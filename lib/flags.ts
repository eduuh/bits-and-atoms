export const FLAGS = {
  // Enable view counter on blog posts
  ENABLE_VIEWS: 'NEXT_PUBLIC_ENABLE_VIEWS',
  // Enable like/heart button on blog posts
  ENABLE_LIKES: 'NEXT_PUBLIC_ENABLE_LIKES',
  // Enable newsletter signup form
  ENABLE_NEWSLETTER: 'NEXT_PUBLIC_ENABLE_NEWSLETTER',
} as const;

export type FlagKey = keyof typeof FLAGS;

export function isFlagEnabled(flag: FlagKey): boolean {
  // In Next.js, process.env is available at build time or runtime depending on config.
  // For client-side access, variables must start with NEXT_PUBLIC_.
  const envVarName = FLAGS[flag];
  const value = process.env[envVarName];
  return value === 'true' || value === '1';
}
