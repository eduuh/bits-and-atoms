'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useSearch } from '@/hooks/useSearch';
import { useKeyboardShortcut, useDoubleKeyShortcut } from '@/hooks/useKeyboardShortcut';
import { useQuickReadList } from '../QuickReadList';
import { useKeyboardShortcuts } from '@/components/keyboard/KeyboardShortcuts';
import type { Post, Tag, SearchResult } from '@/components/search/shared/types';
import { CommandMenuTrigger } from './CommandMenuTrigger';
import { CommandMenuDialog } from './CommandMenuDialog';
import { CommandMenuInput } from './CommandMenuInput';
import { TagResults, GrepResults, PostResults, DefaultView } from './views';

interface CommandMenuProps {
  posts: Post[];
}

export function CommandMenu({ posts }: CommandMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const quickReadList = useQuickReadList();
  const { setIsHelpOpen } = useKeyboardShortcuts();

  // Use the shared search hook
  const { allTags, filteredPosts, fuzzySearch, grepSearch, tagSearch } = useSearch({
    posts,
    selectedTags,
  });

  // Get pinned posts or fallback to first 5
  const pinnedPosts = React.useMemo(() => {
    const pinned = posts.filter((post) => post.pinned);
    return pinned.length > 0 ? pinned.slice(0, 5) : posts.slice(0, 5);
  }, [posts]);

  // Register keyboard shortcuts
  useKeyboardShortcut({
    id: 'open-search',
    handler: () => setOpen((prev) => !prev),
  });

  useDoubleKeyShortcut(';', () => setOpen(true));

  // Reset state when closing
  React.useEffect(() => {
    if (!open) {
      setQuery('');
      setSelectedTags([]);
    }
  }, [open]);

  // Focus input when opening
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  // Detect search modes
  const isGrepMode = query.startsWith('>');
  const isTagMode = query.startsWith('#');
  const isSearching = query.length > 0 || selectedTags.length > 0;

  // Calculate search results based on mode
  const searchResults = React.useMemo((): SearchResult[] => {
    if (isTagMode) {
      const tagQuery = query.slice(1);
      return tagSearch(tagQuery).map((t) => ({ type: 'tag', item: t }));
    }

    if (isGrepMode) {
      const grepQuery = query.slice(1).trim();
      if (!grepQuery) return [];
      return grepSearch(grepQuery);
    }

    if (!query) {
      if (selectedTags.length > 0) {
        return filteredPosts.map((p) => ({ type: 'post', item: p }));
      }
      return [];
    }

    return fuzzySearch(query);
  }, [query, selectedTags, filteredPosts, isGrepMode, isTagMode, grepSearch, tagSearch, fuzzySearch]);

  // Handlers
  const handleSelectPost = React.useCallback(
    (post: Post) => {
      setOpen(false);
      router.push(`/blog/${post.slug}`);
    },
    [router]
  );

  const handleSelectTag = React.useCallback((tag: Tag) => {
    setSelectedTags((prev) => [...prev, tag.name]);
    setQuery('');
  }, []);

  const handleRemoveTag = React.useCallback((tagToRemove: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  }, []);

  const handleAddToQuickReadList = React.useCallback(
    (result: SearchResult) => {
      if (result.type === 'post' && result.matchedContent) {
        const post = result.item as Post;
        quickReadList.addItem({
          title: post.title,
          slug: post.slug,
          matchedContent: result.matchedContent,
          searchTerm: query.slice(1).trim(),
        });
      }
    },
    [query, quickReadList]
  );

  const handleOpenKeyboardHelp = React.useCallback(() => {
    setOpen(false);
    setTimeout(() => setIsHelpOpen(true), 100);
  }, [setIsHelpOpen]);

  return (
    <>
      <CommandMenuTrigger onClick={() => setOpen(true)} isOpen={open} />

      <CommandMenuDialog open={open} onClose={() => setOpen(false)} isGrepMode={isGrepMode}>
        <CommandMenuInput
          ref={inputRef}
          query={query}
          onQueryChange={setQuery}
          selectedTags={selectedTags}
          onRemoveTag={handleRemoveTag}
          onClose={() => setOpen(false)}
          allTags={allTags}
          onSelectTag={handleSelectTag}
        />

        <span id="search-help" className="sr-only">
          Type to search posts. Use # for tags, &gt; for grep content search. Use
          arrow keys to navigate, Enter to select.
        </span>

        <Command.List
          className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto overscroll-contain p-2"
          aria-label="Search results"
        >
          {/* Tag Results */}
          {isTagMode && (
            <TagResults
              tags={searchResults
                .filter((r) => r.type === 'tag')
                .map((r) => r.item as Tag)}
              onSelectTag={handleSelectTag}
            />
          )}

          {/* Grep Results */}
          {isGrepMode && searchResults.length > 0 && (
            <GrepResults
              results={searchResults}
              onSelectPost={handleSelectPost}
              onAddToQuickReadList={handleAddToQuickReadList}
            />
          )}

          {/* Normal Search Results */}
          {isSearching && !isTagMode && !isGrepMode && searchResults.length > 0 && (
            <PostResults results={searchResults} onSelectPost={handleSelectPost} />
          )}

          {/* No Results */}
          {isSearching && !isTagMode && searchResults.length === 0 && query && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No results found for &quot;
              <span className="font-medium text-foreground">{query}</span>&quot;
            </div>
          )}

          {/* Default View - When not searching */}
          {!isSearching && (
            <DefaultView
              pinnedPosts={pinnedPosts}
              onSelectPost={handleSelectPost}
              onOpenKeyboardHelp={handleOpenKeyboardHelp}
            />
          )}
        </Command.List>
      </CommandMenuDialog>
    </>
  );
}
