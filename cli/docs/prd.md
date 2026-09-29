# Repxray — Product Requirements Document (PRD)

> **Version:** 1.0  
> **Status:** Draft  
> **Author:** AI-generated (based on codebase analysis)  
> **Last updated:** June 20, 2026

---

## 1. Product Vision

**Repxray** is a **project intelligence system** that enables developers and AI agents to instantly scan, catalog, and explore any project folder. One command reveals the full picture — tech stack, features, structure, and status — stored in a searchable database accessible via CLI, Terminal UI, or Web Dashboard.

### Mission Statement

> "Make every project immediately understandable — by humans and by AI — with zero configuration."

---

## 2. Target Audience & Personas

### Primary Personas

| Persona | Description | Key Need |
|---------|-------------|----------|
| **Individual Developer** | Solo dev managing 5-20 projects locally | Quickly remember what each project does, what stack it uses, what features it has |
| **Tech Lead / Manager** | Oversees team repos and wants visibility | Search across projects by stack, export reports, track project status |
| **Open Source Maintainer** | Maintains multiple OSS projects | Catalog projects, generate documentation, onboard new contributors |
| **AI Coding Agent** | Codebuff, Cursor, Copilot, etc. | Scan and summarize a project without reading every file |

### Secondary Personas

| Persona | Description | Key Need |
|---------|-------------|----------|
| **Freelancer** | Juggles many client projects | Quickly context-switch between projects, remember tech decisions |
| **Student** | Learning by exploring open source | Understand project structure and stack before diving in |

---

## 3. Current Features (v1.0.x)

### Must-Have (MVP)

| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| 🔍 **Project Scanning** | P0 | ✅ Done | Reads `package.json`, `README.md`, `requirements.txt`, `go.mod`, `Cargo.toml`, etc. Extracts name, description, tech stack, features, folder structure |
| 📦 **Batch Scan** | P1 | ✅ Done | `scan --all` scans all sub-directories in a parent folder |
| ⚡ **One-Command Flow** | P0 | ✅ Done | `repxray go <folder>` — auto-starts server if needed, scans, uploads |
| 📋 **CLI List & View** | P0 | ✅ Done | `repxray list` shows all projects, `repxray view <id>` shows details |
| 🔎 **CLI Search** | P1 | ✅ Done | Search by name, stack, or description |
| 📤 **Export (JSON/MD)** | P1 | ✅ Done | `repxray export json` and `repxray export md` |
| 🗑️ **Delete** | P1 | ✅ Done | `repxray delete <id>` removes a project |
| 📄 **Upload JSON** | P2 | ✅ Done | `repxray upload <file>` imports a JSON scan |

### Web Dashboard (v1.0.x)

| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| 🏠 **Project List** | P0 | ✅ Done | Sidebar with search, stats, progress bars |
| 📄 **Detail Panel** | P0 | ✅ Done | Overview cards, description, tech stack (categorized), features, summary tabs |
| 🔍 **Scan from Browser** | P1 | ✅ Done | Path input + scan/scan-all buttons |
| 🗑️ **Delete with Confirm** | P1 | ✅ Done | Modal confirmation before delete |
| 📋 **Copy JSON/MD** | P1 | ✅ Done | One-click copy to clipboard |
| ⌨️ **Command Palette** | P2 | ✅ Done | Cmd+K / Ctrl+K search overlay |
| 🎨 **Dark Theme** | P1 | ✅ Done | Full design system with layered backgrounds, accent colors |
| 📱 **Responsive** | P2 | ✅ Done | Adaptive layout for mobile/tablet/desktop |
| 🔄 **Auto-Refresh** | P2 | ✅ Done | Polls server every 10s for updates |

### Terminal UI (v1.0.x)

| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| 🖥️ **Project Browser** | P0 | ✅ Done | Side-by-side list + detail panel |
| ⌨️ **Keyboard Navigation** | P0 | ✅ Done | Arrow keys, vim keys, search, sort |
| 📤 **Export JSON/MD** | P1 | ✅ Done | Press J/M to print and exit |
| 🔄 **Sort Modes** | P2 | ✅ Done | By name, date, stack count |
| 🔍 **Search** | P2 | ✅ Done | Press `/` to filter |

---

## 4. Future Features (v2.x Roadmap)

### Short-term (v1.1 — v1.5)

