import { BookOpen, Clock } from 'lucide-react';
import { Topic } from '@/lib/mdx/topics';

interface TopicHeaderProps {
  topic: Topic;
}

export function TopicHeader({ topic }: TopicHeaderProps) {
  const { frontmatter, posts, totalReadingTime } = topic;

  return (
    <div className="mb-8 pb-6 border-b border-border">
      <div className="flex items-center gap-3 mb-4">
        {frontmatter.icon && (
          <span
            className="text-4xl"
            style={frontmatter.color ? { filter: `drop-shadow(0 0 8px ${frontmatter.color}40)` } : undefined}
          >
            {frontmatter.icon}
          </span>
        )}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          {frontmatter.title}
        </h1>
      </div>

      <p className="text-lg text-muted-foreground mb-4 max-w-2xl">
        {frontmatter.description}
      </p>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-4 w-4" />
          <span>{posts.length} {posts.length === 1 ? 'post' : 'posts'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>~{totalReadingTime} min total reading time</span>
        </div>
      </div>
    </div>
  );
}
