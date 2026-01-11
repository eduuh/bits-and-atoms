import { ImageResponse } from 'next/og';
import { getPostBySlug, getAllPosts } from '@/lib/mdx/source';
import { siteConfig } from '@/config/site';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-static';
export const alt = 'Blog Post Cover';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#09090b',
            color: 'white',
          }}
        >
          <div style={{ fontSize: 60, fontWeight: 800 }}>Post Not Found</div>
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(to bottom right, #09090b, #18181b)',
          color: 'white',
          padding: '80px',
          position: 'relative',
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 25px 25px, #27272a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #27272a 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            opacity: 0.2,
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', zIndex: 10 }}>
          {/* Tags */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
            {post.frontmatter.tags?.map((tag) => (
              <div
                key={tag}
                style={{
                  backgroundColor: 'rgba(39, 39, 42, 0.5)', // zinc-800 with opacity
                  border: '1px solid #3f3f46', // zinc-700
                  color: '#e4e4e7', // zinc-200
                  padding: '8px 20px',
                  borderRadius: '999px',
                  fontSize: 20,
                  fontWeight: 600,
                }}
              >
                {tag}
              </div>
            ))}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 80,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              marginBottom: '24px',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}
          >
            {post.frontmatter.title}
          </div>

          {/* Summary */}
          <div
            style={{
              fontSize: 32,
              color: '#a1a1aa', // zinc-400
              lineHeight: 1.4,
              maxWidth: '90%',
            }}
          >
            {post.frontmatter.summary}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            width: '100%',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 24,
                color: '#71717a', // zinc-500
                fontWeight: 600,
                marginBottom: '8px',
              }}
            >
              Published on
            </div>
            <div style={{ fontSize: 32, fontWeight: 600, color: '#e4e4e7' }}>
              {formatDate(post.frontmatter.publishedAt)}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: '-0.05em',
            }}
          >
            {siteConfig.header.logo.text}
            <span style={{ color: '#22c55e' }}>{siteConfig.header.logo.highlight}</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
