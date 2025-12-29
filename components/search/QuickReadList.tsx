'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronUp, ChevronDown, FileSearch, ExternalLink, Trash2, List } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface QuickReadItem {
  id: string;
  title: string;
  slug: string;
  matchedContent: string;
  searchTerm: string;
}

interface QuickReadListContextType {
  items: QuickReadItem[];
  addItem: (item: Omit<QuickReadItem, 'id'>) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  navigateNext: () => void;
  navigatePrev: () => void;
}

const QuickReadListContext = React.createContext<QuickReadListContextType | undefined>(undefined);

export function useQuickReadList() {
  const context = React.useContext(QuickReadListContext);
  if (!context) {
    throw new Error('useQuickReadList must be used within a QuickReadListProvider');
  }
  return context;
}

export function QuickReadListProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<QuickReadItem[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();

  const addItem = React.useCallback((item: Omit<QuickReadItem, 'id'>) => {
    const id = `${item.slug}-${Date.now()}`;
    setItems(prev => {
      // Don't add duplicates (same slug and content)
      const exists = prev.some(i => i.slug === item.slug && i.matchedContent === item.matchedContent);
      if (exists) return prev;
      return [...prev, { ...item, id }];
    });
  }, []);

  const removeItem = React.useCallback((id: string) => {
    setItems(prev => {
      const newItems = prev.filter(item => item.id !== id);
      // Adjust current index if needed
      if (currentIndex >= newItems.length && newItems.length > 0) {
        setCurrentIndex(newItems.length - 1);
      }
      return newItems;
    });
  }, [currentIndex]);

  const clearAll = React.useCallback(() => {
    setItems([]);
    setCurrentIndex(0);
    setIsOpen(false);
  }, []);

  const navigateNext = React.useCallback(() => {
    if (items.length === 0) return;
    const nextIndex = (currentIndex + 1) % items.length;
    setCurrentIndex(nextIndex);
    router.push(`/blog/${items[nextIndex].slug}`);
  }, [items, currentIndex, router]);

  const navigatePrev = React.useCallback(() => {
    if (items.length === 0) return;
    const prevIndex = (currentIndex - 1 + items.length) % items.length;
    setCurrentIndex(prevIndex);
    router.push(`/blog/${items[prevIndex].slug}`);
  }, [items, currentIndex, router]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Q to toggle Quick Read List
      if (e.key === 'q' && e.ctrlKey) {
        e.preventDefault();
        if (items.length > 0) {
          setIsOpen(prev => !prev);
        }
      }
      // When list is open, use arrow keys or [ ] to navigate
      if (isOpen && items.length > 0) {
        if (e.key === ']' || (e.key === 'ArrowDown' && e.ctrlKey)) {
          e.preventDefault();
          navigateNext();
        } else if (e.key === '[' || (e.key === 'ArrowUp' && e.ctrlKey)) {
          e.preventDefault();
          navigatePrev();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items.length, isOpen, navigateNext, navigatePrev]);

  return (
    <QuickReadListContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearAll,
        currentIndex,
        setCurrentIndex,
        isOpen,
        setIsOpen,
        navigateNext,
        navigatePrev,
      }}
    >
      {children}
    </QuickReadListContext.Provider>
  );
}

export function QuickReadListPanel() {
  const {
    items,
    removeItem,
    clearAll,
    currentIndex,
    setCurrentIndex,
    isOpen,
    setIsOpen,
    navigateNext,
    navigatePrev,
  } = useQuickReadList();
  const router = useRouter();
  const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  if (!isOpen || items.length === 0 || !portalContainer) return null;

  const handleItemClick = (index: number) => {
    setCurrentIndex(index);
    router.push(`/blog/${items[index].slug}`);
  };

  return createPortal(
    <div 
      className="fixed bottom-4 right-4 w-96 max-h-[50vh] bg-popover border border-border rounded-xl shadow-2xl overflow-hidden"
      style={{ zIndex: 99998 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <List className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Quick Read List</span>
          <span className="text-xs text-muted-foreground">({items.length} items)</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={navigatePrev}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Previous ([ or Ctrl+↑)"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            onClick={navigateNext}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Next (] or Ctrl+↓)"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            onClick={clearAll}
            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors ml-1"
            title="Clear all"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Close (Ctrl+Q)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="overflow-y-auto max-h-[calc(50vh-48px)]">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-border last:border-b-0 transition-colors ${
              index === currentIndex 
                ? 'bg-primary/10 border-l-2 border-l-primary' 
                : 'hover:bg-accent/50'
            }`}
            onClick={() => handleItemClick(index)}
          >
            <FileSearch className={`h-4 w-4 shrink-0 mt-0.5 ${index === currentIndex ? 'text-primary' : 'text-muted-foreground'}`} />
            <div className="flex-1 overflow-hidden">
              <div className={`text-sm font-medium truncate ${index === currentIndex ? 'text-primary' : ''}`}>
                {item.title}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 font-mono bg-muted/50 rounded px-1.5 py-0.5 line-clamp-2">
                {item.matchedContent}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                Search: &quot;{item.searchTerm}&quot;
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeItem(item.id);
              }}
              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
              title="Remove"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-muted/30 border-t border-border text-[10px] text-muted-foreground flex items-center justify-between">
        <span>
          <kbd className="rounded bg-muted px-1 py-0.5 font-mono">[</kbd>
          <kbd className="rounded bg-muted px-1 py-0.5 font-mono ml-1">]</kbd>
          <span className="ml-1">Navigate</span>
        </span>
        <span>
          <kbd className="rounded bg-muted px-1 py-0.5 font-mono">Ctrl+Q</kbd>
          <span className="ml-1">Toggle</span>
        </span>
      </div>
    </div>,
    portalContainer
  );
}

// Indicator button to show when there are items in the quick read list
export function QuickReadListIndicator() {
  const { items, isOpen, setIsOpen } = useQuickReadList();

  if (items.length === 0) return null;

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className={`fixed bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-all ${
        isOpen 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-popover border border-border hover:bg-accent'
      }`}
      style={{ zIndex: isOpen ? 99997 : 99998 }}
      title="Toggle Quick Read List (Ctrl+Q)"
    >
      <List className="h-4 w-4" />
      <span className="text-sm font-medium">{items.length}</span>
    </button>
  );
}
