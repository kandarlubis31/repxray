const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database/repxray.sqlite');

let db = null;
let SQL = null;

async function getDatabase() {
  if (db) return db;

  SQL = await initSqlJs();

  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    stack TEXT DEFAULT '[]',
    status TEXT DEFAULT '',
    progress TEXT DEFAULT '',
    features TEXT DEFAULT '[]',
    directory TEXT UNIQUE NOT NULL,
    summary_json TEXT DEFAULT '{}',
    summary_md TEXT DEFAULT '',
    created_at DATETIME DEFAULT (datetime('now')),
    updated_at DATETIME DEFAULT (datetime('now'))
  )`);

  saveDatabase();
  return db;
}

function saveDatabase() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

function ensureDb() {
  if (!db) {
    throw new Error('Database not initialized. Call getDatabase() first.');
  }
}

function prepareRun(sql, params = {}) {
  ensureDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  stmt.step();
  stmt.free();
  saveDatabase();
}

function prepareGet(sql, params = {}) {
  ensureDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  let row = null;
  if (stmt.step()) {
    row = stmt.getAsObject();
  }
  stmt.free();
  return row || undefined;
}

function prepareAll(sql, params = {}) {
  ensureDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function prepareRunRaw(sql, params = []) {
  ensureDb();
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  stmt.step();
  stmt.free();
  saveDatabase();
}

function prepareGetRaw(sql, params = []) {
  ensureDb();
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  let row = null;
  if (stmt.step()) {
    row = stmt.getAsObject();
  }
  stmt.free();
  return row || undefined;
}

function prepareAllRaw(sql, params = []) {
  ensureDb();
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

module.exports = {
  getDatabase,
  prepareRun,
  prepareGet,
  prepareAll,
  prepareRunRaw,
  prepareGetRaw,
  prepareAllRaw,
  saveDatabase,
};
