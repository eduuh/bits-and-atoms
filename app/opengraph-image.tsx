import { ImageResponse } from 'next/og';
import { siteConfig } from '@/config/site';

export const dynamic = 'force-static';
export const alt = siteConfig.name;
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
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
          background: 'linear-gradient(to bottom right, #09090b, #18181b)',
          color: 'white',
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

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 80,
            fontWeight: 800,
            letterSpacing: '-0.05em',
            zIndex: 10,
          }}
        >
          {siteConfig.header.logo.text}
          <span style={{ color: '#22c55e' }}>{siteConfig.header.logo.highlight}</span>
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 30,
            color: '#a1a1aa', // zinc-400
            fontWeight: 500,
            zIndex: 10,
          }}
        >
          {siteConfig.description}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
