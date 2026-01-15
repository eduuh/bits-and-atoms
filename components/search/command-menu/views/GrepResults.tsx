'use client';

import { Command } from 'cmdk';
import { motion } from 'framer-motion';
import { FileSearch, ListPlus } from 'lucide-react';
import type { Post, SearchResult } from '@/components/search/shared/types';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface GrepResultsProps {
  results: SearchResult[];
  onSelectPost: (post: Post) => void;
  onAddToQuickReadList?: (result: SearchResult) => void;
}

export function GrepResults({
  results,
  onSelectPost,
  onAddToQuickReadList,
}: GrepResultsProps) {
  if (results.length === 0) return null;

  return (
    <Command.Group
      heading="Content Matches"
      className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
    >
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {results.map((result, index) => {
          const post = result.item as Post;
          return (
            <motion.div key={index} variants={staggerItem}>
              <Command.Item
                value={post.title + index}
                onSelect={() => onSelectPost(post)}
                className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150 hover:bg-accent/50 hover:shadow-sm"
              >
                <FileSearch
                  className="h-4 w-4 shrink-0 text-muted-foreground group-aria-selected:text-primary transition-colors duration-150"
                  aria-hidden="true"
                />
                <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                  <span className="truncate text-sm font-medium group-aria-selected:text-primary transition-colors duration-150">
                    {post.title}
                  </span>
                  {result.matchedContent && (
                    <span className="text-xs text-muted-foreground line-clamp-2 font-mono bg-muted/50 rounded px-1.5 py-0.5">
                      {result.matchedContent}
                    </span>
                  )}
                </div>
                {onAddToQuickReadList && (
                  <div className="shrink-0 flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 group-aria-selected:opacity-100 transition-all duration-150">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToQuickReadList(result);
                      }}
                      className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-primary transition-all duration-150 hover:scale-110 active:scale-95"
                      title="Add to Quick Read List"
                      aria-label="Add to Quick Read List"
                    >
                      <ListPlus className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </Command.Item>
            </motion.div>
          );
        })}
      </motion.div>
    </Command.Group>
  );
}
