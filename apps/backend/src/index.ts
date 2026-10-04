import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
import { prismaClient } from "db";
import cors from "cors";
import projectRoutes from "./routes/project";
import type { Request, Response, NextFunction } from "express";
import { generateWebsite, modifyWebsite } from "./services/ai";
import { getProject, saveProject, updateProjectFiles } from "./project-store";
import bcrypt from "bcrypt";
import { WEBSITE_DIR } from "./services/sandbox";
import z from "zod";
import { createWebsite, updateWebsite } from "./services/sandbox";

// Validate server-side environment variables at startup
function validateEnv() {
  const envSchema = z.object({
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    E2B_API_KEY: z.string().min(1, "E2B_API_KEY is required"),
    OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
  });

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    console.warn(`[Config Warning] Missing or invalid environment variable(s): ${missing}`);
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.info("[Config Notice] GOOGLE_GENERATIVE_AI_API_KEY not set. Gemini fallback will be unavailable.");
  }
}
validateEnv();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  })
);

app.use(express.json());

app.use("/api/projects", projectRoutes);

// Validation Schemas
const signUpSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email format")
    .refine((val) => val.endsWith("@gmail.com"), {
      message: "Only @gmail.com email addresses are allowed",
    }),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const projectIdSchema = z
  .string()
  .trim()
  .min(1, "Project ID cannot be empty")
  .max(100, "Project ID too long");

const safeFilePathSchema = z
  .string()
  .trim()
  .min(1, "File path cannot be empty")
  .max(500, "File path is too long")
  .refine(
    (p) =>
      !p.includes("..") &&
      !p.startsWith("/") &&
      !p.startsWith("\\") &&
      !p.includes("\0"),
    {
      message: "Invalid file path (path traversal characters not permitted)",
    }
  );

const websiteTestSchema = z.object({
  projectId: projectIdSchema,
  prompt: z
    .string()
    .trim()
    .min(1, "Prompt cannot be empty")
    .max(10000, "Prompt is too long"),
});

const modifyWebsiteSchema = z.object({
  projectId: projectIdSchema,
  instruction: z
    .string()
    .trim()
    .min(1, "Instruction cannot be empty")
    .max(10000, "Instruction is too long"),
});

const saveFileSchema = z.object({
  projectId: projectIdSchema,
  path: safeFilePathSchema,
  content: z.string(),
});

