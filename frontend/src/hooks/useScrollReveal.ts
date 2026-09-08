import { useEffect, useRef } from "react";
import { animate, stagger as animeStagger } from "animejs";

export interface ScrollRevealOptions {
  /** CSS selector, scoped to the ref'd element, for children to stagger in. Omit to animate the element itself. */
  childSelector?: string;
  translateY?: number;
  duration?: number;
  delay?: number;
  staggerDelay?: number;
  easing?: string;
  threshold?: number;
  /** Set true to allow the animation to replay every time the element re-enters the viewport. Default false (once). */
  repeat?: boolean;
}

/**
 * Fires a single anime.js fade + translate-up reveal the first time the
 * attached element scrolls into view. Respects prefers-reduced-motion and
 * never re-triggers on subsequent scroll passes unless `repeat` is set.
 */
export function useScrollReveal<T extends HTMLElement>(options: ScrollRevealOptions = {}) {
  const ref = useRef<T | null>(null);
  const hasRun = useRef(false);

  const {
    childSelector,
    translateY = 32,
    duration = 750,
    delay = 0,
    staggerDelay = 80,
    easing = "easeOutCubic",
    threshold = 0.2,
    repeat = false,
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const targets = childSelector ? el.querySelectorAll<HTMLElement>(childSelector) : el;

    if (prefersReduced) {
      hasRun.current = true;
      return;
    }

    // start hidden so there's no flash of unanimated content before the observer fires
    animate(targets, { opacity: 0, translateY: 0, duration: 0 });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && (!hasRun.current || repeat)) {
            hasRun.current = true;
            animate(targets, {
              opacity: [0, 1],
              translateY: [translateY, 0],
              duration,
              delay: childSelector ? animeStagger(staggerDelay, { start: delay }) : delay,
              easing,
            });
            if (!repeat) observer.unobserve(el);
          }
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}
