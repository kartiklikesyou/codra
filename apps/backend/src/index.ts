import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
import { prismaClient } from "db";
import cors from "cors";
import projectRoutes from "./routes/project";
import type { Request, Response, NextFunction } from "express";
import { generateWebsite, modifyWebsite} from "./services/ai";
import { getProject, saveProject, updateProjectFiles } from "./project-store";
import bcrypt from "bcrypt";
import { WEBSITE_DIR } from "./services/sandbox";
import z from "zod";
import { createWebsite, updateWebsite } from "./services/sandbox";
import { send } from "process";
import { string } from "zod/v4";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  })
);

app.use(express.json());

app.use("/api/projects",projectRoutes)

const signUpSchema = z.object({
  email : z.string().trim().toLowerCase().email("Invalid email Format").
          refine((val)=>val.endsWith("@gmail.com"),{message : "Only @gmail.com email addresses are allowed"}),
  password : z.string()
})


//sends a single SSE event to the browser
function sendSSE(res:Response, event: string, data: any){
  res.write(`event:${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`)
}


//basic keep alive messages to prevent Nginx/broswer timeouts and also cleanup. 
function setupSSE(res:Response){
  res.setHeader("Content-Type","text/event-stream") 
  res.setHeader(`Cache-Control`,`no-cache, no-transform`) 
  res.setHeader("Connection","keep-alive") 
  res.setHeader("X-Accel-Buffering","no") 

  res.flushHeaders?.()

  const heartbeat = setInterval (()=>{
    if(!res.writableEnded){
      res.write(" ") 
    }
  },10000)

  return ()=>{
    clearInterval(heartbeat) 
  }
}

app.post("/signup", async (req, res) => {
  const result = signUpSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      error: result.error.errors[0]?.message || "Invalid input",
    });
  }

  const {email, password} = result.data

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


//This endpoint generates the website and sandbox
app.post("/website-test", async (req, res) => {
  const { prompt, projectId } = req.body;
  res.setHeader("Content-Type","application/json")

  const cleanup = setupSSE(res)

  try {
    sendSSE(res,"Generation_Started",{
      message: "Starting your Project"
    })

    sendSSE(res,"status",{
      id:"understanding",
      message:"Understanding your Request",
      status:"running"
    })

    const aiResult = await generateWebsite(prompt);

    sendSSE(res,"status",{
      id:"understanding",
      message:"Understanding your Request",
      status:"completed"
    })

    sendSSE(res,"status",{
      id:"generation",
      message:"Generating your Application",
      status:"running"
    })

    sendSSE(res,"status",{
      id:"generation",
      message:"Generated your Application",
      status:"completed"
    })

    sendSSE(res,"status",{
      id:"sandbox",
      message:"Creating secure development environment",
      status:"running"
    })

    const website = await createWebsite(aiResult.files);

    sendSSE(res,"status",{
      id:"sandbox",
      message:"Created secure development environment",
      status:"completed"
    })

    sendSSE(res,"status",{
      id:"preview",
      message:"Starting live preview",
      status:"running"
    })

    sendSSE(res,"preview_ready",{
      previewUrl : website.url
    })

    sendSSE(res,"status",{
      id:"preview",
      message:"Created live preview",
      status:"completed"
    })

    saveProject(
      projectId,
      aiResult.files,
      website.sandbox,
      website.url
    );

    sendSSE(res,"files_updated",{
      files: aiResult.files
    })

    sendSSE(res,"generation_complete",{
      message: aiResult.message,
      previewUrl: website.url,
      files: aiResult.files,
    });

    cleanup()
    return res.end()
  } catch (error) {
    cleanup()
    console.error("Website Generation Error",error);

    sendSSE(res,"error",{
      message:"Website Generation Failed"
    })
    return res.end()
  }
});

//This endpoint modifies the website 
app.post("/modify-website", async (req, res) => {
  const { projectId, instruction } = req.body;
  res.setHeader("Content-Type", "application/json");

  const cleanup = setupSSE(res)

  try {
    const project = getProject(projectId);

    if(!project){
      sendSSE(res,"Error",{
        message : "Project not found"
      })
      cleanup()
      return res.end()
    }

    sendSSE(res,"Generation_Started",{
      message : "Starting modification"
    })
    
    sendSSE(res,"status",{
      id:"understanding",
      message:"Understanding your request",
      status: "running"
    })


    const aiResult = await modifyWebsite(project.files, instruction);

    sendSSE(res,"status",{
      id:"understanding",
      message:"Understood your request",
      status: "completed"
    })
    
    sendSSE(res,"status",{
      id:"files",
      message:"Updating your application",
      status: "running"
    })

    await updateWebsite(project.sandbox, aiResult.files);

    updateProjectFiles(projectId, aiResult.files);

    sendSSE(res,"status",{
      id:"files",
      message:"Updated your application",
      status: "completed"
    })

    sendSSE(res,"files_updated",{
      files : aiResult.files
    })

    sendSSE(res,"status",{
      id:"preview",
      message : "Preparing Preview",
      status: "running"
    })

    await new Promise(resolve=>setTimeout(resolve,150))

    sendSSE(res,"status",{
      id:"preview",
      message : "Preview Updated",
      status: "completed"
    })

    sendSSE(res,"complete",{
      message:aiResult.message,
      files:aiResult.files
    })
    
    cleanup()
    return res.end()
  } catch (error) {
    cleanup()
    console.error("Website Modification Error",error);

    sendSSE(res,"error",{
      message:"Website Modification Failed"
    })

    return res.end()
  }
});

app.post("/save-file",async(req,res)=>{
  try{
    const {projectId, path, content} = req.body
    if(!projectId||!path||typeof content !== "string"){
      return res.status(400).json({
        error: "ProjectId, Path &  Content are required"
      })
    }

    const project = getProject(projectId)

    if(!project){
      return res.status(404).json({
        error: "Project not found"
      })
    }
    
    await project.sandbox.files.write(
      `${WEBSITE_DIR}/${path}`,
      content
    )

    updateProjectFiles(projectId,[
      ...project.files.map((file)=>{
        return file.path===path ? {...file, content} : file
      })
    ])

    return res.json({
      success: true,
      path,
    });
  }catch (error) {
    console.error("Save file error:", error);

    return res.status(500).json({
      error: "Failed to save file",
    });
  }
})

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
