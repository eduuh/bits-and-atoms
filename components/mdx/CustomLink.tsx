'use client';

import React from 'react';
import Link from 'next/link';

export function CustomLink({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isInternal = href && (href.startsWith('/') || href.startsWith('#'));

  if (!isInternal) {
    return (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={href}
        {...props}
        className="text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary transition-colors"
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href as string}
      {...props}
      className="text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary transition-colors"
    >
      {children}
    </Link>
  );
}
