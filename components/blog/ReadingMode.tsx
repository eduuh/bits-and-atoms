'use client';

import { X } from 'lucide-react';
import { useReadingMode } from './ReadingModeContext';

interface ReadingModeProps {
  children: React.ReactNode;
  title?: string;
  summary?: string;
}

export function ReadingMode({ children, title, summary }: ReadingModeProps) {
  const { enabled, setEnabled } = useReadingMode();

  return (
    <>
      {/* Normal Content */}
      {children}

      {/* Fullscreen Overlay */}
      {enabled && (
        <div className="fixed inset-0 z-[100] bg-background overflow-y-auto animate-in fade-in duration-300">
          <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
            {/* Exit Button */}
            <button
              onClick={() => setEnabled(false)}
              className="fixed top-6 right-6 p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors shadow-sm"
              title="Exit Reading Mode (ESC)"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Content Container */}
            <div className="prose dark:prose-invert max-w-none mx-auto">
              {title && (
                <div className="mb-8 pb-8 border-b border-border">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{title}</h1>
                  {summary && <p className="text-xl text-muted-foreground leading-relaxed">{summary}</p>}
                </div>
              )}
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
