import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { cache } from 'react';
import { getAllPosts, Post } from './source';

const TOPICS_PATH = path.join(process.cwd(), 'content/topics');

interface TopicResource {
  title: string;
  url: string;
  description?: string;
}

export interface TopicFrontmatter {
  title: string;
  slug: string;
  description: string;
  icon?: string;
  color?: string;
  tag: string; // The tag to match posts against
  learningPath?: string[]; // Array of post slugs in recommended order
  resources?: TopicResource[];
}

export interface Topic {
  slug: string;
  frontmatter: TopicFrontmatter;
  content: string;
  posts: Post[];
  totalReadingTime: number;
}

export const getTopicSlugs = (): string[] => {
  if (!fs.existsSync(TOPICS_PATH)) return [];
  return fs.readdirSync(TOPICS_PATH).filter((path) => /\.mdx?$/.test(path));
};

export const getTopicBySlug = cache((slug: string): Topic | null => {
  const realSlug = slug.replace(/\.mdx$/, '');
  const filePath = path.join(TOPICS_PATH, `${realSlug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);
  const frontmatter = data as TopicFrontmatter;

  // Get all posts with matching tag
  const allPosts = getAllPosts();
  const posts = allPosts.filter((post) =>
    post.frontmatter.tags?.includes(frontmatter.tag)
  );

  // Calculate total reading time
  const totalReadingTime = posts.reduce((acc, post) => acc + post.readingTime, 0);

  return {
    slug: realSlug,
    frontmatter,
    content,
    posts,
    totalReadingTime,
  };
});

export const getAllTopics = cache((): Topic[] => {
  const slugs = getTopicSlugs();
  const topics = slugs
    .map((slug) => getTopicBySlug(slug))
    .filter((topic): topic is Topic => topic !== null)
    .sort((a, b) => b.posts.length - a.posts.length); // Sort by number of posts

  return topics;
});

export const getLearningPathPosts = (
  topic: Topic
): { post: Post; order: number }[] => {
  if (!topic.frontmatter.learningPath) return [];

  const allPosts = getAllPosts();
  const pathPosts: { post: Post; order: number }[] = [];

  topic.frontmatter.learningPath.forEach((slug, index) => {
    const post = allPosts.find((p) => p.slug === slug);
    if (post) {
      pathPosts.push({ post, order: index + 1 });
    }
  });

  return pathPosts;
};
