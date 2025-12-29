'use client';

import { BookOpen } from 'lucide-react';
import { useReadingMode } from './ReadingModeContext';

export function ReadingModeTrigger() {
  const { setEnabled } = useReadingMode();

  return (
    <button
      onClick={() => setEnabled(true)}
      className="flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/20"
      title="Enter Reading Mode"
      aria-label="Enter Reading Mode"
    >
      <BookOpen className="w-4 h-4" />
    </button>
  );
}
