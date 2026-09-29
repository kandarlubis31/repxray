# ADR-005: CommonJS with ESM Dynamic Import for Terminal UI

**Status:** ✅ Accepted  
**Date:** 2026-06-20  
**Author:** AI-generated (based on codebase analysis)  

---

## Context

The Repxray CLI is written in CommonJS (CJS). The Terminal UI (TUI) uses **Ink v7+** and **React**, which are ESM-only packages — they cannot be `require()`'d.

Options:
- **Convert entire project to ESM** — Add `"type": "module"` to package.json, convert all `require()` to `import`
- **Stay CommonJS + dynamic import** — Use `await import()` for ESM packages only
- **Downgrade Ink** — Use Ink v4 (CJS-compatible) but lose newer features

## Decision

Stay with **CommonJS for the main codebase** and use **dynamic `await import()`** for Ink and React in the TUI module only.

```javascript
// ui.js — the only file that uses ESM packages
async function launchUI() {
    var ink = await import('ink');
    var React = await import('react');
    // ... use ink and React normally
}
```

## Rationale

1. **Minimal change** — Only `ui.js` needs the ESM dance. The rest of the project (20+ files) stays CJS.
2. **Ink 7+ features** — Ink v7+ has better performance, new components, and active maintenance.
3. **CJS is simpler for CLI tools** — No top-level await issues, no ESM/CJS interop headaches for the main code.
4. **TUI is optional** — Users who don't use `repxray ui` never trigger the ESM import. The CLI core (scan, list, view, go) works without Ink.

## Consequences

### Positive
- The CLI core remains simple CJS (works with `require()`, `__dirname`, `__filename`)
- No need to rewrite 20+ source files
- The ESM dance is isolated to one file

### Negative
- `ui.js` must use `var` instead of `const`/`let` in some patterns (legacy convention)
- The dynamic import adds ~200ms latency to TUI startup
- Mixed module system can confuse bundlers (but Repxray doesn't bundle)
- React hooks inside `ui.js` are constructed differently (no JSX, using `React.createElement`)

### Mitigations
- The dynamic import only happens once, at TUI startup
- `React.createElement` (JSX-free) is used throughout `ui.js` — this is documented in the code
- If the TUI grows significantly, consider extracting it into a separate ESM module

## Pattern Used in ui.js

```javascript
// 1. Dynamic import ESM packages
var ink = await import('ink');
var React = await import('react');

// 2. Destructure tools from ink
var render = ink.render;
var Box = ink.Box;
var Text = ink.Text;
var useInput = ink.useInput;
var useApp = ink.useApp;
var Static = ink.Static;

// 3. Use React hooks
var useState = React.useState;
var useEffect = React.useEffect;
var useMemo = React.useMemo;
var h = React.createElement;  // No JSX — use createElement

// 4. Create elements with h()
return h(Box, { flexDirection: 'column' },
    h(Text, { bold: true }, 'Hello'),
    h(Text, {}, 'World')
);
```

## References

- `src/ui.js` — The only file using ESM dynamic import
- [`CONTEXT.md`](../../CONTEXT.md) — Coding conventions (TUI section)