| Feature | Priority | Description |
|---------|----------|-------------|
| **Better GitHub Integration** | P1 | Scan GitHub repos directly via URL; push results as PR comments |
| **Project Comparisons** | P2 | Side-by-side comparison of two or more projects |
| **Custom Tags** | P1 | User-defined tags beyond auto-detected features |
| **Export PDF Reports** | P2 | Generate printable project summary reports |
| **CLI Autocomplete** | P2 | Shell autocomplete for `repxray` commands |
| **Unit Tests** | P1 | Test suite for scanner, formatter, uploader, API routes |
| **CI/CD Pipeline** | P1 | GitHub Actions for testing on PR, auto-publish on tag |

### Medium-term (v2.0)

| Feature | Priority | Description |
|---------|----------|-------------|
| **Multi-User Support** | P2 | Separate workspaces, shareable project links |
| **Plugins System** | P2 | Custom detectors for non-standard project types (Docker, Ansible, etc.) |
| **Webhook Notifications** | P2 | Slack/Discord/Email when new projects are scanned |
| **Scan History** | P2 | Track how a project's metadata changes over time |
| **AI-Generated README** | P2 | Generate/improve README based on scan results |
| **Dashboard Charts** | P2 | Stack popularity, feature distribution, activity timeline |

### Long-term (v3.0+)

| Feature | Priority | Description |
|---------|----------|-------------|
| **API Tokens** | P2 | Secure API access for CI/CD pipelines and remote scanning |
| **Cloud Sync** | P3 | Cross-machine project database sync |
| **VSCode Extension** | P3 | View project intelligence without leaving the editor |
| **Team Workspaces** | P3 | Shared project catalogs for teams |
| **Marketplace** | P3 | Community plugins & detectors |

---

## 5. User Stories

### Core Workflow

```
As a developer,
I want to scan a project with one command,
So that I can see its tech stack, features, and structure without reading config files manually.

As a tech lead,
I want to search across all my projects by technology,
So that I can find which projects use a specific framework or library.

As an AI agent,
I want to scan a project and get structured metadata,
So that I can understand the project's context and help the user effectively.
```

### Edge Cases

```
As a user,
I want the server to auto-detect an available port,
So that I don't have to manually configure when ports are in use.

As a user,
I want batch scan to continue even if some subdirectories fail,
So that one broken project doesn't block the entire scan.

As a user,
I want to scan a project without a server running first,
So that I can get started immediately without setup.
```

---

## 6. Technical Requirements

### Performance

| Requirement | Target | Notes |
|-------------|--------|-------|
| Scan time | < 2s for typical project | Most projects are < 1000 files |
| Batch scan | < 10s for 50 subdirectories | Sequential scan (could be parallelized) |
| API response | < 200ms for list, < 100ms for detail | SQLite queries on small datasets |
| Dashboard load | < 1s initial render | Vanilla JS, no framework overhead |
| Package size | < 300kB unpacked | Currently 215kB |
| Auto-refresh | Poll every 10s, no visible jank | Background polling with change detection |

### Compatibility

| Requirement | Target |
|-------------|--------|
| Node.js | >= 18 (for native `fetch`) |
| npm | >= 8 |
| OS | Windows, macOS, Linux |
| Browser | Chrome, Firefox, Safari, Edge (last 2 versions) |
| Terminal | Windows Terminal, iTerm2, GNOME Terminal, etc. (UTF-8 support) |

### Security

| Requirement | Notes |
|-------------|-------|
| No authentication | Currently single-user, local-only |
| No remote code execution | Scan only reads files, doesn't execute |
| Input sanitization | `validator.js` sanitizes all API inputs |
| Rate limiting | None yet (local-only mitigates risk) |

---

## 7. Success Metrics

| Metric | Current (v1.0.4) | Target (v2.0) |
|--------|------------------|---------------|
| **npm downloads** | — | 1,000+/month |
| **GitHub stars** | — | 100+ |
| **Projects scanned** | — | 10,000+ total |
| **Supported languages** | 10+ | 20+ (add Ruby, Kotlin, Swift, etc.) |
| **CLI commands** | 12 | 15+ |
| **Test coverage** | 0% | 80%+ |
| **Reported bugs** | — | < 5 open |
| **Time to scan** | < 2s | < 1s (parallelize where possible) |

---

## 8. Architecture & Data Model

