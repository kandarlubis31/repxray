# Repxray

> 🌐 [Read in English](README.en.md)

Scan project folder, dapetin metadata (tech stack, features, structure), simpen ke database. Ada CLI, Web Dashboard, Terminal UI — tinggal pilih.

---

## Yang Bisa Dilakuin

- **Scan otomatis** — Baca `package.json`, `README.md`, `requirements.txt`, dll. Tau tech stack, framework, feature, status
- **Batch scan** — Scan semua sub-folder pake `scan --all`
- **Web Dashboard** — Browser UI buat liat, cari, export, hapus project
- **Terminal UI** — Navigasi pake arrow keys, export JSON/MD sekali pencet
- **`repxray go`** — Satu perintah langsung start server + scan + upload
- **AI Agent ready** — Bisa pake AI assistant buat scan project (lengkap di `AGENTS.md`)

---

## Cara Pake

### Paling gampang — tinggal jalanin
```bash
npx repxray go ./test-sample
# Download → start server → scan → upload → selesai
```

### Install global (biar gak perlu download ulang)
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

Buka `http://localhost:7890` buat Web Dashboard, atau `repxray ui` buat Terminal UI.

---

## Cara Kerja

```
[Target Repo] → repxray scan → [Repxray Server] → [SQLite Database]
                                    ↑
                              localhost:7890
```

### Struktur Folder

```
repxray/
├── cli/
│   ├── src/               # CLI commands (scan, view, list, go, dll)
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
├── AGENTS.md              # Buat AI assistant
└── README.md
```

---

## CLI Commands

| Command | Description |
|---------|-------------|
| `repxray go <folder>` | **Auto start server + scan**, satu perintah aja |
| `repxray scan <folder>` | Scan project + upload ke database |
| `repxray scan --all <dir>` | Scan semua sub-folder |
| `repxray list` | Lihat semua project |
| `repxray view <id>` | Detail project |
| `repxray search <keyword>` | Cari project (name, stack, description) |
| `repxray export json` | Export semua project sebagai JSON |
| `repxray export md` | Export semua project sebagai Markdown |
| `repxray upload <file>` | Upload file JSON |
| `repxray delete <id>` | Hapus project |
| `repxray ui` | Terminal UI interaktif |
| `repxray --help` | Tampilkan help |

### Contoh

```bash
# Paling gampang — auto server + scan
repxray go ./my-project

# Scan aja (server harus udah jalan)
repxray scan ./my-project

# Batch scan
repxray scan --all ./projects/

# Cari project pake React
repxray search react

# Export semua
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

Cocok buat:
- **Pertama kali** — langsung jalan, gak perlu setup manual
- **Demo cepet** — tunjukkin Repxray dalam 5 detik
- **Main-main** — scan, catet ID, selesai

---

## Terminal UI

```
repxray ui
```

| Tombol | Fungsi |
|--------|--------|
| `↑/↓` / `j/k` | Navigasi project |
| `J` | Export JSON (print + exit) |
| `M` | Export Markdown (print + exit) |
| `s` | Ganti mode sort |
| `d` | Hapus project |
| `/` | Search |
| `q` / `Esc` | Keluar |

---

## Web Dashboard

Buka `http://localhost:7890` pas server jalan.

- Daftar project dengan search + filter
- Detail: status, tech stack, features, timestamps
- Export: copy JSON/Markdown ke clipboard
- Scan langsung dari browser
- Delete dengan konfirmasi

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/projects` | Create/update project |
| `GET` | `/api/projects` | List semua project |
| `GET` | `/api/projects/:id` | Detail project |
| `DELETE` | `/api/projects/:id` | Hapus project |
| `POST` | `/api/scan` | Scan project via path |
| `POST` | `/api/scan/all` | Batch scan |
| `GET` | `/api/export/json` | Export JSON |
| `GET` | `/api/export/markdown` | Export Markdown |
| `GET` | `/api/health` | Health check |

---

## AI Agent

File `AGENTS.md` berisi instruksi buat AI coding assistant (Codebuff, Cursor, Copilot, dll).

Tinggal bilang:
- *"Bantu gw buat ringkasan project ini pake repxray"*
- *"Simpen project ini ke database repxray"*
- *"Scan project ini pake repxray"*

Agent bakal jalanin `repxray scan` dan kasih tau hasilnya.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REPXRAY_PORT` | `7890` | Port server (auto fallback +10 kalo sibuk) |
| `API_URL` | `http://localhost:7890` | URL server buat koneksi CLI |
| `DATABASE_PATH` | `./cli/database/repxray.sqlite` | Lokasi database SQLite |

Kalo port 7890 kepake, server otomatis coba 7891, 7892, ... 7899.
Port yang kepake bakal dipake otomatis sama `repxray go`.

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** SQLite (sql.js)
- **CLI:** Node.js, Ink + React (TUI)
- **Web UI:** Vanilla HTML/CSS/JS (no build)
- **Lisensi:** MIT
