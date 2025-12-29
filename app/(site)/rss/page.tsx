import { PageContainer } from '@/components/layout/PageContainer';

export const metadata = {
  title: 'RSS Feed',
  description: 'Subscribe to my RSS feed',
};

export default function RssPage() {
  return (
    <PageContainer className="py-12">
      <h1 className="text-3xl font-bold mb-6">RSS Feed</h1>
      <p className="text-muted-foreground">Coming soon...</p>
    </PageContainer>
  );
}
