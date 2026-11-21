import React, { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MechanicalScene } from "./MechanicalScene";
import { ComponentId } from "./KinematicsRig";
import { FallbackBlueprint } from "./FallbackBlueprint";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface MechanicalCenterpieceProps {
  className?: string;
  isMobile?: boolean;
  heroSectionRef?: React.RefObject<HTMLElement | null>;
}

interface ComponentMetadata {
  id: ComponentId;
  label: string;
  code: string;
  spec: string;
  desc: string;
}

const COMPONENTS: ComponentMetadata[] = [
  {
    id: "stator",
    label: "STATOR",
    code: "01",
    spec: "CAST BED & BEARING HOUSING",
    desc: "Asymmetrical base plate and trunnion mounts",
  },
  {
    id: "rotor",
    label: "ROTOR",
    code: "02",
    spec: "SHAFT & FLYWHEEL",
    desc: "High-inertia counterweight flywheel and turbine",
  },
  {
    id: "gimbal",
    label: "GIMBAL",
    code: "03",
    spec: "ARTICULATED LINKAGE",
    desc: "Connecting rod, bellcrank and stabilizer calipers",
  },
  {
    id: "core",
    label: "CORE",
    code: "04",
    spec: "DRIVE & COMPUTATION",
    desc: "Heat sink cooled drive module with emerald core",
  },
];

