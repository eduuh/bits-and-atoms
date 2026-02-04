import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ArrowRight, BookOpen } from 'lucide-react';
import { getTopicBySlug, getAllTopics, getLearningPathPosts } from '@/lib/mdx/topics';
import { MDXContent } from '@/components/mdx/MDXContent';
import { PageContainer } from '@/components/layout/PageContainer';
import { TopicHeader } from '@/components/topics/TopicHeader';
import { LearningPath } from '@/components/topics/LearningPath';
import { TopicResources } from '@/components/topics/TopicResources';
import { siteConfig } from '@/config/site';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const { topic } = await params;
  const topicData = getTopicBySlug(topic);

  if (!topicData) {
    return {};
  }

  return {
    title: topicData.frontmatter.title,
    description: topicData.frontmatter.description,
    openGraph: {
      title: topicData.frontmatter.title,
      description: topicData.frontmatter.description,
      type: 'website',
      url: `${siteConfig.url}/topics/${topic}`,
    },
  };
}

export async function generateStaticParams() {
  const topics = getAllTopics();
  return topics.map((topic) => ({
    topic: topic.slug,
  }));
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  const topicData = getTopicBySlug(topic);

  if (!topicData) {
    notFound();
  }

  const learningPathPosts = getLearningPathPosts(topicData);

  // Generate breadcrumb schema - safe internal data, not user input
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: 'Topics', url: `${siteConfig.url}/topics` },
    { name: topicData.frontmatter.title, url: `${siteConfig.url}/topics/${topic}` },
  ]);

  return (
    <PageContainer className="py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <TopicHeader topic={topicData} />

      {/* Learning Path */}
      {learningPathPosts.length > 0 && (
        <LearningPath posts={learningPathPosts} />
      )}

      {/* Custom MDX Content */}
      {topicData.content && (
        <div className="prose prose-neutral dark:prose-invert max-w-none mb-8">
          <MDXContent source={topicData.content} />
        </div>
      )}

      {/* All Posts */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
            <BookOpen className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-semibold">All Posts</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {topicData.posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-all"
            >
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors mb-2">
                {post.frontmatter.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                {post.frontmatter.summary}
              </p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                <span>{post.readingTime} min read</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Resources */}
      {topicData.frontmatter.resources && topicData.frontmatter.resources.length > 0 && (
        <TopicResources resources={topicData.frontmatter.resources} />
      )}
    </PageContainer>
  );
}
