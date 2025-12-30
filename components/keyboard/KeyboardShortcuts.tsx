'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X, Keyboard } from 'lucide-react';

// Default keyboard shortcuts configuration
export const defaultShortcuts: ShortcutConfig[] = [
  // Navigation
  { id: 'open-search', key: 'k', modifiers: ['meta'], description: 'Open search / command menu', category: 'Navigation' },
  { id: 'close-modal', key: 'Escape', modifiers: [], description: 'Close modal / dialog', category: 'Navigation' },
  { id: 'go-home', key: 'g h', modifiers: [], description: 'Go to home', category: 'Navigation', sequence: true },
  { id: 'go-blog', key: 'g b', modifiers: [], description: 'Go to blog', category: 'Navigation', sequence: true },
  
  // Search modes
  { id: 'search-tags', key: '#', modifiers: [], description: 'Search by tags (in search)', category: 'Search' },
  { id: 'search-grep', key: '>', modifiers: [], description: 'Grep content (in search)', category: 'Search' },
  
  // Quick Read List
  { id: 'toggle-quick-read', key: 'q', modifiers: ['ctrl'], description: 'Toggle Quick Read List', category: 'Quick Read' },
  { id: 'quick-read-next', key: ']', modifiers: [], description: 'Next item in Quick Read List', category: 'Quick Read' },
  { id: 'quick-read-prev', key: '[', modifiers: [], description: 'Previous item in Quick Read List', category: 'Quick Read' },
  
  // Reading
  { id: 'toggle-reading-mode', key: 'Enter', modifiers: [], description: 'Toggle reading mode (on blog posts)', category: 'Reading' },
  
  // Theme
  { id: 'toggle-theme', key: 't', modifiers: ['meta', 'shift'], description: 'Toggle theme', category: 'Theme' },
  
  // Help
  { id: 'open-help', key: '?', modifiers: [], description: 'Open keyboard shortcuts help', category: 'Help' },
];

export interface ShortcutConfig {
  id: string;
  key: string;
  modifiers: ('meta' | 'ctrl' | 'alt' | 'shift')[];
  description: string;
  category: string;
  sequence?: boolean; // For key sequences like "g h"
}

interface KeyboardShortcutsContextType {
  shortcuts: ShortcutConfig[];
  isHelpOpen: boolean;
  setIsHelpOpen: (open: boolean) => void;
  getShortcut: (id: string) => ShortcutConfig | undefined;
  formatShortcut: (shortcut: ShortcutConfig) => string;
}

const KeyboardShortcutsContext = React.createContext<KeyboardShortcutsContextType | undefined>(undefined);

export function useKeyboardShortcuts() {
  const context = React.useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
  }
  return context;
}

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const [isHelpOpen, setIsHelpOpen] = React.useState(false);

  const getShortcut = React.useCallback((id: string) => {
    return defaultShortcuts.find(s => s.id === id);
  }, []);

  const formatShortcut = React.useCallback((shortcut: ShortcutConfig): string => {
    const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const parts: string[] = [];
    
    if (shortcut.modifiers.includes('meta')) {
      parts.push(isMac ? '⌘' : 'Ctrl');
    }
    if (shortcut.modifiers.includes('ctrl')) {
      parts.push('Ctrl');
    }
    if (shortcut.modifiers.includes('alt')) {
      parts.push(isMac ? '⌥' : 'Alt');
    }
    if (shortcut.modifiers.includes('shift')) {
      parts.push(isMac ? '⇧' : 'Shift');
    }
    
    // Format the key
    let key = shortcut.key;
    if (key === ' ') key = 'Space';
    if (key === 'Escape') key = 'Esc';
    if (key === 'Enter') key = '↵';
    if (key === 'ArrowUp') key = '↑';
    if (key === 'ArrowDown') key = '↓';
    if (key === 'ArrowLeft') key = '←';
    if (key === 'ArrowRight') key = '→';
    
    if (shortcut.sequence) {
      // Key sequence like "g h"
      parts.push(...key.split(' '));
    } else {
      parts.push(key.toUpperCase());
    }
    
    return parts.join(shortcut.sequence ? ' then ' : '+');
  }, []);

  // Listen for ? key to open help
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Check if inside a modal/dialog
      if ((e.target as HTMLElement).closest('[role="dialog"]') || 
          (e.target as HTMLElement).closest('[cmdk-root]')) {
        return;
      }
      
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setIsHelpOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <KeyboardShortcutsContext.Provider
      value={{
        shortcuts: defaultShortcuts,
        isHelpOpen,
        setIsHelpOpen,
        getShortcut,
        formatShortcut,
      }}
    >
      {children}
    </KeyboardShortcutsContext.Provider>
  );
}

export function KeyboardShortcutsHelp() {
  const { shortcuts, isHelpOpen, setIsHelpOpen, formatShortcut } = useKeyboardShortcuts();
  const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  // Group shortcuts by category
  const groupedShortcuts = React.useMemo(() => {
    const groups: Record<string, ShortcutConfig[]> = {};
    shortcuts.forEach(shortcut => {
      if (!groups[shortcut.category]) {
        groups[shortcut.category] = [];
      }
      groups[shortcut.category].push(shortcut);
    });
    return groups;
  }, [shortcuts]);

  // Lock body scroll when open
  React.useEffect(() => {
    if (isHelpOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isHelpOpen]);

  // Close on Escape
  React.useEffect(() => {
    if (!isHelpOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsHelpOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHelpOpen, setIsHelpOpen]);

  if (!isHelpOpen || !portalContainer) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        style={{ zIndex: 99999 }}
        onClick={() => setIsHelpOpen(false)}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        className="fixed left-1/2 top-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 px-4"
        style={{ zIndex: 100000 }}
      >
        <div 
          className="overflow-hidden rounded-xl border border-border bg-popover shadow-2xl"
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-labelledby="keyboard-help-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <Keyboard className="h-5 w-5 text-primary" />
              <h2 id="keyboard-help-title" className="text-lg font-semibold">Keyboard Shortcuts</h2>
            </div>
            <button 
              onClick={() => setIsHelpOpen(false)}
              className="rounded-md p-1.5 hover:bg-accent transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          
          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto p-6">
            <div className="space-y-6">
              {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                <div key={category}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    {category}
                  </h3>
                  <div className="space-y-1">
                    {categoryShortcuts.map(shortcut => (
                      <ShortcutRow 
                        key={shortcut.id} 
                        shortcut={shortcut} 
                        formatted={formatShortcut(shortcut)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Footer */}
          <div className="border-t border-border bg-muted/30 px-6 py-3 text-xs text-muted-foreground text-center">
            Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">?</kbd> to toggle this help
          </div>
        </div>
      </div>
    </>,
    portalContainer
  );
}

interface ShortcutRowProps {
  shortcut: ShortcutConfig;
  formatted: string;
}

function ShortcutRow({ shortcut, formatted }: ShortcutRowProps) {
  return (
    <div className="flex items-center justify-between rounded-lg px-4 py-2.5">
      <span className="text-sm text-foreground">{shortcut.description}</span>
      <div className="flex items-center gap-1">
        {formatted.split(/(\+| then )/).filter(Boolean).map((part, i) => {
          if (part === '+' || part === ' then ') {
            return <span key={i} className="text-muted-foreground text-xs">{part}</span>;
          }
          return (
            <kbd 
              key={i} 
              className="rounded px-1.5 py-0.5 font-mono text-xs bg-muted text-foreground"
            >
              {part}
            </kbd>
          );
        })}
      </div>
    </div>
  );
}
