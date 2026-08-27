import { Router } from "express";
import { prismaClient } from "db";

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
    return res.json(project)
})

router.delete("/:id",async(req,res)=>{
    await prismaClient.project.delete({
        where:{
            id : req.params.id
        }
    })
    return res.send()
})

export default router


