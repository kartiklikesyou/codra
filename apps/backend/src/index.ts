import express from "express";
import { prismaClient } from "db";
import cors from "cors";
import  projectRoutes from "./routes/project"

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

app.listen(8080);