'use client';

import { Command } from 'cmdk';
import { motion } from 'framer-motion';
import type { Post, SearchResult } from '@/components/search/shared/types';
import { getPostIcon } from '@/components/search/shared/tag-icons';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface PostResultsProps {
  results: SearchResult[];
  onSelectPost: (post: Post) => void;
  heading?: string;
}

export function PostResults({
  results,
  onSelectPost,
  heading = 'Results',
}: PostResultsProps) {
  if (results.length === 0) return null;

  return (
    <Command.Group
      heading={heading}
      className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
    >
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {results.map((result, index) => {
          const post = result.item as Post;
          const PostIcon = getPostIcon(post.tags);
          return (
            <motion.div key={index} variants={staggerItem}>
              <Command.Item
                value={post.title}
                onSelect={() => onSelectPost(post)}
                className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150 hover:bg-accent/50 hover:shadow-sm"
              >
                <PostIcon
                  className="h-4 w-4 shrink-0 text-muted-foreground group-aria-selected:text-primary transition-colors duration-150"
                  aria-hidden="true"
                />
                <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                  <span className="truncate text-sm font-medium group-aria-selected:text-primary transition-colors duration-150">
                    {post.title}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {post.summary}
                  </span>
                </div>
              </Command.Item>
            </motion.div>
          );
        })}
      </motion.div>
    </Command.Group>
  );
}
