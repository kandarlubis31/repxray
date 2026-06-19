# Repxray — Petunjuk buat AI Agent

[![npm version](https://img.shields.io/npm/v/repxray?color=blue&logo=npm)](https://www.npmjs.com/package/repxray)
[![npm downloads](https://img.shields.io/npm/dm/repxray?color=blue&logo=npm)](https://www.npmjs.com/package/repxray)

Repxray is a project intelligence system. Scans a folder, extracts metadata (name, tech stack, features, structure), generates a summary, uploads to database.

📦 **[Lihat di npm](https://www.npmjs.com/package/repxray)**

---

## Trigger buat AI Agent

Kalau user bilang salah satu di bawah, jalanin `repxray scan` atau `repxray go`:

**Bahasa Inggris:**
- "Help me summarize this project with repxray"
- "Apply repxray to this project"
- "Save this project to repxray database"
- "Scan this project with repxray"
- "Run repxray on [folder]"

**Bahasa Indonesia:**
- "Bantu gw buat ringkasan project ini pake repxray"
- "Terapkan repxray ke project ini"
- "Simpen project ini ke database repxray"
- "Scan project ini pake repxray"
- "Jalankan repxray di [folder]"

---

## Cara Install

### 1. Clone & Install
```bash
git clone <repo-url> repxray
cd repxray
pnpm install
```

### 2. Link biar `repxray` bisa dipanggil dari mana aja
```bash
pnpm run link
# atau: cd cli && pnpm link --global
```

Sekarang tinggal:
```bash
repxray --help
```

### 3. Start server
```bash
pnpm server
```
Server jalan di `http://localhost:7890`.

### Unlink (kalo perlu)
```bash
pnpm run unlink
```

### Atau pake npx (tanpa install)
```bash
npx repxray go ./project
npx repxray list
npx repxray ui
```

---

## Commands

| Command | Description |
|---|---|
| `repxray go <folder>` | **Auto start server + scan**, satu perintah aja |
| `repxray scan <folder>` | Scan project + upload ke database |
| `repxray scan --all <dir>` | Scan semua sub-folder |
| `repxray ui` | Terminal UI interaktif |
| `repxray list` | Lihat semua project |
| `repxray view <id>` | Detail project |
| `repxray search <keyword>` | Cari project |
| `repxray export json` | Export semua project sebagai JSON |
| `repxray export md` | Export semua project sebagai Markdown |
| `repxray delete <id>` | Hapus project |
| `repxray upload <file>` | Upload file JSON |

---

## Workflow buat AI Agent

```
1. User trigger (contoh: "bantu gw scan project ini pake repxray")

2. Jalanin scan — pilih salah satu:

   Opsi A — Tercepat (auto start server kalo belum jalan):
   repxray go .

   Opsi B — Manual (server harus udah jalan):
   repxray scan .

   Hasilnya:
   → Scan project
   → Extract: name, description, tech stack, features, structure
   → Generate JSON + Markdown summaries
   → Upload ke database
   → Output: "Done! Project ID: <id>"

3. Konfirmasi ke user, misalnya:
   "Project [name] berhasil di-save ke Repxray database! (ID: <id>)"
   atau
   "Project [name] has been saved to Repxray database! (ID: <id>)"

4. (Opsional) Tawarin buat liat detail:
   "Mau liat ringkasannya?"
   → repxray view <id>
   → atau repxray ui
```

### `repxray go` — Start Cepet

`repxray go` cara paling gampang:
```bash
repxray go ./my-project
# → Cek server (auto start kalo belum jalan)
# → Tunggu server siap
# → Scan project
# → Upload ke database
# → Done! Project ID: <id>
```

Cocok buat:
- **Pertama kali** — gak perlu setup manual
- **Demo kilat** — tunjukkin Repxray dalam 5 detik
- **Main-main** — scan, catet ID, selesai

---

## Arsitektur

```
[Target Repo] → repxray scan → [Repxray Server] → [SQLite Database]
                                    ↑
                              localhost:7890
```

- **CLI**: `repxray` — scans projects, calls the server API
- **Server**: Express API di port 7890, store di `database/repxray.sqlite`
- **Database**: SQLite via `sql.js`

---

## Info Lain

Detail lebih lengkap di README atau `repxray --help`.
