"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "./dashboard-sidebar";
import { NewProjectModal } from "./new-project-modal";
import { INITIAL_PROJECTS, Project } from "./mock-data";
import { WebsiteFile } from "./mock-data";

interface DashboardLayoutProps {
  children: (props: {
    projects: Project[];
    onOpenNewProjectModal: (initialPrompt?: string) => void;
  }) => React.ReactNode;
}

type GenerateWebsiteResponse = {
  message: string;
  previewUrl: string;
  files?: WebsiteFile[];
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialPromptForModal, setInitialPromptForModal] = useState("");

  const handleOpenModal = (initialPrompt?: string) => {
    if (initialPrompt) {
      setInitialPromptForModal(initialPrompt);
    } else {
      setInitialPromptForModal("");
    }
    setIsModalOpen(true);
  };

  const handleCreateProject = async (name: string, description: string) => {
  try {
    const newId = `proj-${Date.now()}`;
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/website-test`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectId:newId,
        prompt: description,
      }),
    });

    if (!response.ok) {
      throw new Error("Website generation failed");
    }

    const data : GenerateWebsiteResponse = await response.json();

    console.log("Generated website:", data);

    const newProject: Project = {
      id: newId,
      name,
      description,
      updatedAt: "Just now",
      stack: "HTML,CSS,JS",
      previewUrl : data.previewUrl,
      files:data.files
    };

    setProjects((prev)=>[newProject,...prev]);
    setIsModalOpen(false);

    router.push(`/project/${newId}?previewUrl=${encodeURIComponent(data.previewUrl)}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white">
      {/* Sidebar */}
      <DashboardSidebar
        projects={projects}
        onOpenNewProjectModal={() => handleOpenModal()}
      />

      {/* Main Content Area */}
      <div className="lg:pl-60 flex flex-col min-h-screen">
        <main className="flex-1 px-5 py-10 sm:px-10 lg:px-16 max-w-5xl w-full mx-auto space-y-12">
          {children({
            projects,
            onOpenNewProjectModal: handleOpenModal,
          })}
        </main>
      </div>

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProject}
        initialPrompt={initialPromptForModal}
      />
    </div>
  );
}
