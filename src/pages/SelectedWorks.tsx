import React, { useState, useRef, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import { projects, type PortfolioProject } from "@/data/projects";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ExternalLink, Lock, Terminal, Cpu, Database, ShieldCheck } from "lucide-react";

export default function SelectedWorks() {
  const [activeProjectIndex, setActiveProjectIndex] = useState<number | null>(null);
  const [knotModalOpen, setKnotModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewImgRefs = useRef<(HTMLImageElement | null)[]>([]);

  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const isHovering = useRef(false);
  const rafId = useRef<number | null>(null);
  const updatePreviewPosition = useCallback(() => {
    if (!isHovering.current) {
      rafId.current = null;
      return;
    }

    const preview = previewRef.current;
    if (preview) {
      const previewWidth = 420;
      const previewHeight = 236;

      // Smart offset: position to the right or left of cursor to never obscure title or link
      let targetX = mousePos.current.x + 32;
      if (targetX + previewWidth > window.innerWidth - 24) {
        targetX = mousePos.current.x - previewWidth - 32;
      }
      targetX = Math.max(20, Math.min(targetX, window.innerWidth - previewWidth - 20));

      let targetY = mousePos.current.y - previewHeight / 2;
      targetY = Math.max(20, Math.min(targetY, window.innerHeight - previewHeight - 20));

      // Inertial smoothing (lerp)
      currentPos.current.x += (targetX - currentPos.current.x) * 0.1;
      currentPos.current.y += (targetY - currentPos.current.y) * 0.1;

      gsap.set(preview, {
        x: currentPos.current.x,
        y: currentPos.current.y,
      });
    }

    rafId.current = requestAnimationFrame(updatePreviewPosition);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      if (!rafId.current && isHovering.current) {
        rafId.current = requestAnimationFrame(updatePreviewPosition);
      }
    },
    [updatePreviewPosition]
  );

  const handleRowMouseEnter = useCallback(
    (index: number, e: React.MouseEvent) => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      setActiveProjectIndex(index);
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      if (!isHovering.current) {
        isHovering.current = true;
        currentPos.current.x = e.clientX + 32;
        currentPos.current.y = e.clientY - 118;

        const preview = previewRef.current;
        if (preview) {
          gsap.killTweensOf(preview);
          gsap.set(preview, {
            visibility: "visible",
            x: currentPos.current.x,
            y: currentPos.current.y,
          });
          gsap.to(preview, {
            opacity: 1,
            scale: 1,
            duration: reduced ? 0.05 : 0.35,
            ease: "power2.out",
          });
        }

        if (!rafId.current) {
          rafId.current = requestAnimationFrame(updatePreviewPosition);
        }
      }

      // Crossfade preview images smoothly
      previewImgRefs.current.forEach((img, i) => {
        if (!img) return;
        gsap.killTweensOf(img);
        if (i === index) {
          gsap.to(img, {
            opacity: 1,
            scale: 1,
            duration: reduced ? 0.05 : 0.4,
            ease: "power2.out",
          });
        } else {
          gsap.to(img, {
            opacity: 0,
            scale: 1.05,
            duration: reduced ? 0.05 : 0.3,
            ease: "power2.out",
          });
        }
      });
    },
    [updatePreviewPosition]
  );

  const handleRowMouseLeave = useCallback(() => {
    // Only deactivate if leaving the whole table or handled by container leave
  }, []);

  const handleTableMouseLeave = useCallback(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    isHovering.current = false;
    setActiveProjectIndex(null);

    const preview = previewRef.current;
    if (preview) {
      gsap.killTweensOf(preview);
      gsap.to(preview, {
        opacity: 0,
        scale: 0.95,
        duration: reduced ? 0.05 : 0.25,
        ease: "power2.in",
        onComplete: () => {
          if (!isHovering.current && preview) {
            preview.style.visibility = "hidden";
          }
        },
      });
    }

    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  const handleProjectAction = (project: PortfolioProject, e?: React.MouseEvent) => {
    if (project.links.isPrivate) {
      if (e) e.preventDefault();
      setKnotModalOpen(true);
    } else {
      window.open(project.links.code, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section
      id="projects"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleTableMouseLeave}
      className="relative w-full bg-black text-white py-24 sm:py-32 md:py-36 overflow-hidden select-none"
      aria-label="Selected Projects"
    >
      <div className="max-w-5xl mx-auto px-6 sm:px-8 md:px-12">
        {/* Section Header with Syne uppercase and Fraunces italic serif */}
        <div className="mb-14 sm:mb-20 md:mb-24">
          <span className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.25em] text-zinc-400 block mb-3">
            <span className="text-terracotta font-semibold">(01)</span> — Selected Works
          </span>
          <h2 className="text-[clamp(2.5rem,6vw,5.5rem)] font-bold tracking-tight text-white leading-none">
            <span className="font-syne uppercase">Featured</span>{" "}
            <span className="font-serif italic font-normal text-terracotta">Projects</span>
          </h2>
        </div>

        {/* Thin top horizontal divider */}
        <div className="w-full border-t border-zinc-800/80 mb-2" />

        {/* Editorial Project Showcase List */}
        <div className="flex flex-col w-full">
          {projects.map((project, index) => {
            const isHovered = activeProjectIndex === index;
            const isPrivate = project.links.isPrivate;

            return (
              <article
                key={project.id}
                onMouseEnter={(e) => handleRowMouseEnter(index, e)}
                onMouseLeave={handleRowMouseLeave}
                onClick={(e) => handleProjectAction(project, e)}
                className="group relative flex flex-col md:flex-row items-start md:items-baseline justify-between py-10 sm:py-12 md:py-14 border-b border-zinc-800/80 transition-colors duration-300 cursor-pointer"
              >
                {/* Subtle project-row hover indicator on far left */}
                <div
                  aria-hidden="true"
                  className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 w-0.5 h-0 group-hover:h-8 bg-terracotta rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                />

                {/* Left: Sequential Number */}
                <div className="w-12 sm:w-16 font-mono text-xs sm:text-sm text-terracotta shrink-0 pt-1 group-hover:brightness-110 transition-all duration-200">
                  {project.id}
                </div>

                {/* Center / Main Column: Title + Description + Stack */}
                <div className="flex-1 min-w-0 pr-0 md:pr-10 mt-3 md:mt-0">
                  <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-syne uppercase leading-none transition-transform duration-300 group-hover:translate-x-1.5">
                    {project.title}
                  </h3>

                  {/* Concise, verified technical description */}
                  <p className="text-zinc-400 font-sans text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mt-3 sm:mt-4">
                    {project.description}
                  </p>

                  {/* Stack Pills */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {project.stack.split(" / ").map((tech) => (
                      <span
                        key={tech}
                        className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-400 bg-zinc-900/60 border border-zinc-800/80 rounded-full px-2.5 py-0.5"
                      >
                        {tech}
                      </span>
                    ))}
                    {isPrivate && (
                      <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-400 bg-zinc-900/80 border border-zinc-700/80 rounded-full px-2.5 py-0.5 flex items-center gap-1">
                        <Lock size={10} className="text-zinc-400" />
                        Internal Preview
                      </span>
                    )}
                  </div>

                  {/* Touch / Mobile Thumbnail Preview (Restrained, responsive, non-hover) */}
                  <div className="block lg:hidden mt-5 rounded-xl overflow-hidden border border-zinc-800/80 group-hover:border-terracotta/40 transition-colors duration-300 aspect-video w-full max-w-md bg-zinc-950">
                    <img
                      src={project.image}
                      alt={`${project.title} Interface Preview`}
                      loading="lazy"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>

                {/* Right: VIEW PROJECT → Action Link */}
                <div className="mt-6 md:mt-0 shrink-0 self-start md:self-auto pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProjectAction(project, e);
                    }}
                    aria-label={`View ${project.title} project`}
                    className="font-mono text-xs sm:text-sm uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors duration-200 flex items-center gap-2 group/btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded py-1 px-1"
                  >
                    <span>VIEW PROJECT</span>
                    <span className="inline-block transition-all duration-200 group-hover:translate-x-1.5 text-zinc-400 group-hover:text-terracotta">
                      →
                    </span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Floating Desktop Hover Image Preview (Typography-First, Restrained, Non-blocking) */}
      <div
        ref={previewRef}
        aria-hidden="true"
        className="hidden lg:block fixed pointer-events-none z-50 rounded-xl overflow-hidden shadow-2xl border border-terracotta/35 bg-zinc-950 w-[420px] aspect-video"
        style={{
          top: 0,
          left: 0,
          visibility: "hidden",
          opacity: 0,
          transform: "scale(0.95)",
          boxShadow:
            "0 25px 60px -12px rgba(0, 0, 0, 0.8), 0 10px 20px -8px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div className="relative w-full h-full overflow-hidden bg-zinc-950">
          {projects.map((p, idx) => (
            <img
              key={p.id}
              ref={(el) => {
                previewImgRefs.current[idx] = el;
              }}
              src={p.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-top opacity-0"
              style={{ willChange: "opacity, transform" }}
            />
          ))}
          {/* Subtle bottom vignette */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      </div>

      {/* Knot Internal Project Details Destination Dialog */}
      <Dialog open={knotModalOpen} onOpenChange={setKnotModalOpen}>
        <DialogContent className="bg-zinc-950 border border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-8">
          <DialogHeader className="text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-terracotta font-semibold">
                03 / AXONEL
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Lock size={11} className="text-terracotta" /> Private Repository
              </span>
            </div>
            <DialogTitle className="text-3xl sm:text-4xl font-extrabold font-syne tracking-tight uppercase text-white">
              KNOT
            </DialogTitle>
            <DialogDescription className="text-zinc-400 font-sans text-sm sm:text-base leading-relaxed">
              Desktop developer environment providing process lifecycle management, remote connection verification, sanitized diagnostic telemetry, and persistent SQLite session coordination.
            </DialogDescription>
          </DialogHeader>

          {/* Knot Preview Showcase */}
          <div className="my-4 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/60 aspect-video shadow-2xl">
            <img
              src="/knot_portfolio_visual.png"
              alt="Knot Desktop Agent Workspace"
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Verified Implemented Architecture */}
          <div className="space-y-4 text-xs sm:text-sm font-sans mt-2">
            <h4 className="font-mono text-xs uppercase tracking-widest text-zinc-300 font-semibold flex items-center gap-2">
              <Terminal size={14} className="text-zinc-400" /> Implemented Systems
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40">
                <div className="flex items-center gap-2 text-zinc-200 font-semibold mb-1">
                  <Cpu size={14} className="text-zinc-400" />
                  <span>Desktop Commander Controller</span>
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Managed child process spawning with PID tracking, targeted termination, graceful SIGINT/SIGTERM escalation, and lifecycle cleanup.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40">
                <div className="flex items-center gap-2 text-zinc-200 font-semibold mb-1">
                  <ShieldCheck size={14} className="text-zinc-400" />
                  <span>Connection Verification</span>
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Real-time detection of broker pairing and remote connection states directly from process telemetry output.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40">
                <div className="flex items-center gap-2 text-zinc-200 font-semibold mb-1">
                  <Terminal size={14} className="text-zinc-400" />
                  <span>Log Sanitization & Redaction</span>
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Live redaction of JWT tokens, bearer authorization headers, and private credentials before terminal rendering.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40">
                <div className="flex items-center gap-2 text-zinc-200 font-semibold mb-1">
                  <Database size={14} className="text-zinc-400" />
                  <span>Persistent SQLite Engine</span>
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Versioned schema migrations, WAL journaling, and foreign-key referential integrity across projects, sessions, messages, and audit events.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 font-mono">
            <span>AXONEL / KNOT • ELECTRON + REACT + SQLITE</span>
            <button
              type="button"
              onClick={() => setKnotModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-white text-black font-semibold text-xs tracking-wider uppercase hover:bg-zinc-200 transition-colors"
            >
              CLOSE
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}