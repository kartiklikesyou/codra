import type { Sandbox } from "e2b";

type WebsiteFile = {
  path: string;
  content: string;
};

type ProjectData = {
  files: WebsiteFile[];
  sandbox: Sandbox;
  previewUrl ?: string
};

const projects =new Map<string, ProjectData>()

export function saveProject(
    projectId : string,
    files : WebsiteFile[],
    sandbox : Sandbox,
    previewUrl ?: string
){
    projects.set(projectId,{
        files,
        sandbox,
        previewUrl 
    })
}

export function getProject(projectId:string){
    return projects.get(projectId)
}

export function updateProjectFiles(
    projectId : string,
    files : WebsiteFile[]
){
    const project = projects.get(projectId)
    if(!project) return  null
    project.files=files
    return project
}
