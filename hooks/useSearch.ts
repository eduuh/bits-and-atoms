'use client';

import { useMemo, useCallback } from 'react';
import Fuse, { type IFuseOptions } from 'fuse.js';
import type { Post, Tag, SearchResult } from '@/components/search/shared/types';

const DEFAULT_FUSE_CONFIG: IFuseOptions<Post> = {
  keys: [
    { name: 'title', weight: 0.5 },
    { name: 'summary', weight: 0.3 },
    { name: 'content', weight: 0.1 },
  ],
  threshold: 0.3,
  ignoreLocation: true,
  includeMatches: true,
};

interface UseSearchOptions {
  posts: Post[];
  selectedTags: string[];
}

interface UseSearchReturn {
  allTags: Tag[];
  filteredPosts: Post[];
  fuzzySearch: (query: string) => SearchResult[];
  grepSearch: (query: string) => SearchResult[];
  tagSearch: (query: string) => Tag[];
}

/**
 * Hook that provides search functionality for posts and tags.
 * Consolidates duplicate search logic from CommandMenu and Search components.
 */
export function useSearch({ posts, selectedTags }: UseSearchOptions): UseSearchReturn {
  // Extract all unique tags from posts
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach((post) => post.tags?.forEach((tag) => tags.add(tag)));
    return Array.from(tags).map((tag) => ({ name: tag }));
  }, [posts]);

  // Filter posts by selected tags
  const filteredPosts = useMemo(() => {
    if (selectedTags.length === 0) return posts;
    return posts.filter((post) =>
      selectedTags.every((tag) => post.tags?.includes(tag))
    );
  }, [posts, selectedTags]);

  // Fuse instance for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(filteredPosts, DEFAULT_FUSE_CONFIG);
  }, [filteredPosts]);

  // Fuzzy search in post titles/summaries
  const fuzzySearch = useCallback(
    (query: string): SearchResult[] => {
      if (!query) return [];
      return fuse.search(query).map((result) => ({
        type: 'post' as const,
        item: result.item,
      }));
    },
    [fuse]
  );

  // Grep search in post content
  const grepSearch = useCallback(
    (searchTerm: string): SearchResult[] => {
      const results: SearchResult[] = [];
      const lowerSearchTerm = searchTerm.toLowerCase();

      for (const post of filteredPosts) {
        if (!post.content) continue;

        const lowerContent = post.content.toLowerCase();
        const index = lowerContent.indexOf(lowerSearchTerm);

        if (index !== -1) {
          // Extract a snippet around the match (50 chars before and after)
          const start = Math.max(0, index - 50);
          const end = Math.min(
            post.content.length,
            index + searchTerm.length + 50
          );
          let snippet = post.content.slice(start, end);

          // Clean up the snippet
          if (start > 0) snippet = '...' + snippet;
          if (end < post.content.length) snippet = snippet + '...';

          // Remove markdown syntax for cleaner display
          snippet = snippet
            .replace(/[#*`_\[\]]/g, '')
            .replace(/\n/g, ' ')
            .trim();

          results.push({
            type: 'post',
            item: post,
            matchedContent: snippet,
          });
        }
      }

      return results;
    },
    [filteredPosts]
  );

  // Tag autocomplete search
  const tagSearch = useCallback(
    (query: string): Tag[] => {
      const availableTags = allTags.filter((t) => !selectedTags.includes(t.name));

      if (!query) return availableTags;

      return new Fuse(availableTags, { keys: ['name'], threshold: 0.3 })
        .search(query)
        .map((r) => r.item);
    },
    [allTags, selectedTags]
  );

  return { allTags, filteredPosts, fuzzySearch, grepSearch, tagSearch };
}
