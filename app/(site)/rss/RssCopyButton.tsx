'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RssCopyButtonProps {
  url: string;
}

export function RssCopyButton({ url }: RssCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "p-2 rounded-md transition-colors",
        copied 
          ? "bg-green-500/10 text-green-500" 
          : "hover:bg-background text-muted-foreground hover:text-foreground"
      )}
      aria-label="Copy RSS feed URL"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}
