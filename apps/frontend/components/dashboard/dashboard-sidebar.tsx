"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CodraLogo } from "@/components/auth/icons";
import { CURRENT_USER, Project } from "./mock-data";
import {
  LayoutDashboard,
  Folder,
  Settings,
  Plus,
  ChevronsUpDown,
  Code2,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";

interface DashboardSidebarProps {
  projects: Project[];
  onOpenNewProjectModal: () => void;
}

export function DashboardSidebar({
  projects,
  onOpenNewProjectModal,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Projects", href: "/projects", icon: Folder },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const recentProjects = projects.slice(0, 4);

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b border-zinc-850 bg-[#09090b]/90 px-4 backdrop-blur-md">
        <Link href="/dashboard" className="flex items-center gap-2">
          <CodraLogo className="scale-90" />
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenNewProjectModal}
            className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-900 shadow-sm hover:bg-white transition-colors"
          >
            <Plus className="size-3.5" />
            <span>New</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 text-zinc-400 hover:text-zinc-100"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-60 flex-col justify-between border-r border-zinc-800/60 bg-[#0c0c0e] transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Section */}
        <div className="flex flex-col flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
          {/* Logo & Brand */}
          <div className="px-2 pt-1 pb-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 outline-none"
            >
              <CodraLogo />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href === "/dashboard" && pathname === "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-zinc-800/70 text-zinc-100"
                      : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                  }`}
                >
                  <Icon className="size-4 text-zinc-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="border-t border-zinc-800/60" />

          {/* Projects Section */}
          <div className="space-y-1.5">
            <div className="px-2.5 text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
              Projects
            </div>

            <div className="space-y-0.5">
              {recentProjects.map((project) => {
                const isProjectActive =
                  pathname === `/project/${project.id}` ||
                  pathname === `/projects/${project.id}`;
                return (
                  <Link
                    key={project.id}
                    href={`/project/${project.id}`}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                      isProjectActive
                        ? "bg-zinc-800/70 text-zinc-100 font-medium"
                        : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
                    }`}
                  >
                    <Code2 className="size-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate text-[12px]">{project.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Simple "+ New Project" Button */}
            <button
              type="button"
              onClick={onOpenNewProjectModal}
              className="mt-2 flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/40 transition-colors"
            >
              <Plus className="size-3.5" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Bottom Section: Signed-in User */}
        <div className="relative border-t border-zinc-800/60 p-3 bg-[#0a0a0c]">
          {/* User Popup Menu */}
          {userMenuOpen && (
            <div className="absolute bottom-16 left-3 right-3 rounded-xl border border-zinc-800 bg-zinc-950 p-1 shadow-2xl z-50 animate-in fade-in">
              <div className="px-2.5 py-2 border-b border-zinc-800/80 mb-1">
                <p className="text-xs font-medium text-zinc-200">{CURRENT_USER.name}</p>
                <p className="text-[11px] text-zinc-500 font-mono">{CURRENT_USER.email}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false);
                  router.push("/settings");
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
              >
                <User className="size-3.5 text-zinc-500" />
                <span>Settings</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false);
                  router.push("/signin");
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
              >
                <LogOut className="size-3.5 text-zinc-500" />
                <span>Sign out</span>
              </button>
            </div>
          )}

          {/* User Button */}
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex w-full items-center justify-between rounded-lg p-1.5 text-left hover:bg-zinc-900/60 transition-colors"
          >
            <div className="flex items-center gap-2.5 truncate">
              {/* Neutral Avatar */}
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700/60 text-xs font-medium text-zinc-200">
                {CURRENT_USER.initials}
              </div>
              <span className="truncate text-xs font-medium text-zinc-200">
                {CURRENT_USER.name}
              </span>
            </div>
            <ChevronsUpDown className="size-3.5 text-zinc-500 shrink-0" />
          </button>
        </div>
      </aside>
    </>
  );
}
