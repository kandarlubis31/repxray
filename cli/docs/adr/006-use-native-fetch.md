# ADR-006: Use Native `fetch` Instead of an HTTP Client Library

**Status:** ✅ Accepted  
**Date:** 2026-06-20  
**Author:** AI-generated (based on codebase analysis)  

---

## Context

The CLI needs to make HTTP requests to the server (upload, list, view, search, delete, export). Options:

- **`node-fetch`** — Popular fetch polyfill for Node.js
- **`axios`** — Full-featured HTTP client
- **Native `fetch`** — Built into Node.js since v18
- **Node `http` module** — Low-level, no convenience methods

## Decision

Use **Node.js native `fetch`** (available since Node.js v18).

## Rationale

1. **Zero dependencies** — Native `fetch` is built into Node.js. No `npm install` needed.
2. **Standard API** — Same API as browser `fetch()`. Familiar to web developers.
3. **Sufficient for Repxray** — Repxray only does simple GET/POST requests with JSON bodies. No streaming, no retry logic, no interceptors needed.
4. **Future-proof** — Native `fetch` is stable and well-supported in Node.js 18+.

## Consequences

### Positive
- Smaller package size (no `node-fetch` or `axios` dependency)
- Simpler dependency tree (fewer transitive dependencies)
- Works out of the box on any Node.js 18+ installation

### Negative
- **Requires Node.js 18+** — Users on Node.js 16 or earlier can't use Repxray
- No built-in request timeout in older Node.js versions (mitigated with `AbortSignal.timeout()`)
- No error retry, no interceptors, no progress events

### Mitigations
- Node.js 16 is EOL as of September 2023. Requiring 18+ is reasonable for a 2026 tool.
- Timeout is handled via `AbortSignal.timeout(ms)` (available in Node.js 18+)
- Error handling in `uploader.js` catches network errors and HTTP error status codes
- If more advanced HTTP features are needed (retries, streaming), consider adding a thin wrapper the specific feature rather than installing axios

## Usage Pattern

```javascript
// uploader.js
async function uploadProject(apiUrl, projectData) {
    const url = `${apiUrl.replace(/\/+$/, '')}/api/projects`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorBody}`);
    }
    
    return response.json();
}
```

## References

- `src/uploader.js` — HTTP upload via native fetch
- `src/index.js` — Multiple fetch calls for list, view, search, delete, export
- `package.json` — `"engines"` field (should specify Node.js >= 18)
