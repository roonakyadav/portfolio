import React from "react";

interface FallbackBlueprintProps {
  className?: string;
  label?: string;
}

/**
 * FallbackBlueprint
 *
 * Precision SVG schematic blueprint of THE EXECUTION GRAPH (AST Lattice)
 * displayed when WebGL is unavailable or when the user has enabled prefers-reduced-motion.
 */
export const FallbackBlueprint: React.FC<FallbackBlueprintProps> = ({
  className = "",
  label = "SPEC: COMPUTATIONAL AST SCHEMATIC // 001",
}) => {
  return (
    <div
      className={`relative w-full h-full flex items-center justify-center select-none ${className}`}
      role="img"
      aria-label="Computational AST Execution Graph Blueprint"
    >
      <svg
        viewBox="0 0 600 600"
        className="w-full h-full max-w-[540px] max-h-[540px] overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="ast-blueprint-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00FF66" stopOpacity="0.12" />
            <stop offset="60%" stopColor="#00FF66" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#00FF66" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Center Glow */}
        <circle cx="300" cy="300" r="260" fill="url(#ast-blueprint-glow)" />

        {/* Coordinate Grid Background */}
        <g stroke="#20242c" strokeWidth="0.8" opacity="0.6">
          <line x1="80" y1="150" x2="520" y2="150" strokeDasharray="4 8" />
          <line x1="80" y1="300" x2="520" y2="300" strokeDasharray="4 8" />
          <line x1="80" y1="450" x2="520" y2="450" strokeDasharray="4 8" />
          <line x1="150" y1="80" x2="150" y2="520" strokeDasharray="4 8" />
          <line x1="300" y1="80" x2="300" y2="520" strokeDasharray="4 8" />
          <line x1="450" y1="80" x2="450" y2="520" strokeDasharray="4 8" />
        </g>

        {/* Conduit Bus Tracks Linking Nodes */}
        <g stroke="#3a4454" strokeWidth="2.5" fill="none">
          {/* Root -> Decl1 */}
          <path d="M 160 380 L 190 280 L 220 220" />
          {/* Root -> Lexer Sink */}
          <path d="M 160 380 L 320 420 L 460 410" strokeDasharray="6 4" />
          {/* Decl1 -> StmtMain */}
          <path d="M 220 220 L 280 260 L 330 280" />
          {/* Decl1 -> TypeDef */}
          <path d="M 220 220 L 260 160 L 330 140" />
          {/* TypeDef -> Decl2 */}
          <path d="M 330 140 L 400 160 L 440 220" />
          {/* StmtMain -> Expr1 */}
          <path d="M 330 280 L 350 340 L 370 380" />
          {/* Expr1 -> BinOp */}
          <path d="M 370 380 L 410 400 L 450 410" />
        </g>

        {/* Glowing Optical Core Channels */}
        <g stroke="#00FF66" strokeWidth="1" fill="none" opacity="0.8">
          <path d="M 160 380 L 190 280 L 220 220" />
          <path d="M 220 220 L 280 260 L 330 280" />
          <path d="M 330 280 L 350 340 L 370 380" />
        </g>

        {/* 1. Root Anchor: PARSE_ROOT (Hexagonal prism at 160, 380) */}
        <polygon
          points="160,345 195,365 195,405 160,425 125,405 125,365"
          fill="#181a1f"
          stroke="#00FF66"
          strokeWidth="2"
        />
        <polygon
          points="160,355 185,370 185,400 160,415 135,400 135,370"
          fill="#0c0e12"
          stroke="#828f9e"
          strokeWidth="1"
        />
        <text
          x="160"
          y="392"
          textAnchor="middle"
          fill="#00FF66"
          fontFamily="monospace"
          fontSize="9"
          fontWeight="bold"
        >
          PARSE_ROOT
        </text>

        {/* 2. Declaration Modules: FUNCTION_DECL [01] & [02] */}
        {/* Decl 1 */}
        <rect
          x="160"
          y="190"
          width="120"
          height="45"
          rx="4"
          fill="#181a1f"
          stroke="#828f9e"
          strokeWidth="1.5"
        />
        <rect x="165" y="195" width="110" height="18" rx="2" fill="#0c0e12" />
        <text
          x="220"
          y="208"
          textAnchor="middle"
          fill="#EDEDEB"
          fontFamily="monospace"
          fontSize="9"
          fontWeight="bold"
        >
          FN_DECL [01]
        </text>
        <line x1="165" y1="225" x2="275" y2="225" stroke="#00FF66" strokeWidth="1.5" />

        {/* Decl 2 */}
        <rect
          x="400"
          y="195"
          width="110"
          height="40"
          rx="4"
          fill="#181a1f"
          stroke="#828f9e"
          strokeWidth="1.5"
        />
        <text
          x="455"
          y="218"
          textAnchor="middle"
          fill="#94A3B8"
          fontFamily="monospace"
          fontSize="8"
          fontWeight="bold"
        >
          FN_DECL [02]
        </text>

        {/* TypeDef Block */}
        <rect
          x="285"
          y="120"
          width="90"
          height="35"
          rx="3"
          fill="#181a1f"
          stroke="#4a5568"
          strokeWidth="1.2"
        />
        <text
          x="330"
          y="142"
          textAnchor="middle"
          fill="#94A3B8"
          fontFamily="monospace"
          fontSize="8"
        >
          TYPE_DEF
        </text>

        {/* 3. Statements: STMT_LIST (Main Highway at 280, 260) */}
        <rect
          x="270"
          y="255"
          width="130"
          height="48"
          rx="4"
          fill="#181a1f"
          stroke="#00FF66"
          strokeWidth="1.5"
        />
        <text
          x="335"
          y="280"
          textAnchor="middle"
          fill="#EDEDEB"
          fontFamily="monospace"
          fontSize="9"
          fontWeight="bold"
        >
          STMT_LIST [MAIN]
        </text>
        <rect x="280" y="288" width="110" height="6" fill="#00FF66" opacity="0.3" />

        {/* 4. Expressions: EXPR_EVAL & BINARY_OP */}
        <rect
          x="320"
          y="360"
          width="100"
          height="40"
          rx="3"
          fill="#181a1f"
          stroke="#828f9e"
          strokeWidth="1.2"
        />
        <text
          x="370"
          y="384"
          textAnchor="middle"
          fill="#EDEDEB"
          fontFamily="monospace"
          fontSize="9"
        >
          EXPR [EVAL]
        </text>

        {/* Binary Operator Diamond */}
        <polygon
          points="460,385 485,410 460,435 435,410"
          fill="#181a1f"
          stroke="#00FF66"
          strokeWidth="1.5"
        />
        <text
          x="460"
          y="414"
          textAnchor="middle"
          fill="#00FF66"
          fontFamily="monospace"
          fontSize="11"
          fontWeight="bold"
        >
          +
        </text>

        {/* Precision Crosshairs & Corner Ticks */}
        <g stroke="#94A3B8" strokeWidth="1" opacity="0.7">
          {/* Top-left crosshair */}
          <line x1="60" y1="75" x2="60" y2="95" />
          <line x1="50" y1="85" x2="70" y2="85" />
          {/* Top-right crosshair */}
          <line x1="540" y1="75" x2="540" y2="95" />
          <line x1="530" y1="85" x2="550" y2="85" />
          {/* Bottom-left crosshair */}
          <line x1="60" y1="515" x2="60" y2="535" />
          <line x1="50" y1="525" x2="70" y2="525" />
          {/* Bottom-right crosshair */}
          <line x1="540" y1="515" x2="540" y2="535" />
          <line x1="530" y1="525" x2="550" y2="525" />
        </g>

        {/* Technical Coordinate Scale */}
        <text
          x="60"
          y="110"
          fill="#4a5568"
          fontFamily="monospace"
          fontSize="8"
          letterSpacing="1"
        >
          AST.GRID // [X: 4.6, Y: 2.8, Z: 6.8]
        </text>
        <text
          x="60"
          y="500"
          fill="#4a5568"
          fontFamily="monospace"
          fontSize="8"
          letterSpacing="1"
        >
          TOPOLOGY // HIERARCHICAL_DAG
        </text>
        <text
          x="540"
          y="500"
          textAnchor="end"
          fill="#00FF66"
          fontFamily="monospace"
          fontSize="8"
          letterSpacing="1"
        >
          IR // OPTIMIZED
        </text>
      </svg>

      {/* Blueprint Title Badge */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-machine-surface/90 border border-machine-border rounded flex items-center gap-2 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-machine-accent animate-pulse" />
        <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-machine-steel uppercase">
          {label}
        </span>
      </div>
    </div>
  );
};
