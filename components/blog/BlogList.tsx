'use client';

import Link from 'next/link';
import { Post } from '@/lib/mdx/source';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { formatDate } from '@/lib/utils';

interface BlogListProps {
  posts: Post[];
  isDev: boolean;
}

export function BlogList({ posts, isDev }: BlogListProps) {
  const [showUnpublished, setShowUnpublished] = useState(isDev);

  const filteredPosts = posts.filter((post) => {
    if (post.frontmatter.published === false) {
      return showUnpublished;
    }
    return true;
  });

  return (
    <>
      <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-baseline gap-4">
          <h1 className="text-3xl font-bold tracking-tight">All Posts</h1>
          <span className="text-sm font-medium text-muted-foreground">
            {filteredPosts.length} Article{filteredPosts.length === 1 ? '' : 's'}
          </span>
        </div>

        {isDev && (
          <button
            onClick={() => setShowUnpublished(!showUnpublished)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {showUnpublished ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Unpublished
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Show Unpublished
              </>
            )}
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredPosts.map((post) => (
          <article
            key={post.slug}
            className="group relative flex flex-col justify-between rounded-lg border border-border bg-card text-card-foreground p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                  <Link href={`/blog/${post.slug}`}>
                    <span className="absolute inset-0" />
                    {post.frontmatter.title}
                  </Link>
                </h2>
                {post.frontmatter.published === false && (
                  <span className="relative z-10 inline-flex items-center rounded-full border border-yellow-500/50 bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-500">
                    Draft
                  </span>
                )}
              </div>
              <p className="mb-4 text-base text-muted-foreground leading-relaxed line-clamp-2">
                {post.frontmatter.summary}
              </p>
            </div>
            <div className="flex items-center text-sm font-bold text-primary">
              Read more
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
