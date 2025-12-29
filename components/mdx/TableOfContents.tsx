"use client";

import { useEffect, useState } from "react";

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
  const [activeId, setActiveId] = useState<string>("");

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
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

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
      { rootMargin: "0% 0% -80% 0%" }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-24 self-start hidden lg:block">
      <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
        Table of Contents
      </h4>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: (heading.level - 2) * 16 }}
          >
            <a
              href={`#${heading.id}`}
              className={`block transition-colors duration-200 ${
                activeId === heading.id
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({
                  behavior: "smooth",
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
