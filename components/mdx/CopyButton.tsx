'use client';

import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  code: string;
}

export function CopyButton({ code }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [code]);

  return (
    <button
      onClick={handleCopy}
      className="copy-button absolute right-2 top-2 z-10 flex items-center gap-1.5 rounded-md bg-muted/80 px-2 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-all hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      aria-label={copied ? 'Copied!' : 'Copy code to clipboard'}
      type="button"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Copy</span>
        </>
      )}
    </button>
  );
}
