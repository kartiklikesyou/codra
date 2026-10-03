"use client"

import Editor from "@monaco-editor/react"

type ProjectFile={
    path: string,
    content: string
}

type CodeEditorProps = {
    file: ProjectFile | null,
    onChange: (content:string) => void 
}

function getLanguage(path:string){
    if (path.endsWith(".js")) return "javascript"
    if (path.endsWith(".jsx")) return "javascript"
    if (path.endsWith(".ts")) return "typescript"
    if (path.endsWith("tsx")) return "typescript"
    if (path.endsWith("html")) return "html"
    if (path.endsWith("css")) return "css"
    if (path.endsWith(".json")) return "json"

    return "plaintext"
}

export default function CodeEditor({
    file,
    onChange
}:CodeEditorProps){
    if(!file){
        return (
            <div className="flex h-full items-center justify-center text-sm text-white/40">
                Select a file to start editing
            </div>
        )
    }
    return (
        <Editor
            height="100%"
            theme = "vs-dark"
            language= {getLanguage(file.path)}
            value={file.content}
            onChange={(value)=>{
                onChange(value ?? "")
            }}
            options={{
                minimap: {
                enabled: false,
                },
                fontSize: 14,
                padding: {
                top: 16,
                },
                automaticLayout: true,
                scrollBeyondLastLine: false,
                wordWrap: "on",
            }}
        />
    )
}
