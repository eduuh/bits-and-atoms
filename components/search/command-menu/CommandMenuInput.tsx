'use client';

import { forwardRef, KeyboardEvent } from 'react';
import { Command } from 'cmdk';
import { Search as SearchIcon, X } from 'lucide-react';
import type { Tag } from '@/components/search/shared/types';

interface CommandMenuInputProps {
  query: string;
  onQueryChange: (query: string) => void;
  selectedTags: string[];
  onRemoveTag: (tag: string) => void;
  onClose: () => void;
  allTags: Tag[];
  onSelectTag: (tag: Tag) => void;
  placeholder?: string;
}

export const CommandMenuInput = forwardRef<HTMLInputElement, CommandMenuInputProps>(
  function CommandMenuInput(
    {
      query,
      onQueryChange,
      selectedTags,
      onRemoveTag,
      onClose,
      allTags,
      onSelectTag,
      placeholder,
    },
    ref
  ) {
    const defaultPlaceholder =
      selectedTags.length > 0
        ? 'Continue searching...'
        : 'Search posts, # tags, > grep content...';

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      // Remove last tag on backspace when query is empty
      if (e.key === 'Backspace' && !query && selectedTags.length > 0) {
        onRemoveTag(selectedTags[selectedTags.length - 1]);
      }

      // Add tag on space when in tag mode
      if (e.key === ' ' && query.startsWith('#')) {
        const potentialTag = query.slice(1);
        const match = allTags.find(
          (t) => t.name.toLowerCase() === potentialTag.toLowerCase()
        );
        if (match && !selectedTags.includes(match.name)) {
          e.preventDefault();
          onSelectTag(match);
        }
      }
    };

    return (
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <SearchIcon
          className="h-5 w-5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />

        {/* Selected Tags */}
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
          >
            #{tag}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveTag(tag);
              }}
              className="hover:text-primary/70"
              aria-label={`Remove ${tag} filter`}
              type="button"
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          </span>
        ))}

        <Command.Input
          ref={ref}
          placeholder={placeholder || defaultPlaceholder}
          value={query}
          onValueChange={onQueryChange}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          aria-label="Search input"
          aria-describedby="search-help"
        />

        <button
          onClick={onClose}
          className="rounded-md p-1 hover:bg-accent"
          aria-label="Close search"
          type="button"
        >
          <X className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        </button>
      </div>
    );
  }
);
