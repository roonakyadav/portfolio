# Contributing

This repository is primarily a personal portfolio, but the codebase is kept in a form that supports focused engineering contributions.

## Development

Use Node.js 18+ and install dependencies with `npm install`.

```bash
npm run dev
npm run lint
npm run test
npm run build
```

## Changes

Keep changes narrow and explain the reason for behavioral changes. Prefer existing components and utilities before introducing new dependencies.

Use Conventional Commit-style messages such as:

```text
feat: add accessible project filters
fix: prevent contact form duplicate submissions
perf: defer non-critical visual effects
```

## Pull requests

Every pull request should describe what changed, why it changed, and how it was verified. UI changes should include the affected viewport or interaction states when relevant.
