import { PageContainer } from '@/components/layout/PageContainer';
import { siteConfig } from '@/config/site';
import { Rss, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { RssCopyButton } from './RssCopyButton';

export const metadata = {
  title: 'RSS Feed',
  description: 'Subscribe to my RSS feed',
};

export default function RssPage() {
  const feedUrl = `${siteConfig.url}/feed.xml`;

  return (
    <PageContainer className="py-12">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="flex justify-center">
          <div className="p-4 bg-primary/10 rounded-full">
            <Rss className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Subscribe via RSS</h1>
          <p className="text-muted-foreground text-lg">
            Stay up to date with my latest posts by subscribing to the RSS feed.
            You can use any RSS reader like Feedly, Reeder, or NetNewsWire.
          </p>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl space-y-4">
          <p className="font-medium">Feed URL</p>
          <div className="flex items-center gap-2 p-2 bg-secondary rounded-lg border border-border">
            <code className="flex-1 text-sm font-mono text-left px-2 overflow-x-auto">
              {feedUrl}
            </code>
            <RssCopyButton url={feedUrl} />
            <Link
              href="/feed.xml"
              target="_blank"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Open
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

