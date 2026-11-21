import React from "react";

interface FallbackBlueprintProps {
  className?: string;
  label?: string;
}

/**
 * FallbackBlueprint
 *
 * Polished SVG mechanical blueprint displayed when WebGL is unavailable
 * or when the user has enabled prefers-reduced-motion.
 */
export const FallbackBlueprint: React.FC<FallbackBlueprintProps> = ({
  className = "",
  label = "SPEC: MECHANICAL SCHEMATIC // 001",
}) => {
  return (
    <div
      className={`relative w-full h-full flex items-center justify-center select-none ${className}`}
      role="img"
      aria-label="Mechanical Artifact Schematic Blueprint"
    >
      <svg
        viewBox="0 0 600 600"
        className="w-full h-full max-w-[540px] max-h-[540px] overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="blueprint-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00FF66" stopOpacity="0.12" />
            <stop offset="60%" stopColor="#00FF66" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#00FF66" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient center glow */}
        <circle cx="300" cy="300" r="240" fill="url(#blueprint-glow)" />

        {/* Outer Stator Ring */}
        <circle
          cx="300"
          cy="300"
          r="230"
          fill="none"
          stroke="#27272A"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
        <circle
          cx="300"
          cy="300"
          r="215"
          fill="none"
          stroke="#94A3B8"
          strokeWidth="2"
          strokeOpacity="0.6"
        />

        {/* Outer Measurement Ticks */}
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = (i * 10 * Math.PI) / 180;
          const isMajor = i % 3 === 0;
          const r1 = isMajor ? 200 : 206;
          const r2 = 215;
          const x1 = 300 + Math.cos(angle) * r1;
          const y1 = 300 + Math.sin(angle) * r1;
          const x2 = 300 + Math.cos(angle) * r2;
          const y2 = 300 + Math.sin(angle) * r2;
          return (
            <line
              key={`tick-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isMajor ? "#EDEDEB" : "#3F3F46"}
              strokeWidth={isMajor ? "1.5" : "1"}
            />
          );
        })}

        {/* Outer Gimbal Ring */}
        <circle
          cx="300"
          cy="300"
          r="175"
          fill="none"
          stroke="#94A3B8"
          strokeWidth="1.5"
          strokeDasharray="18 4"
        />

        {/* Rotor Turbine Hub & Blades */}
        <circle
          cx="300"
          cy="300"
          r="130"
          fill="none"
          stroke="#3F3F46"
          strokeWidth="1.5"
        />
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i * 22.5 * Math.PI) / 180;
          const x1 = 300 + Math.cos(angle) * 70;
          const y1 = 300 + Math.sin(angle) * 70;
          const x2 = 300 + Math.cos(angle + 0.15) * 130;
          const y2 = 300 + Math.sin(angle + 0.15) * 130;
          return (
            <line
              key={`blade-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#64748B"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Central Computation Core */}
        <circle
          cx="300"
          cy="300"
          r="65"
          fill="#121216"
          stroke="#27272A"
          strokeWidth="2"
        />
        <polygon
          points="300,250 343,275 343,325 300,350 257,325 257,275"
          fill="none"
          stroke="#94A3B8"
          strokeWidth="1.5"
        />
        <polygon
          points="300,265 330,282 330,318 300,335 270,318 270,282"
          fill="#00FF66"
          fillOpacity="0.15"
          stroke="#00FF66"
          strokeWidth="1.5"
        />
        <circle cx="300" cy="300" r="8" fill="#00FF66" />

        {/* 4 Articulated Calipers */}
        {[
          { x: 300, y: 70, deg: 0 },
          { x: 530, y: 300, deg: 90 },
          { x: 300, y: 530, deg: 180 },
          { x: 70, y: 300, deg: 270 },
        ].map((caliper, i) => (
          <g key={`caliper-${i}`}>
            <circle cx={caliper.x} cy={caliper.y} r="5" fill="#00FF66" />
            <line
              x1={caliper.deg % 180 === 0 ? caliper.x : caliper.x > 300 ? 510 : 90}
              y1={caliper.deg % 180 === 0 ? (caliper.y > 300 ? 510 : 90) : caliper.y}
              x2={caliper.deg % 180 === 0 ? caliper.x : caliper.x > 300 ? 470 : 130}
              y2={caliper.deg % 180 === 0 ? (caliper.y > 300 ? 470 : 130) : caliper.y}
              stroke="#00FF66"
              strokeWidth="2"
            />
          </g>
        ))}

        {/* Crosshair Alignment Guides */}
        <line x1="300" y1="20" x2="300" y2="580" stroke="#27272A" strokeWidth="0.8" strokeDasharray="2 4" />
        <line x1="20" y1="300" x2="580" y2="300" stroke="#27272A" strokeWidth="0.8" strokeDasharray="2 4" />

        {/* Technical Coordinate Annotations */}
        <text x="32" y="45" fill="#8B8B95" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="2">
          SYS.DIAG // STATIC_SCHEMATIC
        </text>
        <text x="32" y="60" fill="#00FF66" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1.5">
          STATUS: ONLINE [PBR_BYPASS]
        </text>
        <text x="440" y="45" fill="#8B8B95" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1.5">
          RAD: 3.30m
        </text>
        <text x="440" y="60" fill="#8B8B95" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1.5">
          FINS: 16 BLADES
        </text>
        <text x="32" y="565" fill="#8B8B95" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1.5">
          LOC: 12.9716° N, 77.5946° E
        </text>
        <text x="440" y="565" fill="#EDEDEB" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1.5">
          CALIPER: NOMINAL
        </text>
      </svg>

      {/* Schematic footer label */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 tech-label text-[10px] text-machine-text-secondary whitespace-nowrap">
        {label}
      </div>
    </div>
  );
};

export default FallbackBlueprint;
