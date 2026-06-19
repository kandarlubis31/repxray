#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { scanProject, IGNORE_DIRS } = require('./scanner');
const { generateSummaryJson, generateSummaryMd } = require('./formatter');
const { uploadProject } = require('./uploader');

var API_URL = process.env.API_URL || 'http://localhost:7890';
const REPXRAY_ROOT = path.resolve(__dirname, '..');

async function main() {
  const command = process.argv[2];
  const target = process.argv[3];

  if (!command || command === '--help') {
    printHelp();
    return;
  }

  if (command === 'scan') {
    if (!target) {
      console.error('Error: Please specify a folder to scan.');
      console.error('Usage: npx repxray scan <folder>');
      console.error('       npx repxray scan --all <parent-folder>');
      process.exit(1);
    }
    if (target === '--all' || target === '-a') {
      const parentFolder = process.argv[4];
      if (!parentFolder) {
        console.error('Error: Please specify a parent folder with --all flag.');
        console.error('Usage: npx repxray scan --all <parent-folder>');
        process.exit(1);
      }
      await scanAll(parentFolder);
    } else {
      await scan(target);
    }
  } else if (command === 'upload') {
    if (!target) {
      console.error('Error: Please specify a JSON file to upload.');
      console.error('Usage: npx repxray upload <json-file>');
      process.exit(1);
    }
    await upload(target);
  } else if (command === 'list') {
    await list();
  } else if (command === 'view') {
    if (!target) {
      console.error('Error: Please specify a project ID.');
      console.error('Usage: npx repxray view <id>');
      process.exit(1);
    }
    await view(target);
  } else if (command === 'search') {
    if (!target) {
      console.error('Error: Please specify a search keyword.');
      console.error('Usage: npx repxray search <keyword>');
      process.exit(1);
    }
    await search(target);
  } else if (command === 'export') {
    const format = target || 'json';
    await exportProjects(format);
  } else if (command === 'delete') {
    if (!target) {
      console.error('Error: Please specify a project ID to delete.');
      console.error('Usage: npx repxray delete <id>');
      process.exit(1);
    }
    await deleteProject(target);
  } else if (command === 'ui' || command === 'tui') {
    const { launchUI } = await import('./ui.js');
    await launchUI();
  } else if (command === 'go') {
    if (!target) {
      console.error('Error: Please specify a folder to scan.');
      console.error('Usage: npx repxray go <folder>');
      process.exit(1);
    }
    await go(target);
  } else {
    console.error(`Error: Unknown command "${command}"`);
    printHelp();
    process.exit(1);
  }
}

async function scan(folderPath) {
  try {
    console.log(`[Repxray] Scanning folder: ${folderPath}`);
    console.log('');

    const scanned = scanProject(folderPath);
    console.log(`  Name: ${scanned.name}`);
    console.log(`  Status: ${scanned.status}`);
    console.log(`  Stack: ${scanned.stack.slice(0, 5).join(', ')}${scanned.stack.length > 5 ? '...' : ''}`);
    console.log(`  Features: ${scanned.features.length} found`);
    console.log('');

    const summaryJson = generateSummaryJson(scanned);
    const summaryMd = generateSummaryMd(scanned);

    const projectData = {
      ...scanned,
      summary_json: summaryJson,
      summary_md: summaryMd,
    };

    console.log('[Repxray] Uploading to server...');
    const result = await uploadProject(API_URL, projectData);
    console.log(`[Repxray] Done! Project ID: ${result.id}`);
  } catch (err) {
    handleError(err);
  }
}

async function scanAll(parentFolder) {
  try {
    const resolvedPath = path.resolve(parentFolder);
    if (!fs.existsSync(resolvedPath)) {
      console.error('Error: Folder not found: ' + parentFolder);
      process.exit(1);
    }

    const entries = fs.readdirSync(resolvedPath, { withFileTypes: true });

    const subdirs = entries
      .filter(function (e) { return e.isDirectory() && !e.name.startsWith('.') && !IGNORE_DIRS.includes(e.name); })
      .map(function (e) { return path.join(resolvedPath, e.name); });

    if (subdirs.length === 0) {
      console.log('[Repxray] No subdirectories found in: ' + parentFolder);
      return;
    }

    console.log('[Repxray] Scanning ' + subdirs.length + ' subdirectories in: ' + parentFolder);
    console.log('');

    var scanned = 0;
    var errors = 0;

    for (var i = 0; i < subdirs.length; i++) {
      var dir = subdirs[i];
      var dirName = path.basename(dir);
      process.stdout.write('  [' + (i + 1) + '/' + subdirs.length + '] ' + dirName + '... ');

      try {
        const scannedData = scanProject(dir);
        const summaryJson = generateSummaryJson(scannedData);
        const summaryMd = generateSummaryMd(scannedData);

        const projectData = {
          ...scannedData,
          summary_json: summaryJson,
          summary_md: summaryMd,
        };

        const result = await uploadProject(API_URL, projectData);
        process.stdout.write('OK (ID: ' + result.id + ')\n');
        scanned++;
      } catch (err) {
        process.stdout.write('FAIL - ' + err.message + '\n');
        errors++;
      }
    }

    console.log('');
    console.log('[Repxray] Done! Scanned: ' + scanned + ', Errors: ' + errors);
  } catch (err) {
    handleError(err);
  }
}

