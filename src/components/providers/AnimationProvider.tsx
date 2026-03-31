/**
 * AnimationProvider Component
 * Wraps the entire application to enable smooth scrolling, GSAP effects, and animations
 * Initialize Lenis (smooth scroll), ScrollTrigger refresh, and motion preferences
 */

'use client';

import React, { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

interface AnimationProviderProps {
  children: React.ReactNode;
  enableSmoothScroll?: boolean;
  enableScrollTrigger?: boolean;
}

/**
 * Global animation provider that initializes:
 * - Lenis for smooth scrolling
 * - GSAP ScrollTrigger for scroll-based animations
 * - Custom cursor tracking
 * - Motion preference detection
 */
export const AnimationProvider: React.FC<AnimationProviderProps> = ({
  children,
  enableSmoothScroll = true,
  enableScrollTrigger = true,
}) => {
  const lenisRef = useRef<Lenis | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    let prefersMotion: MediaQueryList | null = null;
    let motionListener: ((event: MediaQueryListEvent) => void) | null = null;
    const tickerCallback = () => {
      ScrollTrigger.update();
    };

    const applyMotionPreference = (shouldReduce: boolean) => {
      if (typeof document === 'undefined') return;
      document.documentElement.style.setProperty('--motion-ok', shouldReduce ? '0' : '1');
      document.documentElement.dataset.motion = shouldReduce ? 'reduced' : 'full';
      gsap.globalTimeline.timeScale(shouldReduce ? 0 : 1);
      if (lenisRef.current) {
        shouldReduce ? lenisRef.current.stop() : lenisRef.current.start();
      }
    };

    if (typeof window !== 'undefined') {
      prefersMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      applyMotionPreference(prefersMotion.matches);
      motionListener = (event: MediaQueryListEvent) => applyMotionPreference(event.matches);
      prefersMotion.addEventListener('change', motionListener);
    }

    if (enableSmoothScroll && typeof window !== 'undefined') {
      lenisRef.current = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
      });

      const lenis = lenisRef.current;
      const raf = (time: number) => {
        lenis.raf(time);
        rafId.current = requestAnimationFrame(raf);
      };
      rafId.current = requestAnimationFrame(raf);

      lenis.on('scroll', () => {
        window.dispatchEvent(new CustomEvent('lenis-scroll'));
        if (enableScrollTrigger) {
          ScrollTrigger.update();
        }
      });

      if (enableScrollTrigger) {
        gsap.ticker.add(tickerCallback);
      }
    }

    return () => {
      if (prefersMotion && motionListener) {
        prefersMotion.removeEventListener('change', motionListener);
      }
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      if (enableScrollTrigger) {
        gsap.ticker.remove(tickerCallback);
      }
    };
  }, [enableSmoothScroll, enableScrollTrigger]);

  useEffect(() => {
    // Refresh ScrollTrigger on window resize
    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <>{children}</>;
};

export default AnimationProvider;
