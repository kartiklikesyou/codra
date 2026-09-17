  "use client";

  import React, { useState,useEffect } from "react";
  import Link from "next/link";
  import { useParams } from "next/navigation";
  import { GitHubIcon } from "@/components/auth/icons";
  import { GitHubExportModal } from "@/components/project/github-export-modal";
  import { useSearchParams } from "next/navigation";
  import { Project } from "@/components/dashboard/mock-data";
  import {
    ArrowLeft,
    FolderTree,
    FileCode,
    Send,
    Code2,
    Laptop,
    RotateCw,
  } from "lucide-react";

  type ProjectFile = { path: string; content: string };

  export default function ProjectWorkspacePage() {
    const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    const params = useParams();
    const projectId = params?.id as string;

    const searchParams = useSearchParams();
    const urlParam = searchParams.get("previewUrl");
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

    const [activeTab, setActiveTab] =
      useState<"code" | "preview">("preview");

    const [activeFile, setActiveFile] = useState<string>("");

    const [chatPrompt, setChatPrompt] = useState("");

    const [messages, setMessages] = useState<
      Array<{ sender: "user" | "agent"; text: string }>
    >([]);

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
            stack: "Next.js",
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

          setMessages([
            {
              sender: "agent",
              text: `Initialized ${loadedProject.name}. What would you like to build or modify?`,
            },
          ]);
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

    const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!chatPrompt.trim()) return

      const userMsg = chatPrompt.trim()
      setChatPrompt("")

      setMessages((prev)=>[
        ...prev,
        {
          sender:"user", text : userMsg
        },
        {
          sender : "agent", text : `Modifying your website...`
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

        const data = await response.json()

        setMessages((prev)=>[
          ...prev,
          {
            sender : "agent",
            text : data.message
          }
        ])

        setPreviewRefreshKey((prev) => prev + 1);

        if (data.files && Array.isArray(data.files)) {
          setFiles(data.files);
          setActiveFile(prev =>
            data.files.find((f: ProjectFile) => f.path === prev)
              ? prev
              : (data.files[0]?.path ?? "")
          );
        }

        console.log("Preview Url", data.previewUrl)
      }catch(e){
        console.log(e)
        setMessages((prev)=>[
          ...prev,
          {
            sender : "agent",
            text : "Something went wrong while modifying the website"
          }
        ])
      }
    };

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
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-300 hover:text-white transition-colors">
              <GitHubIcon className="size-3 text-zinc-400" />
              <span>Export</span>
            </button>
          </div>
        </header>

        {/* Main 3-Pane Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Explorer Pane */}
          <aside className="hidden md:flex w-52 shrink-0 flex-col border-r border-zinc-800/60 bg-[#0a0a0c] p-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-zinc-500 uppercase tracking-wider text-[10px] mb-2 px-1">
              <FolderTree className="size-3" />
              <span>Files</span>
            </div>

            <div className="space-y-0.5 text-zinc-400">
              {files.length === 0 ? (
                <div className="text-zinc-600 px-2 py-1 text-[11px]">No files available.</div>
              ) : (
                files.map(file => (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => setActiveFile(file.path)}
                    className={`w-full text-left px-2 py-1 rounded flex items-center gap-1.5 transition-colors ${
                      activeFile === file.path
                        ? "bg-zinc-800/70 text-zinc-100"
                        : "hover:text-zinc-200"
                    }`}
                  >
                    <FileCode className="size-3 text-zinc-500 shrink-0" />
                    <span className="truncate">{file.path}</span>
                  </button>
                ))
              )}
            </div>
          </aside>

          {/* Center: Editor / Live Canvas */}
          <main className="flex-1 flex flex-col overflow-hidden bg-[#060608] border-r border-zinc-800/60">
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
              <pre className="flex-1 p-4 font-mono text-xs text-zinc-300 overflow-auto bg-[#070709] whitespace-pre-wrap leading-relaxed">
                {files.find(f => f.path === activeFile)?.content
                  ?? (files.length === 0
                    ? "No files loaded. Generate the project first."
                    : "Select a file to view its contents.")}
              </pre>
            )}
          </main>

          {/* Right: Minimal AI Assistant Chat Pane */}
          <aside className="w-72 shrink-0 flex flex-col bg-[#0c0c0e] text-xs">
            <div className="flex h-10 items-center justify-between border-b border-zinc-800/60 px-3 font-medium text-zinc-300">
              <span>Codra AI</span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-zinc-800/50 border-zinc-700/60 text-zinc-100 ml-4"
                      : "bg-zinc-900/50 border-zinc-800 text-zinc-300 mr-4"
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              ))}
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
