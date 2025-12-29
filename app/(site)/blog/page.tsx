import { getAllPosts } from '@/lib/mdx/source';
import { Metadata } from 'next';
import { PageContainer } from '@/components/layout/PageContainer';
import { BlogList } from '@/components/blog/BlogList';

export const metadata: Metadata = {
  title: 'All Posts',
  description: 'Browse all articles and tutorials.',
};

export default function BlogPage() {
  const posts = getAllPosts();
  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <PageContainer className="py-8">
      <BlogList posts={posts} isDev={isDev} />
    </PageContainer>
  );
}