// Sends a single SSE event to the browser
function sendSSE(res: Response, event: string, data: any) {
  res.write(`event:${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

// Basic keep-alive messages to prevent Nginx/browser timeouts and also cleanup.
function setupSSE(res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  res.flushHeaders?.();

  const heartbeat = setInterval(() => {
    if (!res.writableEnded) {
      res.write(": keep-alive\n\n");
    }
  }, 10000);

  return () => {
    clearInterval(heartbeat);
  };
}

app.post("/signup", async (req, res) => {
  const result = signUpSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: result.error.errors[0]?.message || "Invalid input",
    });
  }

  const { email, password } = result.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prismaClient.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      id: user.id,
      email: user.email,
    });
  } catch (e: any) {
    console.error("Signup error:", e);

    if (e?.code === "P2002") {
      return res.status(409).json({
        error: "User with this email already exists",
      });
    }

    return res.status(500).json({
      error: "Could not create user",
    });
  }
});

app.post("/signin", async (req, res) => {
  const result = signInSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Email and password are required",
    });
  }

  const { email, password } = result.data;

  try {
    const user = await prismaClient.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      image: user.image ?? null,
    });
  } catch (e) {
    console.error("Backend signin error:", e);
    return res.status(500).json({
      error: "Sign-in failed",
    });
  }
});

// This endpoint generates the website and sandbox
app.post("/website-test", async (req, res) => {
  const validation = websiteTestSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: validation.error.flatten(),
    });
  }

  const { prompt, projectId } = validation.data;

  const cleanup = setupSSE(res);

  try {
    sendSSE(res, "Generation_Started", {
      message: "Starting your Project",
    });

    sendSSE(res, "status", {
      id: "understanding",
      message: "Understanding your Request",
      status: "running",
    });

    const aiResult = await generateWebsite(prompt);

    sendSSE(res, "status", {
      id: "understanding",
      message: "Understanding your Request",
      status: "completed",
    });

    sendSSE(res, "status", {
      id: "generation",
      message: "Generating your Application",
      status: "running",
    });

    sendSSE(res, "status", {
      id: "generation",
      message: "Generated your Application",
      status: "completed",
    });

    sendSSE(res, "status", {
      id: "sandbox",
      message: "Creating secure development environment",
      status: "running",
    });

    const website = await createWebsite(aiResult.files);

    sendSSE(res, "status", {
      id: "sandbox",
      message: "Created secure development environment",
      status: "completed",
    });

    sendSSE(res, "status", {
      id: "preview",
      message: "Starting live preview",
      status: "running",
    });

    sendSSE(res, "preview_ready", {
      previewUrl: website.url,
    });

    sendSSE(res, "status", {
      id: "preview",
      message: "Created live preview",
      status: "completed",
    });

    saveProject(
      projectId,
      aiResult.files,
      website.sandbox,
      website.url
    );

    sendSSE(res, "files_updated", {
      files: aiResult.files,
    });

    sendSSE(res, "generation_complete", {
      message: aiResult.message,
      previewUrl: website.url,
      files: aiResult.files,
    });

    cleanup();
    return res.end();
  } catch (error) {
    cleanup();
    console.error("Website Generation Error:", error);

    sendSSE(res, "error", {
      message: error instanceof Error ? error.message : "Website Generation Failed",
    });
    return res.end();
  }
});

// This endpoint modifies the website 
app.post("/modify-website", async (req, res) => {
  const validation = modifyWebsiteSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: validation.error.flatten(),
    });
  }

  const { projectId, instruction } = validation.data;

  const cleanup = setupSSE(res);

  try {
    const project = getProject(projectId);

    if (!project) {
      sendSSE(res, "error", {
        message: "Project not found or session expired",
      });
      cleanup();
      return res.end();
    }

    sendSSE(res, "Generation_Started", {
      message: "Starting modification",
    });
    
    sendSSE(res, "status", {
      id: "understanding",
      message: "Understanding your request",
      status: "running",
    });

    const aiResult = await modifyWebsite(project.files, instruction);

    sendSSE(res, "status", {
      id: "understanding",
      message: "Understood your request",
      status: "completed",
    });
    
    sendSSE(res, "status", {
      id: "files",
      message: "Updating your application",
      status: "running",
    });

    await updateWebsite(project.sandbox, aiResult.files, project.files);

    updateProjectFiles(projectId, aiResult.files);

    sendSSE(res, "status", {
      id: "files",
      message: "Updated your application",
      status: "completed",
    });

    sendSSE(res, "files_updated", {
      files: aiResult.files,
    });

    sendSSE(res, "status", {
      id: "preview",
      message: "Preparing Preview",
      status: "running",
    });

    await new Promise((resolve) => setTimeout(resolve, 150));

    sendSSE(res, "status", {
      id: "preview",
      message: "Preview Updated",
      status: "completed",
    });

    sendSSE(res, "complete", {
      message: aiResult.message,
      files: aiResult.files,
    });
    
    cleanup();
    return res.end();
  } catch (error) {
    cleanup();
    console.error("Website Modification Error:", error);

    sendSSE(res, "error", {
      message: error instanceof Error ? error.message : "Website Modification Failed",
    });

    return res.end();
  }
});

app.post("/save-file", async (req, res) => {
  try {
    const validation = saveFileSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid request",
        details: validation.error.flatten(),
      });
    }

    const { projectId, path: safePath, content } = validation.data;

    const project = getProject(projectId);

    if (!project) {
      return res.status(404).json({
        error: "Project not found or session expired",
      });
    }
    
    await project.sandbox.files.write(
      `${WEBSITE_DIR}/${safePath}`,
      content
    );

    updateProjectFiles(projectId, [
      ...project.files.map((file) => {
        return file.path === safePath ? { ...file, content } : file;
      }),
    ]);

    return res.json({
      success: true,
      path: safePath,
    });
  } catch (error) {
    console.error("Save file error:", error);

    return res.status(500).json({
      error: "Failed to save file",
    });
  }
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Express error handler caught:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Deals  with unhandled Promises Rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});


const server = app.listen(8080, () => {
  console.log('Backend server listening on port 8080');
});
// Disabling the timeout so that long AI operations can be done 
server.setTimeout(0);
