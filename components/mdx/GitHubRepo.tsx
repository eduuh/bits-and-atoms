import { Github, Star, GitFork, ExternalLink } from 'lucide-react';

interface GitHubRepoProps {
  repo: string; // format: "owner/repo"
  description?: string;
}

export function GitHubRepo({ repo, description }: GitHubRepoProps) {
  const url = `https://github.com/${repo}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="not-prose my-6 flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors group"
    >
      <div className="shrink-0 p-2 rounded-lg bg-muted">
        <Github className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {repo}
          </span>
          <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </a>
  );
}
