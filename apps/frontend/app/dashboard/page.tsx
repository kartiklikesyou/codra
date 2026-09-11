"use client";

import React from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DashboardPrompt } from "@/components/dashboard/dashboard-prompt";
import { ProjectsGrid } from "@/components/dashboard/projects-grid";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      {({ projects, onOpenNewProjectModal, onDeleteProject }) => (
        <div className="space-y-12">
          <DashboardPrompt
            onBuildProject={(promptText) => {
              onOpenNewProjectModal(promptText);
            }}
          />
          <ProjectsGrid
            projects={projects}
            onOpenNewProjectModal={() => onOpenNewProjectModal()}
            onDeleteProject={onDeleteProject}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
