'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, User, Clock, Tags, BookOpen, Rss } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePortal } from '@/hooks/usePortal';
import { useModal } from '@/hooks/useModal';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { slideInRight, dialogOverlay, staggerContainer, staggerItem } from '@/lib/animations';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/blog', label: 'Blog', icon: BookOpen },
  { href: '/now', label: 'Now', icon: Clock },
  { href: '/series', label: 'Series', icon: BookOpen },
  { href: '/tags', label: 'Tags', icon: Tags },
  { href: '/about', label: 'About', icon: User },
  { href: '/rss', label: 'RSS', icon: Rss },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const portalContainer = usePortal();

  useModal({
    open: isOpen,
    onClose: () => setIsOpen(false),
    closeOnEscape: true,
    lockScroll: true,
  });

  return (
    <>
      {/* Hamburger button - visible on mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
        aria-label="Open menu"
        aria-expanded={isOpen}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile drawer */}
      {portalContainer &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden"
                  style={{ zIndex: 99999 }}
                  onClick={() => setIsOpen(false)}
                  variants={dialogOverlay}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                />

                {/* Drawer */}
                <motion.div
                  className="fixed inset-y-0 right-0 w-[280px] bg-background border-l border-border shadow-2xl md:hidden"
                  style={{ zIndex: 100000 }}
                  variants={slideInRight}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <span className="font-semibold">Menu</span>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 rounded-lg hover:bg-accent transition-colors"
                      aria-label="Close menu"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Navigation links */}
                  <motion.nav
                    className="p-4 space-y-1"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <motion.div key={item.href} variants={staggerItem}>
                          <Link
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150',
                              isActive
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                            )}
                          >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.nav>

                  {/* Footer with theme toggle */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Theme</span>
                      <ThemeToggle />
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          portalContainer
        )}
    </>
  );
}
