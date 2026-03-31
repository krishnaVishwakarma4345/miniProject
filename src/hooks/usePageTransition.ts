/**
 * usePageTransition Hook
 * Handles page-level animations when routes change
 * Integrates with Next.js App Router
 */

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { getMotionOK } from '@/lib/animations/gsap.config';

interface PageTransitionOptions {
  duration?: number;
  type?: 'fade' | 'slide' | 'zoom' | 'clip';
  direction?: 'left' | 'right' | 'up' | 'down';
}

/**
 * Animate page transitions on route change
 * @param containerRef - React ref to the main page container
 * @param options - Transition options
 */
export const usePageTransition = (
  containerRef: React.RefObject<HTMLElement>,
  options: PageTransitionOptions = {}
) => {
  const {
    duration = 0.4,
    type = 'fade',
    direction = 'left',
  } = options;

  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!containerRef.current || !getMotionOK() || pathname === prevPathname.current) {
      prevPathname.current = pathname;
      return;
    }

    // Kill any existing animation
    if (tlRef.current) {
      tlRef.current.kill();
    }

    const container = containerRef.current;

    // Define animations based on type
    let animationProps: gsap.TweenVars = {};

    switch (type) {
      case 'fade':
        animationProps = {
          opacity: [0, 1],
        };
        break;

      case 'slide':
        const slideDistance = direction === 'left' ? 100 : -100;
        animationProps = {
          x: [direction === 'left' ? slideDistance : -slideDistance, 0],
          opacity: [0, 1],
        };
        break;

      case 'zoom':
        animationProps = {
          scale: [0.95, 1],
          opacity: [0, 1],
        };
        break;

      case 'clip':
        animationProps = {
          clipPath: [
            'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
            'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          ],
          opacity: [0, 1],
        };
        break;

      default:
        animationProps = { opacity: [0, 1] };
    }

    // Reset position before animation
    gsap.set(container, {
      x: direction === 'left' ? 100 : -100,
      opacity: 0,
    });

    // Create timeline animation
    tlRef.current = gsap.timeline({
      onComplete: () => {
        // Reset to normal state after animation
        gsap.set(container, { clearProps: 'all' });
      },
    });

    tlRef.current.to(container, {
      ...animationProps,
      duration,
      ease: 'power2.out',
    });

    prevPathname.current = pathname;

    return () => {
      if (tlRef.current) {
        tlRef.current.kill();
      }
    };
  }, [pathname, containerRef, duration, type, direction]);
};

/**
 * Animate page exit before route change
 * Use with useEffect to trigger animation before navigation
 */
export const usePageExitAnimation = (
  containerRef: React.RefObject<HTMLElement>,
  duration: number = 0.3
) => {
  const executeExitAnimation = async () => {
    if (!containerRef.current || !getMotionOK()) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration,
        ease: 'power2.inOut',
        onComplete: () => resolve(),
      });
    });
  };

  return { executeExitAnimation };
};

/**
 * Disable page transitions for specific routes
 * Useful for modals, sidebars, etc.
 */
export const useDisablePageTransition = (routes: string[]) => {
  const pathname = usePathname();
  const isDisabled = routes.some((route) => pathname === route);
  return isDisabled;
};

export default {
  usePageTransition,
  usePageExitAnimation,
  useDisablePageTransition,
};
