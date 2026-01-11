import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/mdx/source';
import { siteConfig } from '@/config/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  const blogs = posts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: post.frontmatter.updatedAt || post.frontmatter.publishedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const routes = [
    '',
    '/about',
    '/blog',
    '/tags',
    '/graph',
  ].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return [...routes, ...blogs];
}
