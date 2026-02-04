'use client';

import { Printer } from 'lucide-react';

interface PrintButtonProps {
  variant?: 'icon' | 'button';
  className?: string;
}

export function PrintButton({ variant = 'icon', className = '' }: PrintButtonProps) {
  const handlePrint = () => {
    window.print();
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handlePrint}
        className={`p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors ${className}`}
        title="Print this post"
        aria-label="Print this post"
      >
        <Printer className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      onClick={handlePrint}
      className={`inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors ${className}`}
      title="Print this post"
    >
      <Printer className="h-3.5 w-3.5" />
      <span>Print</span>
    </button>
  );
}
