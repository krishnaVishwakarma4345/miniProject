/**
 * Framer Motion Animation Variants
 * Reusable animation presets for consistent motion across the entire application
 * Import and use with motion components throughout the app
 */

import { Variants } from 'framer-motion';

/**
 * Fade animations
 */
export const fadeVariants: Variants = {
  hidden: {
    opacity: 0,
    transition: { duration: 0.3 },
  },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

/**
 * Fade with Y offset (entrance from top)
 */
export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 },
  },
};

/**
 * Fade with Y offset (entrance from bottom)
 */
export const fadeDownVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: 0.3 },
  },
};

/**
 * Slide in from left
 */
export const slideInLeftVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -60,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    x: -60,
    transition: { duration: 0.3 },
  },
};

/**
 * Slide in from right
 */
export const slideInRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 60,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    x: 60,
    transition: { duration: 0.3 },
  },
};

/**
 * Scale entrance (grows from small to full size)
 */
export const scaleInVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.34, 1.56, 0.64, 1], // easeOutBack
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
};

/**
 * Container for staggered children animations
 * Apply to parent, use staggerItemVariants on children
 */
export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
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
 * Fast stagger (50ms between items)
 */
export const fastStaggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

/**
 * Child item for stager animations
 * Use inside a component with staggerContainerVariants
 */
export const staggerItemVariants: Variants = {
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
 * Rotation entrance
 */
export const rotateInVariants: Variants = {
  hidden: {
    opacity: 0,
    rotate: -20,
  },
  visible: {
    opacity: 1,
    rotate: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    rotate: 20,
  },
};

/**
 * Height expand (for collapsible content)
 */
export const expandVariants: Variants = {
  hidden: {
    height: 0,
    opacity: 0,
    marginBottom: 0,
  },
  visible: {
    height: 'auto',
    opacity: 1,
    marginBottom: 16,
    transition: { duration: 0.3 },
  },
  exit: {
    height: 0,
    opacity: 0,
    marginBottom: 0,
    transition: { duration: 0.3 },
  },
};

/**
 * Bounce entrance (spring physics)
 */
export const bounceInVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
  },
};

/**
 * Shimmer loading animation
 */
export const shimmerVariants: Variants = {
  hidden: {
    backgroundPosition: '-1000px 0',
  },
  visible: {
    backgroundPosition: '1000px 0',
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

/**
 * Pulse animation (opacity)
 */
export const pulseVariants: Variants = {
  hidden: {
    opacity: 0.6,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Modal backdrop (for overlay animations)
 */
export const backdropVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

/**
 * Modal content (pops in with spring physics)
 */
export const modalContentVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.92,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      mass: 1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 20,
    transition: { duration: 0.2 },
  },
};

/**
 * Page transition (for route changes)
 * Typically used with AnimatePresence on layout
 */
export const pageVariants: Variants = {
  hidden: {
    opacity: 0,
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
  },
  visible: {
    opacity: 1,
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)',
    transition: { duration: 0.3 },
  },
};

export default {
  fadeVariants,
  fadeUpVariants,
  fadeDownVariants,
  slideInLeftVariants,
  slideInRightVariants,
  scaleInVariants,
  staggerContainerVariants,
  fastStaggerContainerVariants,
  staggerItemVariants,
  rotateInVariants,
  expandVariants,
  bounceInVariants,
  shimmerVariants,
  pulseVariants,
  backdropVariants,
  modalContentVariants,
  pageVariants,
};
