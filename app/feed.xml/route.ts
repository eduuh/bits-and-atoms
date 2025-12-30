import { getAllPosts } from '@/lib/mdx/source';
import { siteConfig } from '@/config/site';

export async function GET() {
  const posts = getAllPosts();
  const siteUrl = siteConfig.url;

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteConfig.name}</title>
    <link>${siteUrl}</link>
    <description>${siteConfig.description}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${posts
      .map((post) => {
        const url = `${siteUrl}/blog/${post.slug}`;
        return `
    <item>
      <title><![CDATA[${post.frontmatter.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.frontmatter.publishedAt).toUTCString()}</pubDate>
      <description><![CDATA[${post.frontmatter.summary}]]></description>
      ${post.frontmatter.tags?.map(tag => `<category>${tag}</category>`).join('') || ''}
    </item>`;
      })
      .join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
