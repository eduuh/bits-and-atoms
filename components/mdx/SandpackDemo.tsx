"use client";

import { Sandpack } from "@codesandbox/sandpack-react";
import { useTheme } from "next-themes";

interface SandpackDemoProps {
  template?: "react" | "react-ts" | "vanilla" | "vanilla-ts" | "node";
  files?: Record<string, string>;
}

export function SandpackDemo({ template = "react", files = {} }: SandpackDemoProps) {
  const { theme } = useTheme();
  
  return (
    <div className="my-8">
      <Sandpack 
        template={template}
        theme={theme === 'dark' ? 'dark' : 'light'}
        files={files}
        options={{
          showNavigator: true,
          showLineNumbers: true,
          showInlineErrors: true,
          wrapContent: true,
          editorHeight: 400,
        }}
      />
    </div>
  );
}
