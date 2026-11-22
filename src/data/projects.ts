export type PortfolioProject = {
  id: string;
  title: string;
  tagline: string;
  stack: string;
  description: string;
  links: {
    live?: string;
    code: string;
    isPrivate?: boolean;
  };
  image: string;
  cta: string;
};

export const projects: PortfolioProject[] = [
  {
    id: "01",
    title: "CONCORD",
    tagline: "Deterministic Environment Analysis Engine",
    stack: "Rust / Systems / Constraint Graphs",
    description:
      "Deterministic Rust engine modeling development environments as constraint graphs to detect runtime incompatibilities, missing services, and port conflicts before execution.",
    links: {
      code: "https://github.com/axonel/concord",
      isPrivate: false,
    },
    image: "/concord_portfolio_visual.png",
    cta: "VIEW PROJECT →",
  },
  {
    id: "02",
    title: "SENTINEL",
    tagline: "Autonomous Coding Agent Control Plane",
    stack: "Rust / Git Worktrees / Autonomous Agents",
    description:
      "Autonomous coding agent control plane enforcing isolated Git worktree execution, disk-level verification, and human review gates before candidate integration.",
    links: {
      code: "https://github.com/axonel/sentinel",
      isPrivate: false,
    },
    image: "/sentinel_portfolio_visual.png",
    cta: "VIEW PROJECT →",
  },
  {
    id: "03",
    title: "KNOT",
    tagline: "Desktop Developer Environment for AI Agents",
    stack: "Electron / React / TypeScript / SQLite",
    description:
      "Desktop developer environment providing process lifecycle management, remote connection verification, sanitized diagnostic telemetry, and persistent SQLite session coordination.",
    links: {
      code: "https://github.com/axonel/knot",
      isPrivate: true,
    },
    image: "/knot_portfolio_visual.png",
    cta: "VIEW PROJECT →",
  },
  {
    id: "04",
    title: "REGNANT",
    tagline: "Linux Desktop Control Surface for Android",
    stack: "Kotlin / Jetpack Compose / Node.js / Hyprland",
    description:
      "Native Android control surface communicating over authenticated local WebSocket channels to switch Hyprland workspaces, monitor telemetry, and launch developer projects.",
    links: {
      code: "https://github.com/axonel/regnant",
      isPrivate: false,
    },
    image: "/regnant_portfolio_visual.png",
    cta: "VIEW PROJECT →",
  },
];
