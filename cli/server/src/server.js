require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const projectsRouter = require('./routes/projects');
const { scanProject, listSubdirectories } = require('./scanner');
const { sanitizeString, sanitizeArray } = require('./utils/validator');
const db = require('./database');
const os = require('os');

const app = express();

// Serve static files (web UI)
app.use(express.static(path.join(__dirname, '../public')));

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API routes
app.use('/api/projects', projectsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export routes
const { parseProject } = require('./routes/projects');

app.get('/api/export/json', async (req, res) => {
  try {
    await db.getDatabase();
    const rows = db.prepareAllRaw('SELECT * FROM projects ORDER BY created_at DESC');
    const projects = rows.map(p => parseProject(p));
    res.json({ success: true, data: projects });
  } catch (err) {
    console.error('Export error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/export/markdown', async (req, res) => {
  try {
    await db.getDatabase();
    const rows = db.prepareAllRaw('SELECT * FROM projects ORDER BY created_at DESC');

    let md = '# Repxray - Project Export\n\n';
    md += 'Generated: ' + new Date().toISOString() + '\n\n';
    md += '---\n\n';

    if (rows.length === 0) {
      md += 'No projects found.\n';
    } else {
      rows.forEach((project) => {
        const data = parseProject(project);
        md += '# ' + data.name + '\n\n';
        md += '## Description\n' + (data.description || 'No description') + '\n\n';

        md += '## Tech Stack\n';
        if (data.stack.length > 0) {
          md += data.stack.map(s => '- ' + s).join('\n');
        } else {
          md += 'None';
        }
        md += '\n\n';

        md += '## Features\n';
        if (data.features.length > 0) {
          md += data.features.map(f => '- ' + f).join('\n');
        } else {
          md += 'None';
        }
        md += '\n\n';

        md += '## Structure\n```\n' + data.directory + '\n```\n\n';
        md += '## Status\n**Status:** ' + (data.status || 'Unknown') + '\n\n';
        md += '**Progress:** ' + (data.progress || 'Unknown') + '\n\n';
        md += '---\n\n';
      });
    }

    res.setHeader('Content-Type', 'text/markdown');
    res.send(md);
  } catch (err) {
    console.error('Export error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ── Scan endpoint ────────────────────────────────────────
app.post('/api/scan', async (req, res) => {
  try {
    const scanPath = req.body.path;
    if (!scanPath) {
      return res.status(400).json({ success: false, error: 'path is required' });
    }
    if (typeof scanPath !== 'string' || scanPath.trim() === '') {
      return res.status(400).json({ success: false, error: 'path must be a non-empty string' });
    }
    if (!fs.existsSync(scanPath)) {
      return res.status(404).json({ success: false, error: 'Path not found: ' + scanPath });
    }

    const scanned = scanProject(scanPath);

    // Upsert into database
    await db.getDatabase();
    const existing = db.prepareGetRaw('SELECT id FROM projects WHERE directory = ?', [scanned.directory]);

    const params = {
      $name: sanitizeString(scanned.name),
      $description: sanitizeString(scanned.description),
      $stack: sanitizeArray(scanned.stack),
      $status: sanitizeString(scanned.status),
      $progress: sanitizeString(scanned.progress),
      $features: sanitizeArray(scanned.features),
      $directory: sanitizeString(scanned.directory),
      $summary_json: scanned.summary_json || '{}',
      $summary_md: sanitizeString(scanned.summary_md),
    };

    let id;
    if (existing) {
      db.prepareRun(
        `UPDATE projects SET
          name = $name, description = $description, stack = $stack,
          status = $status, progress = $progress, features = $features,
          summary_json = $summary_json, summary_md = $summary_md,
          updated_at = datetime('now')
        WHERE directory = $directory`,
        params
      );
      id = existing.id;
    } else {
      db.prepareRun(
        `INSERT INTO projects (name, description, stack, status, progress, features, directory, summary_json, summary_md)
        VALUES ($name, $description, $stack, $status, $progress, $features, $directory, $summary_json, $summary_md)`,
        params
      );
      const row = db.prepareGetRaw('SELECT id FROM projects WHERE directory = ?', [scanned.directory]);
      id = row ? row.id : null;
    }

    res.json({ success: true, id: id, name: scanned.name });
  } catch (err) {
    console.error('Scan error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Batch scan endpoint ────────────────────────────────────
app.post('/api/scan/all', async (req, res) => {
  try {
    const parentPath = req.body.path;
    if (!parentPath) {
      return res.status(400).json({ success: false, error: 'path is required' });
    }
    if (typeof parentPath !== 'string' || parentPath.trim() === '') {
      return res.status(400).json({ success: false, error: 'path must be a non-empty string' });
    }
    if (!fs.existsSync(parentPath)) {
      return res.status(404).json({ success: false, error: 'Path not found: ' + parentPath });
    }

    const subdirs = listSubdirectories(parentPath);
    const scanned = [];
    const errors = [];

    await db.getDatabase();

    for (const dir of subdirs) {
      try {
        const result = scanProject(dir);

        const existing = db.prepareGetRaw('SELECT id FROM projects WHERE directory = ?', [result.directory]);
        const params = {
          $name: sanitizeString(result.name),
          $description: sanitizeString(result.description),
          $stack: sanitizeArray(result.stack),
          $status: sanitizeString(result.status),
          $progress: sanitizeString(result.progress),
          $features: sanitizeArray(result.features),
          $directory: sanitizeString(result.directory),
          $summary_json: result.summary_json || '{}',
          $summary_md: sanitizeString(result.summary_md),
        };

        if (existing) {
          db.prepareRun(
            `UPDATE projects SET
              name = $name, description = $description, stack = $stack,
              status = $status, progress = $progress, features = $features,
              summary_json = $summary_json, summary_md = $summary_md,
              updated_at = datetime('now')
            WHERE directory = $directory`,
            params
          );
        } else {
          db.prepareRun(
            `INSERT INTO projects (name, description, stack, status, progress, features, directory, summary_json, summary_md)
            VALUES ($name, $description, $stack, $status, $progress, $features, $directory, $summary_json, $summary_md)`,
            params
          );
        }

        scanned.push({ name: result.name, directory: result.directory });
      } catch (err) {
        errors.push({ directory: dir, error: err.message });
      }
    }

    res.json({ success: true, scanned: scanned, errors: errors });
  } catch (err) {
    console.error('Batch scan error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GitHub scan endpoint ──────────────────────────────────
app.post('/api/scan/github', async (req, res) => {
  const url = req.body.url;
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return res.status(400).json({ success: false, error: 'url is required' });
  }

  // Parse GitHub URL (support: https://github.com/owner/repo, owner/repo)
  let owner, repo;
  const urlMatch = url.trim().match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?$/);
  if (urlMatch) {
    owner = urlMatch[1];
    repo = urlMatch[2];
  } else {
    const shorthandMatch = url.trim().match(/^([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)$/);
    if (shorthandMatch) {
      owner = shorthandMatch[1];
      repo = shorthandMatch[2];
    } else {
      return res.status(400).json({ success: false, error: 'Invalid GitHub URL. Use: https://github.com/owner/repo or owner/repo' });
    }
  }

  const cloneUrl = 'https://github.com/' + owner + '/' + repo + '.git';
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'repxray-'));
  const destPath = path.join(tmpDir, repo);

  try {
    // Clone repo
    console.log('[Repxray] Cloning ' + owner + '/' + repo + '...');
    await new Promise((resolve, reject) => {
      const { spawn } = require('child_process');
      const proc = spawn('git', ['clone', '--depth', '1', cloneUrl, destPath], {
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      let stderr = '';
      proc.stdout.on('data', () => {});
      proc.stderr.on('data', (data) => { stderr += data.toString(); });
      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error('Git clone failed (exit ' + code + '): ' + stderr.trim()));
      });
      proc.on('error', (err) => reject(new Error('Failed to start git: ' + err.message)));
    });
    console.log('[Repxray] Clone complete!');

    // Scan the cloned repo
    const scanned = scanProject(destPath);
    scanned.name = repo + ' (gh:' + owner + ')';

    // Upsert into database
    await db.getDatabase();
    const existing = db.prepareGetRaw('SELECT id FROM projects WHERE directory = ?', [scanned.directory]);

    const params = {
      $name: sanitizeString(scanned.name),
      $description: sanitizeString(scanned.description),
      $stack: sanitizeArray(scanned.stack),
      $status: sanitizeString(scanned.status),
      $progress: sanitizeString(scanned.progress),
      $features: sanitizeArray(scanned.features),
      $directory: sanitizeString(scanned.directory),
      $summary_json: scanned.summary_json || '{}',
      $summary_md: sanitizeString(scanned.summary_md),
    };

    let id;
    if (existing) {
      db.prepareRun(
        `UPDATE projects SET
          name = $name, description = $description, stack = $stack,
          status = $status, progress = $progress, features = $features,
          summary_json = $summary_json, summary_md = $summary_md,
          updated_at = datetime('now')
        WHERE directory = $directory`,
        params
      );
      id = existing.id;
    } else {
      db.prepareRun(
        `INSERT INTO projects (name, description, stack, status, progress, features, directory, summary_json, summary_md)
        VALUES ($name, $description, $stack, $status, $progress, $features, $directory, $summary_json, $summary_md)`,
        params
      );
      const row = db.prepareGetRaw('SELECT id FROM projects WHERE directory = ?', [scanned.directory]);
      id = row ? row.id : null;
    }

    res.json({ success: true, id: id, name: scanned.name, github_url: 'https://github.com/' + owner + '/' + repo });
  } catch (err) {
    console.error('GitHub scan error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    // Cleanup temp directory
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
  }
});

// 404 handler (API only - not for static files)
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

async function tryListen(port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port);
    server.on('listening', () => resolve(server));
    server.on('error', (err) => {
      server.close();
      reject(err);
    });
  });
}

async function start() {
  try {
    await db.getDatabase();

    var envPort = process.env.REPXRAY_PORT || process.env.SERVER_PORT || '7890';
    const startPort = parseInt(envPort, 10);
    var server = null;
    var actualPort = startPort;

    for (var i = 0; i < 10; i++) {
      var tryPort = startPort + i;
      try {
        server = await tryListen(tryPort);
        actualPort = tryPort;
        break;
      } catch (err) {
        if (err.code !== 'EADDRINUSE') throw err;
        if (i === 9) {
          console.error('[Repxray Server] No available port in range ' + startPort + '-' + (startPort + 9));
          process.exit(1);
        }
      }
    }

    console.log('[PORT] ' + actualPort);
    console.log('[Repxray Server] Running on http://localhost:' + actualPort);
  } catch (err) {
    console.error('[Repxray Server] Failed to initialize database:', err.message);
    process.exit(1);
  }
}

start();
