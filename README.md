# Repxray

Scans a project folder, extracts metadata about it, and stores the result in a
local database you can browse. Ships as a CLI, a web dashboard, and an interactive
terminal UI.

Published on npm as [`repxray`](https://www.npmjs.com/package/repxray).

## What it does

Point it at a folder and it records the project name, detected tech stack, and
description, then makes that searchable. Useful when you have dozens of projects
scattered across a drive and no memory of what each one was.

```
Target repo  →  repxray scan  →  Repxray server (SQLite)  →  CLI / dashboard / TUI
```

## Quick start

```bash
npx repxray go ./test-sample
```

`go` starts the local server if it is not already running, scans the folder, and
uploads the result in one step. The dashboard is then on
**http://localhost:7890** — the port is auto-detected, so a busy port shifts to the
next free one.

Install globally to skip the download each time:

```bash
npm i -g repxray
repxray go ./some-project
```

## Commands

| Command | Purpose |
| :--- | :--- |
| `repxray go <folder>` | Start the server, scan, and upload in one command |
| `repxray scan <folder>` | Scan a project and upload it |
| `repxray scan --all <dir>` | Scan every sub-folder under a directory |
| `repxray list` | List all stored projects |
| `repxray view <id>` | Show one project's details |
| `repxray search <keyword>` | Search by name, stack, or description |
| `repxray export json` | Export everything as JSON |
| `repxray export md` | Export everything as Markdown |
| `repxray upload <file>` | Import a JSON file |
| `repxray delete <id>` | Delete a project |
| `repxray ui` | Interactive terminal UI |

## Repository layout

```
cli/                  the published npm package (`bin` points at src/index.js)
  src/index.js        command dispatch
  src/scanner.js      walks a folder and extracts project metadata
  src/formatter.js    output formatting for list/view/export
  src/uploader.js     sends a scan result to the server
  src/ui.js           interactive terminal UI
  src/github.js       GitHub metadata lookup
  server/             local HTTP server + vanilla-JS dashboard
  database/           SQLite file created at runtime
  docs/adr/           architecture decision records
  docs/prd.md         product notes
test-sample/          small fixture project used by the demo above
.github/workflows/    publish pipeline
```

This is a pnpm workspace (`pnpm-workspace.yaml`).

## Development

```bash
pnpm install
cd cli
node src/index.js scan ../test-sample   # scan one folder
node src/index.js                        # start the server + dashboard
```

## Design notes

The decisions that shaped the implementation are written down in
[`cli/docs/adr/`](cli/docs/adr/):

| ADR | Decision |
| :--- | :--- |
| 001 | SQLite through `sql.js` instead of a native driver |
| 002 | Ship as a single npm package rather than a monorepo of packages |
| 003 | Dashboard written in vanilla JS, no framework |
| 004 | Auto-detect a free port instead of hard-coding one |
| 005 | CommonJS/ESM hybrid build |
| 006 | Use the native `fetch` API |

## License

MIT — see [LICENSE](LICENSE).
