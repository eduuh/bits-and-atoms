import { siteConfig } from '@/config/site';

/**
 * Auto-generated SEO Schema utilities for structured data
 */

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface BlogPostSchemaProps {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  slug: string;
  image?: string;
  tags?: string[];
}

export interface PersonSchemaProps {
  name: string;
  url: string;
  description?: string;
  image?: string;
  sameAs?: string[];
  jobTitle?: string;
  location?: string;
}

export interface CollectionPageSchemaProps {
  name: string;
  description: string;
  url: string;
  items: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
}

/**
 * Generate WebSite schema for the root layout
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    author: {
      '@type': 'Person',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/tags/{search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate breadcrumb schema for navigation
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate BlogPosting schema for blog posts
 */
export function generateBlogPostSchema(props: BlogPostSchemaProps) {
  const { title, description, publishedAt, updatedAt, slug, image, tags } = props;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    image: image
      ? [`${siteConfig.url}${image}`]
      : [`${siteConfig.url}/og.jpg`],
    url: `${siteConfig.url}/blog/${slug}`,
    author: {
      '@type': 'Person',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/og.jpg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteConfig.url}/blog/${slug}`,
    },
    ...(tags && tags.length > 0 && { keywords: tags.join(', ') }),
  };
}

/**
 * Generate Person schema for the about page
 */
export function generatePersonSchema(props: PersonSchemaProps) {
  const { name, url, description, image, sameAs, jobTitle, location } = props;

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    url,
    ...(description && { description }),
    ...(image && { image }),
    ...(jobTitle && { jobTitle }),
    ...(location && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: location,
      }
    }),
    ...(sameAs && sameAs.length > 0 && { sameAs }),
  };
}

/**
 * Generate CollectionPage schema for tag/category pages
 */
export function generateCollectionPageSchema(props: CollectionPageSchemaProps) {
  const { name, description, url, items } = props;

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: item.url,
        name: item.title,
        ...(item.description && { description: item.description }),
      })),
    },
  };
}

/**
 * Generate Article schema (alternative to BlogPosting for more general articles)
 */
export function generateArticleSchema(props: BlogPostSchemaProps) {
  const baseSchema = generateBlogPostSchema(props);
  return {
    ...baseSchema,
    '@type': 'Article',
  };
}

/**
 * Combine multiple schemas into a graph
 */
export function combineSchemas(...schemas: Record<string, unknown>[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': schemas.map(schema => {
      // Remove @context from individual schemas when combining
      const { '@context': _, ...rest } = schema;
      return rest;
    }),
  };
}

/**
 * Schema script component helper - returns props for script tag
 */
export function schemaToScriptProps(schema: Record<string, unknown>) {
  return {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: JSON.stringify(schema) },
  };
}
