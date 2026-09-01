"use client";

import React from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ProjectsGrid } from "@/components/dashboard/projects-grid";
import { Plus } from "lucide-react";

export default function ProjectsPage() {
  return (
    <DashboardLayout>
      {({ projects, onOpenNewProjectModal }) => (
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-5">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white">
                Projects
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                All software projects in your workspace.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onOpenNewProjectModal()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-white transition-colors"
            >
              <Plus className="size-3.5" />
              <span>New Project</span>
            </button>
          </div>

          <ProjectsGrid
            projects={projects}
            onOpenNewProjectModal={() => onOpenNewProjectModal()}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
