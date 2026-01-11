'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Layers } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface SeriesItem {
  title: string;
  postCount: number;
  summary: string;
}

interface SeriesListProps {
  series: SeriesItem[];
}

export function SeriesList({ series }: SeriesListProps) {
  return (
    <>
      <motion.div
        className="mb-8 flex items-center justify-between border-b border-border pb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-baseline gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Series & Workshops</h1>
          <span className="text-sm font-medium text-muted-foreground">
            {series.length} Series
          </span>
        </div>
      </motion.div>

      <motion.div
        className="grid gap-4 md:grid-cols-2"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {series.map((item) => (
          <motion.article
            key={item.title}
            variants={staggerItem}
            className="group relative flex flex-col justify-between rounded-xl border border-border bg-card text-card-foreground p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 card-glow"
          >
            <div>
              <h2 className="mb-3 text-xl font-bold leading-tight group-hover:text-primary transition-colors duration-200">
                <Link href={`/series/${encodeURIComponent(item.title)}`}>
                  <span className="absolute inset-0" />
                  {item.title}
                </Link>
              </h2>
              <p className="mb-4 text-base text-muted-foreground leading-relaxed line-clamp-2">
                {item.summary}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm font-bold text-primary group-hover:text-gradient transition-colors duration-200">
                Start Workshop
                <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-2" />
              </div>
              <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                <Layers className="h-4 w-4" />
                {item.postCount} Parts
              </span>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </>
  );
}
