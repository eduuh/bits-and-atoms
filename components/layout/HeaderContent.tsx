'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { CommandMenu } from '@/components/search/command-menu';
import { MobileNav } from './MobileNav';
import { siteConfig } from '@/config/site';
import type { Post } from '@/components/search/shared/types';

interface HeaderContentProps {
  posts: Post[];
}

interface NavLinkProps {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}

function NavLink({ href, isActive, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'relative py-1 transition-colors duration-150',
        isActive
          ? 'text-foreground font-semibold'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
      {/* Animated gradient underline */}
      <span
        className={cn(
          'absolute left-0 -bottom-0.5 h-0.5 bg-gradient-to-r from-primary to-accent-purple transition-all duration-200',
          isActive ? 'w-full' : 'w-0 group-hover:w-full'
        )}
      />
    </Link>
  );
}

export function HeaderContent({ posts }: HeaderContentProps) {
  const pathname = usePathname();
  const isTransparentHeader = pathname === '/';

  return (
    <header
      className={cn(
        'w-full transition-all duration-300 z-50 relative',
        isTransparentHeader
          ? 'fixed top-0 left-0 bg-background/20 backdrop-blur-sm border-transparent'
          : 'sticky top-0 bg-background/80 backdrop-blur-sm'
      )}
      role="banner"
    >
      {/* Animated gradient bottom border */}
      {!isTransparentHeader && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] header-gradient" />
      )}
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between relative">
        {/* Logo / Title */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-foreground transition-transform duration-150 hover:scale-105"
          aria-label={`${siteConfig.header.logo.text}${siteConfig.header.logo.highlight} - Home`}
        >
          {siteConfig.header.logo.text}
          <span className="text-primary">{siteConfig.header.logo.highlight}</span>
        </Link>

        {/* Actions */}
        <nav className="flex items-center gap-6" aria-label="Main navigation">
          {/* Primary Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <NavLink href="/now" isActive={pathname === '/now'}>
              Now
            </NavLink>
            <NavLink href="/series" isActive={pathname?.startsWith('/series') ?? false}>
              Series
            </NavLink>
            <NavLink href="/about" isActive={pathname === '/about'}>
              About
            </NavLink>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <CommandMenu posts={posts} />
            <MobileNav />
          </div>
        </nav>
      </div>
    </header>
  );
}
