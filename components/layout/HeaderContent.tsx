'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { CommandMenu } from '@/components/search/CommandMenu';
import { siteConfig } from '@/config/site';

interface HeaderContentProps {
  posts: {
    title: string;
    slug: string;
    summary: string;
    tags?: string[];
    pinned?: boolean;
    content?: string;
  }[];
}

export function HeaderContent({ posts }: HeaderContentProps) {
  const pathname = usePathname();
  const isTransparentHeader = pathname === '/';

  return (
    <header 
      className={cn(
        "w-full transition-colors duration-200 z-50",
        isTransparentHeader 
          ? "fixed top-0 left-0 bg-background/20 backdrop-blur-sm border-transparent" 
          : "sticky top-0 border-b border-border bg-background/80 backdrop-blur-sm"
      )}
      role="banner"
    >
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between relative">
        {/* Logo / Title */}
        <Link 
          href="/" 
          className="text-xl font-bold tracking-tight text-foreground"
          aria-label={`${siteConfig.header.logo.text}${siteConfig.header.logo.highlight} - Home`}
        >
          {siteConfig.header.logo.text}<span className="text-primary">{siteConfig.header.logo.highlight}</span>
        </Link>

        {/* Actions */}
        <nav className="flex items-center gap-6" aria-label="Main navigation">
          {/* Primary Nav Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link 
              href="/now" 
              className={cn(
                "hover:text-foreground transition-colors",
                pathname === '/now' && "text-foreground font-semibold"
              )}
            >
              Now
            </Link>
            <Link 
              href="/series" 
              className={cn(
                "hover:text-foreground transition-colors",
                pathname?.startsWith('/series') && "text-foreground font-semibold"
              )}
            >
              Series
            </Link>
            <Link 
              href="/about" 
              className={cn(
                "hover:text-foreground transition-colors",
                pathname === '/about' && "text-foreground font-semibold"
              )}
            >
              About
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <CommandMenu posts={posts} />
          </div>
        </nav>
      </div>
    </header>
  );
}
