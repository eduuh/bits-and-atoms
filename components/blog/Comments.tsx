'use client';

import Giscus from '@giscus/react';
import { useTheme } from 'next-themes';

export function Comments() {
  const { theme } = useTheme();

  return (
    <div className="mt-10 pt-10 border-t border-border" id="comments">
      <Giscus
        id="comments"
        repo={process.env.NEXT_PUBLIC_GISCUS_REPO as `${string}/${string}`}
        repoId={process.env.NEXT_PUBLIC_GISCUS_REPO_ID as string}
        category={process.env.NEXT_PUBLIC_GISCUS_CATEGORY as string}
        categoryId={process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID as string}
        mapping="pathname"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme === 'dark' ? 'transparent_dark' : 'light'}
        lang="en"
        loading="lazy"
      />
    </div>
  );
}
