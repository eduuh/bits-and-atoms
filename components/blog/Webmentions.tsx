'use client';

import { useState, useEffect } from 'react';
import { Heart, Repeat2, MessageCircle, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface WebmentionAuthor {
  name: string;
  photo?: string;
  url?: string;
}

interface Webmention {
  'wm-id': number;
  'wm-source': string;
  'wm-target': string;
  'wm-property': 'like-of' | 'repost-of' | 'in-reply-to' | 'mention-of' | 'bookmark-of';
  'wm-received': string;
  author?: WebmentionAuthor;
  content?: {
    text?: string;
    html?: string;
  };
  published?: string;
  url?: string;
}

interface WebmentionResponse {
  type: string;
  name: string;
  children: Webmention[];
}

interface WebmentionsProps {
  slug: string;
  domain?: string;
}

export function Webmentions({ slug, domain = 'eduuh.com' }: WebmentionsProps) {
  const [mentions, setMentions] = useState<Webmention[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMentions = async () => {
      try {
        setIsLoading(true);
        const targetUrl = encodeURIComponent(`https://${domain}/blog/${slug}`);
        const res = await fetch(
          `https://webmention.io/api/mentions.jf2?target=${targetUrl}&per-page=100`
        );

        if (!res.ok) {
          throw new Error('Failed to fetch webmentions');
        }

        const data: WebmentionResponse = await res.json();
        setMentions(data.children || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load mentions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentions();
  }, [slug, domain]);

  // Filter mentions by type
  const likes = mentions.filter((m) => m['wm-property'] === 'like-of');
  const reposts = mentions.filter((m) => m['wm-property'] === 'repost-of');
  const replies = mentions.filter(
    (m) => m['wm-property'] === 'in-reply-to' || m['wm-property'] === 'mention-of'
  );
  const bookmarks = mentions.filter((m) => m['wm-property'] === 'bookmark-of');

  const totalInteractions = likes.length + reposts.length + replies.length + bookmarks.length;

  if (isLoading) {
    return (
      <div className="my-8 p-6 rounded-lg border border-border bg-card animate-pulse">
        <div className="h-6 w-32 bg-muted rounded mb-4" />
        <div className="flex gap-4">
          <div className="h-8 w-20 bg-muted rounded" />
          <div className="h-8 w-20 bg-muted rounded" />
          <div className="h-8 w-20 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return null; // Silently fail if webmentions can't be loaded
  }

  if (totalInteractions === 0) {
    return (
      <div className="my-8 p-6 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Webmentions</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          No webmentions yet. Share this post on Twitter, Mastodon, or your blog to start a
          conversation!
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          <a
            href="https://indieweb.org/Webmention"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            Learn about Webmentions
            <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPlatform = (url: string): string => {
    if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter';
    if (url.includes('mastodon')) return 'Mastodon';
    if (url.includes('bsky.app')) return 'Bluesky';
    if (url.includes('linkedin.com')) return 'LinkedIn';
    return 'Web';
  };

  return (
    <div className="my-8 rounded-lg border border-border bg-card overflow-hidden not-prose">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Webmentions</h3>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-4 border-b border-border flex flex-wrap gap-6">
        {likes.length > 0 && (
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-foreground">{likes.length} Likes</span>
          </div>
        )}
        {reposts.length > 0 && (
          <div className="flex items-center gap-2">
            <Repeat2 className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-foreground">{reposts.length} Reposts</span>
          </div>
        )}
        {replies.length > 0 && (
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-foreground">{replies.length} Replies</span>
          </div>
        )}
      </div>

      {/* Avatars for likes */}
      {likes.length > 0 && (
        <div className="px-4 py-4 border-b border-border">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Liked by
          </h4>
          <div className="flex flex-wrap gap-1">
            {likes.slice(0, 20).map((like) => (
              <a
                key={like['wm-id']}
                href={like.author?.url || like['wm-source']}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
                title={like.author?.name || 'Anonymous'}
              >
                {like.author?.photo ? (
                  <Image
                    src={like.author.photo}
                    alt={like.author?.name || 'User avatar'}
                    width={32}
                    height={32}
                    className="rounded-full border border-border hover:ring-2 hover:ring-primary transition-all"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground border border-border">
                    {like.author?.name?.[0] || '?'}
                  </div>
                )}
              </a>
            ))}
            {likes.length > 20 && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground border border-border">
                +{likes.length - 20}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Replies */}
      {replies.length > 0 && (
        <div className="divide-y divide-border">
          {replies.map((reply) => (
            <div key={reply['wm-id']} className="px-4 py-4">
              <div className="flex items-start gap-3">
                <a
                  href={reply.author?.url || reply['wm-source']}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                >
                  {reply.author?.photo ? (
                    <Image
                      src={reply.author.photo}
                      alt={reply.author?.name || 'User avatar'}
                      width={40}
                      height={40}
                      className="rounded-full border border-border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground border border-border">
                      {reply.author?.name?.[0] || '?'}
                    </div>
                  )}
                </a>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={reply.author?.url || reply['wm-source']}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {reply.author?.name || 'Anonymous'}
                    </a>
                    <span className="text-xs text-muted-foreground">
                      · {getPlatform(reply['wm-source'])}
                    </span>
                    {reply.published && (
                      <span className="text-xs text-muted-foreground">
                        · {formatDate(reply.published)}
                      </span>
                    )}
                  </div>
                  {reply.content?.text && (
                    <p className="mt-1 text-sm text-foreground/90 line-clamp-4">
                      {reply.content.text}
                    </p>
                  )}
                  <a
                    href={reply.url || reply['wm-source']}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    View original
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