export const MechanicalCenterpiece: React.FC<MechanicalCenterpieceProps> = ({
  className = "",
  isMobile = false,
  heroSectionRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<MechanicalScene | null>(null);

  // Separated hover and selection state
  const [hoveredComponent, setHoveredComponent] = useState<ComponentId | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<ComponentId | null>(null);
  const [scrollPhase, setScrollPhase] = useState<string>("ASSEMBLED");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const isVisibleRef = useRef<boolean>(true);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Drag interaction tracking
  const pointerDownPos = useRef({ x: 0, y: 0 });

  // Determine active highlight: hover takes temporary preview precedence,
  // falling back to persistent selection, or null if neither
  const activeHighlight = hoveredComponent ?? selectedComponent;

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

  // Sync highlight to 3D scene whenever activeHighlight changes
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.highlightComponent(activeHighlight);
    }
  }, [activeHighlight]);

  // Sync isMobile dynamically
  const isMobileRef = useRef(isMobile);
  useEffect(() => {
    isMobileRef.current = isMobile;
    if (sceneRef.current) {
      sceneRef.current.setIsMobile(isMobile);
    }
  }, [isMobile]);

  // Pointer move: updates parallax tracking, drag-to-orbit, and Raycast mesh picking
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const scene = sceneRef.current;
    if (!canvas || !scene) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    // Subtle pointer parallax
    scene.setPointer(nx, ny);

    // If currently dragging, update orbit rotation
    if (isDragging) {
      scene.updateDrag(e.clientX, e.clientY);
      return;
    }

    // Direct 3D Raycaster Mesh Picking on hover
    if (e.pointerType !== "touch") {
      const hitComponent = scene.raycast(nx, ny);
      setHoveredComponent((prev) => (prev !== hitComponent ? hitComponent : prev));
    }
  }, [isDragging]);

  const handlePointerLeave = useCallback(() => {
    if (sceneRef.current) {
      sceneRef.current.setPointer(0, 0);
      sceneRef.current.endDrag();
    }
    setIsDragging(false);
    // Clear hover; selection persists!
    setHoveredComponent(null);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    // Left click or tap
    if (e.button !== 0 && e.pointerType !== "touch") return;

    pointerDownPos.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);

    if (sceneRef.current && e.pointerType !== "touch") {
      sceneRef.current.startDrag(e.clientX, e.clientY);
    }
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const scene = sceneRef.current;
    const canvas = canvasRef.current;
    setIsDragging(false);

    if (scene) {
      scene.endDrag();
    }

    if (!canvas || !scene) return;

    // Check if pointer moved significantly (drag vs click)
    const dx = Math.abs(e.clientX - pointerDownPos.current.x);
    const dy = Math.abs(e.clientY - pointerDownPos.current.y);

    // If movement is under 8px, treat as intentional click/selection
    if (dx < 8 && dy < 8) {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      const hit = scene.raycast(nx, ny);
      if (hit) {
        // Toggle selection: clicking selected deselects it; clicking another changes selection
        setSelectedComponent((prev) => (prev === hit ? null : hit));
      } else {
        // Clicking outside any assembly clears selection
        setSelectedComponent(null);
      }
    }
  }, []);

  // Component selector button handlers
  const handleButtonHover = useCallback((id: ComponentId | null) => {
    setHoveredComponent(id);
  }, []);

  const handleButtonClick = useCallback((id: ComponentId) => {
    setSelectedComponent((prev) => (prev === id ? null : id));
  }, []);

  // Viewport IntersectionObserver: pauses rendering without tearing down scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Initialize Scene, GSAP Ticker, and ScrollTrigger Sequence
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !webglSupported) return;

    let scene: MechanicalScene | null = null;
    try {
      scene = new MechanicalScene({ canvas, isMobile: isMobileRef.current });
      sceneRef.current = scene;
    } catch (err) {
      console.warn("MechanicalScene initialization failed, falling back to blueprint:", err);
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

    // Scroll progress tracker
    let currentProgress = 0;

    // Dedicated GSAP ScrollTrigger Sequence with Pinned Hero
    const targetSection = heroSectionRef?.current || container.closest("section");
    let scrollTriggerInstance: ScrollTrigger | null = null;

    if (!prefersReducedMotion && targetSection) {
      scrollTriggerInstance = ScrollTrigger.create({
        trigger: targetSection,
        start: "top top",
        end: isMobileRef.current ? "+=80%" : "+=130%",
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => {
          currentProgress = self.progress;
          scene?.setScrollProgress(self.progress);

          // Update active scroll phase label
          if (self.progress < 0.25) {
            setScrollPhase("PHASE 1 // ASSEMBLED");
          } else if (self.progress < 0.5) {
            setScrollPhase("PHASE 2 // ACCELERATION");
          } else if (self.progress < 0.75) {
            setScrollPhase("PHASE 3 // EXPLODED VIEW");
          } else {
            setScrollPhase("PHASE 4 // REASSEMBLY");
          }
        },
      });
    }

    // Single-Clock GSAP Ticker Subscription
    let previousTime = 0;
    const tickerCallback = (time: number) => {
      if (!isVisibleRef.current || !scene) return;

      const deltaTime = previousTime > 0 ? time - previousTime : 0.016;
      previousTime = time;

      scene.render(time, deltaTime, currentProgress, prefersReducedMotion);
    };

    gsap.ticker.add(tickerCallback);

    return () => {
      resizeObserver.disconnect();
      scrollTriggerInstance?.kill();
      gsap.ticker.remove(tickerCallback);
      scene?.dispose();
      sceneRef.current = null;
    };
  }, [webglSupported, prefersReducedMotion, heroSectionRef]);

  // Active component metadata for live readout
  const activeMeta = COMPONENTS.find((c) => c.id === activeHighlight);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[380px] lg:min-h-[620px] flex items-center justify-center select-none ${className}`}
      role="region"
      aria-label="Interactive 3D Mechanical Assembly"
    >
      {/* 3D WebGL Canvas OR 2D Fallback Blueprint */}
      {webglSupported ? (
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          className="w-full h-full max-w-full max-h-full block touch-none z-10"
          aria-hidden="true"
          style={{
            cursor: hoveredComponent ? "pointer" : isDragging ? "grabbing" : "grab",
          }}
        />
      ) : (
        <div className="w-full h-full max-w-[540px] max-h-[540px] z-10 flex items-center justify-center">
          <FallbackBlueprint className="w-full h-full" label="SPEC: 2D INDUSTRIAL SCHEMATIC [FALLBACK]" />
        </div>
      )}

      {/* Subtle Background Coordinate Crosshair Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-25">
        <div className="w-[88%] h-[88%] border border-machine-border border-dashed rounded-full" />
        <div className="absolute w-[64%] h-[64%] border border-machine-border/50 rounded-full" />
        <div className="absolute w-full h-[1px] bg-machine-border/30" />
        <div className="absolute h-full w-[1px] bg-machine-border/30" />
      </div>

      {/* Top Status & Interaction Hint */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none hidden sm:flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-machine-accent animate-pulse" />
          <span className="font-mono text-[9px] font-semibold text-machine-text-primary tracking-[0.2em] uppercase">
            {scrollPhase}
          </span>
        </div>
        <span className="font-mono text-[9px] text-machine-text-secondary">
          DRAG TO ORBIT // CLICK TO SELECT
        </span>
      </div>

      {/* Direct Component Hover / Selection Tooltip */}
      {activeMeta && (
        <div className="absolute top-4 right-4 z-20 pointer-events-none bg-machine-surface/90 border border-machine-accent/60 backdrop-blur-md px-3 py-1.5 rounded shadow-xl flex flex-col items-end animate-fadeIn">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[9px] font-bold text-machine-accent tracking-wider">
              SYS.{activeMeta.code} // {activeMeta.label}
            </span>
          </div>
          <span className="font-mono text-[8px] text-machine-text-secondary tracking-wide">
            {activeMeta.spec}
          </span>
        </div>
      )}

      {/* Accessible Component Selector Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-[560px] bg-machine-surface/90 backdrop-blur-md border border-machine-border p-2 px-3 rounded flex items-center justify-between gap-2 shadow-2xl">
        <div className="flex items-center gap-1 sm:gap-1.5">
          {COMPONENTS.map((item) => {
            const isSelected = selectedComponent === item.id;
            const isHovered = hoveredComponent === item.id;
            const isActive = isHovered || isSelected;

            return (
              <button
                key={item.id}
                type="button"
                onMouseEnter={() => handleButtonHover(item.id)}
                onMouseLeave={() => handleButtonHover(null)}
                onFocus={() => handleButtonHover(item.id)}
                onBlur={() => handleButtonHover(null)}
                onClick={() => handleButtonClick(item.id)}
                className={`px-2 sm:px-2.5 py-1 text-[10px] font-mono uppercase font-bold tracking-wider rounded transition-all ${
                  isSelected
                    ? "bg-machine-accent text-black shadow-[0_0_12px_rgba(0,255,102,0.45)] ring-1 ring-white"
                    : isHovered
                    ? "bg-machine-surface-elevated text-machine-accent border border-machine-accent/60"
                    : "bg-machine-bg/70 text-machine-text-secondary hover:text-machine-text-primary hover:border-machine-steel border border-machine-border/60"
                }`}
                aria-label={`Select mechanical component ${item.label}: ${item.spec}`}
                aria-pressed={isSelected}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Telemetry Reading */}
        <div className="hidden sm:flex items-center text-right font-mono text-[9px]">
          {activeMeta ? (
            <span className="text-machine-accent font-semibold tracking-wider">
              {activeMeta.spec}
            </span>
          ) : (
            <span className="text-machine-text-secondary tracking-widest">
              SYSTEM // READY
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MechanicalCenterpiece;
