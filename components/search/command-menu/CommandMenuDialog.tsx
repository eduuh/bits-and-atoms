'use client';

import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Command } from 'cmdk';
import { useModal } from '@/hooks/useModal';
import { dialogOverlay, dialogContent } from '@/lib/animations';

interface CommandMenuDialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  isGrepMode?: boolean;
}

export function CommandMenuDialog({
  open,
  onClose,
  children,
  isGrepMode = false,
}: CommandMenuDialogProps) {
  const { portalContainer, handleBackdropClick } = useModal({
    open,
    onClose,
    closeOnEscape: true,
    lockScroll: true,
  });

  if (!portalContainer) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            style={{ zIndex: 99999 }}
            onClick={handleBackdropClick}
            aria-hidden="true"
            variants={dialogOverlay}
            initial="initial"
            animate="animate"
            exit="exit"
          />

          {/* Command Dialog - Positioned at top like VS Code, lower on mobile to avoid browser chrome */}
          <motion.div
            className="fixed left-1/2 top-[20%] sm:top-[12%] w-full max-w-[640px] -translate-x-1/2 px-3 sm:px-4"
            style={{ zIndex: 100000 }}
            role="dialog"
            aria-modal="true"
            aria-label="Search and navigation"
            variants={dialogContent}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div
              className="overflow-hidden rounded-xl border border-border bg-popover shadow-2xl ring-1 ring-black/5"
              onClick={(e) => e.stopPropagation()}
            >
              <Command shouldFilter={false} className="w-full" label="Search commands">
                {children}

                {/* Footer with keyboard hints - hidden on mobile, simplified for touch devices */}
                <div className="hidden sm:flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                        ↑↓
                      </kbd>
                      <span>Navigate</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                        ↵
                      </kbd>
                      <span>Select</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                        esc
                      </kbd>
                      <span>Close</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                        #
                      </kbd>
                      <span>Tags</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                        &gt;
                      </kbd>
                      <span>Grep</span>
                    </span>
                    {isGrepMode && (
                      <span className="flex items-center gap-1.5">
                        <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                          Ctrl+Q
                        </kbd>
                        <span>Add to List</span>
                      </span>
                    )}
                  </div>
                </div>
                {/* Mobile footer - simpler hint */}
                <div className="sm:hidden flex items-center justify-center border-t border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  <span>Tap to select · Use # for tags</span>
                </div>
              </Command>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    portalContainer
  );
}
