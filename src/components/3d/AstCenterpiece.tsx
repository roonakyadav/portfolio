import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AstScene, AstRaycastHit } from "./AstScene";
import { AstComponentId } from "./AstRig";
import { FallbackBlueprint } from "./FallbackBlueprint";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

interface AstCenterpieceProps {
  className?: string;
  isMobile?: boolean;
  heroSectionRef?: React.RefObject<HTMLElement>;
}

interface ComponentMetadata {
  id: AstComponentId;
  label: string;
  code: string;
  telemetry: string;
  description: string;
}

const COMPONENTS: ComponentMetadata[] = [
  {
    id: "root",
    label: "ROOT",
    code: "SYS.01",
    telemetry: "PARSE_ROOT // LEXICAL ANCHOR",
    description: "Hexagonal titanium root plate & input token feeder socket",
  },
  {
    id: "declarations",
    label: "SCOPE",
    code: "SYS.02",
    telemetry: "SCOPE_DECL // FUNCTIONS & TYPES",
    description: "Function declaration blocks, type definitions & parameter sockets",
  },
  {
    id: "statements",
    label: "FLOW",
    code: "SYS.03",
    telemetry: "STMT_FLOW // CONTROL & HIGHWAYS",
    description: "Statement list highways, conditional branch gate & loop tracks",
  },
  {
    id: "expressions",
    label: "EXPR",
    code: "SYS.04",
    telemetry: "EXPR_EVAL // LOGIC & OPERANDS",
    description: "Binary operator diamond, evaluation units & leaf operand pills",
  },
];

