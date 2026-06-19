const express = require('express');
const router = express.Router();
const db = require('../database');
const { validateProject, sanitizeArray, sanitizeString } = require('../utils/validator');

// POST /api/projects - Create or update a project
router.post('/', async (req, res) => {
  try {
    await db.getDatabase();
    const { valid, errors } = validateProject(req.body);
    if (!valid) {
      return res.status(400).json({ success: false, errors });
    }

    const { name, description, stack, status, progress, features, directory, summary_json, summary_md } = req.body;

    // Check if project with this directory already exists
    const existing = db.prepareGetRaw('SELECT id FROM projects WHERE directory = ?', [directory]);

    const params = {
      $name: sanitizeString(name),
      $description: sanitizeString(description),
      $stack: sanitizeArray(stack),
      $status: sanitizeString(status),
      $progress: sanitizeString(progress),
      $features: sanitizeArray(features),
      $directory: sanitizeString(directory),
      $summary_json: typeof summary_json === 'object' ? JSON.stringify(summary_json) : sanitizeString(summary_json),
      $summary_md: sanitizeString(summary_md),
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
      const row = db.prepareGetRaw('SELECT id FROM projects WHERE directory = ?', [directory]);
      id = row ? row.id : null;
    }

    res.status(201).json({ success: true, id });
  } catch (err) {
    console.error('Database error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/projects - List all projects
router.get('/', async (req, res) => {
  try {
    await db.getDatabase();
    const rows = db.prepareAllRaw('SELECT * FROM projects ORDER BY updated_at DESC');
    const projects = rows.map(parseProject);
    res.json({ success: true, data: projects });
  } catch (err) {
    console.error('Database error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/projects/:id - Get project by ID
router.get('/:id', async (req, res) => {
  try {
    await db.getDatabase();
    const row = db.prepareGetRaw('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    res.json({ success: true, data: parseProject(row) });
  } catch (err) {
    console.error('Database error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// DELETE /api/projects/:id - Delete a project
router.delete('/:id', async (req, res) => {
  try {
    await db.getDatabase();
    const row = db.prepareGetRaw('SELECT id FROM projects WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    db.prepareRunRaw('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    console.error('Database error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});



function parseProject(row) {
  return {
    ...row,
    stack: tryParseJSON(row.stack, []),
    features: tryParseJSON(row.features, []),
    summary_json: tryParseJSON(row.summary_json, {})
  };
}

function tryParseJSON(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

module.exports = router;
module.exports.parseProject = parseProject;
module.exports.tryParseJSON = tryParseJSON;
