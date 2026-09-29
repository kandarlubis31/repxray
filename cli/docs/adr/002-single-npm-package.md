# ADR-002: Single npm Package for CLI + Server

**Status:** ✅ Accepted  
**Date:** 2026-06-20  
**Author:** AI-generated (based on codebase analysis)  

---

## Context

Repxray has two major components:
1. **CLI** — Command-line interface (`src/`) — scanner, formatter, uploader, TUI
2. **Server** — Express API server (`server/`) — REST API, database, web dashboard

These could be distributed as:
- **Single package** — One `package.json`, one `npm publish`
- **Separate packages** — `repxray-cli` and `repxray-server`, or `repxray` with `repxray-server` as optional dependency
- **Monorepo** — Workspace root with multiple packages

## Decision

Publish **everything as a single npm package** (`repxray`).

The single `package.json` at `cli/package.json` includes both `src/` and `server/` in its `"files"` field. The workspace root `package.json` is for development only (not published).

## Rationale

1. **`npx repxray go` just works** — One command downloads everything. No `npx repxray-server` needed.
2. **Version lock** — CLI and server versions are always in sync. No compatibility matrix.
3. **Simpler release process** — One `npm version` and `npm publish`.
4. **Smaller cognitive load** — New contributors see one package, not a multi-package architecture.
5. **The server is a thin API layer** — ~200 lines of Express routes. Not worth a separate package.

## Consequences

### Positive
- Zero-config `npx repxray go` experience
- Single version number for the entire product
- Easy to install globally: `npm install -g repxray`

### Negative
- Users who only want the CLI still download the server code
- Server and CLI share the same dependency tree (some deps like express aren't needed for CLI-only use)
- Can't version CLI and server independently

### Mitigations
- Server code is only ~60KB; the overhead is negligible
- Server dependencies (express, cors) are already needed by the CLI's `go` command
- If the server grows significantly, it can be extracted to a separate package in v2.0+

## References

- `package.json` — Main npm package config
- `package.json` fields: `"files": ["src/", "server/", "database/", ...]`
- [`CONTEXT.md`](../../CONTEXT.md) — Architecture overview
