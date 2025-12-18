# Blog Content

Public content repository for [eduuh.dev](https://eduuh.dev). This repo contains MDX blog posts, topic pages, and images.

Code (Next.js app, components, deployment) lives in a separate private monorepo that consumes this repo as a git submodule.

## Structure

```
posts/          # MDX blog posts
topics/         # Topic/learning path MDX files
images/         # Blog post images
```

## Frontmatter Schema

Each post in `posts/` uses this frontmatter:

```yaml
---
title: Post Title                     # Required
slug: post-slug                       # Required - URL slug
publishedAt: '2026-01-15'            # Required - ISO date
summary: >-                           # Required - Short description
  A brief summary of the post.
published: true                       # Optional - set false to hide
status: published                     # Optional - 'published' | 'draft'
updatedAt: '2026-02-01'              # Optional - ISO date
image: /images/hero.jpg              # Optional - hero image path
tags:                                 # Optional - array of tags
  - Engineering
  - Homelab
pinned: true                          # Optional - pin to top
tldr: >-                              # Optional - TL;DR text
  Quick summary of the key points.
keyTakeaways:                         # Optional - bullet points
  - First takeaway
  - Second takeaway
series:                               # Optional - series grouping
  title: Series Name
  order: 1
aiSummary: AI-generated summary       # Optional
aiKeyTakeaways:                       # Optional
  - AI-generated takeaway
changelog:                            # Optional - version history
  - version: '1.1'
    date: '2026-02-01'
    changes:
      - Updated section on X
---
```

## Topic Frontmatter

Each file in `topics/` uses:

```yaml
---
title: Topic Title                    # Required
slug: topic-slug                      # Required
description: What this topic covers   # Required
tag: engineering                      # Required - matches post tags
icon: Server                          # Optional - Lucide icon name
color: blue                           # Optional - accent color
learningPath:                         # Optional - ordered post slugs
  - first-post-slug
  - second-post-slug
resources:                            # Optional - external links
  - title: Resource Name
    url: https://example.com
    description: Why this is useful
---
```

## Available MDX Components

These components are available in all MDX files:

| Component | Description |
|-----------|-------------|
| `<Callout type="info\|warning\|error\|tip">` | Styled callout box |
| `<Terminal lines={[...]}/>` | Animated terminal output |
| `<CodeBlock>` | Enhanced code block with copy button |
| `<CodeDiff>` | Side-by-side code diff |
| `<CodeExercise>` | Interactive code exercise |
| `<Playground>` | Live code playground |
| `<InlinePlayground>` | Inline live code editor |
| `<SandpackDemo>` | Sandpack code sandbox |
| `<D2Diagram>` | D2 diagram renderer |
| `<GitHubRepo>` | GitHub repository card |
| `<Kbd>` | Keyboard key styling |
| `<Footnote>` | Footnote reference |
| `<Sidenote>` | Margin sidenote |

## Images

Reference images using `/images/filename.ext` in both frontmatter and markdown:

```markdown
image: /images/hero.jpg

![Alt text](/images/screenshot.png)
```

## Local Preview

To preview content locally, clone the private monorepo and run:

```bash
npm run dev:blog
```

The dev server runs at `http://localhost:1425`.
