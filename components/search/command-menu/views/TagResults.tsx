'use client';

import { Command } from 'cmdk';
import { motion } from 'framer-motion';
import { Hash } from 'lucide-react';
import type { Tag } from '@/components/search/shared/types';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface TagResultsProps {
  tags: Tag[];
  onSelectTag: (tag: Tag) => void;
}

export function TagResults({ tags, onSelectTag }: TagResultsProps) {
  if (tags.length === 0) return null;

  return (
    <Command.Group
      heading="Tags"
      className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
    >
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {tags.map((tag, index) => (
          <motion.div key={index} variants={staggerItem}>
            <Command.Item
              value={tag.name}
              onSelect={() => onSelectTag(tag)}
              className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150 hover:bg-accent/50 hover:shadow-sm"
            >
              <Hash
                className="h-4 w-4 text-muted-foreground group-aria-selected:text-primary transition-colors duration-150"
                aria-hidden="true"
              />
              <span className="group-aria-selected:text-primary group-aria-selected:font-medium transition-colors duration-150">
                {tag.name}
              </span>
            </Command.Item>
          </motion.div>
        ))}
      </motion.div>
    </Command.Group>
  );
}
