# Repxray

Scan any project folder — get metadata (tech stack, features, structure), save to database. CLI, Web Dashboard, Terminal UI. Pick whatever works.

---

## Features

- **Auto scan** — Reads `package.json`, `README.md`, `requirements.txt`, etc. Detects tech stack, frameworks, features
- **Batch scan** — Scan all sub-folders with `scan --all`
- **Web Dashboard** — Browser UI to view, search, export, delete projects
- **Terminal UI** — Navigate with arrow keys, export JSON/MD with one keypress
- **`repxray go`** — One command to start server + scan + upload
- **AI Agent ready** — AI assistants can scan projects for you (see `AGENTS.md`)

---

## Quick Start

### Easiest — just run it
```bash
npx repxray go ./test-sample
# Downloads → starts server → scans → uploads → done
```

### Global install (skip the download every time)
```bash
npm install -g repxray
repxray go ./test-sample
```

### Development (clone repo)
```bash
git clone <repo-url>
cd repxray
pnpm install
pnpm run link
pnpm server
repxray scan ./test-sample
```

Open `http://localhost:7890` for Web Dashboard, or `repxray ui` for Terminal UI.

---

## How It Works

```
[Target Repo] → repxray scan → [Repxray Server] → [SQLite Database]
                                    ↑
                              localhost:7890
```

### Project Structure

```
repxray/
├── cli/
│   ├── src/               # CLI commands (scan, view, list, go, etc.)
│   │   ├── index.js       # Entry point
│   │   ├── scanner.js     # Project scanner
│   │   ├── formatter.js   # JSON/MD formatter
│   │   ├── uploader.js    # HTTP uploader
│   │   └── ui.js          # Terminal UI (Ink + React)
│   ├── server/            # Express API server
│   │   ├── public/        # Web Dashboard (HTML/CSS/JS)
│   │   └── src/
│   │       ├── server.js  # Entry point
│   │       ├── database.js
│   │       ├── scanner.js
│   │       ├── routes/projects.js
│   │       └── utils/validator.js
│   ├── database/          # SQLite database
│   │   └── repxray.sqlite
│   └── package.json       # Single npm package (repxray)
├── package.json           # Workspace root
├── AGENTS.md              # For AI assistants
└── README.md
```

---

## CLI Commands

| Command | Description |
|---------|-------------|
| `repxray go <folder>` | **Auto start server + scan**, one command |
| `repxray scan <folder>` | Scan project + upload to database |
| `repxray scan --all <dir>` | Scan all sub-folders |
| `repxray list` | List all projects |
| `repxray view <id>` | View project details |
| `repxray search <keyword>` | Search projects by name, stack, or description |
| `repxray export json` | Export all projects as JSON |
| `repxray export md` | Export all projects as Markdown |
| `repxray upload <file>` | Upload a JSON file |
| `repxray delete <id>` | Delete a project |
| `repxray ui` | Interactive Terminal UI |
| `repxray --help` | Show help |

### Examples

```bash
# Quickest — auto server + scan
repxray go ./my-project

# Just scan (server must be running)
repxray scan ./my-project

# Batch scan
repxray scan --all ./projects/

# Search for React projects
repxray search react

# Export everything
repxray export md
```

### Output

```bash
$ repxray scan ./test-sample

[Repxray] Scanning folder: ./test-sample

  Name: test-sample
  Status: Active
  Stack: express, react, tailwindcss, prisma
  Features: 5 found

[Repxray] Uploading to server...
[Repxray] Done! Project ID: 1
```

### `repxray go` — Auto Server + Scan

```bash
$ repxray go ./test-sample

[Repxray] Checking server...
[Repxray] Server not running. Starting server...
  Waiting for server...
[Repxray] Server is ready!

[Repxray] Scanning folder: ./test-sample
  ...
[Repxray] Done! Project ID: 1
```

Good for:
- **First time** — just run it, no setup
- **Quick demo** — show Repxray in 5 seconds
- **Play around** — scan, note the ID, done

---

## Terminal UI

```
repxray ui
```

| Key | Action |
|-----|--------|
| `↑/↓` / `j/k` | Navigate projects |
| `J` | Export JSON (print + exit) |
| `M` | Export Markdown (print + exit) |
| `s` | Cycle sort mode |
| `d` | Delete project |
| `/` | Search |
| `q` / `Esc` | Quit |

---

## Web Dashboard

Open `http://localhost:7890` when the server is running.

- Project list with search + filter
- Details: status, tech stack, features, timestamps
- Export: copy JSON/Markdown to clipboard
- Scan directly from your browser
- Delete with confirmation

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/projects` | Create/update project |
| `GET` | `/api/projects` | List all projects |
| `GET` | `/api/projects/:id` | Get project details |
| `DELETE` | `/api/projects/:id` | Delete a project |
| `POST` | `/api/scan` | Scan a project by path |
| `POST` | `/api/scan/all` | Batch scan |
| `GET` | `/api/export/json` | Export as JSON |
| `GET` | `/api/export/markdown` | Export as Markdown |
| `GET` | `/api/health` | Health check |

---

## AI Agent

`AGENTS.md` has instructions for AI coding assistants (Codebuff, Cursor, Copilot, etc.).

Just tell the agent:
- *"Help me summarize this project with repxray"*
- *"Save this project to repxray database"*
- *"Scan this project with repxray"*

The agent will run `repxray scan` and report back.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REPXRAY_PORT` | `7890` | Server port (auto fallback +10 if busy) |
| `API_URL` | `http://localhost:7890` | Server URL for CLI connection |
| `DATABASE_PATH` | `./cli/database/repxray.sqlite` | SQLite database path |

If port 7890 is in use, server tries 7891, 7892, ... 7899.
The detected port is automatically used by `repxray go`.

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** SQLite (sql.js)
- **CLI:** Node.js, Ink + React (TUI)
- **Web UI:** Vanilla HTML/CSS/JS (no build)
- **License:** MIT
