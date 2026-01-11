'use client';

import { Command } from 'cmdk';
import { motion } from 'framer-motion';
import { Keyboard } from 'lucide-react';
import type { Post } from '@/components/search/shared/types';
import { getPostIcon } from '@/components/search/shared/tag-icons';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface DefaultViewProps {
  pinnedPosts: Post[];
  onSelectPost: (post: Post) => void;
  onOpenKeyboardHelp: () => void;
}

export function DefaultView({
  pinnedPosts,
  onSelectPost,
  onOpenKeyboardHelp,
}: DefaultViewProps) {
  return (
    <>
      {/* Pinned Content */}
      <Command.Group
        heading="Pinned Content"
        className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {pinnedPosts.map((post) => {
            const PostIcon = getPostIcon(post.tags);
            return (
              <motion.div key={post.slug} variants={staggerItem}>
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
                    {post.tags && (
                      <div className="flex gap-1.5">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] text-muted-foreground"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Command.Item>
              </motion.div>
            );
          })}
        </motion.div>
      </Command.Group>

      <div className="my-2 h-px bg-border" />

      {/* Help */}
      <Command.Group
        heading="Help"
        className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.2 }}
        >
          <Command.Item
            value="Keyboard Shortcuts"
            onSelect={onOpenKeyboardHelp}
            className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150 hover:bg-accent/50 hover:shadow-sm"
          >
            <Keyboard
              className="h-4 w-4 text-muted-foreground group-aria-selected:text-primary transition-colors duration-150"
              aria-hidden="true"
            />
            <span className="group-aria-selected:text-primary group-aria-selected:font-medium transition-colors duration-150">
              Keyboard Shortcuts
            </span>
            <kbd className="ml-auto rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              ?
            </kbd>
          </Command.Item>
        </motion.div>
      </Command.Group>
    </>
  );
}
