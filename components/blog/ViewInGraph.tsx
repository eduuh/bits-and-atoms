'use client';

import { Network } from 'lucide-react';
import Link from 'next/link';

interface ViewInGraphProps {
  slug: string;
  className?: string;
}

export function ViewInGraph({ slug, className = '' }: ViewInGraphProps) {
  return (
    <Link
      href={`/graph?focus=${slug}`}
      className={`inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors ${className}`}
      title="View connections in graph"
    >
      <Network className="h-3.5 w-3.5" />
      <span>Graph</span>
    </Link>
  );
}
