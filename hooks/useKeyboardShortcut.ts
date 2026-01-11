'use client';

import { useEffect, useCallback, useRef } from 'react';
import { defaultShortcuts, type ShortcutConfig } from '@/components/keyboard/KeyboardShortcuts';

interface UseKeyboardShortcutOptions {
  id: string;
  handler: () => void;
  enabled?: boolean;
  preventDefault?: boolean;
}

/**
 * Hook to register a keyboard shortcut using the centralized shortcut configuration.
 */
export function useKeyboardShortcut({
  id,
  handler,
  enabled = true,
  preventDefault = true,
}: UseKeyboardShortcutOptions): void {
  const shortcut = defaultShortcuts.find((s) => s.id === id);
  const handlerRef = useRef(handler);

  // Keep handler ref up to date
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  const matchesShortcut = useCallback(
    (e: KeyboardEvent, def: ShortcutConfig): boolean => {
      // Handle sequence shortcuts like "g h" separately
      if (def.sequence) {
        return false; // Sequence shortcuts need special handling
      }

      const hasMetaMod = def.modifiers.includes('meta');
      const hasCtrlMod = def.modifiers.includes('ctrl');
      const hasAltMod = def.modifiers.includes('alt');
      const hasShiftMod = def.modifiers.includes('shift');

      // For meta modifier, accept either metaKey or ctrlKey (cross-platform)
      const metaMatch = hasMetaMod ? e.metaKey || e.ctrlKey : !e.metaKey;
      const ctrlMatch = hasCtrlMod ? e.ctrlKey : hasMetaMod ? true : !e.ctrlKey;
      const altMatch = hasAltMod ? e.altKey : !e.altKey;
      const shiftMatch = hasShiftMod ? e.shiftKey : !e.shiftKey;

      const keyMatch = e.key.toLowerCase() === def.key.toLowerCase();

      return keyMatch && metaMatch && ctrlMatch && altMatch && shiftMatch;
    },
    []
  );

  useEffect(() => {
    if (!enabled || !shortcut) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger in inputs unless it's a modifier-based shortcut
      if (
        (e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement) &&
        shortcut.modifiers.length === 0
      ) {
        return;
      }

      if (matchesShortcut(e, shortcut)) {
        if (preventDefault) e.preventDefault();
        handlerRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, shortcut, preventDefault, matchesShortcut]);
}

/**
 * Hook for double-key shortcuts like ";;".
 */
export function useDoubleKeyShortcut(
  key: string,
  handler: () => void,
  enabled = true,
  threshold = 300
): void {
  const lastKeyTimeRef = useRef(0);
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === key) {
        const currentTime = Date.now();
        if (currentTime - lastKeyTimeRef.current < threshold) {
          e.preventDefault();
          handlerRef.current();
          lastKeyTimeRef.current = 0;
        } else {
          lastKeyTimeRef.current = currentTime;
        }
      } else {
        lastKeyTimeRef.current = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, key, threshold]);
}
