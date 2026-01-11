export interface Post {
  title: string;
  slug: string;
  summary: string;
  tags?: string[];
  pinned?: boolean;
  content?: string;
}

export interface Tag {
  name: string;
}

export interface SearchResult {
  type: 'post' | 'tag';
  item: Post | Tag;
  matchedContent?: string;
}

export interface QuickReadItem {
  title: string;
  slug: string;
  matchedContent: string;
  searchTerm: string;
}
