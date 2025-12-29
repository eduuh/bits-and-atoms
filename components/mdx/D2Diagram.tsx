'use client';

import React, { useMemo } from 'react';
import pako from 'pako';

interface D2DiagramProps {
  code: string;
  alt?: string;
}

export function D2Diagram({ code, alt = 'D2 Diagram' }: D2DiagramProps) {
  const imageUrl = useMemo(() => {
    try {
      const data = new TextEncoder().encode(code.trim());
      const compressed = pako.deflate(data, { level: 9 });
      const base64 = Buffer.from(compressed)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
      return `https://kroki.io/d2/svg/${base64}`;
    } catch (e) {
      console.error('Error generating D2 diagram URL:', e);
      return '';
    }
  }, [code]);

  if (!imageUrl) return null;

  return (
    <div className="my-8 flex justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={imageUrl} 
        alt={alt}
        className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
        loading="lazy"
      />
    </div>
  );
}
