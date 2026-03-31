/**
 * GSAP Configuration & Initialization
 * Global animation settings and custom easing curves
 * Loaded once per application lifetime
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { TextPlugin } from 'gsap/dist/TextPlugin';
import { CustomEase } from 'gsap/dist/CustomEase';

/**
 * Register GSAP plugins
 */
gsap.registerPlugin(ScrollTrigger, TextPlugin, CustomEase);

/**
 * Define custom easing curves
 * Named by their function (ease in, ease out, etc.)
 */
export const customEases = {
  // Smooth entrance: cubic-bezier(0.34, 1.56, 0.64, 1)
  easeOutBack: 'M0,0 C0.34,1.56 0.64,1 1,1',
  
  // Elastic bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)
  easeOutElastic: 'M0,0 C0.68,-0.55 0.265,1.55 1,1',
  
  // Sharp entrance: cubic-bezier(0.95, 0.05, 0.795, 0.035)
  easeInQuad: 'M0,0 C0.95,0.05 0.795,0.035 1,1',
  
  // Default GSAP easing
  power3Out: 'power3.out',
  power2Out: 'power2.out',
  power4Out: 'power4.out',
  power1InOut: 'power1.inOut',
} as const;

/**
 * Register custom eases
 */
Object.entries(customEases).forEach(([name, path]) => {
  if (!path.startsWith('M')) return;
  try {
    CustomEase.create(name, path);
  } catch (e) {
    // May fail if path format is invalid, use fallback
  }
});

/**
 * Global GSAP configuration
 */
export const gsapConfig = {
  // Default easing for all animations
  defaultEase: 'power3.out',
  
  // Default duration (in seconds)
  defaultDuration: 0.6,
  
  // Speed multiplier (useful for testing)
  timeScale: 1,
  
  // Whether to use GPU acceleration
  useGPU: true,
  
  // Stagger configurations
  stagger: {
    small: 0.05, // 50ms
    medium: 0.08, // 80ms
    large: 0.12, // 120ms
  },
  
  // Spring physics (used in Framer Motion)
  spring: {
    stiffness: 300,
    damping: 30,
    mass: 1,
  },
  
  // Scroll trigger settings
  scrollTrigger: {
    scrub: false,
    trigger: null,
    start: 'top 80%',
    end: 'top 20%',
  },
} as const;

/**
 * Set GSAP global defaults
 */
gsap.defaults({
  duration: gsapConfig.defaultDuration,
  ease: gsapConfig.defaultEase,
  overwrite: 'auto',
  clearProps: 'none',
});

/**
 * ScrollTrigger configuration
 * Optimize scroll trigger behavior site-wide
 */
if (typeof window !== 'undefined' && typeof ScrollTrigger.config === 'function') {
  ScrollTrigger.config({
    autoRefreshEvents: 'visibilitychange,domContentLoaded,load',
  });
}

/**
 * Disable GSAP animations if user prefers reduced motion
 */
if (typeof window !== 'undefined') {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    gsap.globalTimeline.timeScale(0);
    document.documentElement.style.setProperty('--motion-ok', '0');
  } else {
    document.documentElement.style.setProperty('--motion-ok', '1');
  }
  
  // Listen for changes to prefers-reduced-motion
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    gsap.globalTimeline.timeScale(e.matches ? 0 : 1);
    document.documentElement.style.setProperty('--motion-ok', e.matches ? '0' : '1');
  });
}

/**
 * Helper to create animation with motion preference check
 */
export const shouldAnimate = (): boolean => {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches === false;
};

/**
 * Helper to get CSS variable for motion
 * Usage: if (getMotionOK()) { run animation }
 */
export const getMotionOK = (): boolean => {
  if (typeof window === 'undefined') return true;
  const value = getComputedStyle(document.documentElement).getPropertyValue('--motion-ok');
  return value.trim() !== '0';
};

/**
 * Callback to be used with ScrollTrigger for batch animations
 */
export const batchAnimateOnScroll = (
  elements: NodeListOf<Element> | Element[],
  properties: gsap.TweenVars,
  staggerDelay = 0.05
) => {
  Array.from(elements).forEach((element, index) => {
    gsap.to(element, {
      ...properties,
      delay: index * staggerDelay,
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
      },
    });
  });
};

export default {
  gsap,
  gsapConfig,
  customEases,
  shouldAnimate,
  getMotionOK,
  batchAnimateOnScroll,
};
