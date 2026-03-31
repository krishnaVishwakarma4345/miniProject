/**
 * Page Transition Definitions
 * Route-level animations that fire when navigating between pages
 * Used with Next.js App Router and Framer Motion AnimatePresence
 */

import { Variants } from 'framer-motion';

/**
 * Clip-path expand transition (center outward)
 * Elegant entrance for new pages
 */
export const clipPathPageTransition: Variants = {
  hidden: {
    clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
    opacity: 0,
  },
  visible: {
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.32, 0.72, 0.32, 1], // cubic-bezier for smooth curve
    },
  },
  exit: {
    clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
    opacity: 0,
    transition: { duration: 0.4 },
  },
};

/**
 * Slide transition (from right to left)
 * Page slides in from the right side
 */
export const slidePageTransition: Variants = {
  hidden: {
    opacity: 0,
    x: 100,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: { duration: 0.3 },
  },
};

/**
 * Fade transition (simple cross-fade)
 * Minimal, non-intrusive page change
 */
export const fadePageTransition: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

/**
 * Zoom transition
 * Page scales up while fading in
 */
export const zoomPageTransition: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 1.05,
    transition: { duration: 0.3 },
  },
};

/**
 * Soft scale transition
 * Subtle zoom with spring physics
 */
export const springPageTransition: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.2 },
  },
};

/**
 * Vertical slide transition
 * Page slides up from bottom
 */
export const slideUpPageTransition: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -40,
    transition: { duration: 0.3 },
  },
};

/**
 * Reveal transition (width expands)
 * Horizontal wipe effect
 */
export const revealPageTransition: Variants = {
  hidden: {
    width: 0,
    opacity: 0,
  },
  visible: {
    width: '100%',
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.32, 0.72, 0.32, 1],
    },
  },
  exit: {
    width: 0,
    opacity: 0,
    transition: { duration: 0.4 },
  },
};

/**
 * Composition: Container animation + staggered children
 * Use on parent layout components
 */
export const pageContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

/**
 * Child element animation (fade + rise)
 * Pair with pageContainerVariants
 */
export const pageChildVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

/**
 * Transition timing configurations
 * Pre-configured durations for consistency
 */
export const transitionDurations = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.6,
  verySlow: 0.8,
} as const;

/**
 * Transition easing presets
 * Import from framer-motion's easing library for consistency
 */
export const transitionEases = {
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],
  easeOutBack: [0.34, 1.56, 0.64, 1],
  easeOutElastic: [0.68, -0.55, 0.265, 1.55],
} as const;

export default {
  clipPathPageTransition,
  slidePageTransition,
  fadePageTransition,
  zoomPageTransition,
  springPageTransition,
  slideUpPageTransition,
  revealPageTransition,
  pageContainerVariants,
  pageChildVariants,
  transitionDurations,
  transitionEases,
};
