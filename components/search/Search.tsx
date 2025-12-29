'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import { Search as SearchIcon, FileText, X, Hash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';

interface Post {
  title: string;
  slug: string;
  summary: string;
  tags?: string[];
  content?: string;
}

interface Tag {
  name: string;
}

interface SearchResult {
  type: 'post' | 'tag';
  item: Post | Tag;
}

interface SearchProps {
  posts: Post[];
}

export function Search({ posts }: SearchProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'p' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setOpen(false);
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
    }
  }, [open]);

  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    posts.forEach(post => post.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).map(tag => ({ name: tag }));
  }, [posts]);

  const filteredPosts = React.useMemo(() => {
    if (selectedTags.length === 0) return posts;
    return posts.filter(post => 
      selectedTags.every(tag => post.tags?.includes(tag))
    );
  }, [posts, selectedTags]);

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

  const results = React.useMemo((): SearchResult[] => {
    // Mode 1: Tag Autocomplete
    if (query.startsWith('#')) {
      const tagQuery = query.slice(1).toLowerCase();
      const availableTags = allTags.filter(t => !selectedTags.includes(t.name));
      
      const matchingTags = !tagQuery 
        ? availableTags 
        : new Fuse(availableTags, { keys: ['name'], threshold: 0.3 }).search(tagQuery).map(r => r.item);
      
      return matchingTags.map(t => ({ type: 'tag', item: t }));
    }

    // Mode 2: Search in filtered posts
    if (!query) {
      if (selectedTags.length > 0) {
        return filteredPosts.map(p => ({ type: 'post', item: p }));
      }
      return [];
    }

    const cleanQuery = query.startsWith('$') ? query.slice(1) : query;
    if (!cleanQuery) return [];
    
    return filteredFuse.search(cleanQuery).map((result) => ({ type: 'post', item: result.item }));
  }, [query, selectedTags, filteredPosts, filteredFuse, allTags]);

  const handleSelect = (result: SearchResult) => {
    if (result.type === 'tag') {
      setSelectedTags(prev => [...prev, (result.item as Tag).name]);
      setQuery('');
    } else {
      setOpen(false);
      router.push(`/blog/${(result.item as Post).slug}`);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative inline-flex h-9 w-9 items-center justify-center whitespace-nowrap rounded-md border border-input bg-transparent text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      >
        <SearchIcon className="h-4 w-4" />
        <span className="sr-only">Search posts</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>P
        </kbd>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div 
            className="w-full max-w-[640px] md:w-[80vw] rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl overflow-hidden mx-4" 
            onClick={e => e.stopPropagation()}
          >
            <Command shouldFilter={false} className="w-full">
              <div className="flex items-center border-b border-border px-4 gap-2 overflow-x-auto py-2">
                  <SearchIcon className="h-4 w-4 shrink-0 opacity-50" />
                  
                  {selectedTags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md text-xs whitespace-nowrap">
                      #{tag}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTag(tag);
                        }}
                        className="hover:text-foreground"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  <Command.Input 
                      placeholder={selectedTags.length > 0 ? "Search..." : "Search posts... (Type # for tags)"}
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
                              setSelectedTags(prev => [...prev, match.name]);
                              setQuery('');
                          }
                        }
                      }}
                      className="flex h-8 w-full min-w-[100px] rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                      autoFocus
                  />
                  <button onClick={() => setOpen(false)} className="ml-auto p-1 hover:bg-accent hover:text-accent-foreground rounded">
                      <X className="h-4 w-4 opacity-50" />
                  </button>
              </div>
              <Command.List className="max-h-[300px] overflow-y-auto p-2">
                  {query && results.length === 0 && !query.startsWith('#') && (
                      <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                          No results found.
                      </Command.Empty>
                  )}
                  {results.length === 0 && selectedTags.length > 0 && !query && (
                        <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                          No posts found with these tags.
                      </Command.Empty>
                  )}
                  {results.length > 0 && (
                      <Command.Group heading={query.startsWith('#') ? "Tags" : "Posts"} className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                          {results.map((result, index) => (
                              <Command.Item
                                  key={index}
                                  value={result.type === 'tag' ? (result.item as Tag).name : (result.item as Post).title}
                                  onSelect={() => handleSelect(result)}
                                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                              >
                                  {result.type === 'tag' ? (
                                      <>
                                          <Hash className="mr-2 h-4 w-4 opacity-70" />
                                          <span>{(result.item as Tag).name}</span>
                                      </>
                                  ) : (
                                      <>
                                          <FileText className="mr-2 h-4 w-4 opacity-70" />
                                          <div className="flex flex-col">
                                              <span>{(result.item as Post).title}</span>
                                              {selectedTags.length === 0 && (result.item as Post).tags && (
                                                <div className="flex gap-1 mt-1">
                                                  {(result.item as Post).tags?.slice(0, 3).map(tag => (
                                                    <span key={tag} className="text-[10px] bg-secondary text-secondary-foreground px-1 rounded">#{tag}</span>
                                                  ))}
                                                </div>
                                              )}
                                          </div>
                                      </>
                                  )}
                              </Command.Item>
                          ))}
                      </Command.Group>
                  )}
              </Command.List>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}
