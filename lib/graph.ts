import { getAllPosts } from '@/lib/mdx/source';

export interface GraphNode {
  id: string;
  name: string;
  val: number;
  color?: string;
  tags?: string[];
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export function getGraphData(): GraphData {
  const posts = getAllPosts();
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const slugSet = new Set(posts.map((p) => p.slug));

  // Create Nodes
  posts.forEach((post) => {
    nodes.push({
      id: post.slug,
      name: post.frontmatter.title,
      val: 1, // Default size
      tags: post.frontmatter.tags || [],
    });
  });

  // Create Links
  posts.forEach((post) => {
    const content = post.content;
    // Regex to find markdown links: [text](/blog/slug) or just /blog/slug
    // We are looking for links that point to /blog/something
    const linkRegex = /\/blog\/([a-zA-Z0-9-]+)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const targetSlug = match[1];
      // Only create link if target exists and it's not a self-link
      if (slugSet.has(targetSlug) && targetSlug !== post.slug) {
        // Check if link already exists to avoid duplicates
        const exists = links.some(
          (l) => l.source === post.slug && l.target === targetSlug
        );
        if (!exists) {
          links.push({
            source: post.slug,
            target: targetSlug,
          });
        }
      }
    }
  });

  // Create Links based on shared tags
  for (let i = 0; i < posts.length; i++) {
    for (let j = i + 1; j < posts.length; j++) {
      const p1 = posts[i];
      const p2 = posts[j];

      const sharedTags = p1.frontmatter.tags?.filter((t) =>
        p2.frontmatter.tags?.includes(t)
      );

      if (sharedTags && sharedTags.length > 0) {
        const exists = links.some(
          (l) =>
            (l.source === p1.slug && l.target === p2.slug) ||
            (l.source === p2.slug && l.target === p1.slug)
        );

        if (!exists) {
          links.push({
            source: p1.slug,
            target: p2.slug,
          });
        }
      }
    }
  }

  // Calculate node value (size) based on connections
  nodes.forEach((node) => {
    const connectionCount = links.filter(
      (l) => l.source === node.id || l.target === node.id
    ).length;
    node.val = Math.max(1, Math.log2(connectionCount + 2) * 2);
  });

  return { nodes, links };
}
