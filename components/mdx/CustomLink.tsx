'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { getPostPreview } from '@/app/actions';

interface PreviewData {
  title: string;
  summary: string;
  image?: string;
  content?: React.ReactNode;
}

export function CustomLink({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const isInternal = href && (href.startsWith('/') || href.startsWith('#'));
  const isBlogPost = href && href.startsWith('/blog/');

  const handleMouseEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }

    setIsHovered(true);
    
    if (isBlogPost && !preview && !isLoading) {
      hoverTimeout.current = setTimeout(async () => {
        setIsLoading(true);
        const data = await getPostPreview(href as string);
        setPreview(data);
        setIsLoading(false);
      }, 300); // Delay before fetching/showing
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }

    closeTimeout.current = setTimeout(() => {
      setIsHovered(false);
    }, 300); // Grace period before closing
  };

  if (!isInternal) {
    return (
      <a target="_blank" rel="noopener noreferrer" href={href} {...props} className="text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary transition-colors">
        {children}
      </a>
    );
  }

  return (
    <span className="relative inline-block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Link href={href as string} {...props} className="text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary transition-colors">
        {children}
      </Link>
      
      <AnimatePresence>
        {isHovered && isBlogPost && (preview || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full w-[500px] max-h-[600px] overflow-y-auto p-4 rounded-lg border bg-popover text-popover-foreground shadow-lg"
            style={{ 
              pointerEvents: 'auto',
              marginBottom: '0.5rem' // Visual gap
            }}
          >
            {/* Invisible bridge to prevent mouse leave when moving to the card */}
            <div className="absolute left-0 right-0 top-full h-2 bg-transparent" />

            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : preview ? (
              <div className="space-y-4">
                {preview.image && (
                  <div className="relative w-full h-48">
                    <Image 
                      src={preview.image} 
                      alt={preview.title} 
                      fill
                      className="object-cover rounded-md" 
                    />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-lg leading-none tracking-tight mb-2">{preview.title}</h4>
                  {preview.content ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {preview.content}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {preview.summary}
                    </p>
                  )}
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
