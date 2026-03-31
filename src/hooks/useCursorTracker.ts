/**
 * useCursorTracker Hook
 * Tracks mouse position and provides cursor data for custom cursor effects
 * Optimized with throttling and RAF for performance
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { getMotionOK } from '@/lib/animations/gsap.config';

interface CursorPosition {
  x: number;
  y: number;
  vx: number; // Velocity X
  vy: number; // Velocity Y
}

/**
 * Track cursor position globally
 * Returns current cursor position and velocity
 */
export const useCursorTracker = (enabled: boolean = true) => {
  const cursorPos = useRef<CursorPosition>({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
  });

  const prevPos = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState<CursorPosition>({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
  });

  const rafId = useRef<number | null>(null);

  const updatePosition = useCallback((e: MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;

    // Calculate velocity
    const vx = x - prevPos.current.x;
    const vy = y - prevPos.current.y;

    cursorPos.current = { x, y, vx, vy };
    prevPos.current = { x, y };

    // Use RAF to avoid excessive state updates
    if (rafId.current) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      setPosition({ ...cursorPos.current });
    });
  }, []);

  useEffect(() => {
    if (!enabled || !getMotionOK()) return;

    // Use throttled event listener
    let throttleTimer: NodeJS.Timeout | null = null;

    const throttledMouseMove = (e: MouseEvent) => {
      if (throttleTimer) return;

      updatePosition(e);

      throttleTimer = setTimeout(() => {
        throttleTimer = null;
      }, 16); // ~60fps throttle
    };

    window.addEventListener('mousemove', throttledMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', throttledMouseMove);
      if (throttleTimer) clearTimeout(throttleTimer);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [enabled, updatePosition]);

  return position;
};

/**
 * Custom cursor dot that follows mouse with eased position
 * Use this in a layout component to show a custom cursor
 */
export const useFollowCursor = (
  elementRef: React.RefObject<HTMLElement>,
  options = { ease: 0.1, scale: 1 }
) => {
  const mousePos = useRef({ x: 0, y: 0 });
  const tlRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!elementRef.current || !getMotionOK()) return;

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      if (tlRef.current) {
        tlRef.current.kill();
      }

      tlRef.current = gsap.to(elementRef.current, {
        x: mousePos.current.x,
        y: mousePos.current.y,
        duration: 0.4,
        ease: `power${Math.round(1 / options.ease)}.out`,
        overwrite: 'auto',
      });
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (tlRef.current) tlRef.current.kill();
    };
  }, [elementRef, options]);
};

/**
 * Detect if cursor is hovering over interactive elements
 * Scales/expands custom cursor when hovering buttons, links, etc.
 */
export const useCursorScale = (
  cursorRef: React.RefObject<HTMLElement>,
  options = { scaleOnHover: 1.5 }
) => {
  useEffect(() => {
    if (!cursorRef.current || !getMotionOK()) return;

    const interactiveElements = document.querySelectorAll(
      'button, a, [role="button"], input, textarea, select'
    );

    const handleMouseEnter = () => {
      gsap.to(cursorRef.current, {
        scale: options.scaleOnHover,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(cursorRef.current, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    interactiveElements.forEach((element) => {
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      interactiveElements.forEach((element) => {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [cursorRef, options]);
};

export default {
  useCursorTracker,
  useFollowCursor,
  useCursorScale,
};
