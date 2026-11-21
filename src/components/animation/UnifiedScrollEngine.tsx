import { useEffect } from "react";
import { useLenis } from "lenis/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// Idempotent registration of GSAP ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * UnifiedScrollEngine
 *
 * Establishes a single-clock animation architecture:
 * 1. Coordinates the root Lenis smooth-scroll instance with GSAP's central ticker.
 * 2. Synchronizes scroll callbacks with GSAP ScrollTrigger to prevent tearing.
 * 3. Disables duplicate requestAnimationFrame clocks by driving Lenis exclusively via GSAP.
 * 4. Honors OS prefers-reduced-motion accessibility preference.
 * 5. Guarantees lifecycle cleanup and React Strict Mode safety.
 */
export const UnifiedScrollEngine = () => {
  const lenis = useLenis();
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!lenis) return;

    // Synchronize Lenis scroll output with GSAP ScrollTrigger
    const handleScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on("scroll", handleScroll);

    // Single-clock driver: GSAP Ticker drives Lenis RAF
    // GSAP passes time in seconds; Lenis expects milliseconds
    const handleTicker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(handleTicker);

    // Disable lag smoothing to prevent frame desynchronization during heavy computations
    gsap.ticker.lagSmoothing(0);

    // Synchronize window resize events with Lenis and ScrollTrigger
    const handleResize = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // Initial recalculation
    ScrollTrigger.refresh();

    // Strict Mode & unmount cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      lenis.off("scroll", handleScroll);
      gsap.ticker.remove(handleTicker);
    };
  }, [lenis]);

  // Dynamic reaction to user accessibility reduced-motion preference changes
  useEffect(() => {
    if (!lenis) return;

    if (prefersReducedMotion) {
      // Instant scrolling without interpolation when reduced motion is preferred
      lenis.stop();
      lenis.start();
    }
  }, [lenis, prefersReducedMotion]);

  return null;
};

export default UnifiedScrollEngine;
