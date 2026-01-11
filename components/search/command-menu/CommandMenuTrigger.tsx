'use client';

import { Search as SearchIcon } from 'lucide-react';

interface CommandMenuTriggerProps {
  onClick: () => void;
  isOpen: boolean;
}

export function CommandMenuTrigger({ onClick, isOpen }: CommandMenuTriggerProps) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-full hover:bg-primary/10 hover:text-primary transition-all hover:scale-110"
      aria-label="Open search (Command K)"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      type="button"
      title="Search"
    >
      <SearchIcon className="w-5 h-5" aria-hidden="true" />
    </button>
  );
}
