'use client';

import { useState, useEffect } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

interface SidenoteProps {
  id?: number | string;
  label?: string;
  children: React.ReactNode;
}

export function Sidenote({ id, label, children }: SidenoteProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1280);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const displayLabel = label || (id ? `Note ${id}` : 'Note');

  // On large screens, show as margin note
  if (isLargeScreen) {
    return (
      <span className="relative inline">
        {id && (
          <sup className="text-primary font-semibold text-xs ml-0.5">
            [{id}]
          </sup>
        )}
        <aside className="absolute left-[calc(100%+2rem)] top-0 w-48 text-sm text-muted-foreground leading-relaxed not-prose">
          {id && (
            <span className="block text-xs font-semibold text-primary mb-1">
              {displayLabel}
            </span>
          )}
          <span className="block">{children}</span>
        </aside>
      </span>
    );
  }

  // On smaller screens, show as expandable inline note
  return (
    <span className="inline">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-secondary/50 text-secondary-foreground hover:bg-secondary/80 transition-colors ml-1"
        aria-expanded={isExpanded}
      >
        <Info className="h-3 w-3" />
        <span>{displayLabel}</span>
        {isExpanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>
      {isExpanded && (
        <span className="block mt-2 mb-3 p-3 text-sm bg-secondary/30 border-l-2 border-primary rounded-r-md text-muted-foreground not-prose">
          {children}
        </span>
      )}
    </span>
  );
}
