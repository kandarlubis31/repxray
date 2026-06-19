# Repxray — AI Agent Instructions

[![npm version](https://img.shields.io/npm/v/repxray?color=blue&logo=npm)](https://www.npmjs.com/package/repxray)
[![npm downloads](https://img.shields.io/npm/dm/repxray?color=blue&logo=npm)](https://www.npmjs.com/package/repxray)

Repxray is a project intelligence system. Scans a folder, extracts metadata (name, tech stack, features, structure), generates a summary, uploads to database.

📦 **[View on npm](https://www.npmjs.com/package/repxray)**

---

## Triggers for AI Agents

When a user says any of these, run `repxray scan` or `repxray go`:

**English triggers:**
- "Help me summarize this project with repxray"
- "Apply repxray to this project"
- "Save this project to repxray database"
- "Scan this project with repxray"
- "Run repxray on [folder]"

**Indonesian triggers (for Indonesian-speaking users):**
- "Bantu gw buat ringkasan project ini pake repxray"
- "Terapkan repxray ke project ini"
- "Simpen project ini ke database repxray"
- "Scan project ini pake repxray"
- "Jalankan repxray di [folder]"

---

## Installation

### 1. Clone & Install
```bash
git clone <repo-url> repxray
cd repxray
pnpm install
```

### 2. Link globally
```bash
pnpm run link
# or: cd cli && pnpm link --global
```

Now use it from anywhere:
```bash
repxray --help
```

### 3. Start server
```bash
pnpm server
```
Server runs at `http://localhost:7890`.

### Unlink (if needed)
```bash
pnpm run unlink
```

### Or use npx (no install)
```bash
npx repxray go ./project
npx repxray list
npx repxray ui
```

---

## Commands

| Command | Description |
|---|---|
| `repxray go <folder>` | **Auto start server + scan**, one command |
| `repxray scan <folder>` | Scan project + upload to database |
| `repxray scan --all <dir>` | Scan all sub-folders |
| `repxray ui` | Interactive Terminal UI |
| `repxray list` | List all projects |
| `repxray view <id>` | View project details |
| `repxray search <keyword>` | Search projects |
| `repxray export json` | Export all as JSON |
| `repxray export md` | Export all as Markdown |
| `repxray delete <id>` | Delete a project |
| `repxray upload <file>` | Upload a JSON file |

---

## Workflow for AI Agents

```
1. User triggers (e.g. "help me summarize this project with repxray")

2. Run the scan — pick one:

   Option A — Fastest (auto-starts server if needed):
   repxray go .

   Option B — Manual (server must be running):
   repxray scan .

   Result:
   → Scans the project
   → Extracts: name, description, tech stack, features, structure
   → Generates JSON + Markdown summaries
   → Uploads to database
   → Output: "Done! Project ID: <id>"

3. Confirm to the user:
   "Project [name] has been saved to Repxray database! (ID: <id>)"

4. (Optional) Offer to show details:
   "Want to see the summary?"
   → repxray view <id>
   → or repxray ui
```

### `repxray go` — Quick Start

`repxray go` is the easiest way:
```bash
repxray go ./my-project
# → Checks server (auto-starts if needed)
# → Waits for it to be ready
# → Scans the project
# → Uploads to database
# → Done! Project ID: <id>
```

Good for:
- **First time** — no manual setup
- **Quick demo** — show Repxray in 5 seconds
- **Fast sessions** — scan, note the ID, done

---

## Architecture

```
[Target Repo] → repxray scan → [Repxray Server] → [SQLite Database]
                                    ↑
                              localhost:7890
```

- **CLI**: `repxray` — scans projects, calls the server API
- **Server**: Express API on port 7890, stores in `database/repxray.sqlite`
- **Database**: SQLite via `sql.js`

---

## More Info

Full details in README or `repxray --help`.