async function go(folderPath) {
  const resolvedPath = path.resolve(folderPath);
  if (!fs.existsSync(resolvedPath)) {
    console.error('Error: Folder not found: ' + folderPath);
    process.exit(1);
  }

  console.log('[Repxray] Checking server...');

  // Check if server is already running
  var serverRunning = false;
  try {
    var healthRes = await fetch(API_URL.replace(/\/+$/, '') + '/api/health', { signal: AbortSignal.timeout(3000) });
    serverRunning = healthRes.ok;
  } catch (e) {
    serverRunning = false;
  }

  if (!serverRunning) {
    console.log('[Repxray] Server not running. Starting server...');

    // Start server in background (keep handle alive until health check passes)
    var serverProcess = spawn('node', [path.join(REPXRAY_ROOT, 'server/src/server.js')], {
      stdio: ['ignore', 'pipe', 'ignore'],
      detached: true,
      env: { ...process.env },
    });

    // Capture the actual port from server stdout
    var detectedPort = null;
    var stdoutBuffer = '';
    serverProcess.stdout.on('data', function (data) {
      stdoutBuffer += data.toString();
      var match = stdoutBuffer.match(/\[PORT\]\s+(\d+)/);
      if (match) {
        detectedPort = parseInt(match[1], 10);
      }
    });

    // Build API URL with detected port (or fallback to default)
    function getServerUrl() {
      if (detectedPort) {
        return 'http://localhost:' + detectedPort;
      }
      return API_URL;
    }

    // Wait for server to be ready (don't unref yet — keep the handle alive)
    var maxRetries = 15;
    var ready = false;
    for (var i = 0; i < maxRetries; i++) {
      process.stdout.write('  Waiting for server' + '.'.repeat(i + 1) + '\r');
      try {
        var check = await fetch(getServerUrl().replace(/\/+$/, '') + '/api/health', { signal: AbortSignal.timeout(2000) });
        if (check.ok) {
          ready = true;
          break;
        }
      } catch (e) {
        // Not ready yet
      }
      await new Promise(function (r) { return setTimeout(r, 1000); });
    }

    process.stdout.write('                                    \r');

    if (!ready) {
      // Kill gracefully — suppress Windows UV_HANDLE_CLOSING assertion
      try { serverProcess.kill(); } catch (e) {}
      console.error('[Repxray] Failed to start server.');
      process.exit(1);
    }

    // Update API_URL to use the detected port for subsequent upload
    if (detectedPort) {
      API_URL = 'http://localhost:' + detectedPort;
    }

    // Server confirmed running — detach so it outlives the CLI
    serverProcess.unref();
    console.log('[Repxray] Server is ready! (port ' + (detectedPort || 7890) + ')');
    console.log('');
  } else {
    console.log('[Repxray] Server is already running.');
    console.log('');
  }

  // Run scan
  await scan(folderPath);
}

async function upload(filePath) {
  try {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`Error: File not found: ${filePath}`);
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));
    const result = await uploadProject(API_URL, data);
    console.log(`[Repxray] Uploaded! Project ID: ${result.id}`);
  } catch (err) {
    handleError(err);
  }
}

async function list() {
  try {
    const url = `${API_URL.replace(/\/+$/, '')}/api/projects`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const { data } = await response.json();
    console.log(`[Repxray] Projects (${data.length}):`);
    console.log('');

    if (data.length === 0) {
      console.log('  No projects found.');
      console.log('');
      return;
    }

    for (const project of data) {
      const stack = Array.isArray(project.stack) ? project.stack.slice(0, 3).join(', ') : '';
      console.log(`  ${project.id}. ${project.name}`);
      console.log(`     Stack: ${stack || 'N/A'}`);
      console.log(`     Status: ${project.status}`);
      console.log('');
    }
  } catch (err) {
    handleError(err);
  }
}