### Current Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│ Target Repo │ ──→ │ repxray scan │ ──→ │ Repxray Server   │
│ ./project   │     │ (CLI)        │     │ localhost:7890   │
└─────────────┘     └──────────────┘     └────────┬─────────┘
                                                   │
                                            ┌──────▼──────┐
                                            │   SQLite DB  │
                                            │ repxray.sqlite│
                                            └─────────────┘
```

### Database Schema

```sql
projects (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    description TEXT DEFAULT '',
    stack       TEXT DEFAULT '[]',      -- JSON array
    status      TEXT DEFAULT '',
    progress    TEXT DEFAULT '',
    features    TEXT DEFAULT '[]',      -- JSON array
    directory   TEXT UNIQUE NOT NULL,
    summary_json TEXT DEFAULT '{}',     -- JSON object
    summary_md  TEXT DEFAULT '',
    created_at  DATETIME DEFAULT (datetime('now')),
    updated_at  DATETIME DEFAULT (datetime('now'))
)
```

### Package Structure

```
repxray/
├── cli/
│   ├── src/               # CLI commands (CommonJS)
│   ├── server/            # Express API server (CommonJS)
│   │   ├── public/        # Web Dashboard (vanilla HTML/CSS/JS)
│   │   └── src/
│   ├── database/          # SQLite file
│   └── package.json       # Published to npm
├── AGENTS.md              # AI agent instructions
├── CONTEXT.md             # Project context for AI agents
└── docs/prd.md            # ← This file
```

---

## 9. Release History

| Version | Date | Highlights |
|---------|------|------------|
| v1.0.0 | — | Initial release: scan, list, view, server, dashboard |
| v1.0.1 | — | Bug fixes, README improvements |
| v1.0.2 | — | GitHub Actions CI/CD |
| v1.0.3 | — | README badges, formatting, repo URLs |
| v1.0.4 | June 2026 | Latest release |

---

## 10. Known Issues & Trade-offs

### Current Issues

1. **Duplicated scanner code** — `src/scanner.js` and `server/src/scanner.js` have identical logic. Refactoring needed.
2. **TUI delete bug** — `ui.js`'s `doDelete()` uses `fetchFromApi` which sends GET, not DELETE. Delete in TUI may fail.
3. **No test suite** — All testing is manual. Risky for refactoring.
4. **No package-lock** — Dependencies are loosely versioned with `^` ranges.
5. **Server lifecycle** — No automatic shutdown after `repxray go`. Server runs until killed manually.

### Design Trade-offs

| Decision | Trade-off |
|----------|-----------|
| Single npm package | Simple `npx repxray` usage, but couples CLI and server versions |
| SQLite (sql.js) | Zero setup, but not suitable for multi-user or remote access |
| Vanilla JS dashboard | Zero build step, but harder to maintain as features grow |
| CommonJS (except Ink) | Works without transpilation, but Ink v7+ requires ESM dance |
| No authentication | Simple local use, but can't support multi-user without redesign |

---

## 11. Competitive Landscape

| Tool | How Repxray Differs |
|------|---------------------|
| **`cloc`** | Counts lines of code — Repxray extracts semantic metadata (stack, features) |
| **`tokei`** | Fast code statistics — Repxray focuses on project intelligence |
| **`github-linguist`** | Language detection only — Repxray detects frameworks, features, dependencies |
| **`degit`** | Project scaffolding — Repxray is for existing projects |
| **`npkill`** | Find node_modules to delete — Repxray catalogs, not cleans |

---

## 12. Appendix

### Glossary

| Term | Definition |
|------|------------|
| **Scan** | Process of reading a project folder and extracting metadata |
| **Stack** | List of technologies detected in a project |
| **Feature** | Capability extracted from README bullet points |
| **Go** | One-command flow: start server → scan → upload |
| **TUI** | Terminal User Interface (Ink + React) |
| **Dashboard** | Web-based UI served by the Express server |

### Related Documents

- [`CONTEXT.md`](../CONTEXT.md) — Architecture, conventions, and technical decisions
- [`AGENTS.md`](../AGENTS.md) — AI agent instructions (Indonesian)
- [`AGENTS.en.md`](../AGENTS.en.md) — AI agent instructions (English)
- [`README.md`](../README.md) — User-facing documentation (Indonesian)
- [`README.en.md`](../README.en.md) — User-facing documentation (English)
