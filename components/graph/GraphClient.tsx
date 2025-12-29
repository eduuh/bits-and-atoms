'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { GraphData, GraphNode, GraphLink } from '@/lib/graph';
import { forceCollide } from 'd3-force';
import { Filter, X, Plus, Minus, RotateCcw } from 'lucide-react';

// Extended types for D3 Force Graph
interface ForceGraphNode extends GraphNode {
  x?: number;
  y?: number;
}

interface ForceGraphLink {
  source: string | ForceGraphNode;
  target: string | ForceGraphNode;
}

// Dynamically import ForceGraph2D with no SSR
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-muted-foreground">Loading Graph...</div>
});

interface GraphClientProps {
  data: GraphData;
  initialFocusSlug?: string;
}

export function GraphClient({ data, initialFocusSlug }: GraphClientProps) {
  const { theme, systemTheme } = useTheme();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mounted, setMounted] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'global' | 'local'>(initialFocusSlug ? 'local' : 'global');
  const [focusNodeId, setFocusNodeId] = useState<string | null>(initialFocusSlug || null);
  
  // Search state
  const [tagSearch, setTagSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset highlight when search changes
  useEffect(() => {
      setHighlightedIndex(-1);
  }, [tagSearch]);

  const handleZoomIn = useCallback(() => {
    if (fgRef.current) {
        const currentZoom = fgRef.current.zoom();
        if (typeof currentZoom === 'number') {
            fgRef.current.zoom(currentZoom * 1.2, 400);
        }
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (fgRef.current) {
        const currentZoom = fgRef.current.zoom();
        if (typeof currentZoom === 'number') {
            fgRef.current.zoom(currentZoom / 1.2, 400);
        }
    }
  }, []);

  const handleReset = useCallback(() => {
    if (fgRef.current) {
        fgRef.current.zoomToFit(400);
    }
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
          e.preventDefault();
          setHighlightedIndex(prev => (prev + 1) % filteredTags.length);
      } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setHighlightedIndex(prev => (prev - 1 + filteredTags.length) % filteredTags.length);
      } else if (e.key === 'Enter') {
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filteredTags.length) {
              const tag = filteredTags[highlightedIndex];
              setSelectedTag(tag);
              setTagSearch(tag);
              setIsDropdownOpen(false);
          }
      } else if (e.key === 'Escape') {
          setIsDropdownOpen(false);
          inputRef.current?.blur();
      }
  };

  const handleGraphKeyDown = (e: React.KeyboardEvent) => {
      if (!filteredData.nodes.length) return;

      // If no node is focused yet, focus the first one on any arrow key
      if (!focusNodeId) {
          if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
              e.preventDefault();
              setFocusNodeId(filteredData.nodes[0].id);
              return;
          }
      }

      const currentIndex = filteredData.nodes.findIndex(n => n.id === focusNodeId);
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % filteredData.nodes.length;
          setFocusNodeId(filteredData.nodes[nextIndex].id);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const prevIndex = (currentIndex - 1 + filteredData.nodes.length) % filteredData.nodes.length;
          setFocusNodeId(filteredData.nodes[prevIndex].id);
      } else if (e.key === 'Enter') {
          e.preventDefault();
          if (focusNodeId) {
              router.push(`/blog/${focusNodeId}`);
          }
      }
  };

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    data.nodes.forEach(node => {
      node.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [data]);

  // Filtered tags for dropdown
  const filteredTags = useMemo(() => {
    if (!tagSearch) return allTags;
    return allTags.filter(tag => tag.toLowerCase().includes(tagSearch.toLowerCase()));
  }, [allTags, tagSearch]);

  // Helper to find neighbors
  const getNeighbors = useCallback((nodeId: string, links: ForceGraphLink[]) => {
    const neighbors = new Set<string>();
    links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? (link.source as ForceGraphNode).id : (link.source as string);
      const targetId = typeof link.target === 'object' ? (link.target as ForceGraphNode).id : (link.target as string);
      if (sourceId === nodeId) neighbors.add(targetId);
      if (targetId === nodeId) neighbors.add(sourceId);
    });
    return neighbors;
  }, []);

  // Filter data based on selection and view mode
  const filteredData = useMemo(() => {
    // 1. Tag Filtering (Base Set)
    let nodes = data.nodes;
    let links = data.links;

    if (selectedTag) {
      nodes = nodes.filter(node => node.tags?.includes(selectedTag));
      const nodeIds = new Set(nodes.map(n => n.id));
      links = links.filter(link => {
          const sourceId = typeof link.source === 'object' ? (link.source as ForceGraphNode).id : (link.source as string);
          const targetId = typeof link.target === 'object' ? (link.target as ForceGraphNode).id : (link.target as string);
          return nodeIds.has(sourceId) && nodeIds.has(targetId);
      });
    }

    // 2. Local View Filtering (Neighborhood)
    if (viewMode === 'local' && focusNodeId) {
        const visited = new Set<string>();
        const queue: {id: string, d: number}[] = [{id: focusNodeId, d: 0}];
        visited.add(focusNodeId);
        
        // BFS to find neighbors up to depth 2 (center -> neighbors -> neighbors of neighbors)
        // Depth 3 might be too big for "responsive" view, let's try 2 first as requested "around a node"
        const MAX_DEPTH = 2; 

        while (queue.length > 0) {
            const {id, d} = queue.shift()!;
            if (d >= MAX_DEPTH) continue;

            const neighbors = getNeighbors(id, data.links);
            neighbors.forEach(nid => {
                // Only add if it exists in the current tag-filtered set (if any)
                // But usually local view ignores tag filter? 
                // Let's respect tag filter if active, otherwise use all data
                // Actually, simpler to just traverse the *full* graph structure, 
                // but only include nodes that are in the current 'nodes' list if we want to combine filters.
                // For now, let's say Local View overrides Tag Filter for structure, 
                // OR Local View operates ON the filtered set.
                // Let's operate on the full dataset for connectivity, but only show if in filtered set?
                // No, simpler: Local View operates on the currently filtered nodes.
                
                // Check if this neighbor is in our current 'nodes' list
                const isInCurrentSet = selectedTag ? nodes.some(n => n.id === nid) : true;
                
                if (!visited.has(nid) && isInCurrentSet) {
                    visited.add(nid);
                    queue.push({id: nid, d: d + 1});
                }
            });
        }
        
        nodes = nodes.filter(n => visited.has(n.id));
        const nodeIds = new Set(nodes.map(n => n.id));
        links = links.filter(link => {
            const sourceId = typeof link.source === 'object' ? (link.source as ForceGraphNode).id : (link.source as string);
            const targetId = typeof link.target === 'object' ? (link.target as ForceGraphNode).id : (link.target as string);
            return nodeIds.has(sourceId) && nodeIds.has(targetId);
        });
    }

    return { nodes, links };
  }, [data, selectedTag, viewMode, focusNodeId, getNeighbors]);

  useEffect(() => {
    setMounted(true);
    
    // Auto-detect mobile and switch to local view
    if (window.innerWidth < 768) {
        setViewMode('local');
        // Pick a default focus node (e.g., first one or one with most links)
        if (data.nodes.length > 0) {
            setFocusNodeId(data.nodes[0].id);
        }
    }
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        if (width > 0 && height > 0) {
            setDimensions({ width, height });
        }
      }
    };

    // Initial sizing
    updateDimensions();
    
    // Fallback: if dimensions are still 0 after a tick, try window
    const timer = setTimeout(() => {
        if (containerRef.current) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            if (width === 0 || height === 0) {
                 setDimensions({
                    width: window.innerWidth,
                    height: window.innerHeight - 64
                });
            } else {
                setDimensions({ width, height });
            }
        }
    }, 100);

    // Resize observer for robust updates
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
            setDimensions({ width, height });
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
        resizeObserver.disconnect();
        clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-center graph when dimensions change
  useEffect(() => {
    if (fgRef.current) {
      // Configure forces to spread nodes out
      fgRef.current.d3Force('charge').strength(-400); // Stronger repulsion
      fgRef.current.d3Force('link').distance(100); // Longer links
      
      // Add collision force to prevent overlap
      // Estimate radius based on text length (approx 4px per char + node radius)
      fgRef.current.d3Force('collide', forceCollide((node: ForceGraphNode) => {
        const labelLength = node.name ? node.name.length : 0;
        return 10 + (labelLength * 3); // Base radius + text allowance
      }).strength(0.7));

      if (dimensions.width > 0 && dimensions.height > 0) {
        // Small delay to ensure canvas is resized
        setTimeout(() => {
          fgRef.current.zoomToFit(400);
        }, 100);
      }
    }
  }, [dimensions]);

  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  
  // Colors
  const nodeColor = '#1DB954'; // Spotify Green
  const linkColor = isDark ? '#535353' : '#e5e7eb'; // Spotify Gray : Light Gray
  const textColor = isDark ? '#FFFFFF' : '#191414'; // White : Black
  // Use transparent background so it matches the container's CSS background
  const bgColor = 'rgba(0,0,0,0)'; 
  const nodeBorderColor = isDark ? '#191414' : '#ffffff'; // Match bg for border effect

  if (!mounted) return null;

  if (data.nodes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        No posts found to generate graph.
      </div>
    );
  }

  return (
    <div 
        ref={containerRef} 
        className="w-full h-full relative bg-background overflow-hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/20"
        tabIndex={0}
        onKeyDown={handleGraphKeyDown}
        aria-label="Graph visualization. Use arrow keys to navigate nodes, Enter to visit."
    >
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-50 flex flex-col gap-4 max-w-md pointer-events-none">
        {/* Tag Search Filter */}
        <div className="pointer-events-auto relative w-64 group">
            <div className="relative transition-transform duration-200 ease-in-out group-focus-within:scale-105">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Filter by tag..."
                    value={tagSearch}
                    onKeyDown={handleSearchKeyDown}
                    onChange={(e) => {
                        setTagSearch(e.target.value);
                        setIsDropdownOpen(true);
                        if (e.target.value === '') setSelectedTag(null);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    onBlur={() => setIsDropdownOpen(false)}
                    className="w-full pl-10 pr-8 py-2 text-sm font-medium rounded-xl border bg-card text-foreground border-border hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-lg transition-all"
                />
                {tagSearch && (
                    <button 
                        onClick={() => {
                            setSelectedTag(null);
                            setTagSearch('');
                            inputRef.current?.focus();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {isDropdownOpen && (filteredTags.length > 0 || tagSearch) && (
                <div className="absolute top-full left-0 mt-2 w-full max-h-60 overflow-y-auto bg-card rounded-xl border border-border shadow-xl z-20 scrollbar-thin scrollbar-thumb-border">
                    {filteredTags.length > 0 ? (
                        filteredTags.map((tag, index) => (
                            <button
                                key={tag}
                                onMouseDown={(e) => {
                                    e.preventDefault(); // Prevent blur
                                    setSelectedTag(tag);
                                    setTagSearch(tag);
                                    setIsDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                                    selectedTag === tag || index === highlightedIndex 
                                        ? 'text-primary bg-primary/10 font-medium' 
                                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                }`}
                            >
                                #{tag}
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-sm text-muted-foreground text-center">No tags found</div>
                    )}
                </div>
            )}
        </div>

        {/* Zoom Controls */}
        <div className="pointer-events-auto flex flex-col gap-1 bg-card rounded-xl border border-border shadow-lg p-1 w-10 items-center">
            <button 
                onClick={handleZoomIn}
                className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors"
                title="Zoom In"
            >
                <Plus size={16} />
            </button>
            <button 
                onClick={handleZoomOut}
                className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors"
                title="Zoom Out"
            >
                <Minus size={16} />
            </button>
            <div className="w-full h-px bg-border my-0.5" />
            <button 
                onClick={handleReset}
                className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors"
                title="Reset View"
            >
                <RotateCcw size={14} />
            </button>
        </div>
      </div>

      {dimensions.width > 0 && dimensions.height > 0 ? (
        <>
          <ForceGraph2D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={filteredData}
            backgroundColor={bgColor}
            // @ts-ignore
            pixelRatio={typeof window !== 'undefined' ? window.devicePixelRatio : 2}
            nodeColor={() => nodeColor}
            linkColor={() => linkColor}
            nodeRelSize={6}
            linkWidth={1.5}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={2}
            onNodeClick={(node: any) => {
              if (viewMode === 'local') {
                  if (focusNodeId === node.id) {
                      // If clicking the already focused node, navigate
                      router.push(`/blog/${node.id}`);
                  } else {
                      // Otherwise, re-center on this node
                      setFocusNodeId(node.id);
                  }
              } else {
                  router.push(`/blog/${node.id}`);
              }
            }}
            cooldownTicks={100}
            nodeCanvasObject={(node: any, ctx, globalScale) => {
              const label = node.name;
              const fontSize = 12/globalScale;
              ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
              const r = 5; // Fixed radius

              // Draw Node
              ctx.beginPath();
              // @ts-ignore - x and y are injected by d3
              ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
              ctx.fillStyle = nodeColor;
              ctx.fill();
              
              // Node Border (makes them distinct)
              ctx.strokeStyle = nodeBorderColor;
              ctx.lineWidth = 2 / globalScale;
              ctx.stroke();
              
              // Highlight focused node (keyboard or local view)
              if (node.id === focusNodeId) {
                  ctx.strokeStyle = '#1DB954';
                  ctx.lineWidth = 4 / globalScale;
                  ctx.stroke();
              }

              // Draw Text Background (optional, improves readability)
              // ctx.globalAlpha = 0.8;
              // ctx.fillStyle = bgColor;
              // ... (would need text metrics here)
              // ctx.globalAlpha = 1.0;

              // Draw Text
              ctx.textAlign = 'center';
              ctx.textBaseline = 'top'; // Draw below the node
              ctx.fillStyle = textColor;
              
              // Show label if zoomed in or node is big enough
              if (globalScale > 0.75) {
                 // Add a subtle shadow/outline to text for better contrast against lines
                 ctx.shadowColor = bgColor;
                 ctx.shadowBlur = 4;
                 ctx.lineWidth = 3;
                 ctx.strokeText(label, node.x, node.y + r + (2 / globalScale));
                 ctx.shadowBlur = 0;
                 
                 ctx.fillText(label, node.x, node.y + r + (2 / globalScale)); // Offset by radius + padding
              }
            }}
          />
          <div className="absolute bottom-4 right-4 text-xs text-muted-foreground pointer-events-none select-none">
            {filteredData.nodes.length} nodes · {filteredData.links.length} links
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
           Loading Graph View... ({dimensions.width}x{dimensions.height})
        </div>
      )}
    </div>
  );
}
