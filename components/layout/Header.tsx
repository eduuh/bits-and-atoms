import { getAllPosts } from '@/lib/mdx/source';
import { HeaderContent } from './HeaderContent';

export function Header() {
  const posts = getAllPosts().map((post) => ({
    title: post.frontmatter.title,
    slug: post.slug,
    summary: post.frontmatter.summary,
    tags: post.frontmatter.tags,
    pinned: post.frontmatter.pinned,
    content: post.content, // Include content for grep search
  }));

  return <HeaderContent posts={posts} />;
}


