import Link from 'next/link';
import { getAllTopics } from '@/lib/mdx/topics';
import { PageContainer } from '@/components/layout/PageContainer';
import { BookOpen, Clock, ArrowRight, Layers } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Topics',
  description: 'Explore curated learning paths and resources organized by topic.',
};

export default function TopicsPage() {
  const topics = getAllTopics();

  return (
    <PageContainer className="py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Topics</h1>
            <p className="text-sm text-muted-foreground">
              Curated learning paths and resources
            </p>
          </div>
        </div>
      </div>

      {topics.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No topics available yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {topics.map((topic) => (
            <Link
              key={topic.slug}
              href={`/topics/${topic.slug}`}
              className="group relative flex flex-col p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                {topic.frontmatter.icon && (
                  <span
                    className="text-3xl"
                    style={
                      topic.frontmatter.color
                        ? { filter: `drop-shadow(0 0 6px ${topic.frontmatter.color}40)` }
                        : undefined
                    }
                  >
                    {topic.frontmatter.icon}
                  </span>
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-bold group-hover:text-primary transition-colors">
                    {topic.frontmatter.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {topic.frontmatter.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-4 border-t border-border">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{topic.posts.length} posts</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>~{topic.totalReadingTime} min</span>
                </div>
                <div className="flex-1" />
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
