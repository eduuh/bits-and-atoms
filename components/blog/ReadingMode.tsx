'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUp } from 'lucide-react';
import { useReadingMode } from './ReadingModeContext';
import { scaleIn, durations, easings } from '@/lib/animations';

interface ReadingModeProps {
  children: React.ReactNode;
  title?: string;
  summary?: string;
}

export function ReadingMode({ children, title, summary }: ReadingModeProps) {
  const { enabled, setEnabled } = useReadingMode();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Save scroll position when entering reading mode
  useEffect(() => {
    if (enabled) {
      setScrollPosition(window.scrollY);
    }
  }, [enabled]);

  // Restore scroll position when exiting
  const handleExit = useCallback(() => {
    setEnabled(false);
    // Restore scroll position after animation
    setTimeout(() => {
      window.scrollTo(0, scrollPosition);
    }, 200);
  }, [setEnabled, scrollPosition]);

  // Track scroll for back-to-top button
  useEffect(() => {
    if (!enabled) return;

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      setShowBackToTop(target.scrollTop > 500);
    };

    const overlay = document.getElementById('reading-mode-overlay');
    overlay?.addEventListener('scroll', handleScroll);

    return () => {
      overlay?.removeEventListener('scroll', handleScroll);
    };
  }, [enabled]);

  const scrollToTop = useCallback(() => {
    const overlay = document.getElementById('reading-mode-overlay');
    overlay?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      {/* Normal Content */}
      {children}

      {/* Fullscreen Overlay */}
      <AnimatePresence>
        {enabled && (
          <motion.div
            id="reading-mode-overlay"
            className="fixed inset-0 z-[100] bg-background overflow-y-auto"
            variants={scaleIn}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              duration: durations.slow,
              ease: easings.easeOut,
            }}
          >
            <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
              {/* Exit Button */}
              <motion.button
                onClick={handleExit}
                className="fixed top-6 right-6 p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground transition-all duration-150 shadow-sm hover:scale-110 active:scale-95"
                title="Exit Reading Mode (ESC)"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.button>

              {/* Content Container */}
              <motion.div
                className="prose dark:prose-invert max-w-none mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: durations.slow }}
              >
                {title && (
                  <div className="mb-8 pb-8 border-b border-border">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                      {title}
                    </h1>
                    {summary && (
                      <p className="text-xl text-muted-foreground leading-relaxed">
                        {summary}
                      </p>
                    )}
                  </div>
                )}
                {children}
              </motion.div>

              {/* Back to Top Button */}
              <AnimatePresence>
                {showBackToTop && (
                  <motion.button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-150 hover:scale-110 active:scale-95"
                    title="Back to top"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    transition={{ duration: durations.fast }}
                  >
                    <ArrowUp className="w-5 h-5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
