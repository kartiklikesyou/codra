import express from "express";
import { prismaClient } from "db";
import cors from "cors";
import  projectRoutes from "./routes/project"
import { generateWebsite } from "./services/ai";
import dotenv from "dotenv";
import { createWebsite } from "./services/sandbox";

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
    const {prompt} = req.body
    const aiResult = await generateWebsite(prompt)
    const website = await createWebsite(aiResult.files) 

    return res.json({
      message : aiResult.message,
      previewUrl : website.url
    })
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Website creation failed",
    });
  }
});

app.listen(8080);