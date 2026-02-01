'use client';

import { Sandpack, SandpackProvider, SandpackLayout, SandpackCodeEditor, SandpackPreview } from '@codesandbox/sandpack-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

type PlaygroundTemplate =
  | 'react'
  | 'react-ts'
  | 'vanilla'
  | 'vanilla-ts'
  | 'node'
  | 'vue'
  | 'vue-ts'
  | 'svelte'
  | 'angular';

interface PlaygroundProps {
  template?: PlaygroundTemplate;
  files?: Record<string, string>;
  showNavigator?: boolean;
  showPreview?: boolean;
  showConsole?: boolean;
  editorHeight?: number;
  title?: string;
  description?: string;
}

const templateLabels: Record<PlaygroundTemplate, string> = {
  'react': 'React',
  'react-ts': 'React + TypeScript',
  'vanilla': 'JavaScript',
  'vanilla-ts': 'TypeScript',
  'node': 'Node.js',
  'vue': 'Vue',
  'vue-ts': 'Vue + TypeScript',
  'svelte': 'Svelte',
  'angular': 'Angular',
};

export function Playground({
  template = 'react',
  files = {},
  showNavigator = true,
  showPreview = true,
  showConsole = false,
  editorHeight = 400,
  title,
  description,
}: PlaygroundProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="my-8 rounded-lg border border-border bg-muted/50 animate-pulse" style={{ height: editorHeight + 100 }}>
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          Loading playground...
        </div>
      </div>
    );
  }

  return (
    <div className="my-8 rounded-lg overflow-hidden border border-border not-prose">
      {(title || description) && (
        <div className="px-4 py-3 border-b border-border bg-muted/50">
          <div className="flex items-center justify-between">
            {title && (
              <h4 className="text-sm font-semibold text-foreground">{title}</h4>
            )}
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {templateLabels[template]}
            </span>
          </div>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <Sandpack
        template={template}
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        files={files}
        options={{
          showNavigator,
          showLineNumbers: true,
          showInlineErrors: true,
          wrapContent: true,
          editorHeight,
          showConsole,
          showConsoleButton: showConsole,
        }}
      />
    </div>
  );
}
