'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Command } from 'cmdk';
import { 
  Search as SearchIcon, 
  FileText, 
  X, 
  Hash, 
  Home,
  User,
  Clock,
  Tags,
  Network,
  Rss,
  Sun,
  Moon,
  Monitor,
  ExternalLink,
  Github,
  Linkedin,
  Flame,
  Code,
  Palette,
  Keyboard,
  Globe,
  Cpu,
  Layers,
  Sparkles,
  BookOpen,
  Terminal,
  Zap,
  FileSearch,
  ListPlus,
  type LucideIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import Fuse from 'fuse.js';
import { siteConfig } from '@/config/site';
import { useQuickReadList } from './QuickReadList';
import { useKeyboardShortcuts } from '@/components/keyboard/KeyboardShortcuts';

// Tag to icon mapping
const tagIconMap: Record<string, LucideIcon> = {
  'react': Code,
  'nextjs': Globe,
  'typescript': Terminal,
  'javascript': Code,
  'css': Palette,
  'design': Palette,
  'ux': Sparkles,
  'ui': Layers,
  'keyboard': Keyboard,
  'hardware': Cpu,
  'tutorial': BookOpen,
  'guide': BookOpen,
  'tips': Zap,
  'web': Globe,
  'frontend': Layers,
  'backend': Terminal,
  'devtools': Terminal,
  'productivity': Zap,
};

// Get icon for a post based on its first matching tag
function getPostIcon(tags?: string[]): LucideIcon {
  if (!tags || tags.length === 0) return FileText;
  for (const tag of tags) {
    const normalizedTag = tag.toLowerCase();
    if (tagIconMap[normalizedTag]) {
      return tagIconMap[normalizedTag];
    }
  }
  return FileText;
}

interface Post {
  title: string;
  slug: string;
  summary: string;
  tags?: string[];
  pinned?: boolean;
  content?: string;
  publishedAt?: string;
  readingTime?: number;
  series?: {
    title: string;
    order: number;
  };
}

interface Tag {
  name: string;
}

interface YearFilter {
  year: number;
}

interface SeriesFilter {
  name: string;
}

interface SearchResult {
  type: 'post' | 'tag' | 'year' | 'series';
  item: Post | Tag | YearFilter | SeriesFilter;
  matchedContent?: string; // For grep mode - snippet of matched content
}

interface CommandMenuProps {
  posts: Post[];
}

export function CommandMenu({ posts }: CommandMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [selectedYear, setSelectedYear] = React.useState<number | null>(null);
  const [selectedSeries, setSelectedSeries] = React.useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const quickReadList = useQuickReadList();
  const { setIsHelpOpen } = useKeyboardShortcuts();

  // Extract available years and series from posts
  const availableYears = React.useMemo(() => {
    const years = new Set<number>();
    posts.forEach(post => {
      if (post.publishedAt) {
        years.add(new Date(post.publishedAt).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [posts]);

  const availableSeries = React.useMemo(() => {
    const series = new Set<string>();
    posts.forEach(post => {
      if (post.series?.title) {
        series.add(post.series.title);
      }
    });
    return Array.from(series).sort();
  }, [posts]);

  // Get pinned posts or fallback to first 5
  const pinnedPosts = React.useMemo(() => {
    const pinned = posts.filter(post => post.pinned);
    return pinned.length > 0 ? pinned.slice(0, 5) : posts.slice(0, 5);
  }, [posts]);

  React.useEffect(() => {
    let lastKeyTime = 0;

    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }

      // Check for double semicolon (;;)
      if (e.key === ';') {
        const currentTime = new Date().getTime();
        if (currentTime - lastKeyTime < 300) { // 300ms threshold
          e.preventDefault();
          setOpen(true);
          lastKeyTime = 0; // Reset
        } else {
          lastKeyTime = currentTime;
        }
      } else {
        lastKeyTime = 0; // Reset if any other key is pressed
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Reset state when closing
  React.useEffect(() => {
    if (!open) {
      setQuery('');
      setSelectedTags([]);
      setSelectedYear(null);
      setSelectedSeries(null);
    }
  }, [open]);

  // Focus input when opening
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  // Lock body scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    posts.forEach(post => post.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).map(tag => ({ name: tag }));
  }, [posts]);

  const filteredPosts = React.useMemo(() => {
    return posts.filter(post => {
      // Tag filter
      if (selectedTags.length > 0 && !selectedTags.every(tag => post.tags?.includes(tag))) {
        return false;
      }
      // Year filter
      if (selectedYear && post.publishedAt) {
        const postYear = new Date(post.publishedAt).getFullYear();
        if (postYear !== selectedYear) return false;
      }
      // Series filter
      if (selectedSeries && post.series?.title !== selectedSeries) {
        return false;
      }
      return true;
    });
  }, [posts, selectedTags, selectedYear, selectedSeries]);

  const filteredFuse = React.useMemo(() => {
    return new Fuse(filteredPosts, {
      keys: [
        { name: 'title', weight: 0.5 },
        { name: 'summary', weight: 0.3 },
        { name: 'content', weight: 0.1 }
      ],
      threshold: 0.3,
      ignoreLocation: true,
      includeMatches: true,
    });
  }, [filteredPosts]);

  // Grep mode - full text search in content
  const grepSearch = React.useCallback((searchTerm: string): SearchResult[] => {
    const results: SearchResult[] = [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    for (const post of filteredPosts) {
      if (!post.content) continue;
      
      const lowerContent = post.content.toLowerCase();
      const index = lowerContent.indexOf(lowerSearchTerm);
      
      if (index !== -1) {
        // Extract a snippet around the match (50 chars before and after)
        const start = Math.max(0, index - 50);
        const end = Math.min(post.content.length, index + searchTerm.length + 50);
        let snippet = post.content.slice(start, end);
        
        // Clean up the snippet
        if (start > 0) snippet = '...' + snippet;
        if (end < post.content.length) snippet = snippet + '...';
        
        // Remove markdown syntax for cleaner display
        snippet = snippet.replace(/[#*`_\[\]]/g, '').replace(/\n/g, ' ').trim();
        
        results.push({
          type: 'post',
          item: post,
          matchedContent: snippet,
        });
      }
    }
    
    return results;
  }, [filteredPosts]);

  const isGrepMode = query.startsWith('>');
  const isTagMode = query.startsWith('#');
  const isYearMode = query.startsWith('@');
  const isSeriesMode = query.toLowerCase().startsWith('series:');

  const searchResults = React.useMemo((): SearchResult[] => {
    // Mode 1: Tag Autocomplete (#)
    if (isTagMode) {
      const tagQuery = query.slice(1).toLowerCase();
      const availableTags = allTags.filter(t => !selectedTags.includes(t.name));

      const matchingTags = !tagQuery
        ? availableTags
        : new Fuse(availableTags, { keys: ['name'], threshold: 0.3 }).search(tagQuery).map(r => r.item);

      return matchingTags.map(t => ({ type: 'tag', item: t }));
    }

    // Mode 2: Year filter (@YYYY)
    if (isYearMode) {
      const yearQuery = query.slice(1);
      const matchingYears = availableYears.filter(year =>
        year.toString().startsWith(yearQuery)
      );
      return matchingYears.map(year => ({
        type: 'year' as const,
        item: { year }
      }));
    }

    // Mode 3: Series filter (series:name)
    if (isSeriesMode) {
      const seriesQuery = query.slice(7).toLowerCase();
      const matchingSeries = availableSeries.filter(s =>
        s.toLowerCase().includes(seriesQuery)
      );
      return matchingSeries.map(series => ({
        type: 'series' as const,
        item: { name: series }
      }));
    }

    // Mode 4: Grep mode (>) - full text search in content
    if (isGrepMode) {
      const grepQuery = query.slice(1).trim();
      if (!grepQuery) return [];
      return grepSearch(grepQuery);
    }

    // Mode 5: Normal search in filtered posts
    if (!query) {
      if (selectedTags.length > 0 || selectedYear || selectedSeries) {
        return filteredPosts.map(p => ({ type: 'post', item: p }));
      }
      return [];
    }

    return filteredFuse.search(query).map((result) => ({ type: 'post', item: result.item }));
  }, [query, selectedTags, selectedYear, selectedSeries, filteredPosts, filteredFuse, allTags, availableYears, availableSeries, isGrepMode, isTagMode, isYearMode, isSeriesMode, grepSearch]);

  // Reset selected index when search results change
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults.length]);

  // Handle adding to quick read list in grep mode
  const handleAddToQuickReadList = React.useCallback((result: SearchResult) => {
    if (result.type === 'post' && result.matchedContent) {
      const post = result.item as Post;
      quickReadList.addItem({
        title: post.title,
        slug: post.slug,
        matchedContent: result.matchedContent,
        searchTerm: query.slice(1).trim(),
      });
    }
  }, [query, quickReadList]);

  const handleSelectPost = (post: Post) => {
    setOpen(false);
    router.push(`/blog/${post.slug}`);
  };

  const handleSelectTag = (tag: Tag) => {
    setSelectedTags(prev => [...prev, tag.name]);
    setQuery('');
  };

  const handleSelectYear = (year: number) => {
    setSelectedYear(year);
    setQuery('');
  };

  const handleSelectSeries = (series: string) => {
    setSelectedSeries(series);
    setQuery('');
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const clearAllFilters = () => {
    setSelectedTags([]);
    setSelectedYear(null);
    setSelectedSeries(null);
    setQuery('');
  };

  const hasActiveFilters = selectedTags.length > 0 || selectedYear !== null || selectedSeries !== null;

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const openExternal = (url: string) => {
    setOpen(false);
    window.open(url, '_blank');
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'About', href: '/about', icon: User },
    { name: 'Now', href: '/now', icon: Clock },
    { name: 'Topics', href: '/tags', icon: Tags },
    { name: 'RSS', href: '/rss', icon: Rss },
  ];

  const isSearching = query.length > 0 || hasActiveFilters;

  // Portal target for rendering modal at document root
  const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);
  
  React.useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  return (
    <>
      {/* Trigger Button - Icon style */}
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-full hover:bg-primary/10 hover:text-primary transition-all hover:scale-110"
        aria-label="Open search (Command K)"
        aria-haspopup="dialog"
        aria-expanded={open}
        type="button"
        title="Search"
      >
        <SearchIcon className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Command Palette Modal - Rendered via Portal to escape stacking contexts */}
      {open && portalContainer && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            style={{ zIndex: 99999 }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          
          {/* Command Dialog - Positioned at top like VS Code */}
          <div 
            className="fixed left-1/2 top-[12%] w-full max-w-[640px] -translate-x-1/2 px-4"
            style={{ zIndex: 100000 }}
            role="dialog"
            aria-modal="true"
            aria-label="Search and navigation"
          >
            <div 
              className="overflow-hidden rounded-xl border border-border bg-popover shadow-2xl ring-1 ring-black/5"
              onClick={e => e.stopPropagation()}
            >
              <Command shouldFilter={false} className="w-full" label="Search commands">
                {/* Search Input - Clean VS Code style */}
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                  <SearchIcon className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  
                  {/* Active Filters */}
                  {selectedTags.map(tag => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                    >
                      #{tag}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTag(tag);
                        }}
                        className="hover:text-primary/70"
                        aria-label={`Remove ${tag} filter`}
                        type="button"
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </span>
                  ))}

                  {selectedYear && (
                    <span className="flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-500">
                      @{selectedYear}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedYear(null);
                        }}
                        className="hover:text-blue-400"
                        aria-label={`Remove ${selectedYear} year filter`}
                        type="button"
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </span>
                  )}

                  {selectedSeries && (
                    <span className="flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-1 text-xs font-medium text-purple-500">
                      series:{selectedSeries}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSeries(null);
                        }}
                        className="hover:text-purple-400"
                        aria-label={`Remove ${selectedSeries} series filter`}
                        type="button"
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </span>
                  )}

                  {hasActiveFilters && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearAllFilters();
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground"
                      type="button"
                    >
                      Clear all
                    </button>
                  )}

                  <Command.Input
                    ref={inputRef}
                    placeholder={hasActiveFilters ? "Continue searching..." : "Search posts, # tags, @year, series:name, > grep..."}
                    value={query}
                    onValueChange={setQuery}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !query && selectedTags.length > 0) {
                        removeTag(selectedTags[selectedTags.length - 1]);
                      }
                      if (e.key === ' ' && query.startsWith('#')) {
                        const potentialTag = query.slice(1);
                        const match = allTags.find(t => t.name.toLowerCase() === potentialTag.toLowerCase());
                        if (match && !selectedTags.includes(match.name)) {
                          e.preventDefault();
                          handleSelectTag(match);
                        }
                      }
                    }}
                    className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                    aria-label="Search input"
                    aria-describedby="search-help"
                  />
                  
                  <button 
                    onClick={() => setOpen(false)} 
                    className="rounded-md p-1 hover:bg-accent"
                    aria-label="Close search"
                    type="button"
                  >
                    <X className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  </button>
                </div>
                
                <span id="search-help" className="sr-only">
                  Type to search posts. Use # for tags, &gt; for grep content search. Use arrow keys to navigate, Enter to select.
                </span>

                {/* Results List */}
                <Command.List className="max-h-[60vh] overflow-y-auto overscroll-contain p-2" aria-label="Search results">
                  
                  {/* Tag Results */}
                  {isTagMode && searchResults.length > 0 && (
                    <Command.Group heading="Tags" className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {searchResults.map((result, index) => (
                        <Command.Item
                          key={index}
                          value={(result.item as Tag).name}
                          onSelect={() => handleSelectTag(result.item as Tag)}
                          className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm"
                        >
                          <Hash className="h-4 w-4 text-muted-foreground group-aria-selected:text-primary" aria-hidden="true" />
                          <span className="group-aria-selected:text-primary group-aria-selected:font-medium transition-colors">{(result.item as Tag).name}</span>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  )}

                  {/* Year Results */}
                  {isYearMode && searchResults.length > 0 && (
                    <Command.Group heading="Filter by Year" className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {searchResults.map((result, index) => (
                        <Command.Item
                          key={index}
                          value={`year-${(result.item as YearFilter).year}`}
                          onSelect={() => handleSelectYear((result.item as YearFilter).year)}
                          className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm"
                        >
                          <Clock className="h-4 w-4 text-muted-foreground group-aria-selected:text-blue-500" aria-hidden="true" />
                          <span className="group-aria-selected:text-blue-500 group-aria-selected:font-medium transition-colors">
                            {(result.item as YearFilter).year}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({posts.filter(p => p.publishedAt && new Date(p.publishedAt).getFullYear() === (result.item as YearFilter).year).length} posts)
                          </span>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  )}

                  {/* Series Results */}
                  {isSeriesMode && searchResults.length > 0 && (
                    <Command.Group heading="Filter by Series" className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {searchResults.map((result, index) => (
                        <Command.Item
                          key={index}
                          value={`series-${(result.item as SeriesFilter).name}`}
                          onSelect={() => handleSelectSeries((result.item as SeriesFilter).name)}
                          className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm"
                        >
                          <Network className="h-4 w-4 text-muted-foreground group-aria-selected:text-purple-500" aria-hidden="true" />
                          <span className="group-aria-selected:text-purple-500 group-aria-selected:font-medium transition-colors">
                            {(result.item as SeriesFilter).name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({posts.filter(p => p.series?.title === (result.item as SeriesFilter).name).length} posts)
                          </span>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  )}

                  {/* Grep Results */}
                  {isGrepMode && searchResults.length > 0 && (
                    <Command.Group heading="Content Matches" className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {searchResults.map((result, index) => {
                        const post = result.item as Post;
                        const PostIcon = getPostIcon(post.tags);
                        return (
                          <Command.Item
                            key={index}
                            value={post.title + index}
                            onSelect={() => handleSelectPost(post)}
                            className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5"
                          >
                            <FileSearch className="h-4 w-4 shrink-0 text-muted-foreground group-aria-selected:text-primary transition-colors" aria-hidden="true" />
                            <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                              <span className="truncate text-sm font-medium group-aria-selected:text-primary transition-colors">{post.title}</span>
                              {result.matchedContent && (
                                <span className="text-xs text-muted-foreground line-clamp-2 font-mono bg-muted/50 rounded px-1.5 py-0.5">
                                  {result.matchedContent}
                                </span>
                              )}
                            </div>
                            <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 group-aria-selected:opacity-100 transition-all">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToQuickReadList(result);
                                }}
                                className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-primary transition-all"
                                title="Add to Quick Read List"
                                aria-label="Add to Quick Read List"
                              >
                                <ListPlus className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </div>
                          </Command.Item>
                        );
                      })}
                    </Command.Group>
                  )}

                  {/* Normal Search Results */}
                  {isSearching && !isTagMode && !isGrepMode && searchResults.length > 0 && (
                    <Command.Group heading="Results" className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {searchResults.map((result, index) => {
                        const post = result.item as Post;
                        const PostIcon = getPostIcon(post.tags);
                        return (
                          <Command.Item
                            key={index}
                            value={post.title}
                            onSelect={() => handleSelectPost(post)}
                            className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5"
                          >
                            <PostIcon className="h-4 w-4 shrink-0 text-muted-foreground group-aria-selected:text-primary transition-colors" aria-hidden="true" />
                            <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                              <span className="truncate text-sm font-medium group-aria-selected:text-primary transition-colors">{post.title}</span>
                              <span className="truncate text-xs text-muted-foreground">{post.summary}</span>
                            </div>
                          </Command.Item>
                        );
                      })}
                    </Command.Group>
                  )}

                  {/* No Results */}
                  {isSearching && !isTagMode && searchResults.length === 0 && query && (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No results found for &quot;<span className="font-medium text-foreground">{query}</span>&quot;
                    </div>
                  )}

                  {/* Default View - When not searching */}
                  {!isSearching && (
                    <>
                      {/* Pinned Content */}
                      <Command.Group heading="Pinned Content" className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {pinnedPosts.map((post) => {
                          const PostIcon = getPostIcon(post.tags);
                          return (
                            <Command.Item
                              key={post.slug}
                              value={post.title}
                              onSelect={() => handleSelectPost(post)}
                              className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5"
                            >
                              <PostIcon className="h-4 w-4 shrink-0 text-muted-foreground group-aria-selected:text-primary transition-colors" aria-hidden="true" />
                              <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                                <span className="truncate text-sm font-medium group-aria-selected:text-primary transition-colors">{post.title}</span>
                                {post.tags && (
                                  <div className="flex gap-1.5">
                                    {post.tags.slice(0, 3).map(tag => (
                                      <span key={tag} className="text-[10px] text-muted-foreground">#{tag}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </Command.Item>
                          );
                        })}
                      </Command.Group>

                      <div className="my-2 h-px bg-border" />

                      {/* Help */}
                      <Command.Group heading="Help" className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <Command.Item
                          value="Keyboard Shortcuts"
                          onSelect={() => {
                            setOpen(false);
                            setTimeout(() => setIsHelpOpen(true), 100);
                          }}
                          className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm"
                        >
                          <Keyboard className="h-4 w-4 text-muted-foreground group-aria-selected:text-primary transition-colors" aria-hidden="true" />
                          <span className="group-aria-selected:text-primary group-aria-selected:font-medium transition-colors">Keyboard Shortcuts</span>
                          <kbd className="ml-auto rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">?</kbd>
                        </Command.Item>
                      </Command.Group>
                    </>
                  )}
                </Command.List>

                {/* Footer with keyboard hints */}
                <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">↑↓</kbd>
                      <span>Navigate</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">↵</kbd>
                      <span>Select</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">esc</kbd>
                      <span>Close</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">#</kbd>
                      <span>Tags</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">@</kbd>
                      <span>Year</span>
                    </span>
                    <span className="flex items-center gap-1.5 hidden sm:flex">
                      <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">series:</kbd>
                      <span>Series</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">&gt;</kbd>
                      <span>Grep</span>
                    </span>
                    {isGrepMode && (
                      <span className="flex items-center gap-1.5">
                        <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">Ctrl+Q</kbd>
                        <span>Add to List</span>
                      </span>
                    )}
                  </div>
                </div>
              </Command>
            </div>
          </div>
        </>,
        portalContainer
      )}
    </>
  );
}
