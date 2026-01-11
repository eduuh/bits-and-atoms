'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to get a portal container for rendering modals/dialogs.
 * Returns document.body after component mounts to avoid SSR issues.
 */
export function usePortal(): HTMLElement | null {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setContainer(document.body);
  }, []);

  return container;
}
