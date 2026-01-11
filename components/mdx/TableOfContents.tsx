'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TableOfContentsProps {
  source: string;
}

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ source }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0 });
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Simple regex to extract headings from raw markdown
    // Matches # Heading, ## Heading, etc.
    const headingRegex = /^(#{2,3})\s+(.+)$/gm;
    const foundHeadings: Heading[] = [];
    let match;

    while ((match = headingRegex.exec(source)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      // Create a simple slug from text
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      foundHeadings.push({ id, text, level });
    }

    setHeadings(foundHeadings);
  }, [source]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0% 0% -80% 0%' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  // Update indicator position when active changes
  useEffect(() => {
    if (!activeId || !navRef.current) return;

    const activeLink = navRef.current.querySelector(`[data-heading-id="${activeId}"]`);
    if (activeLink) {
      const navRect = navRef.current.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      setIndicatorStyle({
        top: linkRect.top - navRect.top,
        height: linkRect.height,
      });
    }
  }, [activeId]);

  if (headings.length === 0) return null;

  return (
    <nav ref={navRef} className="sticky top-24 self-start hidden lg:block relative max-h-[calc(100vh-8rem)] overflow-y-auto">
      <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
        Table of Contents
      </h4>

      {/* Animated indicator */}
      {activeId && (
        <motion.div
          className="absolute left-0 w-0.5 bg-primary rounded-full"
          initial={false}
          animate={{
            top: indicatorStyle.top,
            height: indicatorStyle.height,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        />
      )}

      <ul className="space-y-2 text-sm pl-3 border-l border-border">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: (heading.level - 2) * 16 }}
          >
            <a
              href={`#${heading.id}`}
              data-heading-id={heading.id}
              className={cn(
                'block py-1 transition-all duration-200',
                activeId === heading.id
                  ? 'text-primary font-medium translate-x-1'
                  : 'text-muted-foreground hover:text-foreground hover:translate-x-0.5'
              )}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({
                  behavior: 'smooth',
                });
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
