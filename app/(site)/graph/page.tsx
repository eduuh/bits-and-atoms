import { getGraphData } from '@/lib/graph';
import { GraphClient } from '@/components/graph/GraphClient';
import { Metadata } from 'next';
import { PageContainer } from '@/components/layout/PageContainer';

export const metadata: Metadata = {
  title: 'Graph View',
  description: 'Explore the connections between my blog posts.',
};

interface GraphPageProps {
  searchParams: { focus?: string };
}

export default function GraphPage({ searchParams }: GraphPageProps) {
  const data = getGraphData();
  const focusSlug = searchParams.focus;

  return (
    <PageContainer className="py-8 w-full h-[calc(100vh-64px)] flex flex-col">
      <div className="flex-1 w-full border border-border rounded-2xl overflow-hidden shadow-sm">
        <GraphClient data={data} initialFocusSlug={focusSlug} />
      </div>
    </PageContainer>
  );
}
