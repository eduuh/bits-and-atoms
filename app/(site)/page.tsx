import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts, getMostPopularTags } from '@/lib/mdx/source';
import { FeatureFlag } from '@/components/providers/FeatureFlag';
import { ArrowRight, Sparkles } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { PageContainer } from '@/components/layout/PageContainer';
import { TrendingPosts } from '@/components/blog/TrendingPosts';

export default function Home() {
  const posts = getAllPosts();
  const tags = getMostPopularTags(10);
  
  // Limit posts on home page
  const MAX_DISPLAY_POSTS = 5;
  const displayedPosts = posts.slice(0, MAX_DISPLAY_POSTS);

  return (
    <main className="bg-background" aria-label="Home page">
      {/* Hero Section */}
      <div className="relative w-full h-[20vh] min-h-[140px] flex flex-col justify-center items-center text-center overflow-hidden" role="banner" aria-label="Hero section">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/home-hero.jpg"
            alt=""
            fill
            priority
            className="object-cover object-[center_30%]"
            aria-hidden="true"
          />
          {/* Overlay to ensure text contrast in both modes */}
          <div className="absolute inset-0 bg-background/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
      </div>

      <PageContainer className="relative z-10 -mt-12 pb-8">
        <div className="grid md:grid-cols-[1fr_250px] gap-6">
        {/* Left Column: Articles */}
        <section aria-labelledby="recent-posts-heading">
          <h2 id="recent-posts-heading" className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-4">
            {siteConfig.labels.articles}
          </h2>
          
          <div className="space-y-6">
            {displayedPosts.map((post) => (
              <article key={post.slug} className="group">
                <Link href={`/blog/${post.slug}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-muted-foreground transition-colors flex items-center gap-2">
                    {post.frontmatter.title}
                    {post.frontmatter.published === false && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-normal">Draft</span>
                    )}
                  </h3>
                  <p className="text-base text-muted-foreground mb-3 leading-relaxed line-clamp-2">
                    {post.frontmatter.summary}
                  </p>
                  <div className="flex items-center text-primary font-bold text-sm group-hover:text-muted-foreground transition-colors" aria-hidden="true">
                    Read more
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {posts.length > MAX_DISPLAY_POSTS && (
            <div className="mt-6 pt-4 border-t border-border">
              <Link 
                href="/blog" 
                className="inline-flex items-center gap-2 text-primary font-bold hover:text-primary/80 transition-colors text-sm"
              >
                View all posts
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            </div>
          )}
        </section>

        {/* Right Column: Sidebar */}
        <aside className="space-y-6" aria-label="Sidebar">
          {/* Categories */}
          <section aria-labelledby="categories-heading">
            <h2 id="categories-heading" className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-3">
              {siteConfig.labels.categories}
            </h2>
            <div className="flex flex-wrap gap-1.5" role="list" aria-label="Categories">
              {tags.map((tag) => (
                <Link 
                  key={tag} 
                  href={`/tags/${tag}`}
                  className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                  role="listitem"
                >
                  {tag}
                </Link>
              ))}
              <Link 
                href="/tags"
                className="px-2.5 py-1 border border-border text-muted-foreground rounded-md text-xs font-medium hover:bg-secondary hover:text-foreground transition-colors"
              >
                View all
              </Link>
            </div>
          </section>

          {/* Trending Posts */}
          <section aria-labelledby="trending-heading">
            <TrendingPosts limit={5} title={siteConfig.labels.popular} />
          </section>

          <FeatureFlag flag="ENABLE_NEWSLETTER">
            <section className="p-6 bg-primary/5 rounded-xl border border-primary/20" aria-labelledby="newsletter-heading">
              <h3 id="newsletter-heading" className="font-bold mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" aria-hidden="true" />
                {siteConfig.labels.newsletter.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {siteConfig.labels.newsletter.description}
              </p>
              <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <input 
                  id="newsletter-email"
                  type="email" 
                  placeholder="your@email.com" 
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                  aria-describedby="newsletter-desc"
                  required
                />
                <span id="newsletter-desc" className="sr-only">Enter your email to subscribe to the newsletter</span>
                <button 
                  type="submit"
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  Subscribe
                </button>
              </form>
            </section>
          </FeatureFlag>
          </aside>
        </div>
      </PageContainer>
    </main>
  );
}

