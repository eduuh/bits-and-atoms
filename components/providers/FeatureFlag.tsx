import { isFlagEnabled, type FlagKey } from '@/lib/flags';

interface FeatureFlagProps {
  flag: FlagKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureFlag({ flag, children, fallback = null }: FeatureFlagProps) {
  const enabled = isFlagEnabled(flag);

  if (!enabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
