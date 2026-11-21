import { useLayoutEffect, useEffect } from "react";
import { gsap } from "gsap";

// Safe isomorphic layout effect for browser and test/SSR environments
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Reusable GSAP Context lifecycle hook.
 * Encapsulates GSAP tweens, timelines, and ScrollTriggers in a gsap.context().
 * Automatically reverts all animations and kills ScrollTriggers upon unmount,
 * guaranteeing zero memory leaks and full React Strict Mode compatibility.
 *
 * @param effect Callback receiving the gsap.Context instance
 * @param deps Dependency array for rebuilding animations
 * @param scope Optional RefObject or HTMLElement to scope selector queries
 */
export function useGsapContext(
  effect: (context: gsap.Context) => void,
  deps: React.DependencyList = [],
  scope?: React.RefObject<Element | null> | Element | null
) {
  useIsomorphicLayoutEffect(() => {
    const scopeElement = scope && "current" in scope ? scope.current : scope;
    const ctx = gsap.context((self) => {
      effect(self);
    }, scopeElement || undefined);

    return () => {
      ctx.revert();
    };
  }, deps);
}

export default useGsapContext;
