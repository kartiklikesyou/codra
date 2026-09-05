import express from "express";
import { prismaClient } from "db";
import cors from "cors";
import  projectRoutes from "./routes/project"
import { generateWebsite, modifyWebsite } from "./services/ai";
import dotenv from "dotenv";
import { createWebsite } from "./services/sandbox";
import { getProject, saveProject, updateProjectFiles } from "./project-store";


dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());

app.use("/api/projects",projectRoutes)

app.get("/users", (req, res) => {
  prismaClient.user.findMany()
    .then(users => {
      res.json(users);
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
})

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return
  }

  try {
    const user = await prismaClient.user.create({
      data: {
        email,
        password,
      },
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
    });
  } catch (e) {
    console.error(e);

    res.status(500).json({
      e: "Could not create user",
    });
  }
})

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const user = await prismaClient.user.findUnique({
    where: { email },
  });

  if (!user || user.password !== password) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
  });
});

app.post("/ai-test", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await generateWebsite(prompt);

    return res.json({
      response,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "AI failed",
    });
  }
});

app.post("/website-test", async (req, res) => {
  try {
    const {prompt,projectId} = req.body
    const aiResult = await generateWebsite(prompt)
    const website = await createWebsite(aiResult.files) 

    saveProject(
      projectId,
      aiResult.files,
      website.sandbox
    )

    return res.json({
      message: aiResult.message,
      previewUrl: website.url,
      files: aiResult.files,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Website creation failed",
    });
  }
});

app.post("/modify-website", async (req,res)=>{
  try{
    const {projectId,instruction}=req.body
    const project = getProject(projectId)

    if (!project) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    const aiResult = await modifyWebsite(
      project.files,
      instruction
    )

    for (const file of aiResult.files){
      await project.sandbox.files.write(
        `/tmp/website/${file.path}`,
        file.content
      )
    }

    updateProjectFiles(projectId,aiResult.files)

    return res.json({
      message : aiResult.message
    })

  }catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Website modification failed",
    });
  }
})

app.listen(8080);