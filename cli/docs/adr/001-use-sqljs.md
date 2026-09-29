# ADR-001: Use SQLite (sql.js) as the Database Engine

**Status:** ✅ Accepted  
**Date:** 2026-06-20  
**Author:** AI-generated (based on codebase analysis)  

---

## Context

Repxray needs to store project metadata (name, stack, features, structure, summaries) persistently. Options include:

- **PostgreSQL / MySQL** — Full-featured relational databases
- **SQLite** — Embedded, file-based database
- **JSON files** — Flat file storage
- **LevelDB / RocksDB** — Key-value stores

## Decision

Use **SQLite via [sql.js](https://github.com/sql-js/sql.js)** (the WebAssembly port of SQLite).

## Rationale

| Factor | SQLite | PostgreSQL | JSON Files |
|--------|--------|------------|------------|
| Setup | Zero — just `npm install` | Requires server install, config, auth | Zero |
| Dependencies | Single npm dependency | Requires server process | None |
| Portability | Single `.sqlite` file | Server-dependent | Fragile with concurrent access |
| Query capability | Full SQL | Full SQL | Manual parsing/filtering |
| Concurrent access | Single-writer | Multi-writer | Risk of corruption |
| Package size | ~1MB (WASM) | N/A | N/A |

Key reasons:
1. **Zero setup** — Users run `npx repxray go ./project` and it works. No database server to install.
2. **Portable** — The entire database is a single file (`database/repxray.sqlite`) that can be backed up, moved, or deleted.
3. **Adequate for single-user** — Repxray is a local tool; concurrent access isn't needed.
4. **SQL queries** — Allows flexible querying (search by stack, filter by status, etc.) that would be painful with flat JSON files.

## Consequences

### Positive
- Instant setup — users never think about databases
- Easy to debug — inspect with any SQLite browser
- Minimal operational overhead

### Negative
- sql.js loads the entire database into memory (fine for < 100MB datasets)
- WASM adds ~1MB to package size
- Writes are synchronous (fine for Repxray's write frequency)
- No built-in replication or cloud sync

### Mitigations
- Database is saved to disk after every write via `saveDatabase()`
- The `DATABASE_PATH` env var allows custom locations
- For future multi-user needs, ADR would be required to migrate to a client-server database

## References

- `server/src/database.js` — Database wrapper implementation
- `server/src/routes/projects.js` — CRUD operations
- [`CONTEXT.md`](../../CONTEXT.md) — Architecture overview
