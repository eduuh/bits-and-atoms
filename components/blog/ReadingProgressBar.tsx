'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

export function ReadingProgressBar() {
  const { scrollYProgress } = useScroll();
  
  // Add spring animation for smoother progress
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent-purple origin-left z-50"
      style={{ scaleX }}
    />
  );
}
