'use client';

import { useState } from 'react';
import { History, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { ChangelogEntry } from '@/lib/mdx/source';

interface ChangelogProps {
  entries: ChangelogEntry[];
  currentVersion?: string;
}

export function Changelog({ entries, currentVersion }: ChangelogProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!entries || entries.length === 0) {
    return null;
  }

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const latestEntry = sortedEntries[0];

  return (
    <div className="mt-8 rounded-lg border border-border bg-card overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
            <History className="h-4 w-4" />
          </div>
          <div className="text-left">
            <span className="text-sm font-medium text-foreground">Changelog</span>
            <span className="text-xs text-muted-foreground ml-2">
              v{latestEntry.version} • {formatDate(latestEntry.date)}
            </span>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-border px-4 py-4 space-y-4">
          {sortedEntries.map((entry, index) => (
            <div
              key={entry.version}
              className={`${index > 0 ? 'pt-4 border-t border-border/50' : ''}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  v{entry.version}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(entry.date)}
                </span>
                {index === 0 && (
                  <span className="text-xs text-primary font-medium">(Latest)</span>
                )}
              </div>
              <ul className="space-y-1 ml-1">
                {entry.changes.map((change, changeIndex) => (
                  <li
                    key={changeIndex}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-primary mt-1.5">•</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
