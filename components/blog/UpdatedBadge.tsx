'use client';

import { RefreshCw } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface UpdatedBadgeProps {
  publishedAt: string;
  updatedAt?: string;
  variant?: 'full' | 'compact';
}

/**
 * Determines if a post has been significantly updated (30+ days after publish)
 */
function isSignificantlyUpdated(publishedAt: string, updatedAt?: string): boolean {
  if (!updatedAt) return false;

  const publishDate = new Date(publishedAt);
  const updateDate = new Date(updatedAt);

  const diffDays = Math.floor(
    (updateDate.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return diffDays >= 30;
}

export function UpdatedBadge({ publishedAt, updatedAt, variant = 'full' }: UpdatedBadgeProps) {
  if (!isSignificantlyUpdated(publishedAt, updatedAt)) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/50 bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-500">
        <RefreshCw className="h-3 w-3" />
        UPD
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/50 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-500">
      <RefreshCw className="h-3 w-3" />
      Updated {formatDate(updatedAt!)}
    </span>
  );
}