export const AstCenterpiece: React.FC<AstCenterpieceProps> = ({
  className = "",
  isMobile = false,
  heroSectionRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<AstScene | null>(null);
  const isVisibleRef = useRef<boolean>(true);

  const [hoveredComponent, setHoveredComponent] = useState<AstComponentId | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<AstComponentId | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [scrollPhase, setScrollPhase] = useState<string>("PHASE 1 // SOURCE TOKENS");
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  const reducedMotion = usePrefersReducedMotion();

  // Highlight priority: Hover preview overrides selection, selection persists on mouseout
  const activeHighlight = hoveredComponent ?? selectedComponent;

  // Active metadata based on highlight
  const activeMetadata = useMemo(() => {
    if (!activeHighlight) return null;
    return COMPONENTS.find((c) => c.id === activeHighlight) ?? null;
  }, [activeHighlight]);

  // Check WebGL context support
  useEffect(() => {
    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
      if (!gl) setWebglSupported(false);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  // Update scene highlight when activeHighlight changes
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setHighlight(activeHighlight);
    }
  }, [activeHighlight]);

  // Initialize Three.js Scene and GSAP Ticker Loop
  useEffect(() => {
    if (!webglSupported || reducedMotion) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let scene: AstScene;
    try {
      scene = new AstScene(canvas);
      sceneRef.current = scene;
    } catch (err) {
      console.warn("AstScene initialization failed, falling back to blueprint:", err);
      setWebglSupported(false);
      return;
    }

    // Visibility Observer: Pause render when scrolled offscreen (without tearing down scene)
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Single Clock: Drive Three.js through GSAP Ticker
    const tickerCallback = (_time: number, deltaTime: number) => {
      if (isVisibleRef.current && sceneRef.current) {
        sceneRef.current.render(deltaTime / 1000);
      }
    };
    gsap.ticker.add(tickerCallback);

    // Resize Observer
    const handleResize = () => {
      if (!container || !sceneRef.current) return;
      sceneRef.current.resize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // GSAP ScrollTrigger: Pinned Reversible Scrub
    let scrollTriggerInstance: ScrollTrigger | null = null;
    const triggerTarget = heroSectionRef?.current ?? container;

    if (triggerTarget) {
      scrollTriggerInstance = ScrollTrigger.create({
        trigger: triggerTarget,
        start: "top top",
        end: "+=130%",
        pin: true,
        scrub: 0.6,
        onUpdate: (self) => {
          const p = self.progress;
          setScrollProgress(p);
          sceneRef.current?.setScrollProgress(p);

          if (p <= 0.2) {
            setScrollPhase("PHASE 1 // SOURCE TOKENS");
          } else if (p <= 0.45) {
            setScrollPhase("PHASE 2 // SYNTACTIC ACCELERATION");
          } else if (p <= 0.85) {
            setScrollPhase("PHASE 3 // EXPLODED IR LOWERING");
          } else {
            setScrollPhase("PHASE 4 // BYTECODE CONVERGENCE");
          }
        },
      });
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      gsap.ticker.remove(tickerCallback);
      scrollTriggerInstance?.kill();
      scene.dispose();
      sceneRef.current = null;
    };
  }, [webglSupported, reducedMotion, heroSectionRef]);

  // Pointer Raycasting & Drag Interaction Handlers (Directly on Canvas)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!sceneRef.current || isMobile) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      const hit: AstRaycastHit | null = sceneRef.current.raycast(normX, normY);
      if (hit) {
        // Toggle selection or select hit component
        setSelectedComponent((prev) => (prev === hit.componentId ? null : hit.componentId));
      }

      setIsDragging(true);
      sceneRef.current.startDrag(e.clientX, e.clientY);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [isMobile]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!sceneRef.current || isMobile) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (isDragging) {
        sceneRef.current.updateDrag(e.clientX, e.clientY);
      } else {
        const rect = canvas.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

        const hit = sceneRef.current.raycast(normX, normY);
        setHoveredComponent(hit ? hit.componentId : null);
      }
    },
    [isDragging, isMobile]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!sceneRef.current || isMobile) return;
      setIsDragging(false);
      sceneRef.current.endDrag();
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignore if capture was not active
      }
    },
    [isMobile]
  );

  const handlePointerLeave = useCallback(() => {
    if (!sceneRef.current) return;
    setHoveredComponent(null);
    if (isDragging) {
      setIsDragging(false);
      sceneRef.current.endDrag();
    }
  }, [isDragging]);

  // Button Selector Click Handler (Independent from canvas raycasting)
  const handleSelectComponent = useCallback((componentId: AstComponentId | null) => {
    setSelectedComponent(componentId);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden ${className}`}
      style={{ minHeight: "420px" }}
    >
      {/* 1. Top HUD Telemetry Banner */}
      <div className="absolute top-2 left-3 right-3 z-20 flex items-center justify-between text-[10px] font-mono pointer-events-none">
        <div className="flex items-center gap-2 px-2.5 py-1 bg-machine-surface/90 border border-machine-border/80 rounded backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-machine-accent animate-pulse" />
          <span className="text-machine-accent font-bold tracking-widest uppercase">
            {activeMetadata ? activeMetadata.code : "SYS.00"}
          </span>
          <span className="text-machine-border">|</span>
          <span className="text-machine-text-primary tracking-wider uppercase font-semibold">
            {activeMetadata ? activeMetadata.telemetry : "EXECUTION GRAPH // AST LATTICE"}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-machine-surface/90 border border-machine-border/80 rounded backdrop-blur-md text-machine-steel">
          <span className="text-machine-text-secondary">{scrollPhase}</span>
          <span className="text-machine-border">|</span>
          <span className="text-machine-accent font-bold">
            {Math.round(scrollProgress * 100).toString().padStart(3, "0")}%
          </span>
        </div>
      </div>

      {/* 2. Three.js Canvas / Fallback Blueprint */}
      <div className="relative w-full h-full flex items-center justify-center">
        {webglSupported && !reducedMotion ? (
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
            className="w-full h-full block"
            style={{
              cursor: isDragging ? "grabbing" : activeHighlight ? "pointer" : "grab",
              touchAction: "pan-y",
            }}
            aria-label="Interactive 3D Abstract Syntax Tree execution graph. Drag to rotate, click nodes to inspect."
          />
        ) : (
          <FallbackBlueprint
            label={
              reducedMotion
                ? "PREFERS-REDUCED-MOTION: COMPUTATIONAL AST BLUEPRINT"
                : "COMPUTATIONAL AST EXECUTION GRAPH // BLUEPRINT"
            }
          />
        )}
      </div>

      {/* 3. Bottom Component Selector Bar */}
      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1 bg-machine-surface/95 border border-machine-border/90 rounded-md backdrop-blur-md shadow-2xl max-w-[94vw] overflow-x-auto"
        role="group"
        aria-label="Computational AST Subsystem Controls"
      >
        <button
          type="button"
          onClick={() => handleSelectComponent(null)}
          onMouseEnter={() => setHoveredComponent(null)}
          className={`px-2.5 py-1 font-mono text-[9px] font-bold tracking-widest rounded transition-all duration-200 ${
            selectedComponent === null
              ? "bg-machine-accent text-black shadow-[0_0_12px_rgba(0,255,102,0.4)]"
              : "text-machine-steel hover:text-machine-text-primary hover:bg-machine-surface-elevated"
          }`}
          aria-pressed={selectedComponent === null}
        >
          ALL
        </button>

        {COMPONENTS.map((comp) => {
          const isSelected = selectedComponent === comp.id;
          const isHovered = hoveredComponent === comp.id;

          return (
            <button
              key={comp.id}
              type="button"
              onClick={() => handleSelectComponent(isSelected ? null : comp.id)}
              onMouseEnter={() => setHoveredComponent(comp.id)}
              onMouseLeave={() => setHoveredComponent(null)}
              className={`px-2.5 py-1 font-mono text-[9px] font-bold tracking-widest rounded transition-all duration-200 flex items-center gap-1.5 ${
                isSelected
                  ? "bg-machine-accent text-black shadow-[0_0_12px_rgba(0,255,102,0.4)]"
                  : isHovered
                  ? "bg-machine-surface-elevated text-machine-accent border border-machine-accent/40"
                  : "text-machine-steel hover:text-machine-text-primary hover:bg-machine-surface-elevated"
              }`}
              aria-pressed={isSelected}
              aria-label={`Select ${comp.label}: ${comp.description}`}
            >
              <span
                className={`w-1 h-1 rounded-full ${
                  isSelected ? "bg-black" : "bg-machine-accent"
                }`}
              />
              {comp.label}
            </button>
          );
        })}
      </div>

      {/* 4. Bottom-Right Engineering Spec Badge */}
      <div className="absolute bottom-3 right-3 z-10 hidden xl:flex items-center gap-3 text-[9px] font-mono text-machine-steel/80 pointer-events-none">
        <span>AST.DEPTH // 05</span>
        <span className="text-machine-border">/</span>
        <span>NODES // 32</span>
        <span className="text-machine-border">/</span>
        <span>CLOCK // 60HZ</span>
        <span className="text-machine-border">/</span>
        <span className="text-machine-accent font-semibold">IR: OPTIMIZED</span>
      </div>
    </div>
  );
};
