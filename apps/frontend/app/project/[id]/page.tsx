"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { INITIAL_PROJECTS, Project } from "@/components/dashboard/mock-data";
import { GitHubIcon } from "@/components/auth/icons";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  FolderTree,
  FileCode,
  Send,
  Code2,
  Laptop,
  RotateCw,
} from "lucide-react";

export default function ProjectWorkspacePage() {
  const searchParams = useSearchParams();
  const previewUrl = searchParams.get("previewUrl");
  console.log("Search params:", searchParams.toString());
  console.log("Preview URL:", previewUrl);
  const params = useParams();
  const projectId = params?.id as string;

  const project: Project =
    INITIAL_PROJECTS.find((p) => p.id === projectId) || {
      id: projectId || "proj-custom",
      name: "Custom Project",
      description: "AI-generated software application",
      updatedAt: "Just now",
      stack: "Next.js",
    };

  const [activeTab, setActiveTab] = useState<"code" | "preview">("preview");
  const [activeFile, setActiveFile] = useState("src/app/page.tsx");
  const [chatPrompt, setChatPrompt] = useState("");
  const [messages, setMessages] = useState<
    Array<{ sender: "user" | "agent"; text: string }>
  >([
    {
      sender: "agent",
      text: `Initialized ${project.name}. What would you like to build or modify?`,
    },
  ]);

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
        sender : "agent", text : `Synthesizing code for ${userMsg}`
      }
    ])

    try{
      const response = await fetch("http://localhost:8080/website-test",{
        method : "POST",
        headers : {
          "Content-Type": "application/json"
        },
        body : JSON.stringify({
          prompt : userMsg
        })
      })

      if(!response.ok){
        throw new Error("Website Generation Failed")
      }

      const data = await response.json()

      setMessages((prev)=>[
        ...prev,
        {
          sender : "agent",
          text : data.message
        }
      ])

      console.log("Preview Url", data.previewUrl)
    }catch(e){
      console.log(e)
      setMessages((prev)=>[
        ...prev,
        {
          sender : "agent",
          text : "Something went wrong while generating the website"
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
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-300 hover:text-white transition-colors"
          >
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
            <button
              type="button"
              onClick={() => setActiveFile("src/app/page.tsx")}
              className={`w-full text-left px-2 py-1 rounded flex items-center gap-1.5 transition-colors ${
                activeFile === "src/app/page.tsx"
                  ? "bg-zinc-800/70 text-zinc-100"
                  : "hover:text-zinc-200"
              }`}
            >
              <FileCode className="size-3 text-zinc-500" />
              <span>app/page.tsx</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFile("src/components/layout.tsx")}
              className={`w-full text-left px-2 py-1 rounded flex items-center gap-1.5 transition-colors ${
                activeFile === "src/components/layout.tsx"
                  ? "bg-zinc-800/70 text-zinc-100"
                  : "hover:text-zinc-200"
              }`}
            >
              <FileCode className="size-3 text-zinc-500" />
              <span>components/layout.tsx</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFile("prisma/schema.prisma")}
              className={`w-full text-left px-2 py-1 rounded flex items-center gap-1.5 transition-colors ${
                activeFile === "prisma/schema.prisma"
                  ? "bg-zinc-800/70 text-zinc-100"
                  : "hover:text-zinc-200"
              }`}
            >
              <FileCode className="size-3 text-zinc-500" />
              <span>schema.prisma</span>
            </button>
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
                    src={previewUrl}
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
            <div className="flex-1 p-4 font-mono text-xs text-zinc-300 overflow-auto space-y-1 bg-[#070709] leading-relaxed">
              <div className="text-zinc-600">// File: {activeFile}</div>
              <div className="py-1" />
              <div>
                <span className="text-zinc-400">import</span> React <span className="text-zinc-400">from</span> <span className="text-zinc-300">"react"</span>;
              </div>
              <div className="py-1" />
              <div>
                <span className="text-zinc-400">export default function</span> <span className="text-zinc-200">Page</span>() &#123;
              </div>
              <div className="pl-4 text-zinc-400">
                <span className="text-zinc-400">return</span> (
              </div>
              <div className="pl-8 text-zinc-300">
                &lt;<span className="text-zinc-200">main</span> className=<span className="text-zinc-400">"min-h-screen bg-black text-white p-8"</span>&gt;
              </div>
              <div className="pl-12 text-zinc-200">
                &lt;<span className="text-zinc-200">h1</span>&gt;{project.name}&lt;/<span className="text-zinc-200">h1</span>&gt;
              </div>
              <div className="pl-8 text-zinc-300">
                &lt;/<span className="text-zinc-200">main</span>&gt;
              </div>
              <div className="pl-4">);</div>
              <div>&#125;</div>
            </div>
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
    </div>
  );
}
