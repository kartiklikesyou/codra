"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileCode,
  FileJson,
  FileText,
  FileImage,
  File,
  Ellipsis,
  Atom,
} from "lucide-react";

export type ProjectFile = {
  path: string;
  content: string;
};

export type FileExplorerProps = {
  files: ProjectFile[];
  activeFile: string;
  onFileSelect: (path: string) => void;
  projectName?: string;
};

export interface FileNode {
  name: string;
  path: string;
  isFolder: false;
}

export interface FolderNode {
  name: string;
  path: string;
  isFolder: true;
  children: TreeNode[];
}

export type TreeNode = FileNode | FolderNode;

function getFileIcon(filename: string) {
  const lower = filename.toLowerCase();

  if (lower === "package.json") {
    return <FileJson className="size-[14px] shrink-0 text-[#cbcb41]" />;
  }

  if (lower.endsWith(".jsx") || lower.endsWith(".tsx")) {
    return <Atom className="size-[14px] shrink-0 text-[#61dafb]" />;
  }

  if (lower.endsWith(".ts")) {
    return <FileCode className="size-[14px] shrink-0 text-[#3178c6]" />;
  }

  if (lower.endsWith(".js") || lower.endsWith(".mjs") || lower.endsWith(".cjs")) {
    return <FileCode className="size-[14px] shrink-0 text-[#f7df1e]" />;
  }

  if (lower.endsWith(".html") || lower.endsWith(".htm")) {
    return <FileCode className="size-[14px] shrink-0 text-[#e34c26]" />;
  }

  if (
    lower.endsWith(".css") ||
    lower.endsWith(".scss") ||
    lower.endsWith(".sass") ||
    lower.endsWith(".less")
  ) {
    return <FileCode className="size-[14px] shrink-0 text-[#42a5f5]" />;
  }

  if (lower.endsWith(".json")) {
    return <FileJson className="size-[14px] shrink-0 text-[#cbcb41]" />;
  }

  if (lower.endsWith(".md") || lower.endsWith(".txt")) {
    return <FileText className="size-[14px] shrink-0 text-[#519aba]" />;
  }

  if (
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".gif") ||
    lower.endsWith(".svg") ||
    lower.endsWith(".ico") ||
    lower.endsWith(".webp")
  ) {
    return <FileImage className="size-[14px] shrink-0 text-[#b388ff]" />;
  }

  if (lower === ".gitignore" || lower === ".gitattributes") {
    return <FileText className="size-[14px] shrink-0 text-[#f05032]" />;
  }

  return <File className="size-[14px] shrink-0 text-[#858585]" />;
}

export function buildFileTree(files: ProjectFile[]): TreeNode[] {
  interface InternalFolder {
    name: string;
    path: string;
    folders: Map<string, InternalFolder>;
    files: Map<string, FileNode>;
  }

  const root: InternalFolder = {
    name: "",
    path: "",
    folders: new Map(),
    files: new Map(),
  };

  for (const file of files) {
    if (!file || !file.path) continue;

    const normalized = file.path.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
    if (!normalized) continue;

    const parts = normalized.split("/").filter(Boolean);
    if (parts.length === 0) continue;

    let current = root;
    let accumulatedPath = "";

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]!;
      accumulatedPath = accumulatedPath ? `${accumulatedPath}/${part}` : part;

      if (!current.folders.has(part)) {
        current.folders.set(part, {
          name: part,
          path: accumulatedPath,
          folders: new Map(),
          files: new Map(),
        });
      }
      current = current.folders.get(part)!;
    }

    const fileName = parts[parts.length - 1]!;
    current.files.set(fileName, {
      name: fileName,
      path: file.path,
      isFolder: false,
    });
  }

  function convertToTreeNodes(folder: InternalFolder): TreeNode[] {
    const foldersArray: TreeNode[] = Array.from(folder.folders.values())
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      )
      .map((f): FolderNode => ({
        name: f.name,
        path: f.path,
        isFolder: true,
        children: convertToTreeNodes(f),
      }));

    const filesArray: TreeNode[] = Array.from(folder.files.values()).sort(
      (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );

    return [...foldersArray, ...filesArray];
  }

  return convertToTreeNodes(root);
}

interface TreeItemProps {
  node: TreeNode;
  depth: number;
  activeFile: string;
  onFileSelect: (path: string) => void;
  collapsedPaths: Set<string>;
  onToggleFolder: (path: string) => void;
}

