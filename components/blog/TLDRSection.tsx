'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Check } from 'lucide-react';

interface TLDRSectionProps {
  tldr?: string;
  keyTakeaways?: string[];
}

export function TLDRSection({ tldr, keyTakeaways }: TLDRSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!tldr && (!keyTakeaways || keyTakeaways.length === 0)) {
    return null;
  }

  return (
    <div className="not-prose mb-8 rounded-lg border border-primary/20 bg-primary/5">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-primary/10 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">TL;DR</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {tldr && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {tldr}
            </p>
          )}

          {keyTakeaways && keyTakeaways.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                Key Takeaways
              </h4>
              <ul className="space-y-1.5">
                {keyTakeaways.map((takeaway, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
