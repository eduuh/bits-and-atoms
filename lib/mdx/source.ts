import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { cache } from 'react';

const POSTS_PATH = path.join(process.cwd(), 'content/posts');

export interface PostFrontmatter {
  title: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  summary: string;
  image?: string;
  tags?: string[];
  published?: boolean;
  status?: 'published' | 'draft';
  pinned?: boolean;
  comments?: boolean;
  series?: {
    title: string;
    order: number;
  };
  // AI-generated content
  aiSummary?: string;
  aiKeyTakeaways?: string[];
}

export interface Post {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
  readingTime: number;
  wordCount: number;
}

export const getPostSlugs = () => {
  if (!fs.existsSync(POSTS_PATH)) return [];
  return fs.readdirSync(POSTS_PATH).filter((path) => /\.mdx?$/.test(path));
};

export const getPostBySlug = cache((slug: string): Post | null => {
  const realSlug = slug.replace(/\.mdx$/, '');
  const filePath = path.join(POSTS_PATH, `${realSlug}.mdx`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);
  const frontmatter = data as PostFrontmatter;

  // Filter out unpublished posts in all environments
  if (frontmatter.published === false) {
    return null;
  }

  const words = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(words / 200);

  return {
    slug: realSlug,
    frontmatter,
    content,
    readingTime,
    wordCount: words,
  };
});

export const getAllPosts = cache((): Post[] => {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is Post => post !== null)
    // Filter out drafts in all environments
    .filter((post) => post.frontmatter.status !== 'draft')
    .sort((post1, post2) =>
      post1.frontmatter.publishedAt > post2.frontmatter.publishedAt ? -1 : 1
    );

  return posts;
});

export const getAllTags = (): string[] => {
  const posts = getAllPosts();
  const tags = new Set<string>();
  posts.forEach((post) => {
    post.frontmatter.tags?.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
};

export const getAllSeries = (): string[] => {
  const posts = getAllPosts();
  const series = new Set<string>();
  posts.forEach((post) => {
    if (post.frontmatter.series) {
      series.add(post.frontmatter.series.title);
    }
  });
  return Array.from(series).sort();
};

export const getPostsBySeries = (seriesTitle: string): Post[] => {
  const posts = getAllPosts();
  return posts
    .filter((post) => post.frontmatter.series?.title === seriesTitle)
    .sort((a, b) => {
      const orderA = a.frontmatter.series?.order ?? 0;
      const orderB = b.frontmatter.series?.order ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return a.frontmatter.publishedAt > b.frontmatter.publishedAt ? 1 : -1;
    });
};

export const getMostPopularTags = (limit: number = 10): string[] => {
  const posts = getAllPosts();
  const tagCounts: Record<string, number> = {};
  
  posts.forEach((post) => {
    post.frontmatter.tags?.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
};

