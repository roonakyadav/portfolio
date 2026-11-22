import { useEffect, useRef } from 'react';

interface Props {
  text: string;
  minWeight?: number;
  maxWeight?: number;
  className?: string;
}

const OPSZ = 144;

function hasFinePointer(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(hover: hover)').matches &&
    window.matchMedia('(pointer: fine)').matches
  );
}

export default function ReactiveSerif({
  text,
  minWeight = 350,
  maxWeight = 650,
  className = '',
}: Props) {
  const chars = Array.from(text);
  const els = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const n = chars.length;
    const cur = new Array(n).fill(0);
    const tgt = new Array(n).fill(0);
    const pointer = { x: -9999, y: -9999, active: false };
    let waveStart = -1;
    let raf = 0;
    let last = performance.now();
    let idleSince = 0;
    const fine = hasFinePointer();

    const cap = window.innerWidth < 640 ? Math.min(maxWeight, 500) : maxWeight;
    const apply = (i: number, v: number) => {
      const el = els.current[i];
      if (!el) return;
      const w = Math.round(minWeight + (cap - minWeight) * v);
      const soft = Math.round(100 - 90 * v);
      const wonk = v > 0.55 ? 1 : 0;
      el.style.fontVariationSettings = `'opsz' ${OPSZ}, 'wght' ${w}, 'SOFT' ${soft}, 'WONK' ${wonk}`;
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const R = Math.max(180, window.innerWidth * 0.18);
      let moving = false;

      for (let i = 0; i < n; i++) {
        const el = els.current[i];
        if (!el) continue;
        let t = 0;
        if (pointer.active) {
          const r = el.getBoundingClientRect();
          const d = Math.hypot(
            r.left + r.width / 2 - pointer.x,
            r.top + r.height / 2 - pointer.y
          );
          const k = Math.max(0, 1 - d / R);
          t = k * k * (3 - 2 * k);
        }
        let wv = 0;
        if (waveStart >= 0) {
          const pos = ((now - waveStart) / 1200) * (n + 2) - 1;
          const k = Math.max(0, 1 - Math.abs(i - pos) / 1.7);
          wv = k * k * (3 - 2 * k);
          if (now - waveStart > 1600) waveStart = -1;
        }
        tgt[i] = Math.max(t, wv);
        cur[i] += (tgt[i] - cur[i]) * (1 - Math.pow(1 - 0.16, dt * 60));
        if (Math.abs(tgt[i] - cur[i]) > 0.002) moving = true;
        apply(i, cur[i]);
      }

      if (moving || waveStart >= 0 || now - idleSince < 400) {
        raf = requestAnimationFrame(frame);
      } else {
        raf = 0;
      }
    };

    const kick = () => {
      idleSince = performance.now();
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      kick();
    };

    const onLeave = () => {
      pointer.active = false;
      kick();
    };

    if (fine) {
      window.addEventListener('pointermove', onMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', onLeave);
    }

    const startWave = () => {
      waveStart = performance.now() + 300;
      kick();
    };

    const waveTimer = window.setTimeout(startWave, 800);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(waveTimer);
      if (fine) {
        window.removeEventListener('pointermove', onMove);
        document.documentElement.removeEventListener('pointerleave', onLeave);
      }
    };
  }, [text, minWeight, maxWeight, chars.length]);

  return (
    <span className={`inline-block ${className}`.trim()}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-block whitespace-nowrap">
        {chars.map((c, i) => (
          <span
            key={i}
            ref={(el) => {
              els.current[i] = el;
            }}
            data-hero-char
            className="inline-block hero-char will-change-transform"
            style={{
              fontVariationSettings: `'opsz' ${OPSZ}, 'wght' ${minWeight}, 'SOFT' 100, 'WONK' 0`,
            }}
          >
            {c}
          </span>
        ))}
      </span>
    </span>
  );
}
