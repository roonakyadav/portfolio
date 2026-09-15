# Security

## Reporting a problem

Do not publish sensitive security information in a public issue. For issues affecting the contact form, external links, or deployment configuration, provide a minimal reproducible description and avoid sharing credentials or private tokens.

## Client-side boundaries

This is a static frontend. No private API credentials should be committed to the repository or exposed through client-side environment variables.

The contact form submits user-provided fields to the configured external form endpoint. The frontend performs validation before submission, but the receiving service must also enforce its own rate limits and server-side validation.

## Dependency hygiene

Dependencies are tracked with npm and reviewed through Dependabot proposals. CI runs linting, tests, and a production build for changes targeting `main`.
