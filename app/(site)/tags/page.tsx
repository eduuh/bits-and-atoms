import Link from 'next/link';
import { getAllTags } from '@/lib/mdx/source';
import { PageContainer } from '@/components/layout/PageContainer';

export const metadata = {
  title: 'Topics',
  description: 'Browse posts by category',
};

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <PageContainer className="py-12">
      <h1 className="text-3xl font-bold mb-8">Browse by Category</h1>
      <div className="flex flex-wrap gap-4">
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/tags/${tag}`}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors"
          >
            {tag}
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
