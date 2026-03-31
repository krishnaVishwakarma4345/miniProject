/**
 * useMagnetic Hook
 * Creates a magnetic hover effect where elements shift toward the mouse cursor
 * Google Lens-inspired interaction
 */

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { getMotionOK } from '@/lib/animations/gsap.config';

interface UseMagneticOptions {
  magnetRadius?: number; // Distance from element to start magnetic effect (px)
  strength?: number; // How much the element shifts toward cursor (0-1)
  delay?: number; // Animation delay in seconds
  enabled?: boolean; // Enable/disable effect
}

interface MousePosition {
  x: number;
  y: number;
}

/**
 * Apply magnetic hover effect to an element
 * @param ref - React ref to the element
 * @param options - Magnetic effect options
 */
export const useMagnetic = (
  ref: React.RefObject<HTMLElement | null>,
  options: UseMagneticOptions = {}
) => {
  const {
    magnetRadius = 80,
    strength = 0.8,
    delay = 0,
    enabled = true,
  } = options;

  const mousePos = useRef<MousePosition>({ x: 0, y: 0 });
  const tlRef = useRef<gsap.core.Tween | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check if device is touch (disable magnetic on mobile)
    const checkTouchDevice = () => {
      setIsTouchDevice(() => {
        return (
          (typeof window !== 'undefined' &&
            ('ontouchstart' in window || navigator.maxTouchPoints > 0)) ||
          false
        );
      });
    };

    checkTouchDevice();
  }, []);

  useEffect(() => {
    if (!ref.current || !enabled || !getMotionOK() || isTouchDevice) {
      return;
    }

    const element = ref.current;

    const onMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const elementCenterX = rect.left + rect.width / 2;
      const elementCenterY = rect.top + rect.height / 2;

      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      // Cancel previous animation
      if (tlRef.current) {
        tlRef.current.kill();
      }

      // Calculate distance to element center
      const distX = e.clientX - elementCenterX;
      const distY = e.clientY - elementCenterY;
      const distance = Math.sqrt(distX * distX + distY * distY);

      // Only apply effect if within magnetRadius
      if (distance < magnetRadius) {
        // Calculate shift magnitude based on proximity
        const proximity = 1 - distance / magnetRadius;
        const shiftX = (distX * proximity * strength) / 10;
        const shiftY = (distY * proximity * strength) / 10;

        // Animate element position
        tlRef.current = gsap.to(element, {
          x: shiftX,
          y: shiftY,
          delay,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
    };

    const onMouseLeave = () => {
      if (tlRef.current) {
        tlRef.current.kill();
      }

      // Return to original position
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    element.addEventListener('mousemove', onMouseMove);
    element.addEventListener('mouseleave', onMouseLeave);

    return () => {
      element.removeEventListener('mousemove', onMouseMove);
      element.removeEventListener('mouseleave', onMouseLeave);
      if (tlRef.current) {
        tlRef.current.kill();
      }
    };
  }, [ref, magnetRadius, strength, delay, enabled, isTouchDevice]);
};

export default useMagnetic;
