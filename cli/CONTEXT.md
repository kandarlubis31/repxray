# Repxray — Context

> **What this is:** A living document that captures Repxray's domain, architecture, conventions, and decision history.  
> **Who it's for:** AI agents (Codebuff, Cursor, Copilot, etc.) that need to understand and work on this project without reading every file.  
> **How to update:** Keep this synced as the project evolves — especially architecture decisions, naming conventions, and known issues.

---

## Domain & Purpose

Repxray is a **project intelligence system**. It scans any project folder, extracts metadata (name, tech stack, features, folder structure), generates a summary (JSON + Markdown), and saves it to a database.

**Core use cases:**
- Quickly catalog and understand unknown projects
- Search across multiple projects by tech stack / features / name
- Export project metadata as JSON or Markdown
- AI agents can scan projects on behalf of the user

---

## Architecture Overview

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

**Key architectural decisions:**
- CLI (`src/`) & Server (`server/`) live in **a single npm package** (`repxray`)
- Communication: CLI → HTTP POST/GET → Express Server → SQLite (sql.js)
- No separate database process — SQLite runs in-process via sql.js
- The server is an Express.js app that can be started independently or auto-launched by `repxray go`
- The Terminal UI (TUI) uses **Ink v7+** (ESM-only, dynamically imported) + **React**

---

## File Layout

```
repxray/
├── cli/                          # Single npm package root
│   ├── src/                      # CLI command implementations
│   │   ├── index.js              # Entry point — command routing (scan, go, list, view, etc.)
│   │   ├── scanner.js            # Project scanner — reads config files, extracts metadata
│   │   ├── formatter.js          # JSON & Markdown summary generators
│   │   ├── uploader.js           # HTTP client — POST scan results to server
│   │   └── ui.js                 # Terminal UI (Ink + React, ESM dynamic import)
│   ├── server/                   # Express API server
│   │   ├── public/               # Web Dashboard — vanilla HTML/CSS/JS (no build step)
│   │   │   ├── index.html        # Dashboard HTML
│   │   │   ├── style.css         # Design system & styles
│   │   │   └── app.js            # Application logic (vanilla JS, no framework)
│   │   └── src/
│   │       ├── server.js         # Server entry — Express app, routes, port detection
│   │       ├── database.js       # SQLite wrapper (sql.js) — CRUD, save to file
│   │       ├── scanner.js        # Server-side scanner (duplicates CLI scanner)
│   │       ├── routes/
│   │       │   └── projects.js   # REST routes: projects CRUD, export
│   │       └── utils/
│   │           └── validator.js  # Input validation & sanitization
│   ├── database/                 # SQLite database storage
│   │   └── repxray.sqlite        # Actual database file
│   ├── package.json              # npm package config (repxray)
│   ├── LICENSE                   # MIT license
│   ├── README.md                 # Bahasa Indonesia docs
│   ├── README.en.md              # English docs
│   └── CONTEXT.md                # ← This file
├── AGENTS.md                     # AI agent instructions (Indonesian)
├── AGENTS.en.md                  # AI agent instructions (English)
├── .github/workflows/            # CI/CD (e.g. publish.yml)
└── package.json                  # Workspace root
```

---

## Key Terminology

| Term | Meaning |
|------|---------|
| **Scan** | Read project folder, extract metadata (name, stack, features, structure) |
| **Go** | Auto-start server + scan in one command (`repxray go <folder>`) |
| **Upload** | Send scan results via HTTP POST to the server |
| **Stack** | Array of detected technologies (dependencies + frameworks) |
| **Features** | Bullet points extracted from README's Features section |
| **Summary** | Generated JSON or Markdown version of the scan |
| **TUI** | Terminal UI — interactive project browser with Ink + React |
| **Dashboard** | Web UI — browser-based project viewer |
| **Batch Scan** | Scan all subdirectories in a parent folder (`scan --all`) |

### Scan Metadata Fields

| Field | Type | Source |
|-------|------|--------|
| `name` | string | Folder name or `package.json#name` |
| `description` | string | README first paragraph or `package.json#description` |
| `stack` | string[] | Dependencies from package.json, composer.json, requirements.txt, etc. |
| `status` | string | `"Active"`/`"Unknown"` based on config files present |
| `progress` | string | `"In Development"`/`"Unknown"` |
| `features` | string[] | Bullet points under "Features"/"Fitur" sections in README |
| `directory` | string | Absolute path to the scanned folder |
| `structure` | string | Tree representation (depth-3) of folder contents |
| `summary_json` | object | Structured JSON summary |
| `summary_md` | string | Markdown summary |

---

## Data Flow (repxray go)

