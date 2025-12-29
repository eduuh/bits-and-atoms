import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { Calendar, BookOpen, Code2, Briefcase, Music, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Now',
  description: `What ${siteConfig.name} is currently focused on`,
};

// Update this date whenever you update the page content
const lastUpdated = '2025-12-13';

export default function NowPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative w-full py-16 px-6 bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            What I&apos;m Doing <span className="text-primary">Now</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            This is a{' '}
            <a 
              href="https://nownownow.com/about" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              now page
            </a>
            . It&apos;s a snapshot of what I&apos;m currently focused on.
          </p>
          <p className="text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            Last updated: {new Date(lastUpdated).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12 space-y-12">
        {/* Location */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Location
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Based in <span className="text-foreground font-medium">{siteConfig.about.location}</span>, 
            working remotely.
          </p>
        </section>

        {/* Work */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Work
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Currently focused on building this developer blog template and exploring 
            new web technologies. Always looking for interesting projects and collaborations.
          </p>
        </section>

        {/* Building */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-primary" />
            Building
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1">→</span>
              <span className="text-muted-foreground">
                <span className="text-foreground font-medium">This blog</span> — 
                A modern developer blog with MDX, dark mode, and knowledge graph visualization
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1">→</span>
              <span className="text-muted-foreground">
                <span className="text-foreground font-medium">Side projects</span> — 
                Experimenting with AI integrations and developer tools
              </span>
            </li>
          </ul>
        </section>

        {/* Learning */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Learning
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1">→</span>
              <span className="text-muted-foreground">
                Deep diving into <span className="text-foreground font-medium">React Server Components</span> and the Next.js App Router
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1">→</span>
              <span className="text-muted-foreground">
                Exploring <span className="text-foreground font-medium">AI/ML fundamentals</span> and their applications in web development
              </span>
            </li>
          </ul>
        </section>

        {/* Reading */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Reading
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1">📚</span>
              <span className="text-muted-foreground">
                <span className="text-foreground font-medium">&quot;Designing Data-Intensive Applications&quot;</span> by Martin Kleppmann
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1">📚</span>
              <span className="text-muted-foreground">
                <span className="text-foreground font-medium">&quot;The Pragmatic Programmer&quot;</span> by David Thomas & Andrew Hunt
              </span>
            </li>
          </ul>
        </section>

        {/* Listening */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            Listening
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Lots of <span className="text-foreground font-medium">lo-fi beats</span> and{' '}
            <span className="text-foreground font-medium">podcasts</span> about tech and startups 
            while coding.
          </p>
        </section>

        {/* Footer note */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            This page is inspired by{' '}
            <a 
              href="https://sive.rs/now" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Derek Sivers
            </a>
            {' '}and the{' '}
            <a 
              href="https://nownownow.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              /now movement
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
