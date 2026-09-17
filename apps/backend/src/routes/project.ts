import { Router } from "express";
import { prismaClient } from "db";
import { getProject } from "../project-store";

const router = Router()

router.post("/",async (req,res)=>{
    const {name,userId}=req.body
    try{
        if(!name||!userId){
            return res.status(400).json({
                error:"name and userId required"
            })
        }
        const project = await prismaClient.project.create({
            data : {
                name,
                userId
            }
        })
        return res.json(project)
    }catch(e){
        console.log(e)
        return res.json({
            e : "Failed to add Project"
        })
    }
})

router.get("/",async(req,res)=>{
    const {userId}=req.query
    const projects = await prismaClient.project.findMany({
        where :{
            userId: String(userId),
        },
        orderBy:{
            CreatedAt:"desc"
        }
    })
    return res.json(projects)
})

router.get("/:id",async (req,res)=>{
    const pId = req.params.id
    const project = await prismaClient.project.findUnique({
        where:{
            id:pId
        }
    })
    const projectData = getProject(pId)
    return res.json({ ...project, files: projectData?.files ?? [], previewUrl : projectData?.previewUrl ?? null  })
})

router.post("/:id/export/github", async(req,res)=>{
    const {id} =req.params
    const {userId, repoName, isPrivate, files} = req.body

    const account = await prismaClient.account.findFirst({
        where: {
            userId: String(userId),
            provider: "github" 
        }
    });

    if (!account?.access_token) {
        return res.status(400).json({
        error: "No GitHub account linked. Please sign in with GitHub to export.",
        });
    }

    const token = account.access_token
    const headers = {
        Authorization : `Bearer ${token}`,
        Accept : "application.vnd.github+json",
        "User-Agent" : "Codra-App"
    }

    try {
    const createRepoRes = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: repoName,
        private: Boolean(isPrivate),
        auto_init: true
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
  }catch(e){
        console.error("GitHub export error:", e);
        return res.status(500).json({ error: "Failed to export project to GitHub" });
    }

})

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const userId = req.query.userId as string | undefined;

  if (!userId) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  const project = await prismaClient.project.findUnique({
    where: { id },
  });

  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  if (project.userId !== String(userId)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  await prismaClient.project.delete({
    where: { id },
  });
  return res.send();
});

export default router


