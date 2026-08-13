import { useState, useEffect, useRef } from 'react';

/**
 * Tracks scroll direction and whether the page has scrolled past a
 * threshold. Used to shrink/dip the navbar on scroll-down and restore it
 * on scroll-up, like Instagram's app bar.
 */
export function useScrollDirection(threshold = 8) {
  const [direction, setDirection] = useState('up');
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;

    const update = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (Math.abs(y - lastY.current) > threshold) {
        setDirection(y > lastY.current ? 'down' : 'up');
        lastY.current = y;
      }
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return { direction, scrolled };
}
