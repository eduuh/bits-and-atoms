'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Hash, TrendingUp } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface TagWithCount {
  name: string;
  count: number;
}

interface TagsListProps {
  tags: TagWithCount[];
}

export function TagsList({ tags }: TagsListProps) {
  // Sort by count descending
  const sortedTags = [...tags].sort((a, b) => b.count - a.count);
  const maxCount = Math.max(...tags.map(t => t.count));

  return (
    <>
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-baseline gap-4 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">Browse by Category</h1>
          <span className="text-sm font-medium text-muted-foreground">
            {tags.length} Topics
          </span>
        </div>
        <p className="text-muted-foreground">
          Explore articles organized by topic
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {sortedTags.map((tag) => {
          const isPopular = tag.count === maxCount;

          return (
            <motion.div key={tag.name} variants={staggerItem}>
              <Link
                href={`/tags/${tag.name}`}
                className="group relative flex items-center gap-3 p-4 rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/40 hover:-translate-y-0.5 card-glow"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Hash className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate group-hover:text-primary transition-colors">
                      {tag.name}
                    </span>
                    {isPopular && (
                      <TrendingUp className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {tag.count} {tag.count === 1 ? 'article' : 'articles'}
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </>
  );
}
