import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
import { prismaClient } from "db";
import cors from "cors";
import projectRoutes from "./routes/project";
import type { Request, Response, NextFunction } from "express";
import { generateWebsite, modifyWebsite} from "./services/ai";
import { createWebsite } from "./services/sandbox";
import { getProject, saveProject, updateProjectFiles } from "./project-store";
import bcrypt from "bcrypt";
import { WEBSITE_DIR } from "./services/sandbox";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  })
);

app.use(express.json());

app.use("/api/projects",projectRoutes)

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      error: "email and password are required",
    });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prismaClient.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
    });
  } catch (e) {
    console.error(e);

    res.status(500).json({
      error: "Could not create user",
    });
  }
});

app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await prismaClient.user.findUnique({
      where: { email },
    });

    if (!user ) {
      res.status(401).json({ error: "User Not Found!" });
      return;
    }

    if (!user.password) {
      res.status(401).json({
        error: "Invalid credentials",
      });
      return;
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      res.status(401).json({
        error: "Invalid credentials",
      });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      image: user.image ?? null,
    });
  } catch (e) {
    console.error("Backend signin error:", e);
    res.status(500).json({
      error: "Sign-In Failed",
    });
  }
});

app.post("/website-test", async (req, res) => {
  const { prompt, projectId } = req.body;

  res.setHeader("Content-Type","application/json")
  
  const heartbeat = setInterval (()=>{
    if(!res.writableEnded){
      res.write(" ")
    }
  },10000)

  try {
    const aiResult = await generateWebsite(prompt);
    const website = await createWebsite(aiResult.files);

    saveProject(
      projectId,
      aiResult.files,
      website.sandbox
    );

    const responsePayload = {
      message: aiResult.message,
      previewUrl: website.url,
      files: aiResult.files,
    };

    clearInterval(heartbeat)

    return res.end(JSON.stringify(responsePayload))
  } catch (error) {
    clearInterval(heartbeat)
    console.log(error)
    if (!res.headersSent) {
      return res.status(500).json({ error: "Website Generation Failed" });
    }
    return res.end(JSON.stringify({ error: "Website Generation Failed" }));
  }
});

app.post("/modify-website", async (req, res) => {
  const { projectId, instruction } = req.body;

  res.setHeader("Content-Type", "application/json");

  const heartbeat = setInterval(() => {
    if (!res.writableEnded) {
      res.write(" ");
    }
  }, 10000);

  try {
    const project = getProject(projectId);
    
    if (!project) {
      clearInterval(heartbeat);
      if (!res.headersSent) {
        return res.status(404).json({ error: "Project not found" });
      }
      return res.end(JSON.stringify({ error: "Project not found" }));
    }

    const aiResult = await modifyWebsite(project.files, instruction);

    for (const file of aiResult.files) {
      await project.sandbox.files.write(`${WEBSITE_DIR}/${file.path}`, file.content);
    }

    updateProjectFiles(projectId, aiResult.files);

    clearInterval(heartbeat);
    
    return res.end(JSON.stringify({ message: aiResult.message, files: aiResult.files }));
  } catch (error) {
    clearInterval(heartbeat);
    console.error(error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Website Modification Failed" });
    }
    return res.end(JSON.stringify({ error: "Website Modification Failed" }));
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