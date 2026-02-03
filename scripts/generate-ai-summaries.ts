#!/usr/bin/env npx tsx
/**
 * AI Summary Generator
 *
 * Generates AI summaries for blog posts that don't have them.
 * Run with: npx tsx scripts/generate-ai-summaries.ts
 *
 * Requires: ANTHROPIC_API_KEY environment variable
 *
 * Options:
 *   --dry-run     Preview changes without writing files
 *   --force       Regenerate summaries even if they exist
 *   --slug=<slug> Generate summary for a specific post only
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_PATH = path.join(process.cwd(), 'content/posts');
const API_KEY = process.env.ANTHROPIC_API_KEY;

interface AIResponse {
  summary: string;
  keyTakeaways: string[];
}

async function generateSummary(content: string, title: string): Promise<AIResponse> {
  if (!API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  const prompt = `You are a technical blog summarizer. Analyze this blog post and provide:
1. A concise 2-3 sentence summary that captures the main topic and key insights
2. 3-5 key takeaways as bullet points

Blog Title: ${title}

Blog Content:
${content.slice(0, 8000)} ${content.length > 8000 ? '...[truncated]' : ''}

Respond in this exact JSON format:
{
  "summary": "Your 2-3 sentence summary here",
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"]
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const text = data.content[0].text;

  // Parse JSON response
  try {
    const parsed = JSON.parse(text);
    return {
      summary: parsed.summary,
      keyTakeaways: parsed.keyTakeaways || [],
    };
  } catch {
    // Fallback: try to extract summary from response
    return {
      summary: text.slice(0, 500),
      keyTakeaways: [],
    };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const slugArg = args.find((a) => a.startsWith('--slug='));
  const targetSlug = slugArg?.split('=')[1];

  console.log('🤖 AI Summary Generator\n');

  if (!API_KEY) {
    console.error('❌ Error: ANTHROPIC_API_KEY environment variable is required');
    console.log('\nSet it with: export ANTHROPIC_API_KEY=your-key-here');
    process.exit(1);
  }

  if (dryRun) {
    console.log('📋 Dry run mode - no files will be modified\n');
  }

  const files = fs.readdirSync(POSTS_PATH).filter((f) => f.endsWith('.mdx'));
  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const slug = file.replace('.mdx', '');

    if (targetSlug && slug !== targetSlug) {
      continue;
    }

    const filePath = path.join(POSTS_PATH, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content: postContent } = matter(content);

    // Skip unpublished posts
    if (frontmatter.published === false) {
      console.log(`⏭️  Skipping ${slug} (unpublished)`);
      skipped++;
      continue;
    }

    // Skip if already has AI summary (unless force flag)
    if (frontmatter.aiSummary && !force) {
      console.log(`⏭️  Skipping ${slug} (already has AI summary)`);
      skipped++;
      continue;
    }

    console.log(`📝 Processing: ${slug}`);

    try {
      const { summary, keyTakeaways } = await generateSummary(postContent, frontmatter.title);

      console.log(`   Summary: ${summary.slice(0, 100)}...`);
      console.log(`   Takeaways: ${keyTakeaways.length} items`);

      if (!dryRun) {
        // Update frontmatter
        const newFrontmatter = {
          ...frontmatter,
          aiSummary: summary,
          aiKeyTakeaways: keyTakeaways,
        };

        const newContent = matter.stringify(postContent, newFrontmatter);
        fs.writeFileSync(filePath, newContent);
        console.log(`   ✅ Updated ${file}`);
      } else {
        console.log(`   📋 Would update ${file}`);
      }

      processed++;

      // Rate limiting - wait 1 second between requests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`   ❌ Error: ${error instanceof Error ? error.message : error}`);
      errors++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   Processed: ${processed}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);
}

main().catch(console.error);