async function view(id) {
  try {
    const url = `${API_URL.replace(/\/+$/, '')}/api/projects/${id}`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        console.error(`Error: Project with ID ${id} not found.`);
        process.exit(1);
      }
      throw new Error(`Server responded with ${response.status}`);
    }

    const { data } = await response.json();

    console.log('');
    console.log(`  Project: ${data.name}`);
    console.log(`  ${'='.repeat(data.name.length + 10)}`);
    console.log(`  ID:        ${data.id}`);
    console.log(`  Status:    ${data.status}`);
    console.log(`  Progress:  ${data.progress}`);
    console.log(`  Directory: ${data.directory}`);
    console.log('');

    console.log('  Description:');
    console.log(`  ${data.description}`);
    console.log('');

    const stack = Array.isArray(data.stack) ? data.stack : [];
    if (stack.length > 0) {
      console.log('  Tech Stack:');
      stack.forEach(s => console.log(`    - ${s}`));
      console.log('');
    }

    const features = Array.isArray(data.features) ? data.features : [];
    if (features.length > 0) {
      console.log('  Features:');
      features.forEach(f => console.log(`    - ${f}`));
      console.log('');
    }

    if (data.summary_md) {
      console.log('  Summary (Markdown):');
      console.log('  ---');
      const preview = data.summary_md.split('\n').slice(0, 20).join('\n');
      console.log(preview);
      if (data.summary_md.split('\n').length > 20) {
        console.log('  ... (truncated)');
      }
      console.log('  ---');
      console.log('');
    }

    console.log(`  Created: ${data.created_at}`);
    console.log(`  Updated: ${data.updated_at}`);
    console.log('');
  } catch (err) {
    handleError(err);
  }
}

async function search(keyword) {
  try {
    const url = `${API_URL.replace(/\/+$/, '')}/api/projects`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const { data } = await response.json();
    const lowerKeyword = keyword.toLowerCase();

    const results = data.filter(p => {
      const nameMatch = p.name && p.name.toLowerCase().includes(lowerKeyword);
      const stackMatch = Array.isArray(p.stack) && p.stack.some(s => s.toLowerCase().includes(lowerKeyword));
      const descMatch = p.description && p.description.toLowerCase().includes(lowerKeyword);
      const statusMatch = p.status && p.status.toLowerCase().includes(lowerKeyword);
      return nameMatch || stackMatch || descMatch || statusMatch;
    });

    console.log(`[Repxray] Search results for "${keyword}" (${results.length}):`);
    console.log('');

    if (results.length === 0) {
      console.log('  No matching projects found.');
      console.log('');
      return;
    }

    for (const project of results) {
      const stack = Array.isArray(project.stack) ? project.stack.slice(0, 3).join(', ') : '';
      console.log(`  ${project.id}. ${project.name}`);
      console.log(`     Stack: ${stack || 'N/A'}`);
      console.log(`     Status: ${project.status}`);
      console.log('');
    }
  } catch (err) {
    handleError(err);
  }
}

async function exportProjects(format) {
  try {
    const baseUrl = API_URL.replace(/\/+$/, '');
    let url;

    if (format === 'md' || format === 'markdown') {
      url = `${baseUrl}/api/export/markdown`;
    } else {
      url = `${baseUrl}/api/export/json`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    if (format === 'md' || format === 'markdown') {
      const text = await response.text();
      console.log(text);
    } else {
      const json = await response.json();
      console.log(JSON.stringify(json, null, 2));
    }
  } catch (err) {
    handleError(err);
  }
}

async function deleteProject(id) {
  try {
    const url = `${API_URL.replace(/\/+$/, '')}/api/projects/${id}`;
    const response = await fetch(url, { method: 'DELETE' });

    if (!response.ok) {
      if (response.status === 404) {
        console.error(`Error: Project with ID ${id} not found.`);
        process.exit(1);
      }
      throw new Error(`Server responded with ${response.status}`);
    }

    const result = await response.json();
    console.log(`[Repxray] Project ${id} deleted.`);
  } catch (err) {
    handleError(err);
  }
}

function handleError(err) {
  if (err.code === 'ECONNREFUSED') {
    console.error('Error: Cannot connect to Repxray server.');
    console.error(`Make sure the server is running on ${API_URL}`);
  } else if (err instanceof SyntaxError) {
    console.error(`Error: Invalid JSON: ${err.message}`);
  } else {
    console.error(`Error: ${err.message}`);
  }
  process.exit(1);
}

function printHelp() {
  console.log(`
Repxray CLI - Personal Project Intelligence

Usage:
  npx repxray scan <folder>      Scan a project folder and upload to server
  npx repxray scan --all <dir>   Scan all subdirectories in a parent folder
  npx repxray view <id>          View project details
  npx repxray list               List all projects
  npx repxray search <keyword>   Search projects by name, stack, or description
  npx repxray export json        Export all projects as JSON
  npx repxray export md          Export all projects as Markdown
  npx repxray upload <file>      Upload a JSON file to server
  npx repxray delete <id>        Delete a project
  npx repxray ui                 Launch interactive Terminal UI (TUI)
  npx repxray go <folder>        Auto-start server + scan in one command
  npx repxray --help             Show this help

Environment:
  API_URL       Server URL (default: http://localhost:7890)
  REPXRAY_PORT  Server port override (default: 7890)

Examples:
  npx repxray go ./my-project
  npx repxray scan ./my-project
  npx repxray ui
  npx repxray view 1
  npx repxray search react
  npx repxray export md
  npx repxray upload ./result.json
  `);
}

main();
