'use client';

import { useState, useRef, useEffect } from 'react';

interface FootnoteProps {
  id: number | string;
  children: React.ReactNode;
}

export function Footnote({ id, children }: FootnoteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<'above' | 'below'>('below');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isOpen && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipHeight = tooltipRef.current.offsetHeight;
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      if (spaceBelow < tooltipHeight + 20 && spaceAbove > tooltipHeight + 20) {
        setPosition('above');
      } else {
        setPosition('below');
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <span className="relative inline">
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors align-super -mt-1 ml-0.5"
        aria-label={`Footnote ${id}`}
        aria-expanded={isOpen}
      >
        {id}
      </button>
      {isOpen && (
        <span
          ref={tooltipRef}
          className={`absolute z-50 left-0 w-64 p-3 text-sm bg-popover text-popover-foreground rounded-lg border border-border shadow-lg ${
            position === 'above' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
          role="tooltip"
        >
          <span className="block text-xs font-semibold text-muted-foreground mb-1">
            Note {id}
          </span>
          <span className="block text-sm leading-relaxed">{children}</span>
        </span>
      )}
    </span>
  );
}
