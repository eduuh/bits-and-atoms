'use client';

import { useState, useEffect, useCallback } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';

interface TerminalLine {
  input?: string;
  output?: string;
  delay?: number;
}

interface TerminalProps {
  title?: string;
  commands: TerminalLine[];
  loop?: boolean;
  autoStart?: boolean;
  typingSpeed?: number;
}

export function Terminal({
  title = 'Terminal',
  commands,
  loop = false,
  autoStart = true,
  typingSpeed = 50,
}: TerminalProps) {
  const [displayedLines, setDisplayedLines] = useState<{ text: string; isInput: boolean }[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [copied, setCopied] = useState(false);

  const reset = useCallback(() => {
    setDisplayedLines([]);
    setCurrentLineIndex(0);
    setCurrentCharIndex(0);
    setIsTyping(false);
    setIsComplete(false);
  }, []);

  const start = useCallback(() => {
    reset();
    setIsTyping(true);
  }, [reset]);

  // Auto-start on mount
  useEffect(() => {
    if (autoStart) {
      start();
    }
  }, [autoStart, start]);

  // Main animation loop
  useEffect(() => {
    if (!isTyping || currentLineIndex >= commands.length) {
      if (currentLineIndex >= commands.length && isTyping) {
        setIsTyping(false);
        setIsComplete(true);
        if (loop) {
          const timer = setTimeout(() => {
            start();
          }, 2000);
          return () => clearTimeout(timer);
        }
      }
      return;
    }

    const currentCommand = commands[currentLineIndex];

    // Handle input (typing effect)
    if (currentCommand.input) {
      if (currentCharIndex < currentCommand.input.length) {
        const timer = setTimeout(() => {
          setDisplayedLines((prev) => {
            const newLines = [...prev];
            const lastLine = newLines[newLines.length - 1];
            if (lastLine && lastLine.isInput && currentCharIndex > 0) {
              newLines[newLines.length - 1] = {
                text: currentCommand.input!.slice(0, currentCharIndex + 1),
                isInput: true,
              };
            } else {
              newLines.push({
                text: currentCommand.input!.slice(0, currentCharIndex + 1),
                isInput: true,
              });
            }
            return newLines;
          });
          setCurrentCharIndex((prev) => prev + 1);
        }, typingSpeed);
        return () => clearTimeout(timer);
      } else {
        // Finished typing this input, move to next line after delay
        const timer = setTimeout(() => {
          setCurrentLineIndex((prev) => prev + 1);
          setCurrentCharIndex(0);
        }, currentCommand.delay || 300);
        return () => clearTimeout(timer);
      }
    }

    // Handle output (instant display)
    if (currentCommand.output) {
      const timer = setTimeout(() => {
        setDisplayedLines((prev) => [
          ...prev,
          { text: currentCommand.output!, isInput: false },
        ]);
        setCurrentLineIndex((prev) => prev + 1);
        setCurrentCharIndex(0);
      }, currentCommand.delay || 100);
      return () => clearTimeout(timer);
    }

    // No input or output, just move to next line
    setCurrentLineIndex((prev) => prev + 1);
  }, [isTyping, currentLineIndex, currentCharIndex, commands, typingSpeed, loop, start]);

  // Get all input commands for copying
  const allInputCommands = commands
    .filter((cmd) => cmd.input)
    .map((cmd) => cmd.input)
    .join('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(allInputCommands);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard errors
    }
  };

  // Determine if we should show cursor
  const showCursor = isTyping && currentLineIndex < commands.length && commands[currentLineIndex]?.input;

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-gray-700 shadow-lg not-prose">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-xs text-gray-400 ml-2">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {isComplete && !loop && (
            <button
              onClick={start}
              className="p-1.5 text-gray-400 hover:text-white transition-colors"
              title="Replay"
              aria-label="Replay animation"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
            title="Copy commands"
            aria-label="Copy commands"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Terminal content */}
      <div className="bg-gray-900 p-4 font-mono text-sm min-h-[120px]">
        {displayedLines.map((line, index) => (
          <div key={index} className="leading-relaxed">
            {line.isInput ? (
              <span>
                <span className="text-green-400">$</span>{' '}
                <span className="text-white">{line.text}</span>
                {/* Show cursor on current typing line */}
                {showCursor && index === displayedLines.length - 1 && (
                  <span className="animate-pulse text-white">█</span>
                )}
              </span>
            ) : (
              <span className="text-gray-300">{line.text}</span>
            )}
          </div>
        ))}

        {/* Show prompt when idle */}
        {(isComplete || !isTyping) && displayedLines.length > 0 && (
          <div className="leading-relaxed">
            <span className="text-green-400">$</span>{' '}
            <span className="animate-pulse text-white">█</span>
          </div>
        )}

        {/* Initial prompt when empty */}
        {displayedLines.length === 0 && !isTyping && (
          <div className="leading-relaxed">
            <span className="text-green-400">$</span>{' '}
            <span className="animate-pulse text-white">█</span>
          </div>
        )}
      </div>
    </div>
  );
}
