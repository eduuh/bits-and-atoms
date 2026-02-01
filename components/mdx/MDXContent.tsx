import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { remarkD2 } from '@/lib/mdx/remark-d2';
import { Callout } from './Callout';
import { SandpackDemo } from './SandpackDemo';
import { Playground } from './Playground';
import { InlinePlayground } from './InlinePlayground';
import { CodeExercise } from './CodeExercise';
import { D2Diagram } from './D2Diagram';
import { Kbd } from './Kbd';
import { CustomLink } from './CustomLink';
import { CodeBlock } from './CodeBlock';
import { GitHubRepo } from './GitHubRepo';

const options = {
  theme: 'github-dark',
  keepBackground: true,
};

const components = {
  Callout,
  SandpackDemo,
  Playground,
  InlinePlayground,
  CodeExercise,
  D2Diagram,
  Kbd,
  GitHubRepo,
  a: CustomLink,
  pre: CodeBlock,
};

export function MDXContent({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm, remarkD2],
          rehypePlugins: [[rehypePrettyCode, options], rehypeSlug],
        },
      }}
    />
  );
}

