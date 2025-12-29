import { siteConfig } from '@/config/site';
import { Github, Linkedin, Mail, Terminal, Cpu, Globe, Code2, Server, Database } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'About Me',
  description: `About ${siteConfig.name}`,
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative w-full py-24 px-6 bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Hi, I&apos;m <span className="text-primary">{siteConfig.name}</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            {siteConfig.description}. I&apos;m passionate about building digital experiences that look great and perform even better.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link 
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Github className="w-6 h-6" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link 
              href={siteConfig.links.linkedin}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Linkedin className="w-6 h-6" />
              <span className="sr-only">LinkedIn</span>
            </Link>
            <Link 
              href="mailto:contact@example.com"
              className="p-3 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Mail className="w-6 h-6" />
              <span className="sr-only">Email</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16 space-y-16">
        {/* Bio Section */}
        <section className="prose dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Terminal className="w-6 h-6 text-primary" />
            The Backstory
          </h2>
          <p>
            I&apos;m a developer based in {siteConfig.about.location}. {siteConfig.about.bio}
          </p>
          <p>
            When I&apos;m not coding, you can find me {siteConfig.about.hobbies.join(', ')}.
          </p>
        </section>

        {/* Tech Stack */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-primary" />
            Tech Stack
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: 'Next.js', icon: Globe },
              { name: 'React', icon: Code2 },
              { name: 'TypeScript', icon: Terminal },
              { name: 'Tailwind CSS', icon: Code2 },
              { name: 'Node.js', icon: Server },
              { name: 'PostgreSQL', icon: Database },
            ].map((tech) => (
              <div key={tech.name} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
                <tech.icon className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{tech.name}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
