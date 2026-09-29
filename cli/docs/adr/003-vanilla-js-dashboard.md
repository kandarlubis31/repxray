# ADR-003: Vanilla JS for Web Dashboard (No Build Step)

**Status:** ✅ Accepted  
**Date:** 2026-06-20  
**Author:** AI-generated (based on codebase analysis)  

---

## Context

The Web Dashboard needs to display project data, handle search, filtering, and provide a rich UI. Options:

- **React / Vue / Svelte** — Component frameworks requiring a build step
- **Vanilla JS** — Plain HTML + CSS + JavaScript
- **Incremental framework** — Alpine.js, HTMX, etc.

## Decision

Use **vanilla HTML, CSS, and JavaScript** for the Web Dashboard. No build step, no framework, no npm packages for the frontend.

## Rationale

1. **Zero build step** — The dashboard is served directly from `server/public/`. No Webpack, Vite, or Babel needed.
2. **Tightly coupled with the server** — The dashboard is served by the same Express server that hosts the API. Adding a build step adds complexity to the server setup.
3. **Small scope** — The dashboard is a single-page app with ~600 lines of JS. A framework adds more complexity than value at this scale.
4. **No SSR needed** — The dashboard is purely client-side, fetching data from the same-origin API.
5. **Easy to debug** — Open `server/public/app.js` and edit. Refresh browser. Done.

## Consequences

### Positive
- Instant edit-refresh cycle during development
- No framework churn — the dashboard won't break due to dependency updates
- Smaller package size (no React/Vue in the tarball)
- Accessible to any developer who knows HTML/CSS/JS

### Negative
- No component model — DOM manipulation is manual
- State management is ad-hoc (global variables)
- Harder to maintain as the app grows (no TypeScript, no linting)
- All the code is in one file (`app.js` at ~700 lines)

### Mitigations
- The code is organized into clear sections (state, API, DOM refs, render, toast, palette, events)
- If the dashboard grows significantly, consider migrating to a lightweight framework (Preact + HTM could be added without a build step)
- CSS uses custom properties for theming (already implemented)

## Code Conventions for the Dashboard

- Use `var` (legacy — maintain consistency)
- Cache DOM references via `document.getElementById` in a `dom` object
- Use template strings for HTML generation
- One main CSS file with clear section headers
- All functionality is event-driven (no routing, no SPA framework)

## References

- `server/public/index.html` — Dashboard HTML
- `server/public/style.css` — Design system (700+ lines, custom properties)
- `server/public/app.js` — Application logic (~700 lines)
- [`CONTEXT.md`](../../CONTEXT.md) — Project conventions
