import Link from 'next/link';
import { Target, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Post } from '@/lib/mdx/source';

interface LearningPathProps {
  posts: { post: Post; order: number }[];
}

export function LearningPath({ posts }: LearningPathProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-md bg-primary/10 text-primary">
          <Target className="h-4 w-4" />
        </div>
        <h2 className="text-lg font-semibold">Learning Path</h2>
        <span className="text-xs text-muted-foreground">(Recommended Order)</span>
      </div>

      <div className="space-y-3">
        {posts.map(({ post, order }) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-sm transition-all"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
              {order}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                {post.frontmatter.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                {post.frontmatter.summary}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{post.readingTime} min read</span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-2" />
          </Link>
        ))}
      </div>
    </div>
  );
}
