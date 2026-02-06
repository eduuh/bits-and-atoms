import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const TAG_GRADIENTS: Record<string, [string, string]> = {
  'Hardware': ['#0ea5e9', '#06b6d4'],      // sky → cyan
  'DevOps': ['#10b981', '#14b8a6'],         // emerald → teal
  'Self-Hosted': ['#8b5cf6', '#6366f1'],    // violet → indigo
  'Cloudflare': ['#f97316', '#f59e0b'],     // orange → amber
  'React': ['#06b6d4', '#3b82f6'],          // cyan → blue
  'Keyboards': ['#ec4899', '#f43f5e'],      // pink → rose
  'Homelab': ['#6366f1', '#8b5cf6'],        // indigo → violet
  'my-blog': ['#22c55e', '#10b981'],        // green → emerald
  'Networking': ['#3b82f6', '#6366f1'],     // blue → indigo
  'Smart Home': ['#eab308', '#f97316'],     // yellow → orange
  'Cars': ['#ef4444', '#f97316'],           // red → orange
  'Cycling': ['#22c55e', '#eab308'],        // green → yellow
  'Health': ['#14b8a6', '#22c55e'],         // teal → green
  'Backup': ['#64748b', '#6366f1'],         // slate → indigo
  '3D Printing': ['#a855f7', '#ec4899'],    // purple → pink
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const FALLBACK_COLORS: [string, string][] = [
  ['#6366f1', '#8b5cf6'],
  ['#3b82f6', '#06b6d4'],
  ['#10b981', '#14b8a6'],
  ['#f97316', '#eab308'],
  ['#ec4899', '#a855f7'],
  ['#ef4444', '#f97316'],
];

export function getTagGradient(tags?: string[]): string {
  if (tags && tags.length > 0) {
    for (const tag of tags) {
      if (TAG_GRADIENTS[tag]) {
        const [from, to] = TAG_GRADIENTS[tag];
        return `linear-gradient(135deg, ${from}, ${to})`;
      }
    }
    // Hash the first tag for a consistent fallback color
    const idx = hashString(tags[0]) % FALLBACK_COLORS.length;
    const [from, to] = FALLBACK_COLORS[idx];
    return `linear-gradient(135deg, ${from}, ${to})`;
  }
  return 'linear-gradient(135deg, #27272a, #3f3f46)';
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();

  const suffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  return `${month} ${day}${suffix(day)}, ${year}`;
}
