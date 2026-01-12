import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { Github, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative bg-background" role="contentinfo">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col items-center md:flex-row md:items-center justify-between gap-6 text-center md:text-left">

        {/* Left: Brand & Copyright */}
        <div className="flex flex-col gap-1">
          <Link href="/" className="font-bold tracking-tight text-foreground" aria-label="Home">
            {siteConfig.header.logo.text}<span className="text-muted-foreground">{siteConfig.header.logo.highlight}</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.name}.
          </p>
        </div>

        {/* Middle: Links */}
        <nav className="flex flex-wrap justify-center md:justify-start gap-4 sm:gap-6 text-sm text-muted-foreground" aria-label="Footer navigation">
          {siteConfig.nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-foreground transition-colors"
            >
              {link.title}
            </Link>
          ))}
        </nav>

        {/* Right: Socials */}
        <div className="flex items-center gap-4" role="group" aria-label="Social media links">
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110"
            aria-label="GitHub profile (opens in new tab)"
          >
            <Github className="w-5 h-5" aria-hidden="true" />
            <span className="sr-only">GitHub</span>
          </a>
          <a
            href={siteConfig.links.linkedin}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110"
            aria-label="LinkedIn profile (opens in new tab)"
          >
            <Linkedin className="w-5 h-5" aria-hidden="true" />
            <span className="sr-only">LinkedIn</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
