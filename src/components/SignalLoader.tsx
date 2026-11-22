import { useEffect, useRef } from "react";
import gsap from "gsap";

interface SignalLoaderProps {
  onComplete: () => void;
}

export default function SignalLoader({ onComplete }: SignalLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p1Ref = useRef<SVGPathElement>(null);
  const p2Ref = useRef<SVGPathElement>(null);
  const countRef = useRef<HTMLDivElement>(null);
  const linesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduced) {
      document.body.style.overflow = originalOverflow;
      onComplete();
      return;
    }

    const linesContainer = linesContainerRef.current;
    if (linesContainer) {
      linesContainer.innerHTML = "";
      for (let i = 0; i < 40; i++) {
        const line = document.createElement("div");
        line.className = "scan-line";
        line.style.cssText = `
          position:absolute;left:0;width:100%;opacity:0;
          top:${Math.random() * 100}%;
          height:${Math.random() * 2 + 0.5}px;
          background:rgba(255,255,255,0.06);
        `;
        linesContainer.appendChild(line);
      }
    }

    const ctx = gsap.context(() => {
      const lines = gsap.utils.toArray<HTMLElement>(".scan-line");
      const p1 = p1Ref.current;
      const p2 = p2Ref.current;
      if (!p1 || !p2) return;

      gsap.to(lines, {
        opacity: () => Math.random() * 0.12 + 0.02,
        x: () => `random(-20, 20)`,
        duration: 0.08,
        stagger: { each: 0.02, repeat: 30, yoyo: true },
        ease: "none",
      });

      const counter = { val: 1 };
      gsap.to(counter, {
        val: 100,
        duration: 1.8,
        ease: "power2.out",
        delay: 0.1,
        onUpdate: () => {
          if (countRef.current) {
            countRef.current.textContent = `${Math.floor(counter.val)}%`;
          }
        },
        onComplete: signalFound,
      });

      function signalFound() {
        if (!p1 || !p2 || !containerRef.current) return;
        const len1 = p1.getTotalLength();
        const len2 = p2.getTotalLength();

        gsap.set([p1, p2], {
          strokeDasharray: (i: number) => (i === 0 ? len1 : len2),
          strokeDashoffset: (i: number) => (i === 0 ? len1 : len2),
        });

        const tl = gsap.timeline({
          onComplete: () => {
            onComplete();
          },
        });

        tl.to(countRef.current, { opacity: 0, duration: 0.25 })
          .to(lines, { opacity: 0, duration: 0.2, stagger: 0.005 }, "-=0.2")
          .set([p1, p2], { attr: { "stroke-width": 3 } })
          .to(p1, { strokeDashoffset: 0, duration: 0.75, ease: "power3.inOut" }, "draw")
          .to(p2, { strokeDashoffset: 0, duration: 0.75, ease: "power3.inOut" }, "draw+=0.06")
          .to([p1, p2], { attr: { "stroke-width": 2400 }, duration: 0.5, ease: "power4.in" }, "snap")
          .to(containerRef.current, {
            yPercent: -100,
            duration: 0.7,
            ease: "power4.inOut",
            onStart: () => {
              document.body.style.overflow = originalOverflow;
              if (containerRef.current) {
                containerRef.current.style.pointerEvents = "none";
              }
            },
          });
      }
    }, containerRef);

    return () => {
      document.body.style.overflow = originalOverflow;
      ctx.revert();
      if (linesContainer) linesContainer.innerHTML = "";
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-[#000000] flex items-center justify-center select-none overflow-hidden"
    >
      {/* Empty container — scan lines added via DOM after mount */}
      <div ref={linesContainerRef} className="absolute inset-0 overflow-hidden pointer-events-none" />

      {/* Percentage counter centered precisely */}
      <div className="relative z-10 flex items-center justify-center text-center pointer-events-none">
        <div
          ref={countRef}
          className="font-syne text-[clamp(56px,12vw,130px)] font-extrabold tracking-tighter text-white opacity-100 leading-none select-none"
        >
          1%
        </div>
      </div>

      <svg
        className="absolute inset-0 w-full h-full z-20 pointer-events-none"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        <path
          ref={p1Ref}
          d="M-50,450 C200,50 400,850 720,450 C1040,50 1240,850 1490,450"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0"
          strokeLinecap="round"
        />
        <path
          ref={p2Ref}
          d="M-50,450 C200,850 400,50 720,450 C1040,850 1240,50 1490,450"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
