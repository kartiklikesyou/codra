"use client";

import React from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DashboardPrompt } from "@/components/dashboard/dashboard-prompt";
import { ProjectsGrid } from "@/components/dashboard/projects-grid";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      {({ projects, onOpenNewProjectModal }) => (
        <div className="space-y-12">
          {/* Main AI Project Prompt */}
          <DashboardPrompt
            onBuildProject={(promptText) => {
              onOpenNewProjectModal(promptText);
            }}
          />

          {/* Projects Gallery */}
          <ProjectsGrid
            projects={projects}
            onOpenNewProjectModal={() => onOpenNewProjectModal()}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
