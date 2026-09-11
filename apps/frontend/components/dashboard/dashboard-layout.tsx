"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { NewProjectModal } from "./new-project-modal";
import { DeleteProjectModal } from "./delete-project-modal";
import { Project } from "./mock-data";

interface DashboardLayoutProps {
  children: (props: {
    projects: Project[];
    onOpenNewProjectModal: (initialPrompt?: string) => void;
    onDeleteProject: (projectId: string, projectName: string) => void;
  }) => React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialPromptForModal, setInitialPromptForModal] = useState("");
  const [projectToDelete, setProjectToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleOpenModal = (initialPrompt?: string) => {
    setInitialPromptForModal(initialPrompt || "");
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setProjectToDelete({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete || !session?.user?.id) {
      return;
    }

    try {
      const response = await fetch(
        `/backend/api/projects/${projectToDelete.id}?userId=${encodeURIComponent(
          session.user.id
        )}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete project");
      }
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
      setProjectToDelete(null);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to delete project"
      );
      throw error;
    }
  };

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) {
      return;
    }

    const fetchProjects = async () => {
      try {
        const url = `/backend/api/projects?userId=${session.user.id}`
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProjects();
  }, [session, status]);

  const handleCreateProject = async (
    name: string,
    description: string
  ) => {
    if (!session?.user?.id) {
      return;
    }

    try {
      const projectResponse = await fetch(
        `/backend/api/projects`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            userId: session.user.id,
          }),
        }
      );

      if (!projectResponse.ok) {
        throw new Error("Failed to create project");
      }

      const project = await projectResponse.json();

      const websiteResponse = await fetch(
        `/backend/website-test`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: project.id,
            prompt: description,
          }),
        }
      );

      if (!websiteResponse.ok) {
        throw new Error("Website generation failed");
      }

      const websiteData = await websiteResponse.json();

      setProjects((prev) => [
        {
          id: project.id,
          name: project.name,
          description,
          updatedAt: "Just now",
          stack: "HTML,CSS,JS",
          previewUrl: websiteData.previewUrl,
          files: websiteData.files,
        },
        ...prev,
      ]);

      setIsModalOpen(false);

      router.push(
        `/project/${project.id}?previewUrl=${encodeURIComponent(
          websiteData.previewUrl
        )}`
      );
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  if (status === "loading") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white">
      <DashboardSidebar
        projects={projects}
        onOpenNewProjectModal={() => handleOpenModal()}
        onDeleteProject={handleDeleteClick}
      />

      <div className="lg:pl-60 flex flex-col min-h-screen">
        <main className="flex-1 px-5 py-10 sm:px-10 lg:px-16 max-w-5xl w-full mx-auto space-y-12">
          {children({
            projects,
            onOpenNewProjectModal: handleOpenModal,
            onDeleteProject: handleDeleteClick,
          })}
        </main>
      </div>

      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProject}
        initialPrompt={initialPromptForModal}
      />

      <DeleteProjectModal
        isOpen={Boolean(projectToDelete)}
        onClose={() => setProjectToDelete(null)}
        projectName={projectToDelete?.name || ""}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}