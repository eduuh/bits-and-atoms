import Link from 'next/link';
import { getAllPosts, getAllTags } from '@/lib/mdx/source';
import { ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { PageContainer } from '@/components/layout/PageContainer';

export async function generateMetadata({ params }: { params: { tag: string } }): Promise<Metadata> {
  const decodedTag = decodeURIComponent(params.tag);
  return {
    title: `Posts tagged with "${decodedTag}"`,
    description: `Browse all articles and tutorials about ${decodedTag}.`,
  };
}

export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map((tag) => ({
    tag: tag,
  }));
}

export default function TagPage({ params }: { params: { tag: string } }) {
  const { tag } = params;
  const decodedTag = decodeURIComponent(tag);
  const posts = getAllPosts().filter((post) =>
    post.frontmatter.tags?.includes(decodedTag)
  );

  if (posts.length === 0) {
    notFound();
  }

  return (
    <PageContainer className="py-12">
      <div className="mb-12 flex items-baseline justify-between border-b border-border pb-6">
        <h1 className="text-3xl font-bold uppercase tracking-tight">
          {decodedTag}
        </h1>
        <span className="text-sm font-medium text-muted-foreground">
          {posts.length} Article{posts.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="group relative flex flex-col justify-between rounded-xl border border-border bg-card text-card-foreground p-6 shadow-sm transition-all hover:shadow-md"
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
              <p className="mb-4 text-muted-foreground leading-relaxed line-clamp-3">
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
    </PageContainer>
  );
}
