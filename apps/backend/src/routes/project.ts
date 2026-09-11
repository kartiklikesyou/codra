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
    return res.json({ ...project, files: projectData?.files ?? [] })
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


