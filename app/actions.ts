'use server';

import { getPostBySlug } from '@/lib/mdx/source';
import { MDXContent } from '@/components/mdx/MDXContent';
import React from 'react';

export async function getPostPreview(href: string) {
  if (!href.startsWith('/blog/')) {
    return null;
  }

  const slug = href.replace('/blog/', '');
  try {
    const post = getPostBySlug(slug);
    if (!post) return null;
    return {
      title: post.frontmatter.title,
      summary: post.frontmatter.summary,
      image: post.frontmatter.image,
      content: React.createElement(MDXContent, { source: post.content }),
    };
  } catch (error) {
    console.error(`Failed to get post preview for ${slug}`, error);
    return null;
  }
}
