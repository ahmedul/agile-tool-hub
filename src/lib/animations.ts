/**
 * Animation configuration library
 * Provides easing functions, durations, and animation variants for consistent
 * animations across all tools
 */

/** Cubic bezier easing functions for animations */
export const EASINGS = {
  smooth: [0.43, 0.13, 0.23, 0.96],
  bounce: [0.68, -0.55, 0.265, 1.55],
  snappy: [0.34, 1.56, 0.64, 1],
  linear: [0.25, 0.25, 0.75, 0.75],
} as const;

/** Animation timing in milliseconds */
export const DURATIONS = {
  fast: 200,
  normal: 300,
  slow: 500,
  deliberate: 800,
  shakeAndPulse: 400,
  pulseRepeatDelay: 1000,
  staggerInterval: 100,
  initialStaggerDelay: 50,
} as const;

/** Pre-configured animation variants for Framer Motion */
export const ANIMATION_VARIANTS = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: DURATIONS.normal / 1000, ease: EASINGS.smooth },
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: DURATIONS.normal / 1000, ease: EASINGS.smooth },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: DURATIONS.normal / 1000, ease: EASINGS.bounce },
  },
  shake: {
    animate: {
      x: [0, -5, 5, -5, 5, 0],
      transition: { duration: DURATIONS.shakeAndPulse / 1000, ease: EASINGS.linear },
    },
  },
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: { duration: DURATIONS.shakeAndPulse / 1000, repeat: Infinity, repeatDelay: DURATIONS.pulseRepeatDelay / 1000 },
    },
  },
  buttonClick: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { duration: DURATIONS.fast / 1000 },
  },
} as const;

export type AnimationVariant = typeof ANIMATION_VARIANTS[keyof typeof ANIMATION_VARIANTS];

/** Container for staggering child animations */
export const STAGGER_CONTAINER = {
  animate: {
    transition: { staggerChildren: DURATIONS.staggerInterval / 1000, delayChildren: DURATIONS.initialStaggerDelay / 1000 },
  },
} as const;

/** Individual item variant for stagger effect */
export const STAGGER_ITEM = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATIONS.normal / 1000, ease: EASINGS.smooth },
} as const;
