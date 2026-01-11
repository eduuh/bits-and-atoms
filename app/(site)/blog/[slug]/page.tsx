import { getPostBySlug, getAllPosts } from '@/lib/mdx/source';
import { MDXContent } from '@/components/mdx/MDXContent';
import { ReadingMode } from '@/components/blog/ReadingMode';
import { ReadingModeProvider } from '@/components/blog/ReadingModeContext';
import { ReadingModeTrigger } from '@/components/blog/ReadingModeTrigger';
import { ReadingProgressBar } from '@/components/blog/ReadingProgressBar';
import { Comments } from '@/components/blog/Comments';
import { TableOfContents } from '@/components/mdx/TableOfContents';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { Metadata } from 'next';
import { PageContainer } from '@/components/layout/PageContainer';
import { siteConfig } from '@/config/site';
import {
  generateBlogPostSchema,
  generateBreadcrumbSchema,
  combineSchemas,
} from '@/lib/seo/schema';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return {};
  }

  const ogImages = post.frontmatter.image ? [post.frontmatter.image] : [];

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.summary,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.summary,
      type: 'article',
      publishedTime: post.frontmatter.publishedAt,
      modifiedTime: post.frontmatter.updatedAt,
      url: `${siteConfig.url}/blog/${post.slug}`,
      authors: [siteConfig.name],
      tags: post.frontmatter.tags,
      ...(ogImages.length > 0 ? { images: ogImages } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.frontmatter.title,
      description: post.frontmatter.summary,
      ...(ogImages.length > 0 ? { images: ogImages } : {}),
    },
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Auto-generate structured data schemas
  const blogPostSchema = generateBlogPostSchema({
    title: post.frontmatter.title,
    description: post.frontmatter.summary,
    publishedAt: post.frontmatter.publishedAt,
    updatedAt: post.frontmatter.updatedAt,
    slug: post.slug,
    image: post.frontmatter.image,
    tags: post.frontmatter.tags,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: 'Blog', url: `${siteConfig.url}/blog` },
    { name: post.frontmatter.title, url: `${siteConfig.url}/blog/${post.slug}` },
  ]);

  const combinedSchema = combineSchemas(blogPostSchema, breadcrumbSchema);

  return (
    <ReadingModeProvider>
      <ReadingProgressBar />
      <article className="min-h-screen bg-background">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
        />
        
        <div className="relative w-full h-[35vh] min-h-[300px] flex flex-col justify-end pb-8 overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <Image
                src={post.frontmatter.image || '/images/blog-hero.jpg'}
                alt={post.frontmatter.title}
                fill
                className="object-cover"
                priority
              />
              {/* Overlay to ensure text contrast in both modes */}
              <div className="absolute inset-0 bg-background/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            </div>

            <div className="relative z-10 w-full max-w-5xl mx-auto px-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-0.5">
                  <Link href="/" className="hover:text-foreground transition-colors">
                    Home
                  </Link>
                  <span>/</span>
                  <span className="text-primary">Blog</span>
                </div>

                {post.frontmatter.series && (
                  <div className="mb-2">
                    <Link 
                      href={`/series/${encodeURIComponent(post.frontmatter.series.title)}`}
                      className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      <span className="bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                        Series: {post.frontmatter.series.title}
                      </span>
                      {post.frontmatter.series.order && (
                        <span className="text-muted-foreground">
                          Part {post.frontmatter.series.order}
                        </span>
                      )}
                    </Link>
                  </div>
                )}

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-2 drop-shadow-sm">
                  {post.frontmatter.title}
                </h1>
                
                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                  <time dateTime={post.frontmatter.publishedAt}>
                    {formatDate(post.frontmatter.publishedAt)}
                  </time>
                  <span>•</span>
                  <span>{post.readingTime} min read</span>
                  <span>•</span>
                  <span>{post.wordCount} words</span>
                  <span>•</span>
                  <div className="flex gap-2">
                    {post.frontmatter.tags?.map((tag) => (
                      <span key={tag} className="bg-secondary/80 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-medium text-secondary-foreground border border-border">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span>•</span>
                  <ReadingModeTrigger />
                </div>
              </div>
            </div>
          </div>

        <PageContainer className="py-8">
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-8">
            <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-primary prose-a:underline hover:prose-a:text-muted-foreground transition-colors">
              <ReadingMode title={post.frontmatter.title} summary={post.frontmatter.summary}>
                <MDXContent source={post.content} />
              </ReadingMode>
              
              <div className="mt-6 pt-4 border-t border-border not-prose">
                <p className="text-xs text-muted-foreground">
                  Last updated on{' '}
                  <span className="font-bold text-foreground">
                    {formatDate(post.frontmatter.updatedAt || post.frontmatter.publishedAt)}
                  </span>
                </p>
              </div>

              {post.frontmatter.comments !== false && <Comments />}
            </div>
            
            <aside className="hidden lg:block">
              <TableOfContents source={post.content} />
            </aside>
          </div>
        </PageContainer>
      </article>
    </ReadingModeProvider>
  );
}



