"use client";

import CodeEditor from "@/components/project/code-editor";
import FileExplorer from "@/components/project/file-explorer";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { GitHubIcon } from "@/components/auth/icons";
import { GitHubExportModal } from "@/components/project/github-export-modal";
import { useSearchParams } from "next/navigation";
import { Project } from "@/components/dashboard/mock-data";
import {
  ArrowLeft,
  Send,
  Code2,
  Laptop,
  RotateCw,
  Check,
  Loader2,
  Circle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

type ProjectFile = { 
  path: string; 
  content: string 
}

type SSEEvent = {
  event :string, 
  data : any
}

type ActivityStatus =
  | "pending"
  | "running"
  | "completed"
  | "error";

type AgentActivity = {
  id: string,
  message : string,
  status : ActivityStatus
}

type ChatMessage = 
  | {
      id : string,
      sender : "user",
      text : string
  }
  | {
    id : string,
    sender : "agent",
    text ?: string,
    activities : AgentActivity[],
    isStreaming?: boolean,
    detailsOpen?: boolean
  }

async function streamSSE(
  res: Response,
  onEvent: (event:SSEEvent) => void //callback fired for each event 
 ){
  if(!res.body){
    throw new Error ("Streaming not supported")
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  let buffer =  "" //holds onto incomplete fragments until the rest arrives.

  while(true){
    const {value, done} = await reader.read()
    if(done) break

    //Keeps reading chunks until stream ends

    buffer += decoder.decode(value,{
      stream: true
    })

    const events = buffer.split("\n\n")

    buffer = events.pop() || ""

    for(const rawEvent of events){
      if(!rawEvent.trim) continue
      // Ignore heartbeat comments
      if(rawEvent.startsWith(":")) continue

      let eventName = "message"
      let data = ""

      for (const line of rawEvent.split("\n")){
        if(line.startsWith("event:")){
          eventName = line.slice(6).trim()
        }

        if (line.startsWith("data:")) {
          data += line.slice(5).trim();
        }
        
        if(!data) continue

        try{
          onEvent({
            event : eventName,
            data: JSON.parse(data)
          })
        }catch(e){
          console.error("Failed to parse SSE data",data,e)
        }

      }
    }
  }
}   

export default function ProjectWorkspacePage() {
  const params = useParams();
  const projectId = params?.id as string;

  const searchParams = useSearchParams();
  const urlParam = searchParams.get("previewUrl");

  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  const [previewUrl, setpreviewUrl] = useState<string | null>(()=>{
    if(urlParam) return urlParam

    if(typeof window !== "undefined"){
      return localStorage.getItem(`codra_preview_${projectId}`)
    }

    return null
  })

  const [files, setFiles] = useState<ProjectFile[]>(()=>{
    if(typeof window !== "undefined"  && projectId){
      const saved = localStorage.getItem(`codra_files_${projectId}`)
      if(saved){
        try{
          return JSON.parse(saved)
        }catch(e){
          console.log(e)
          return e
        }
      }
    }
    return []
  });

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] =useState<"code" | "preview">("preview");
  const [activeFile, setActiveFile] = useState<string>("");
  const [chatPrompt, setChatPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [saveStatus,setSaveStatus]=useState<"saved"|"saving"|"failed">("saved")

  const initialPromptTriggered = useRef(false);

  const activeFileData =files.find((file) => file.path === activeFile) ?? null;

  const updateAgentActivity = (activity : AgentActivity) => {
    setMessages((prev)=>
      prev.map((message)=>{
        if(message.sender !== "agent" || !message.isStreaming) return message;
        
        const existingIndex = message.activities.findIndex(item=>item.id===activity.id)
        
        if(existingIndex === -1){
          return {
            ...message,
            activities : [
              ...message.activities,
              activity
            ] 
          }
        }

        const updatedActivities = [
          ...message.activities
        ] 

        updatedActivities[existingIndex] = activity

        return {
          ...message,
          activities : updatedActivities
        }
      })
    )
  }

  const generateInitialWebsite = async (promptText: string) => {
    const userMessageId = crypto.randomUUID();
    const agentMessageId = crypto.randomUUID();

    setMessages([
      {
        id: userMessageId,
        sender: "user",
        text: promptText,
      },
      {
        id: agentMessageId,
        sender: "agent",
        text: "",
        isStreaming: true,
        detailsOpen: true,
        activities: [
          {
            id: "understanding",
            message: "Understanding your request",
            status: "running",
          },
        ],
      },
    ]);

    try {
      const response = await fetch(`/backend/website-test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          prompt: promptText,
        }),
      });

      if (!response.ok) {
        throw new Error("Website generation failed");
      }

      await streamSSE(response, ({ event, data }) => {
        if (event === "status") {
          updateAgentActivity({
            id: data.id,
            message: data.message,
            status: data.status,
          });
        }

        if (event === "preview_ready") {
          if (data.previewUrl) {
            setpreviewUrl(data.previewUrl);
            localStorage.setItem(`codra_preview_${projectId}`, data.previewUrl);
          }
        }

        if (event === "files_updated") {
          const updatedFiles = data.files;
          setFiles(updatedFiles);
          localStorage.setItem(`codra_files_${projectId}`, JSON.stringify(updatedFiles));

          if (updatedFiles.length > 0) {
            const preferred =
              updatedFiles.find((f: ProjectFile) => f.path === "src/App.jsx" || f.path === "src/App.tsx") ||
              updatedFiles.find((f: ProjectFile) => f.path === "index.html");
            setActiveFile(preferred ? preferred.path : updatedFiles[0]?.path ?? "");
          }
          setPreviewRefreshKey((prev) => prev + 1);
        }

        if (event === "generation_complete") {
          if (data.previewUrl) {
            setpreviewUrl(data.previewUrl);
            localStorage.setItem(`codra_preview_${projectId}`, data.previewUrl);
          }
          if (data.files && data.files.length > 0) {
            setFiles(data.files);
            localStorage.setItem(`codra_files_${projectId}`, JSON.stringify(data.files));
          }

          setMessages((prev) =>
            prev.map((message) => {
              if (message.id !== agentMessageId || message.sender !== "agent") return message;
              return {
                ...message,
                text: data.message || "Project generated successfully!",
                isStreaming: false,
                detailsOpen: false,
                activities: message.activities.map((act)=>({
                  ...act,
                  status: "completed" as ActivityStatus
                }))
              };
            })
          );
        }
      });
    } catch (e) {
      console.error("Initial generation failed:", e);
      setMessages((prev) =>
        prev.map((message) => {
          if (message.id !== agentMessageId) return message;
          return {
            ...message,
            text: "Something went wrong while generating the website.",
            isStreaming: false,
            detailsOpen: true,
          };
        })
      );
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if(!chatPrompt.trim()) return

    const userMsg = chatPrompt.trim()
    
    setChatPrompt("")

    const userMessageId = crypto.randomUUID()
    const agentMessageId = crypto.randomUUID()

    setMessages((prev)=>[
      ...prev,
      {
        id: userMessageId,
        sender: "user",
        text: userMsg
      },
      {
        id: agentMessageId,
        sender: "agent",
        text: "",
        isStreaming: true,
        detailsOpen: true,

        activities: [
          {
            id: "understanding",
            message:
              "Understanding your request",
            status: "running",
          },
        ],
      }
    ])

    try{
      const response = await fetch(`/backend/modify-website`,{
        method : "POST",
        headers : {
          "Content-Type": "application/json"
        },
        body : JSON.stringify({
          projectId,
          instruction:userMsg
        })
      })

      if(!response.ok){
        throw new Error("Website Modification Failed")
      }

      await streamSSE(
        response,
       ({event,data})=>{

        if(event ===  "status"){
          updateAgentActivity({
            id : data.id,
            message : data.message,
            status : data.status
          })
        }

        if(event === "files_updated"){
          const updatedFiles = data.files
          
          setFiles(updatedFiles)

          setActiveFile((prev)=>
            updatedFiles.find((f:ProjectFile)=>
              f.path === prev 
            )
            ? prev : (
              updatedFiles[0]?.path ?? ""
            )
          )

          setPreviewRefreshKey((prev)=>prev+1)
        }

        if (event === "complete") {
          setMessages((prev) =>
            prev.map((message) => {
              if (message.id !== agentMessageId || message.sender !== "agent") {
                return message;
              }

              return {
                ...message,
                text: data.message,
                isStreaming: false,
                detailsOpen: false,
                activities: message.activities.map((act) => ({
                  ...act,
                  status: "completed" as ActivityStatus,
                })),
              };
            })
          );
        }
      })
    }catch(e){
      console.error(e)
      setMessages((prev)=>
        prev.map((message)=>{
          if(message.id !== agentMessageId) return message

          return {
          ...message,
          text: "Something went wrong while modifying the website",
          isStreaming: false,
          detailsOpen: true
        }
        })
      )
    }
  };

  useEffect(()=>{
    if(!activeFileData) return 

    const timeout = setTimeout(async() => {
      try{
        setSaveStatus("saving")
        const response = await fetch("/backend/save-file",{
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            projectId,
            path:activeFileData.path,
            content: activeFileData.content 
          })
        })
        if (!response.ok) {
        throw new Error("Save failed");
        }
        setSaveStatus("saved")
      }catch(e){
        console.error("Autosave failed",e)
        setSaveStatus("failed")
      }
    }, 1000);
    return ()=>clearTimeout(timeout)
  },[activeFileData,projectId])

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(
          `/backend/api/projects/${projectId}`
        );

        if (!response.ok) {

          throw new Error("Project not found");
        }

        const data = await response.json();

        const loadedProject: Project = {
          id: data.id,
          name: data.name,
          description: data.description,
          updatedAt: data.UpdatedAt,
        };

        setProject(loadedProject);

        const fetchedFiles: ProjectFile[] = data.files ?? [];
        if(fetchedFiles.length>0){
          setFiles(fetchedFiles);
          localStorage.setItem(`codra_files_${projectId}`,JSON.stringify(fetchedFiles))
        }
        
        if(data.previewUrl){
          setpreviewUrl(data.previewUrl)
          localStorage.setItem(`codra_preview_${projectId}`,data.previewUrl)
        }

        if (fetchedFiles.length > 0) {
          const preferred = fetchedFiles.find(f => f.path === "src/App.jsx" || f.path === "src/App.tsx") || fetchedFiles.find(f => f.path === "index.html");
          setActiveFile(preferred ? preferred.path : fetchedFiles[0]!.path);
        }

        const promptParam = searchParams.get("prompt");
        if (promptParam && !initialPromptTriggered.current) {
          initialPromptTriggered.current = true;
          generateInitialWebsite(promptParam);
        } else if(!promptParam && messages.length===0) {
          setMessages([
            {
              id: crypto.randomUUID(),
              sender: "agent",
              text: `Initialized ${loadedProject.name}. What would you like to build or modify?`,
              activities: [],
              isStreaming: false,
              detailsOpen: false,
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#08080a] text-zinc-400">
        Loading project...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#08080a] text-zinc-400">
        Project not found.
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#08080a] text-zinc-100 font-sans overflow-hidden select-none">
      {/* Top Navbar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-800/60 bg-[#0c0c0e] px-4">
        {/* Left: Back & Project Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Dashboard</span>
          </Link>

          <div className="h-3.5 w-px bg-zinc-800" />

          <span className="font-medium text-xs text-zinc-200">{project.name}</span>
        </div>

        {/* Center: View Switcher Tabs */}
        <div className="flex items-center rounded-lg border border-zinc-800 bg-[#141418] p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors ${
              activeTab === "preview"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Laptop className="size-3.5" />
            <span>Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors ${
              activeTab === "code"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Code2 className="size-3.5" />
            <span>Code</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs">
            {saveStatus === "saving" && (
              <span className="text-white/50">Saving...</span>
            )}

            {saveStatus === "saved" && (
              <span className="text-white/40">Saved</span>
            )}

            {saveStatus === "failed" && (
              <span className="text-red-400">Save failed</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-300 hover:text-white transition-colors">
            <GitHubIcon className="size-3 text-zinc-400" />
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Center: Editor / Live Canvas */}
        <main className="flex-1 flex overflow-hidden bg-[#060608] border-r border-zinc-800/60">
          {activeTab === "preview" ? (
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
              {/* Browser Mockup Bar */}
              <div className="flex h-8 items-center justify-between rounded-t-lg border border-b-0 border-zinc-800 bg-[#0d0d10] px-3">
                <div className="flex items-center gap-1">
                  <div className="size-2 rounded-full bg-zinc-700" />
                  <div className="size-2 rounded-full bg-zinc-700" />
                  <div className="size-2 rounded-full bg-zinc-700" />
                </div>
                <span className="text-[11px] font-mono text-zinc-500">
                  {project.name.toLowerCase().replace(/\s+/g, "-")}.codra.app
                </span>
                <button type="button" className="text-zinc-500 hover:text-zinc-300">
                  <RotateCw className="size-2.5" />
                </button>
              </div>

              {/* Canvas View */}
              <div className="flex-1 rounded-b-lg border border-zinc-800 bg-white overflow-hidden">
                {previewUrl ? (
                  <iframe
                    src={`${previewUrl}${previewUrl.includes("?") ? "&" : "?"}refresh=${previewRefreshKey}`}
                    title={`${project.name} Preview`}
                    className="h-full w-full border-0"
                  />
                  ) : (
                  <div className="flex h-full items-center justify-center text-zinc-500">
                    No preview available.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex overflow-hidden">
              <FileExplorer
                files={files}
                activeFile={activeFile}
                onFileSelect={(path) => setActiveFile(path)}
                projectName={project.name}
              />
              <div className="flex-1 overflow-hidden h-full">
                <CodeEditor
                  file={activeFileData}
                  onChange={(content) => {
                    setFiles((prev) =>
                      prev.map((file) =>
                        file.path === activeFile
                          ? {
                              ...file,
                              content,
                            }
                          : file
                      )
                    );
                    setSaveStatus("saving")
                  }}
                />
              </div>
            </div>
          )}
        </main>

        {/* Right: Minimal AI Assistant Chat Pane */}
        <aside className="w-72 shrink-0 flex flex-col bg-[#0c0c0e] text-xs">
          <div className="flex h-10 items-center justify-between border-b border-zinc-800/60 px-3 font-medium text-zinc-300">
            <span>Codra AI</span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {messages.map((msg) => {
              if (msg.sender === "user") {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-xl bg-zinc-800/60 border border-zinc-700/50 px-3 py-2 text-xs text-zinc-100 shadow-sm leading-relaxed">
                      {msg.text}
                    </div>
                  </div>
                );
              }

              const completedCount =
                msg.activities?.filter((a) => a.status === "completed").length ?? 0;
              const totalCount = msg.activities?.length ?? 0;

              return (
                <div key={msg.id} className="space-y-2 text-xs text-zinc-300">
                  {/* Agent Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="flex size-5 shrink-0 items-center justify-center rounded border border-zinc-800 bg-[#121216] font-semibold text-[10px] text-zinc-200">
                        C
                      </div>
                      <span className="font-medium text-zinc-200 text-xs">Codra</span>
                    </div>

                    {totalCount > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setMessages((prev) =>
                            prev.map((item) =>
                              item.id === msg.id && item.sender === "agent"
                                ? { ...item, detailsOpen: !item.detailsOpen }
                                : item
                            )
                          )
                        }
                        className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        <span>{msg.detailsOpen ? "Hide details" : "Show details"}</span>
                        {msg.detailsOpen ? (
                          <ChevronDown className="size-3" />
                        ) : (
                          <ChevronRight className="size-3" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Activity Timeline */}
                  {totalCount > 0 && (
                    msg.detailsOpen ? (
                      <div className="space-y-1.5 rounded-lg border border-zinc-800/80 bg-[#121216]/60 p-2.5">
                        {msg.activities.map((activity) => (
                          <div key={activity.id} className="flex items-center gap-2 text-[11px]">
                            {activity.status === "completed" && (
                              <Check className="size-3 text-emerald-400 shrink-0" />
                            )}
                            {activity.status === "running" && (
                              <Loader2 className="size-3 text-blue-400 animate-spin shrink-0" />
                            )}
                            {activity.status === "error" && (
                              <AlertCircle className="size-3 text-red-400 shrink-0" />
                            )}
                            {activity.status === "pending" && (
                              <Circle className="size-3 text-zinc-600 shrink-0" />
                            )}

                            <span
                              className={
                                activity.status === "completed"
                                  ? "text-zinc-400"
                                  : activity.status === "running"
                                  ? "text-zinc-200 font-medium"
                                  : activity.status === "error"
                                  ? "text-red-300"
                                  : "text-zinc-500"
                              }
                            >
                              {activity.message}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 rounded-md border border-zinc-800/60 bg-zinc-900/40 px-2 py-1 text-[11px] text-zinc-500">
                        <Check className="size-3 text-emerald-400 shrink-0" />
                        <span>
                          Completed {completedCount} of {totalCount} steps
                        </span>
                      </div>
                    )
                  )}

                  {/* Final Agent Response Text */}
                  {msg.text && (
                    <div className="text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap">
                      {msg.text}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Chat Input */}
          <div className="p-2.5 border-t border-zinc-800/60 bg-[#0a0a0c]">
            <form onSubmit={handleSendMessage} className="space-y-1.5">
              <textarea
                value={chatPrompt}
                onChange={(e) => setChatPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                rows={2}
                placeholder="Ask Codra to modify or add code..."
                className="w-full resize-none rounded-lg border border-zinc-800 bg-[#141418] p-2 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-zinc-700"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!chatPrompt.trim()}
                  className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-900 hover:bg-white disabled:opacity-30 transition-colors"
                >
                  <span>Send</span>
                  <Send className="size-2.5" />
                </button>
              </div>
            </form>
          </div>
        </aside>
      </div>

      {/* GitHub Export Modal */}
      <GitHubExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        projectName={project?.name || "my-project"}
        projectId={projectId}
        files={files}
      />
    </div>
  );
}
