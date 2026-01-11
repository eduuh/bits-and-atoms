'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePortal } from './usePortal';

interface UseModalOptions {
  open: boolean;
  onClose: () => void;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
}

interface UseModalReturn {
  portalContainer: HTMLElement | null;
  handleBackdropClick: () => void;
}

/**
 * Hook to manage modal behavior including:
 * - Body scroll locking
 * - Escape key to close
 * - Portal container for rendering
 */
export function useModal({
  open,
  onClose,
  closeOnEscape = true,
  lockScroll = true,
}: UseModalOptions): UseModalReturn {
  const portalContainer = usePortal();
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (!lockScroll) return;

    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open, lockScroll]);

  // Handle escape key
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEscape, onClose]);

  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  return {
    portalContainer,
    handleBackdropClick,
  };
}
