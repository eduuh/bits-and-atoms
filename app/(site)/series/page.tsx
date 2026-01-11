import { getAllSeries, getPostsBySeries } from '@/lib/mdx/source';
import { PageContainer } from '@/components/layout/PageContainer';
import { SeriesList } from '@/components/series/SeriesList';

export default function SeriesPage() {
  const seriesList = getAllSeries();

  const seriesData = seriesList.map((seriesTitle) => {
    const posts = getPostsBySeries(seriesTitle);
    const firstPost = posts[0];
    return {
      title: seriesTitle,
      postCount: posts.length,
      summary: firstPost?.frontmatter.summary || `A series about ${seriesTitle}`,
    };
  });

  return (
    <PageContainer className="py-8">
      <SeriesList series={seriesData} />
    </PageContainer>
  );
}
