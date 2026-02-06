import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { cache } from 'react';

const POSTS_PATH = path.join(process.cwd(), 'content/posts');

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

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
  tldr?: string;
  keyTakeaways?: string[];
  series?: {
    title: string;
    order: number;
  };
  // AI-generated content
  aiSummary?: string;
  aiKeyTakeaways?: string[];
  changelog?: ChangelogEntry[];
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

export const getTrendingPosts = (limit: number = 5): Post[] => {
  const posts = getAllPosts();

  // Score posts based on multiple factors:
  // - Pinned posts get highest priority
  // - More recent posts score higher
  // - Posts updated recently score higher
  const now = new Date().getTime();
  const dayInMs = 24 * 60 * 60 * 1000;

  const scoredPosts = posts.map((post) => {
    let score = 0;

    // Pinned posts get a large boost
    if (post.frontmatter.pinned) {
      score += 1000;
    }

    // Recency score (higher for more recent posts)
    const publishedDate = new Date(post.frontmatter.publishedAt).getTime();
    const ageInDays = (now - publishedDate) / dayInMs;
    score += Math.max(0, 100 - ageInDays); // Max 100 points for very recent

    // Updated recently gets a boost
    if (post.frontmatter.updatedAt) {
      const updatedDate = new Date(post.frontmatter.updatedAt).getTime();
      const updateAgeInDays = (now - updatedDate) / dayInMs;
      if (updateAgeInDays < 30) {
        score += 50; // Boost for recently updated
      }
    }

    return { post, score };
  });

  return scoredPosts
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post }) => post);
};