1. **Health check** — CLI pings `GET /api/health` on the server
2. **Auto-start** — If server not running, spawn it as detached child process
3. **Port detection** — Server prints `[PORT] <number>` to stdout; CLI captures it
4. **Wait for ready** — CLI polls `/api/health` up to 15 seconds
5. **Scan** — CLI scans the target folder using `scanner.js`
6. **Generate summaries** — `formatter.js` creates JSON + Markdown
7. **Upload** — `uploader.js` POSTs to `POST /api/projects`
8. **Server stores** — routes/projects.js upserts into SQLite
9. **Done** — CLI prints the project ID

---

## Technology Choices

| Component | Choice | Why |
|-----------|--------|-----|
| Database | SQLite (sql.js) | Zero setup, single file, no server process |
| Server | Express.js | Minimal, well-known, good for small APIs |
| CLI | Node.js (no framework) | Keep it lightweight, no build step |
| TUI | Ink v7+ + React | Rich terminal UI with React components |
| Web UI | Vanilla HTML/CSS/JS | Zero build step, no framework lock-in |
| HTTP | Native `fetch` (Node 18+) | No need for `node-fetch` or `axios` |

### Why not...

- **PostgreSQL / MySQL?** — Overkill; Repxray is a local tool, not a multi-user service.
- **TypeScript?** — The project started as JS for simplicity; no current plans to migrate.
- **Separate CLI & Server packages?** — Combined into one for easy `npx repxray` usage.
- **Build step for Web UI?** — Deliberately avoided; the dashboard is simple enough for vanilla JS.

---

## Coding Conventions

### JavaScript
- **Module system**: CommonJS (`require`/`module.exports`) for CLI and server
- **ESM dynamic import**: Used only for Ink + React (ESM-only packages) in `ui.js`
- **Async/await**: Preferred over raw promises or callbacks
- **Error handling**: `try/catch` with descriptive error messages; `handleError()` helper for CLI
- **No transpilation**: Run directly with Node.js (no Babel, no TypeScript compiler)

### Style
- **Indentation**: 2 spaces
- **Quotes**: Single quotes preferred (but consistent within files)
- **Semicolons**: Required
- **Naming**: camelCase for variables/functions, kebab-case for files
- **Console output**: `[Repxray]` prefix for tool messages
- **No `.gitignore` for the project itself** — be careful not to check in `node_modules/`

### Web UI (Vanilla JS)
- `var` used throughout (legacy — maintain consistency in `app.js`)
- Functions stored in objects (e.g., `API.getProjects`, `dom.*`)
- DOM references cached via `document.getElementById`
- No framework, no build step, no npm packages for frontend

### TUI (Ink + React)
- Ink v7+ is ESM-only — must be dynamically imported with `await import()`
- React functional components with hooks (`useState`, `useEffect`, `useMemo`, `useInput`, `useApp`)
- Arrow keys, vim keys (`j`/`k`), and keyboard shortcuts
- `Box`, `Text`, `Static` from Ink for layout

---

## Port Detection Strategy

The server tries ports starting from `REPXRAY_PORT` (default: 7890) up to +9. The first available port wins.

```
┌─ tries 7890 ─┐
│   in use?     │── yes ──→ try 7891 ──→ ... ──→ try 7899
│   free?       │── no  ──→ listen on that port, print [PORT] <number>
└───────────────┘
```

The CLI (`go` command) captures `[PORT] <number>` from server stdout to build the correct `API_URL`.

---

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    stack TEXT DEFAULT '[]',         -- JSON array stored as string
    status TEXT DEFAULT '',
    progress TEXT DEFAULT '',
    features TEXT DEFAULT '[]',      -- JSON array stored as string
    directory TEXT UNIQUE NOT NULL,  -- Unique per project
    summary_json TEXT DEFAULT '{}',  -- JSON object stored as string
    summary_md TEXT DEFAULT '',
    created_at DATETIME DEFAULT (datetime('now')),
    updated_at DATETIME DEFAULT (datetime('now'))
);
```

**Note:** `stack`, `features`, and `summary_json` are stored as JSON strings and parsed by `JSON.parse()` on read.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/projects` | List all projects (parsed) |
| `POST` | `/api/projects` | Create/update project (upsert by directory) |
| `GET` | `/api/projects/:id` | Get project by ID |
| `DELETE` | `/api/projects/:id` | Delete project |
| `POST` | `/api/scan` | Scan a path and upsert into DB |
| `POST` | `/api/scan/all` | Batch scan subdirectories |
| `GET` | `/api/export/json` | Export all as JSON |
| `GET` | `/api/export/markdown` | Export all as Markdown |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REPXRAY_PORT` | `7890` | Starting port for server (auto-retries +10) |
| `API_URL` | `http://localhost:7890` | Server base URL used by CLI |
| `DATABASE_PATH` | `./cli/database/repxray.sqlite` | Path to SQLite database file |
| `SERVER_PORT` | `7890` | Alias for `REPXRAY_PORT` (prefer `REPXRAY_PORT`) |

---

## Known Issues & Gotchas

