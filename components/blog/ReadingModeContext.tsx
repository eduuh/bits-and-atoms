'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ReadingModeContextType {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

const ReadingModeContext = createContext<ReadingModeContextType | undefined>(undefined);

export function ReadingModeProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (enabled) {
          e.preventDefault();
          e.stopPropagation();
          setEnabled(false);
        }
      } else if (e.key === 'Enter') {
        // Ignore if user is interacting with an input, button, or other focusable element
        const activeEl = document.activeElement;
        if (activeEl && activeEl !== document.body) {
          // Check if it's an interactive element or inside a dialog/modal
          const tagName = activeEl.tagName.toLowerCase();
          const isInteractive = ['input', 'textarea', 'button', 'a', 'select'].includes(tagName);
          const isInDialog = activeEl.closest('[role="dialog"]') || activeEl.closest('[cmdk-root]');
          if (isInteractive || isInDialog) {
            return;
          }
        }
        setEnabled(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);

  // Lock body scroll when enabled
  useEffect(() => {
    if (enabled) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [enabled]);

  return (
    <ReadingModeContext.Provider value={{ enabled, setEnabled }}>
      {children}
    </ReadingModeContext.Provider>
  );
}

export function useReadingMode() {
  const context = useContext(ReadingModeContext);
  if (context === undefined) {
    throw new Error('useReadingMode must be used within a ReadingModeProvider');
  }
  return context;
}
