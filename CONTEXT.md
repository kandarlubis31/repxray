# repxray — Project Context

## Ringkasan

Repxray memindai folder proyek, mengekstrak metadatanya (nama, tech stack, deskripsi), lalu
menyimpannya ke basis data lokal yang bisa ditelusuri. Berguna ketika folder proyek menumpuk di satu
drive dan tidak lagi jelas isinya apa.

Dirilis di npm sebagai `repxray`.

## Alur

```
folder target → repxray scan → server Repxray (SQLite) → CLI / dashboard web / TUI
```

Pemindaian dan penyajian dipisah: pemindaian menulis ke basis data, sedangkan CLI, dashboard, dan TUI
hanya membaca. Karena itu satu hasil scan bisa dilihat dari antarmuka mana pun tanpa memindai ulang.

## Struktur

```
cli/               Paket yang dipublikasikan: src/ (perintah), server/ (dashboard), database/
cli/docs/          prd.md dan adr/ — keputusan desain
AGENTS.md          Panduan kerja agen di repo ini
pnpm-workspace.yaml
```

## Menjalankan

```bash
pnpm install
node cli/src/index.js --help
```

Atau lewat npm: `npx repxray`.

## Catatan

- Basis data (`cli/database/repxray.sqlite`) bersifat lokal per mesin; jangan di-commit.
- Metadata diturunkan dari isi folder (mis. `package.json`, struktur berkas). Proyek tanpa penanda
  stack akan tercatat sebagai "tidak terdeteksi", bukan ditebak.
- Keputusan arsitektur dicatat di `cli/docs/adr/`; baca sebelum mengubah bentuk data atau perintah.
