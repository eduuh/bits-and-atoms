import { type Variants, type Transition } from 'framer-motion';

// Duration constants (in seconds)
export const durations = {
  fast: 0.15,
  normal: 0.2,
  slow: 0.3,
  slower: 0.5,
} as const;

// Easing functions
export const easings = {
  ease: [0.25, 0.1, 0.25, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.2, 1],
} as const;

// Spring configurations
export const springs = {
  snappy: { type: 'spring', stiffness: 400, damping: 30 } as Transition,
  gentle: { type: 'spring', stiffness: 300, damping: 25 } as Transition,
  bouncy: { type: 'spring', stiffness: 500, damping: 20 } as Transition,
} as const;

// ================================
// Factory Functions
// ================================

interface FadeOptions {
  y?: number;
  scale?: number;
  duration?: number;
  exitY?: number;
}

function createFadeVariant({ y = 0, scale, duration = durations.normal, exitY }: FadeOptions = {}): Variants {
  const initial: Record<string, number> = { opacity: 0 };
  const animate: Record<string, number> = { opacity: 1 };
  const exit: Record<string, number> = { opacity: 0 };

  if (y !== 0) {
    initial.y = y;
    animate.y = 0;
    exit.y = exitY ?? -y;
  }

  if (scale !== undefined) {
    initial.scale = scale;
    animate.scale = 1;
    exit.scale = scale;
  }

  return {
    initial,
    animate: { ...animate, transition: { duration, ease: easings.easeOut } },
    exit: { ...exit, transition: { duration: durations.fast } },
  };
}

interface StaggerOptions {
  staggerChildren?: number;
  delayChildren?: number;
  itemY?: number;
  itemScale?: number;
  itemDuration?: number;
}

function createStaggerVariants({
  staggerChildren = 0.05,
  delayChildren = 0.1,
  itemY = 8,
  itemScale,
  itemDuration = durations.normal,
}: StaggerOptions = {}): { container: Variants; item: Variants } {
  const container: Variants = {
    initial: {},
    animate: {
      transition: { staggerChildren, delayChildren },
    },
    exit: {
      transition: { staggerChildren: staggerChildren * 0.6, staggerDirection: -1 },
    },
  };

  const itemInitial: Record<string, number> = { opacity: 0, y: itemY };
  const itemAnimate: Record<string, number> = { opacity: 1, y: 0 };

  if (itemScale !== undefined) {
    itemInitial.scale = itemScale;
    itemAnimate.scale = 1;
  }

  const item: Variants = {
    initial: itemInitial,
    animate: {
      ...itemAnimate,
      transition: { duration: itemDuration, ease: easings.easeOut },
    },
    exit: {
      opacity: 0,
      y: -itemY,
      transition: { duration: durations.fast },
    },
  };

  return { container, item };
}

// ================================
// Standard Animation Variants
// ================================

export const fadeIn = createFadeVariant();
export const fadeInUp = createFadeVariant({ y: 10 });
export const fadeInDown = createFadeVariant({ y: -10, exitY: 10 });
export const scaleIn = createFadeVariant({ scale: 0.95 });

export const slideInRight: Variants = {
  initial: { opacity: 0, x: '100%' },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: '100%' },
};

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: '-100%' },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: '-100%' },
};

// Stagger variants
const defaultStagger = createStaggerVariants();
export const staggerContainer = defaultStagger.container;
export const staggerItem = defaultStagger.item;

// Dialog/Modal variants
export const dialogOverlay: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: durations.fast } },
  exit: { opacity: 0, transition: { duration: durations.fast } },
};

export const dialogContent: Variants = {
  initial: { opacity: 0, scale: 0.95, y: -10 },
  animate: { opacity: 1, scale: 1, y: 0, transition: springs.snappy },
  exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: durations.fast } },
};

// Hover effects
export const hoverScale = {
  scale: 1.02,
  transition: { duration: durations.fast },
};

export const tapScale = {
  scale: 0.98,
};

export const listItemHover: Variants = {
  initial: { backgroundColor: 'transparent' },
  hover: {
    backgroundColor: 'hsl(var(--accent) / 0.5)',
    transition: { duration: durations.fast },
  },
};

// ================================
// Bold & Expressive Variants
// ================================

export const boldFadeInUp = createFadeVariant({ y: 20, scale: 0.98, duration: 0.4 });
export const boldScaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: springs.bouncy },
  exit: { opacity: 0, scale: 0.9, transition: { duration: durations.fast } },
};

export const boldSlideIn: Variants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: easings.easeOut } },
  exit: { opacity: 0, x: -30, transition: { duration: durations.normal } },
};

// Bold stagger variants
const boldStagger = createStaggerVariants({
  staggerChildren: 0.08,
  delayChildren: 0.15,
  itemY: 15,
  itemScale: 0.98,
  itemDuration: 0.35,
});
export const boldStaggerContainer = boldStagger.container;
export const boldStaggerItem = boldStagger.item;

// Bold hover effects
export const boldHoverScale = {
  scale: 1.03,
  transition: springs.snappy,
};

export const boldHoverLift = {
  y: -4,
  transition: { duration: durations.normal, ease: easings.easeOut },
};
