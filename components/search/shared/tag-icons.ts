import {
  FileText,
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
  type LucideIcon,
} from 'lucide-react';

export const tagIconMap: Record<string, LucideIcon> = {
  react: Code,
  nextjs: Globe,
  typescript: Terminal,
  javascript: Code,
  css: Palette,
  design: Palette,
  ux: Sparkles,
  ui: Layers,
  keyboard: Keyboard,
  hardware: Cpu,
  tutorial: BookOpen,
  guide: BookOpen,
  tips: Zap,
  web: Globe,
  frontend: Layers,
  backend: Terminal,
  devtools: Terminal,
  productivity: Zap,
};

/**
 * Get the icon for a post based on its first matching tag.
 * Falls back to FileText if no matching tag is found.
 */
export function getPostIcon(tags?: string[]): LucideIcon {
  if (!tags || tags.length === 0) return FileText;

  for (const tag of tags) {
    const normalizedTag = tag.toLowerCase();
    if (tagIconMap[normalizedTag]) {
      return tagIconMap[normalizedTag];
    }
  }

  return FileText;
}
