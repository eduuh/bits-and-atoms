import Link from 'next/link';
import { getAllSeries, getPostsBySeries } from '@/lib/mdx/source';
import { ArrowRight, Layers } from 'lucide-react';
import { Metadata } from 'next';
import { PageContainer } from '@/components/layout/PageContainer';

export const metadata: Metadata = {
  title: 'Series',
  description: 'Deep dives and workshops on specific topics.',
};

export default function SeriesPage() {
  const seriesList = getAllSeries();

  return (
    <PageContainer className="py-8">
      <div className="mb-8 flex items-baseline justify-between border-b border-border pb-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Series & Workshops
        </h1>
        <span className="text-sm font-medium text-muted-foreground">
          {seriesList.length} Series
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {seriesList.map((seriesTitle) => {
          const posts = getPostsBySeries(seriesTitle);
          const firstPost = posts[0];
          
          return (
            <article
              key={seriesTitle}
              className="group relative flex flex-col justify-between rounded-lg border border-border bg-card text-card-foreground p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div>
                <h2 className="mb-3 text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                  <Link href={`/series/${encodeURIComponent(seriesTitle)}`}>
                    <span className="absolute inset-0" />
                    {seriesTitle}
                  </Link>
                </h2>
                <p className="mb-4 text-base text-muted-foreground leading-relaxed line-clamp-2">
                  {firstPost?.frontmatter.summary || `A series about ${seriesTitle}`}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm font-bold text-primary">
                  Start Workshop
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
                <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  <Layers className="h-4 w-4" />
                  {posts.length} Parts
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </PageContainer>
  );
}
