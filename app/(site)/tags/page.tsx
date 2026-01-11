import { getAllTags, getAllPosts } from '@/lib/mdx/source';
import { PageContainer } from '@/components/layout/PageContainer';
import { TagsList } from '@/components/tags/TagsList';

export const metadata = {
  title: 'Topics',
  description: 'Browse posts by category',
};

export default function TagsPage() {
  const tags = getAllTags();
  const posts = getAllPosts();

  // Count posts per tag
  const tagsWithCount = tags.map((tag) => ({
    name: tag,
    count: posts.filter((post) =>
      post.frontmatter.tags?.includes(tag)
    ).length,
  }));

  return (
    <PageContainer className="py-8">
      <TagsList tags={tagsWithCount} />
    </PageContainer>
  );
}
