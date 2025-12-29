'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Network } from 'lucide-react';

export function GraphLink() {
  const pathname = usePathname();
  const isActive = pathname === '/graph';

  return (
    <Link 
      href="/graph"
      className={`p-2 rounded-full transition-all hover:scale-110 ${
        isActive 
          ? 'bg-primary/10 text-primary' 
          : 'hover:bg-primary/10 hover:text-primary text-muted-foreground'
      }`}
      title="Graph View"
      aria-label="View knowledge graph"
    >
      <Network className="w-5 h-5" aria-hidden="true" />
      <span className="sr-only">Graph View</span>
    </Link>
  );
}
