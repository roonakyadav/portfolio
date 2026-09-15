export type PortfolioProject = {
  id: string;
  title: string;
  stack: string;
  description: string;
  links: {
    live?: string;
    code: string;
  };
  image: string;
  cta: string;
};

export const projects: PortfolioProject[] = [
  {
    id: "001",
    title: "OpenEnv — AI Incident Response",
    stack: "Python / Docker / LLM Evaluation / SRE",
    description:
      "An environment for evaluating whether AI agents can diagnose distributed-system incidents without chasing misleading logs or reward-hacking shortcuts.",
    links: {
      live: "https://roonakyadav-ai-incident-openenv-final.hf.space",
      code: "https://github.com/roonakyadav/openenv",
    },
    image: "/sample.png",
    cta: "LIVE DEMO",
  },
  {
    id: "002",
    title: "CodeMap",
    stack: "Python / AST / CLI / Static Analysis",
    description:
      "An offline codebase analysis tool that maps project structure, language distribution, Python complexity, dependency imports, and engineering hotspots without executing the target code.",
    links: {
      code: "https://github.com/roonakyadav/CodeMap",
    },
    image: "/sample.png",
    cta: "SOURCE",
  },
  {
    id: "003",
    title: "RepoMind",
    stack: "FastAPI / Next.js / AST / tree-sitter",
    description:
      "A repository processing system that ingests GitHub code, parses multiple languages, creates logical chunks, estimates tokens, and builds dependency maps for downstream code intelligence.",
    links: {
      code: "https://github.com/roonakyadav/GitParse",
    },
    image: "/sample.png",
    cta: "SOURCE",
  },
  {
    id: "004",
    title: "Portfolio",
    stack: "React / TypeScript / Vite / Framer Motion",
    description:
      "This portfolio itself: a responsive, interaction-heavy site combining custom scroll behavior, animated sections, project presentation, and a production-oriented frontend toolchain.",
    links: {
      live: "https://ronakyadav-v1.netlify.app",
      code: "https://github.com/roonakyadav/portfolio",
    },
    image: "/sample.png",
    cta: "LIVE SITE",
  },
];
