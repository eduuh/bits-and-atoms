import { getPostsBySeries } from '@/lib/mdx/source';
import { MDXContent } from '@/components/mdx/MDXContent';
import { formatDate } from '@/lib/utils';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import Image from 'next/image';
import { ReadingMode } from '@/components/blog/ReadingMode';
import { ReadingModeProvider } from '@/components/blog/ReadingModeContext';
import { ReadingModeTrigger } from '@/components/blog/ReadingModeTrigger';
import { SeriesTableOfContents } from '@/components/series/SeriesTableOfContents';
import { siteConfig } from '@/config/site';
import { PageContainer } from '@/components/layout/PageContainer';

interface Props {
  params: {
    series: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const seriesTitle = decodeURIComponent(params.series);
  const posts = getPostsBySeries(seriesTitle);
  
  if (posts.length === 0) {
    return {};
  }

  return {
    title: `${seriesTitle} - Workshop`,
    description: `A comprehensive workshop on ${seriesTitle}.`,
  };
}

export default function SeriesWorkshopPage({ params }: Props) {
  const seriesTitle = decodeURIComponent(params.series);
  const posts = getPostsBySeries(seriesTitle);

  if (posts.length === 0) {
    notFound();
  }

  const totalReadingTime = posts.reduce((acc, post) => acc + (post.readingTime || 0), 0);
  const heroImage = posts[0]?.frontmatter.image || '/images/blog-hero.jpg';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Series',
    headline: seriesTitle,
    description: `A comprehensive workshop on ${seriesTitle}.`,
    image: [heroImage],
    author: {
      '@type': 'Person',
      name: siteConfig.name,
    },
  };

  return (
    <ReadingModeProvider>
      <main className="min-h-screen bg-background">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        <PageContainer className="py-8">
          {/* Hero Section */}
          <div className="relative w-full h-[30vh] min-h-[250px] flex flex-col justify-end pb-8 mb-8 rounded-xl overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <Image
                src={heroImage}
                alt={seriesTitle}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-background/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            </div>

            <div className="relative z-10 px-6 w-full">
              <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
                <span>/</span>
                <Link href="/series" className="hover:text-foreground transition-colors">
                  Series
                </Link>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground drop-shadow-sm">
                {seriesTitle}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-1">
                <span className="font-medium text-foreground">{posts.length} Parts</span>
                <span>•</span>
                <span>~{totalReadingTime} min total read</span>
                <span>•</span>
                <ReadingModeTrigger />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-6">
            
            {/* Main Content */}
            <div className="min-w-0">
              <ReadingMode title={seriesTitle} summary={`A comprehensive workshop with ${posts.length} parts.`}>
                <div className="space-y-12">
                  {posts.map((post, index) => (
                    <section
                      key={post.slug}
                      id={`part-${index + 1}`}
                      className="relative scroll-mt-24"
                    >
                      <div className="mb-8 pb-8 border-b border-border">
                        <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
                          <span className="font-bold text-primary">Part {index + 1}</span>
                          <span>•</span>
                          <time className="font-medium">
                            {formatDate(post.frontmatter.publishedAt)}
                          </time>
                          <span>•</span>
                          <span>{post.readingTime} min read</span>
                          {post.frontmatter.published === false && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center rounded-full border border-yellow-500/50 bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-500">
                                Draft
                              </span>
                            </>
                          )}
                        </div>

                        <h2 className="text-2xl font-bold tracking-tight mb-4">
                          <Link
                            href={`/blog/${post.slug}`}
                            className="hover:text-primary transition-colors"
                          >
                            {post.frontmatter.title}
                          </Link>
                        </h2>

                        {post.frontmatter.summary && (
                          <p className="text-lg text-muted-foreground leading-relaxed">
                            {post.frontmatter.summary}
                          </p>
                        )}
                      </div>

                      <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-primary prose-a:underline hover:prose-a:text-muted-foreground transition-colors">
                        <MDXContent source={post.content} />
                      </div>

                      {index < posts.length - 1 && (
                        <div className="my-12 relative py-4">
                          <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-border" />
                          </div>
                          <div className="relative flex justify-center">
                            <div className="bg-card px-6 py-3 rounded-full border border-border shadow-sm flex items-center gap-3">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                {index + 1}
                              </span>
                              <span className="text-sm font-medium text-muted-foreground">
                                Completed
                              </span>
                              <div className="h-4 w-px bg-border" />
                              <span className="text-sm font-medium text-foreground">
                                Next: Part {index + 2}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </section>
                  ))}
                </div>
              </ReadingMode>
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block h-full">
              <SeriesTableOfContents posts={posts} />
            </aside>

          </div>
        </PageContainer>
      </main>
    </ReadingModeProvider>
  );
}
