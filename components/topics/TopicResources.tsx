import { Link2, ExternalLink } from 'lucide-react';

interface Resource {
  title: string;
  url: string;
  description?: string;
}

interface TopicResourcesProps {
  resources: Resource[];
}

export function TopicResources({ resources }: TopicResourcesProps) {
  if (resources.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 p-6 rounded-lg bg-muted/50 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-md bg-primary/10 text-primary">
          <Link2 className="h-4 w-4" />
        </div>
        <h2 className="text-lg font-semibold">Resources</h2>
      </div>

      <ul className="space-y-3">
        {resources.map((resource) => (
          <li key={resource.url}>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 hover:text-primary transition-colors"
            >
              <ExternalLink className="h-4 w-4 mt-0.5 text-muted-foreground group-hover:text-primary flex-shrink-0" />
              <div>
                <span className="font-medium">{resource.title}</span>
                {resource.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {resource.description}
                  </p>
                )}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
