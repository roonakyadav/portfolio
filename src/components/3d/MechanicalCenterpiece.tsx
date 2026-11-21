import React, { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { MechanicalScene } from "./MechanicalScene";
import { ComponentId } from "./KinematicsRig";
import { FallbackBlueprint } from "./FallbackBlueprint";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface MechanicalCenterpieceProps {
  className?: string;
  isMobile?: boolean;
}

const COMPONENTS: { id: ComponentId; label: string; tag: string; spec: string }[] = [
  { id: "stator", label: "STATOR", tag: "SYS.01", spec: "CHASSIS / RAD: 3.3m" },
  { id: "gimbal", label: "GIMBAL", tag: "SYS.02", spec: "TITANIUM / DUAL-AXIS" },
  { id: "rotor", label: "ROTOR", tag: "SYS.03", spec: "TURBINE / 20 BLADES" },
  { id: "core", label: "CORE", tag: "SYS.04", spec: "COMPUTATION / EMISSIVE" },
];

export const MechanicalCenterpiece: React.FC<MechanicalCenterpieceProps> = ({
  className = "",
  isMobile = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<MechanicalScene | null>(null);

  const [activeComponent, setActiveComponent] = useState<ComponentId | null>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const prefersReducedMotion = usePrefersReducedMotion();

  // Test WebGL availability on mount
  useEffect(() => {
    try {
      const testCanvas = document.createElement("canvas");
      const gl = (testCanvas.getContext("webgl2") || testCanvas.getContext("webgl")) as WebGLRenderingContext | null;
      if (!gl) {
        setWebglSupported(false);
        return;
      }
      const vPrec = gl.getShaderPrecisionFormat ? gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT) : null;
      if (!vPrec || typeof vPrec.precision !== "number" || vPrec.precision <= 0) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
    }
  }, []);

  const isMobileRef = useRef(isMobile);

  // Update mobile mode on existing scene dynamically without rebuilding canvas
  useEffect(() => {
    isMobileRef.current = isMobile;
    if (sceneRef.current) {
      sceneRef.current.setIsMobile(isMobile);
    }
  }, [isMobile]);

  // Handle pointer tracking
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" || !containerRef.current || !sceneRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    sceneRef.current.setPointer(nx, ny);
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (sceneRef.current) {
      sceneRef.current.setPointer(0, 0);
    }
  }, []);

  // Set active hover highlight
  const handleHighlight = useCallback((id: ComponentId | null) => {
    setActiveComponent(id);
    if (sceneRef.current) {
      sceneRef.current.highlightComponent(id);
    }
  }, []);

  // Viewport intersection observer: Pause WebGL renders when out of view
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Initialize Scene & subscribe to GSAP Ticker
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !webglSupported) return;

    let scene: MechanicalScene | null = null;
    try {
      scene = new MechanicalScene({ canvas, isMobile: isMobileRef.current });
      sceneRef.current = scene;
    } catch (err) {
      console.warn("WebGL scene initialization failed, falling back to blueprint:", err);
      setWebglSupported(false);
      return;
    }

    // Size handling
    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      scene?.resize(rect.width, rect.height);
    };
    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    // GSAP Ticker Subscription (Single-Clock Integration)
    let previousTime = 0;
    const tickerCallback = (time: number) => {
      if (!isVisible || !scene) return;

      const deltaTime = previousTime > 0 ? time - previousTime : 0.016;
      previousTime = time;

      // Calculate scroll progress through hero
      const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
      const vh = typeof window !== "undefined" ? window.innerHeight : 800;
      const scrollProgress = Math.min(Math.max(scrollY / vh, 0), 1);

      scene.render(time, deltaTime, scrollProgress, prefersReducedMotion);
    };

    gsap.ticker.add(tickerCallback);

    return () => {
      resizeObserver.disconnect();
      gsap.ticker.remove(tickerCallback);
      scene?.dispose();
      sceneRef.current = null;
    };
  }, [webglSupported, prefersReducedMotion, isVisible]);

  // If WebGL is not supported, gracefully degrade to the SVG schematic
  if (!webglSupported) {
    return <FallbackBlueprint className={className} label="SPEC: 2D BLUEPRINT [WEBGL_UNAVAILABLE]" />;
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative w-full h-full min-h-[300px] lg:min-h-[580px] flex items-center justify-center select-none ${className}`}
      role="region"
      aria-label="Interactive 3D Mechanical Centerpiece"
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full max-w-full max-h-full block touch-none z-10"
        aria-hidden="true"
      />

      {/* Subtle Background Coordinate Crosshair Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-30">
        <div className="w-[85%] h-[85%] border border-machine-border border-dashed rounded-full" />
        <div className="absolute w-[60%] h-[60%] border border-machine-border/60 rounded-full" />
        <div className="absolute w-full h-[1px] bg-machine-border/40" />
        <div className="absolute h-full w-[1px] bg-machine-border/40" />
      </div>

      {/* Technical HUD Coordinates & Status Badges */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none hidden sm:flex flex-col gap-1">
        <div className="tech-accent-pill">
          <span className="w-1.5 h-1.5 rounded-full bg-machine-accent animate-pulse" />
          <span>MACH // 001_ACTIVE</span>
        </div>
        <span className="tech-label text-[9px] text-machine-text-secondary">
          GEOM: PROCEDURAL_TITANIUM
        </span>
      </div>

      <div className="absolute top-4 right-4 z-20 pointer-events-none hidden sm:flex flex-col items-end gap-1">
        <span className="tech-label text-[9px] text-machine-steel">
          RADIAL CALIPERS: 4_AXIS
        </span>
        <span className="tech-label text-[9px] text-machine-text-secondary">
          CLOCK: GSAP_UNIFIED
        </span>
      </div>

      {/* Interactive Component Telemetry Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-[520px] bg-machine-surface/85 backdrop-blur-md border border-machine-border p-2 px-3 rounded flex items-center justify-between gap-2 shadow-2xl">
        <div className="flex items-center gap-1.5">
          {COMPONENTS.map((item) => (
            <button
              key={item.id}
              type="button"
              onMouseEnter={() => handleHighlight(item.id)}
              onMouseLeave={() => handleHighlight(null)}
              onFocus={() => handleHighlight(item.id)}
              onBlur={() => handleHighlight(null)}
              onClick={() => handleHighlight(activeComponent === item.id ? null : item.id)}
              className={`px-2 py-1 text-[10px] font-mono uppercase font-bold tracking-wider rounded transition-all ${
                activeComponent === item.id
                  ? "bg-machine-accent text-black shadow-[0_0_12px_rgba(0,255,102,0.4)]"
                  : "bg-machine-bg/60 text-machine-text-secondary hover:text-machine-text-primary hover:border-machine-steel border border-machine-border/60"
              }`}
              aria-label={`Highlight mechanical component ${item.label}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Dynamic Telemetry Reading */}
        <div className="hidden sm:flex items-center text-right font-mono text-[9px] text-machine-steel font-medium">
          {activeComponent ? (
            <span className="text-machine-accent font-semibold tracking-wider">
              {COMPONENTS.find((c) => c.id === activeComponent)?.spec}
            </span>
          ) : (
            <span className="text-machine-text-secondary tracking-widest">
              SYSTEM: NOMINAL [100%]
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MechanicalCenterpiece;
