# Architecture

## Runtime

The portfolio is a Vite-powered React 18 application. `src/main.tsx` mounts the application, while `src/App.tsx` owns providers and routing.

## Page composition

`src/pages/Index.tsx` composes the visual sections of the home page. The larger sections are isolated into page-level components so interaction-heavy implementations do not need to own global application state.

## Data boundaries

Profile identity, social links, statistics, and featured projects live under `src/data/`. Components consume that data rather than duplicating personal metadata across the UI.

## Interaction model

Framer Motion handles component-level entrance and transform animation. Lenis owns smooth scrolling. Specialized visual components such as `LiquidEther`, `StrokeText`, and `TextPressure` encapsulate heavier visual effects.

## Quality boundaries

Pure validation logic is kept in `src/lib/contactValidation.ts` so it can be tested without mounting the UI. Vitest tests data contracts and validation behavior, while the CI workflow verifies linting, tests, and the production build.

## Design principle

The site deliberately separates content from presentation: portfolio content should be replaceable without rewriting animation or layout primitives.
