import { useEffect, useRef } from "react";

const RECT_H = 460;

const VectorBridge = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const bridgeLineRef = useRef<SVGPathElement>(null);
  const portalInnerRef = useRef<HTMLDivElement>(null);
  const totalLineLenRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const updateBridge = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let newPath = "";

      if (vw >= 900) {
        const startX = vw * 0.2;
        const startY = -10;
        const endX = vw * 0.8;
        const endY = vh / 2 - RECT_H / 2;
        newPath = `M ${startX},${startY} C ${vw * 0.35},${vh * 0.12} ${vw * 0.65},${vh * 0.12} ${endX},${endY}`;
      } else {
        const startX = vw / 2;
        const startY = -10;
        const endX = vw / 2;
        const endY = vh / 2 - RECT_H / 2;
        newPath = `M ${startX},${startY} L ${endX},${endY}`;
      }

      if (bridgeLineRef.current) {
        bridgeLineRef.current.setAttribute("d", newPath);
        try {
          const len = bridgeLineRef.current.getTotalLength();
          if (len > 0) totalLineLenRef.current = len;
        } catch {
          // SVG measurements are unavailable before the element is attached.
        }
      }

      if (portalInnerRef.current && sectionRef.current) {
        const innerHeightPx = portalInnerRef.current.scrollHeight;
        const totalRequiredHeight = (vh * 1.2) + innerHeightPx;
        sectionRef.current.style.height = `${totalRequiredHeight}px`;
        sectionRef.current.style.minHeight = `${totalRequiredHeight}px`;
      }
    };

    updateBridge();
    window.addEventListener("resize", updateBridge);

    return () => window.removeEventListener("resize", updateBridge);
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-white text-black">
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <path ref={bridgeLineRef} d="" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      </svg>
      <div ref={portalInnerRef} className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-32">
        <div className="w-full rounded-[2rem] border border-black/10 p-8 md:p-12">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-black/50">Engineering</p>
          <h2 className="max-w-3xl text-4xl font-black tracking-tight md:text-7xl">From systems to intelligent interfaces.</h2>
        </div>
      </div>
    </section>
  );
};

export default VectorBridge;
