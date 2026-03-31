/**
 * useScrollReveal Hook
 * Triggers animations when elements enter the viewport
 * Combines Intersection Observer + GSAP for optimal performance
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { getMotionOK } from '@/lib/animations/gsap.config';

interface UseScrollRevealOptions {
  duration?: number;
  delay?: number;
  stagger?: number;
  yOffset?: number;
  triggerStart?: string;
  triggerEnd?: string;
  once?: boolean; // Animate only once
  scale?: boolean;
  rotate?: boolean;
}

/**
 * Animate element(s) on scroll reveal
 * @param ref - React ref to the element(s)
 * @param options - Animation options
 */
export const useScrollReveal = (
  ref: React.RefObject<HTMLElement | HTMLElement[]>,
  options: UseScrollRevealOptions = {}
) => {
  const {
    duration = 0.8,
    delay = 0,
    stagger = 0,
    yOffset = 40,
    triggerStart = 'top 80%',
    triggerEnd = 'top 20%',
    once = false,
    scale = false,
    rotate = false,
  } = options;

  useEffect(() => {
    if (!ref.current || !getMotionOK()) {
      return;
    }

    // Handle both single element and multiple elements
    const elements = Array.isArray(ref.current) ? ref.current : [ref.current];

    elements.forEach((element, index) => {
      // Set initial state
      gsap.set(element, {
        autoAlpha: 0,
        y: yOffset,
        ...(scale && { scale: 0.95 }),
        ...(rotate && { rotate: -5 }),
      });

      // Create scroll trigger animation
      ScrollTrigger.create({
        trigger: element,
        start: triggerStart,
        end: triggerEnd,
        onEnter: () => {
          gsap.to(element, {
            autoAlpha: 1,
            y: 0,
            duration,
            delay: index * stagger + delay,
            ease: 'power3.out',
            ...(scale && { scale: 1 }),
            ...(rotate && { rotate: 0 }),
            overwrite: 'auto',
          });

          if (once) {
            ScrollTrigger.getById(element.getBoundingClientRect().toString())?.kill();
          }
        },
        once: once,
      });
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [ref, duration, delay, stagger, yOffset, triggerStart, triggerEnd, once, scale, rotate]);
};

export default useScrollReveal;
