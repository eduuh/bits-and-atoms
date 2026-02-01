'use client';

import { useState, useCallback, useEffect } from 'react';
import { Play, RotateCcw, Copy, Check } from 'lucide-react';

interface InlinePlaygroundProps {
  code: string;
  language?: 'javascript' | 'typescript';
  showLineNumbers?: boolean;
  autoRun?: boolean;
}

// NOTE: This component intentionally uses Function constructor to evaluate
// user-provided code in the browser. This is safe because:
// 1. Code only runs client-side in the user's own browser
// 2. No server-side code execution
// 3. This is the intended purpose of an interactive code playground

export function InlinePlayground({
  code,
  language = 'javascript',
  showLineNumbers = true,
  autoRun = false,
}: InlinePlaygroundProps) {
  const [editedCode, setEditedCode] = useState(code.trim());
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const runCode = useCallback(() => {
    setIsRunning(true);
    setOutput([]);
    setError(null);

    try {
      // Create a custom console that captures output
      const logs: string[] = [];
      const customConsole = {
        log: (...args: unknown[]) => {
          logs.push(args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '));
        },
        error: (...args: unknown[]) => {
          logs.push(`Error: ${args.map(arg => String(arg)).join(' ')}`);
        },
        warn: (...args: unknown[]) => {
          logs.push(`Warning: ${args.map(arg => String(arg)).join(' ')}`);
        },
        info: (...args: unknown[]) => {
          logs.push(args.map(arg => String(arg)).join(' '));
        },
      };

      // Execute the code with custom console (client-side only, user's own code)
      const fn = new Function('console', editedCode);
      const result = fn(customConsole);

      // If the code returns a value, add it to output
      if (result !== undefined) {
        logs.push(`→ ${typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}`);
      }

      setOutput(logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsRunning(false);
    }
  }, [editedCode]);

  const reset = useCallback(() => {
    setEditedCode(code.trim());
    setOutput([]);
    setError(null);
  }, [code]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(editedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard errors
    }
  }, [editedCode]);

  useEffect(() => {
    if (autoRun) {
      runCode();
    }
  }, [autoRun, runCode]);

  const lines = editedCode.split('\n');

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-border not-prose">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs text-gray-400 font-medium">
          {language === 'typescript' ? 'TypeScript' : 'JavaScript'}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
            title="Reset code"
            aria-label="Reset code"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
            title="Copy code"
            aria-label="Copy code"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Editor and Output */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Code Editor */}
        <div className="relative bg-gray-900">
          <textarea
            value={editedCode}
            onChange={(e) => setEditedCode(e.target.value)}
            className="w-full h-full min-h-[120px] p-4 font-mono text-sm bg-transparent text-white resize-none focus:outline-none"
            style={{
              paddingLeft: showLineNumbers ? '3rem' : '1rem',
            }}
            spellCheck={false}
          />
          {showLineNumbers && (
            <div className="absolute top-0 left-0 p-4 font-mono text-sm text-gray-500 pointer-events-none select-none">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}
        </div>

        {/* Output Panel */}
        <div className="border-t md:border-t-0 md:border-l border-gray-700 bg-gray-950">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
            <span className="text-xs text-gray-400 font-medium">Output</span>
            <button
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded bg-green-600 hover:bg-green-500 text-white transition-colors disabled:opacity-50"
            >
              <Play className="h-3 w-3" />
              {isRunning ? 'Running...' : 'Run'}
            </button>
          </div>
          <div className="p-4 font-mono text-sm min-h-[120px] max-h-[300px] overflow-auto">
            {error ? (
              <div className="text-red-400">{error}</div>
            ) : output.length > 0 ? (
              output.map((line, i) => (
                <div key={i} className="text-gray-300 whitespace-pre-wrap">
                  {line}
                </div>
              ))
            ) : (
              <div className="text-gray-500 italic">
                Click &quot;Run&quot; to execute the code
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