function TreeItem({
  node,
  depth,
  activeFile,
  onFileSelect,
  collapsedPaths,
  onToggleFolder,
}: TreeItemProps) {
  const indentPx = depth * 12 + 12;

  if (node.isFolder) {
    const isExpanded = !collapsedPaths.has(node.path);

    return (
      <div>
        <button
          type="button"
          onClick={() => onToggleFolder(node.path)}
          className="w-full h-[22px] flex items-center text-left text-[13px] text-[#cccccc] hover:bg-[#2a2d2e] select-none relative group focus:outline-none"
          style={{ paddingLeft: `${indentPx}px` }}
        >
          {/* Indent Guide Lines */}
          {Array.from({ length: depth }).map((_, i) => (
            <span
              key={i}
              className="absolute top-0 bottom-0 w-[1px] bg-[#37373d]/40 pointer-events-none"
              style={{ left: `${i * 12 + 18}px` }}
            />
          ))}

          {/* Chevron */}
          <span className="w-4 h-full flex items-center justify-center shrink-0 text-[#858585] group-hover:text-[#cccccc]">
            {isExpanded ? (
              <ChevronDown className="size-3 stroke-[2.5]" />
            ) : (
              <ChevronRight className="size-3 stroke-[2.5]" />
            )}
          </span>

          {/* Folder Icon */}
          <span className="size-[14px] flex items-center justify-center shrink-0 mr-1.5">
            {isExpanded ? (
              <FolderOpen className="size-[14px] text-[#dcb67a]" />
            ) : (
              <Folder className="size-[14px] text-[#dcb67a]" />
            )}
          </span>

          {/* Folder Name */}
          <span className="truncate leading-none text-[#cccccc]">{node.name}</span>
        </button>

        {isExpanded &&
          node.children.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              activeFile={activeFile}
              onFileSelect={onFileSelect}
              collapsedPaths={collapsedPaths}
              onToggleFolder={onToggleFolder}
            />
          ))}
      </div>
    );
  }

  const isActive =
    activeFile === node.path ||
    activeFile.replace(/^\/+/, "") === node.path.replace(/^\/+/, "");

  return (
    <button
      type="button"
      onClick={() => onFileSelect(node.path)}
      className={`w-full h-[22px] flex items-center text-left text-[13px] select-none relative focus:outline-none ${
        isActive
          ? "bg-[#37373d] text-[#ffffff]"
          : "text-[#cccccc] hover:bg-[#2a2d2e] hover:text-[#ffffff]"
      }`}
      style={{ paddingLeft: `${indentPx}px` }}
      title={node.path}
    >
      {/* Active Accent Strip */}
      {isActive && (
        <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#007acc]" />
      )}

      {/* Indent Guide Lines */}
      {Array.from({ length: depth }).map((_, i) => (
        <span
          key={i}
          className="absolute top-0 bottom-0 w-[1px] bg-[#37373d]/40 pointer-events-none"
          style={{ left: `${i * 12 + 18}px` }}
        />
      ))}

      {/* Spacer matching chevron width (w-4) */}
      <span className="w-4 shrink-0" />

      {/* File Icon */}
      <span className="size-[14px] flex items-center justify-center shrink-0 mr-1.5">
        {getFileIcon(node.name)}
      </span>

      {/* File Name */}
      <span className="truncate leading-none">{node.name}</span>
    </button>
  );
}

export default function FileExplorer({
  files,
  activeFile,
  onFileSelect,
  projectName,
}: FileExplorerProps) {
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());
  const [isProjectExpanded, setIsProjectExpanded] = useState(true);

  const tree = useMemo(() => buildFileTree(files), [files]);

  // Reveal active file's parent folders if collapsed
  useEffect(() => {
    if (!activeFile) return;

    const normalized = activeFile.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
    const parts = normalized.split("/").filter(Boolean);
    if (parts.length <= 1) return;

    const parentPaths: string[] = [];
    let current = "";
    for (let i = 0; i < parts.length - 1; i++) {
      current = current ? `${current}/${parts[i]}` : parts[i]!;
      parentPaths.push(current);
    }

    setCollapsedPaths((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const p of parentPaths) {
        if (next.has(p)) {
          next.delete(p);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [activeFile]);

  const toggleFolder = (folderPath: string) => {
    setCollapsedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(folderPath)) {
        next.delete(folderPath);
      } else {
        next.add(folderPath);
      }
      return next;
    });
  };

  return (
    <aside className="w-[260px] shrink-0 flex flex-col border-r border-[#252526] bg-[#181818] select-none h-full overflow-hidden font-sans">
      {/* 1. Header: EXPLORER ... */}
      <div className="h-[35px] px-5 flex items-center justify-between select-none border-b border-[#252526]">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-[#969696]">
          Explorer
        </span>
        <button
          type="button"
          className="flex items-center justify-center p-0.5 rounded text-[#8e8e8e] hover:text-[#cccccc] hover:bg-[#ffffff10] transition-colors"
          title="More Actions..."
        >
          <Ellipsis className="size-4" />
        </button>
      </div>

      {/* 2. Project Root: ⌄ PROJECT NAME */}
      <button
        type="button"
        onClick={() => setIsProjectExpanded(!isProjectExpanded)}
        className="w-full h-[22px] px-1 flex items-center gap-1 select-none text-left font-bold text-[11px] tracking-wide uppercase text-[#cccccc] hover:bg-[#2a2d2e]/50 focus:outline-none"
      >
        <span className="size-4 flex items-center justify-center shrink-0 text-[#858585]">
          {isProjectExpanded ? (
            <ChevronDown className="size-3 stroke-[2.5]" />
          ) : (
            <ChevronRight className="size-3 stroke-[2.5]" />
          )}
        </span>
        <span className="truncate">{projectName || "PROJECT"}</span>
      </button>

      {/* 3. File Tree */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-0.5">
        {!isProjectExpanded ? null : files.length === 0 ? (
          <div className="px-5 py-3 text-[12px] text-[#858585] italic select-none">
            No files
          </div>
        ) : (
          tree.map((node) => (
            <TreeItem
              key={node.path}
              node={node}
              depth={0}
              activeFile={activeFile}
              onFileSelect={onFileSelect}
              collapsedPaths={collapsedPaths}
              onToggleFolder={toggleFolder}
            />
          ))
        )}
      </div>
    </aside>
  );
}
