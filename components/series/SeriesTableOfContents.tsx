'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SeriesPost {
  slug: string;
  content: string;
  frontmatter: {
    title: string;
  };
}

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface SeriesTableOfContentsProps {
  posts: SeriesPost[];
}

export function SeriesTableOfContents({ posts }: SeriesTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('part-1');
  const [postHeadings, setPostHeadings] = useState<Record<string, Heading[]>>({});

  useEffect(() => {
    // Extract headings for each post
    const headingsMap: Record<string, Heading[]> = {};
    
    posts.forEach((post) => {
      const headingRegex = /^(#{2,3})\s+(.+)$/gm;
      const foundHeadings: Heading[] = [];
      let match;

      while ((match = headingRegex.exec(post.content)) !== null) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        foundHeadings.push({ id, text, level });
      }
      headingsMap[post.slug] = foundHeadings;
    });

    setPostHeadings(headingsMap);
  }, [posts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0
      }
    );

    // Observe post sections
    posts.forEach((_, index) => {
      const element = document.getElementById(`part-${index + 1}`);
      if (element) observer.observe(element);
    });

    // Observe internal headings
    Object.values(postHeadings).flat().forEach(heading => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [posts, postHeadings]);

  return (
    <div className="sticky top-24 space-y-8 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
      <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Table of Contents
        </h2>
        <nav className="space-y-4">
          {posts.map((post, index) => {
            const partId = `part-${index + 1}`;
            const isPartActive = activeId === partId || postHeadings[post.slug]?.some(h => h.id === activeId);
            
            return (
              <div key={post.slug} className="space-y-2">
                <a
                  href={`#${partId}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(partId)?.scrollIntoView({ behavior: 'smooth' });
                    setActiveId(partId);
                  }}
                  className={cn(
                    "group flex items-start gap-3 text-sm transition-colors",
                    isPartActive 
                      ? "text-primary font-medium" 
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  <span className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-mono font-medium transition-colors",
                    isPartActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground group-hover:border-primary group-hover:text-primary"
                  )}>
                    {index + 1}
                  </span>
                  <span className="line-clamp-2">
                    {post.frontmatter.title}
                  </span>
                </a>

                {/* Internal Headings */}
                {isPartActive && postHeadings[post.slug]?.length > 0 && (
                  <div className="ml-8 space-y-2 border-l border-border pl-4">
                    {postHeadings[post.slug].map((heading) => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                          setActiveId(heading.id);
                        }}
                        className={cn(
                          "block text-xs transition-colors line-clamp-1",
                          activeId === heading.id
                            ? "text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {heading.text}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
