import { Router } from "express";
import { prismaClient } from "db";
import { getProject } from "../project-store";
import z from "zod";

const router = Router();

// Validation Schemas
const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Project name is required")
    .max(100, "Project name is too long"),
  userId: z.string().trim().min(1, "User ID is required"),
});

const getProjectsQuerySchema = z.object({
  userId: z.string().trim().min(1, "User ID is required"),
});

const projectParamsSchema = z.object({
  id: z.string().trim().min(1, "Project ID is required"),
});

const deleteProjectQuerySchema = z.object({
  userId: z.string().trim().min(1, "User ID is required"),
});

const githubExportSchema = z.object({
  userId: z.string().trim().min(1, "User ID is required"),
  repoName: z
    .string()
    .trim()
    .min(1, "Repository name is required")
    .max(100, "Repository name is too long")
    .regex(/^[a-zA-Z0-9._-]+$/, "Invalid repository name format"),
  isPrivate: z.boolean().default(false),
  files: z
    .array(
      z.object({
        path: z.string().trim().min(1, "File path is required"),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
});

// Create a new project
router.post("/", async (req, res) => {
  const result = createProjectSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: result.error.flatten(),
    });
  }

  const { name, userId } = result.data;

  try {
    const project = await prismaClient.project.create({
      data: {
        name,
        userId,
      },
    });
    return res.status(201).json(project);
  } catch (e) {
    console.error("Failed to create project:", e);
    return res.status(500).json({
      error: "Failed to create project",
    });
  }
});

// List projects for a user
router.get("/", async (req, res) => {
  const queryResult = getProjectsQuerySchema.safeParse(req.query);

  if (!queryResult.success) {
    return res.status(400).json({
      error: "Invalid query parameters",
      details: queryResult.error.flatten(),
    });
  }

  const { userId } = queryResult.data;

  try {
    const projects = await prismaClient.project.findMany({
      where: {
        userId,
      },
      orderBy: {
        CreatedAt: "desc",
      },
    });
    return res.json(projects);
  } catch (e) {
    console.error("Failed to fetch projects:", e);
    return res.status(500).json({
      error: "Failed to fetch projects",
    });
  }
});

// Get a single project
router.get("/:id", async (req, res) => {
  const paramsResult = projectParamsSchema.safeParse(req.params);

  if (!paramsResult.success) {
    return res.status(400).json({
      error: "Invalid project ID",
    });
  }

  const { id: pId } = paramsResult.data;

  try {
    const project = await prismaClient.project.findUnique({
      where: {
        id: pId,
      },
    });

    if (!project) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    const projectData = getProject(pId);
    return res.json({
      ...project,
      files: projectData?.files ?? [],
      previewUrl: projectData?.previewUrl ?? null,
    });
  } catch (e) {
    console.error("Failed to fetch project:", e);
    return res.status(500).json({
      error: "Failed to fetch project",
    });
  }
});

// Export project to GitHub
router.post("/:id/export/github", async (req, res) => {
  const paramsResult = projectParamsSchema.safeParse(req.params);

  if (!paramsResult.success) {
    return res.status(400).json({
      error: "Invalid project ID",
    });
  }

  const bodyResult = githubExportSchema.safeParse(req.body);

  if (!bodyResult.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: bodyResult.error.flatten(),
    });
  }

  const { userId, repoName, isPrivate, files } = bodyResult.data;

  try {
    const account = await prismaClient.account.findFirst({
      where: {
        userId,
        provider: "github",
      },
    });

    if (!account?.access_token) {
      return res.status(400).json({
        error: "No GitHub account linked. Please sign in with GitHub to export.",
      });
    }

    const token = account.access_token;
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application.vnd.github+json",
      "User-Agent": "Codra-App",
    };

    const createRepoRes = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: repoName,
        private: Boolean(isPrivate),
        auto_init: true,
      }),
    });

    if (!createRepoRes.ok) {
      const errorData = await createRepoRes.json().catch(() => ({}));
      return res.status(createRepoRes.status).json({
        error: errorData.message || "Failed to create GitHub repository",
      });
    }

    const repoData = await createRepoRes.json();
    const owner = repoData.owner.login;
    const repo = repoData.name;

    if (Array.isArray(files) && files.length > 0) {
      const tree = files.map((f: { path: string; content: string }) => ({
        path: f.path.startsWith("/") ? f.path.slice(1) : f.path,
        mode: "100644",
        type: "blob",
        content: f.content,
      }));

      const refRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/main`,
        { headers }
      );
      const refData = await refRes.json();
      const latestCommitSha = refData.object.sha;

      const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ base_tree: latestCommitSha, tree }),
        }
      );
      const treeResult = await treeRes.json();

      const commitRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/commits`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            message: "Initial commit from Codra",
            tree: treeResult.sha,
            parents: [latestCommitSha],
          }),
        }
      );
      const commitResult = await commitRes.json();

      await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/main`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ sha: commitResult.sha }),
        }
      );
    }

    return res.json({
      success: true,
      repoUrl: repoData.html_url,
      fullName: repoData.full_name,
    });
  } catch (e) {
    console.error("GitHub export error:", e);
    return res.status(500).json({
      error: "Failed to export project to GitHub",
    });
  }
});

// Delete a project
router.delete("/:id", async (req, res) => {
  const paramsResult = projectParamsSchema.safeParse(req.params);

  if (!paramsResult.success) {
    return res.status(400).json({
      error: "Invalid project ID",
    });
  }

  const queryResult = deleteProjectQuerySchema.safeParse(req.query);

  if (!queryResult.success) {
    return res.status(401).json({
      error: "Unauthenticated: User ID required",
    });
  }

  const { id } = paramsResult.data;
  const { userId } = queryResult.data;

  try {
    const project = await prismaClient.project.findUnique({
      where: { id },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await prismaClient.project.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (e) {
    console.error("Delete project error:", e);
    return res.status(500).json({
      error: "Failed to delete project",
    });
  }
});

export default router;