1. **Duplicated scanner logic** — Both `src/scanner.js` (CLI) and `server/src/scanner.js` (server) have nearly identical scanner code. Changes must be made in both files.
2. **Duplicated GitHub URL parsing** — Both `src/github.js` and `server/src/server.js` have GitHub URL parsing logic. Same pattern as the scanner duplication.
3. **Duplicated server-start logic** — Both `go()` and `scanGitHub()` in `src/index.js` have identical server-start + port detection code.
4. **Ink v7+ ESM requirement** — `ui.js` must use dynamic `await import()` for Ink and React. Static `require()` will fail.
5. **Database file management** — The database file is created lazily on first access. If the `database/` directory doesn't exist, it's created automatically. The DB is saved to disk on every write operation (`saveDatabase()`).
6. **Windows compatibility** — Line endings (CRLF vs LF) cause Git warnings. The project works on Windows but be mindful of path separators.
7. **`ui.js` delete bug** — The `doDelete()` function calls `fetchFromApi` which uses `DELETE` method, but the route expects `DELETE /api/projects/:id`. The `fetchFromApi` function always uses `GET` — delete may fail.
8. **No package-lock in repo** — Dependencies are resolved at install time; versions are `^` ranges in package.json.
9. **Server process lifecycle** — When `repxray go` starts the server, it's detached (`unref()`) so it outlives the CLI process. There's no automatic server shutdown — the user must kill it manually.

---

## Project Scanner — How It Works

1. **Priority files** — Reads config files in order: `README.md`, `package.json`, `composer.json`, `requirements.txt`, `go.mod`, `Cargo.toml`, etc.
2. **README parsing** — Extracts description (first paragraph after title), features (bullet points under Features/Fitur heading), and status.
3. **`package.json` parsing** — Extracts name, description, dependencies (all go into `stack`), and detects frameworks via keyword matching.
4. **Framework detection** — Keyword-based map: `react` → "React", `express` → "Express.js", `tailwindcss` → "Tailwind CSS", etc.
5. **Folder structure** — Recursive tree generator (max depth 3), ignores `.git`, `node_modules`, `dist`, etc.
6. **Status heuristic** — If any config file found → "Active" + "In Development". Otherwise → "Unknown".

### Supported Languages & Files

| File | Language | Dependencies Extracted |
|------|----------|----------------------|
| `package.json` | JavaScript/TypeScript | `dependencies` + `devDependencies` |
| `composer.json` | PHP | `require` |
| `requirements.txt` | Python | Lines (split by `==`) |
| `go.mod` | Go | Module require lines |
| `Cargo.toml` | Rust | `[dependencies]` section |
| `pyproject.toml` | Python | (framework detection only) |
| `Gemfile` | Ruby | (framework detection only) |
| `build.gradle` | Java/Kotlin | (framework detection only) |
| `CMakeLists.txt` | C/C++ | (detection only) |
| `pom.xml` | Java | (detection only) |

---

## AI Agent Integration

This project is designed to be AI-agent-friendly. The key principles:

1. **`AGENTS.md`** — Contains instructions for AI agents on how to interact with Repxray. Agents should read this first.
2. **`CONTEXT.md`** (this file) — Provides the full project context for agents to understand architecture and conventions.
3. **Simple CLI** — All operations are single commands: `repxray scan`, `repxray go`, `repxray view`, etc.
4. **No build step** — The project runs directly with Node.js, making it easy for agents to test changes.

**Typical agent workflow:**
1. Read `AGENTS.md` and `CONTEXT.md`
2. Read relevant source files
3. Make changes (if needed) following existing conventions
4. Run `repxray scan ./some-folder` to test
5. Commit and push

---

## Testing

The project currently has **no formal test suite**. Testing is manual:
- Run `node src/index.js scan ./some-folder` to test CLI scanning
- Run `node server/src/server.js` to test server
- Run `node src/index.js go ./some-folder` to test the full pipeline
- Open `http://localhost:7890` to test the web dashboard
- Run `node src/index.js ui` to test the Terminal UI

---

## Build & Release

```bash
# Development
npm run server        # Start server separately
node src/index.js     # Run CLI directly

# Publishing (npm)
npm version patch     # Bump version (creates git tag)
npm publish           # Publish to npm
git push --tags       # Push tags to GitHub
```

The package includes:
- `src/` — CLI source
- `server/` — Server source
- `database/` — SQLite file
- `README.md` and `README.en.md` — Documentation

---

## Related Files

| File | Purpose |
|------|---------|
| `README.md` | Bahasa Indonesia documentation |
| `README.en.md` | English documentation |
| `AGENTS.md` | AI agent instructions (Indonesian) |
| `AGENTS.en.md` | AI agent instructions (English) |
| `CONTEXT.md` | **This file** — project context for AI agents |
| `LICENSE` | MIT license |
| `package.json` | Workspace root config |
| `cli/package.json` | npm package config (`repxray`) |
| `.github/workflows/publish.yml` | CI/CD for npm publish |
