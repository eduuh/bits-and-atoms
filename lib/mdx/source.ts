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

  if (frontmatter.published === false && process.env.NODE_ENV === 'production') {
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
    // Filter out drafts in production
    .filter((post) => {
      if (process.env.NODE_ENV === 'production') {
        return post.frontmatter.status !== 'draft';
      }
      return true;
    })
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

