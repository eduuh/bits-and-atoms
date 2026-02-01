'use client';

import { useState, useMemo } from 'react';
import { diffLines, Change } from 'diff';
import { FileCode, Columns, AlignJustify } from 'lucide-react';

interface CodeDiffProps {
  before: string;
  after: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

type ViewMode = 'unified' | 'split';

export function CodeDiff({
  before,
  after,
  language = 'text',
  filename,
  showLineNumbers = true,
}: CodeDiffProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('unified');

  const changes = useMemo(() => {
    const beforeTrimmed = before.trim();
    const afterTrimmed = after.trim();
    return diffLines(beforeTrimmed, afterTrimmed);
  }, [before, after]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    changes.forEach((change) => {
      if (change.added) {
        added += (change.value.match(/\n/g) || []).length + (change.value.endsWith('\n') ? 0 : 1);
      } else if (change.removed) {
        removed += (change.value.match(/\n/g) || []).length + (change.value.endsWith('\n') ? 0 : 1);
      }
    });
    return { added, removed };
  }, [changes]);

  return (
    <div className="my-6 rounded-lg border border-border overflow-hidden bg-card not-prose">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          {filename && (
            <>
              <FileCode className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{filename}</span>
            </>
          )}
          {language && !filename && (
            <span className="text-xs text-muted-foreground uppercase">{language}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-green-500 dark:text-green-400">+{stats.added}</span>
            <span className="text-red-500 dark:text-red-400">-{stats.removed}</span>
          </div>

          <div className="flex items-center border border-border rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('unified')}
              className={`p-1.5 ${
                viewMode === 'unified'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title="Unified view"
              aria-label="Unified view"
            >
              <AlignJustify className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 ${
                viewMode === 'split'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title="Split view"
              aria-label="Split view"
            >
              <Columns className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-x-auto">
        {viewMode === 'unified' ? (
          <UnifiedView changes={changes} showLineNumbers={showLineNumbers} />
        ) : (
          <SplitView changes={changes} showLineNumbers={showLineNumbers} />
        )}
      </div>
    </div>
  );
}

function UnifiedView({
  changes,
  showLineNumbers,
}: {
  changes: Change[];
  showLineNumbers: boolean;
}) {
  let lineNumber = 0;

  return (
    <pre className="p-0 m-0 bg-[#0d1117] text-sm">
      <code>
        {changes.map((change, changeIndex) => {
          const lines = change.value.split('\n').filter((line, i, arr) =>
            !(i === arr.length - 1 && line === '')
          );

          return lines.map((line, lineIndex) => {
            if (!change.added && !change.removed) {
              lineNumber++;
            } else if (change.added) {
              lineNumber++;
            }

            const bgClass = change.added
              ? 'bg-green-500/10'
              : change.removed
              ? 'bg-red-500/10'
              : '';

            const textClass = change.added
              ? 'text-green-400'
              : change.removed
              ? 'text-red-400'
              : 'text-gray-300';

            const prefix = change.added ? '+' : change.removed ? '-' : ' ';
            const prefixClass = change.added
              ? 'text-green-500'
              : change.removed
              ? 'text-red-500'
              : 'text-gray-500';

            return (
              <div
                key={`${changeIndex}-${lineIndex}`}
                className={`flex ${bgClass}`}
              >
                {showLineNumbers && (
                  <span className="select-none w-12 px-2 text-right text-gray-500 border-r border-gray-700/50">
                    {!change.removed ? lineNumber : ''}
                  </span>
                )}
                <span className={`select-none w-6 text-center ${prefixClass}`}>
                  {prefix}
                </span>
                <span className={`flex-1 px-2 ${textClass}`}>
                  {line || ' '}
                </span>
              </div>
            );
          });
        })}
      </code>
    </pre>
  );
}

function SplitView({
  changes,
  showLineNumbers,
}: {
  changes: Change[];
  showLineNumbers: boolean;
}) {
  const { leftLines, rightLines } = useMemo(() => {
    const left: { line: string; type: 'removed' | 'unchanged' | 'empty' }[] = [];
    const right: { line: string; type: 'added' | 'unchanged' | 'empty' }[] = [];

    changes.forEach((change) => {
      const lines = change.value.split('\n').filter((line, i, arr) =>
        !(i === arr.length - 1 && line === '')
      );

      if (change.added) {
        lines.forEach((line) => {
          left.push({ line: '', type: 'empty' });
          right.push({ line, type: 'added' });
        });
      } else if (change.removed) {
        lines.forEach((line) => {
          left.push({ line, type: 'removed' });
          right.push({ line: '', type: 'empty' });
        });
      } else {
        lines.forEach((line) => {
          left.push({ line, type: 'unchanged' });
          right.push({ line, type: 'unchanged' });
        });
      }
    });

    return { leftLines: left, rightLines: right };
  }, [changes]);

  return (
    <div className="flex">
      {/* Left (Before) */}
      <div className="flex-1 border-r border-gray-700/50">
        <div className="px-3 py-1 text-xs text-gray-500 bg-red-500/5 border-b border-gray-700/50">
          Before
        </div>
        <pre className="p-0 m-0 bg-[#0d1117] text-sm">
          <code>
            {leftLines.map((item, index) => {
              const bgClass = item.type === 'removed' ? 'bg-red-500/10' : '';
              const textClass = item.type === 'removed' ? 'text-red-400' : 'text-gray-300';

              return (
                <div key={index} className={`flex ${bgClass} min-h-[1.5rem]`}>
                  {showLineNumbers && (
                    <span className="select-none w-10 px-2 text-right text-gray-500 border-r border-gray-700/50">
                      {item.type !== 'empty' ? index + 1 : ''}
                    </span>
                  )}
                  <span className={`flex-1 px-2 ${textClass}`}>
                    {item.line || ' '}
                  </span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>

      {/* Right (After) */}
      <div className="flex-1">
        <div className="px-3 py-1 text-xs text-gray-500 bg-green-500/5 border-b border-gray-700/50">
          After
        </div>
        <pre className="p-0 m-0 bg-[#0d1117] text-sm">
          <code>
            {rightLines.map((item, index) => {
              const bgClass = item.type === 'added' ? 'bg-green-500/10' : '';
              const textClass = item.type === 'added' ? 'text-green-400' : 'text-gray-300';

              return (
                <div key={index} className={`flex ${bgClass} min-h-[1.5rem]`}>
                  {showLineNumbers && (
                    <span className="select-none w-10 px-2 text-right text-gray-500 border-r border-gray-700/50">
                      {item.type !== 'empty' ? index + 1 : ''}
                    </span>
                  )}
                  <span className={`flex-1 px-2 ${textClass}`}>
                    {item.line || ' '}
                  </span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}
