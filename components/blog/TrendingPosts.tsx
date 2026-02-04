import Link from 'next/link';
import { TrendingUp, Clock, Pin } from 'lucide-react';
import { getTrendingPosts } from '@/lib/mdx/source';

interface TrendingPostsProps {
  limit?: number;
  title?: string;
  showIcon?: boolean;
}

export function TrendingPosts({
  limit = 5,
  title = 'Trending',
  showIcon = true,
}: TrendingPostsProps) {
  const posts = getTrendingPosts(limit);

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {showIcon && (
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
            <TrendingUp className="h-4 w-4" />
          </div>
        )}
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>

      <div className="space-y-3">
        {posts.map((post, index) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex items-start gap-3 p-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/50 transition-colors"
          >
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1 text-sm">
                  {post.frontmatter.title}
                </h4>
                {post.frontmatter.pinned && (
                  <Pin className="h-3 w-3 text-primary flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{post.readingTime} min read</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
