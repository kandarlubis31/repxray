const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

/**
 * Parse a GitHub URL into { owner, repo }.
 * Supports formats:
 *   https://github.com/owner/repo
 *   https://github.com/owner/repo.git
 *   github.com/owner/repo
 *   owner/repo
 */
function parseGitHubUrl(input) {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid GitHub URL');
  }

  let url = input.trim();

  // Remove trailing .git
  if (url.endsWith('.git')) {
    url = url.slice(0, -4);
  }

  // Remove trailing slash
  url = url.replace(/\/+$/, '');

  let owner, repo;

  // Try full URL first: https://github.com/owner/repo or github.com/owner/repo
  const urlMatch = url.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)/);
  if (urlMatch) {
    owner = urlMatch[1];
    repo = urlMatch[2];
  } else {
    // Try shorthand: owner/repo
    const shorthandMatch = url.match(/^([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)$/);
    if (shorthandMatch) {
      owner = shorthandMatch[1];
      repo = shorthandMatch[2];
    } else {
      throw new Error(
        'Invalid GitHub URL. Expected formats:\n' +
        '  https://github.com/owner/repo\n' +
        '  github.com/owner/repo\n' +
        '  owner/repo'
      );
    }
  }

  return { owner, repo };
}

/**
 * Clone a GitHub repo to a temporary directory.
 * Returns the path to the cloned directory.
 */
function cloneRepo(owner, repo, tmpDir) {
  const cloneUrl = `https://github.com/${owner}/${repo}.git`;
  const destPath = path.join(tmpDir, repo);

  console.log(`  Cloning ${owner}/${repo}...`);

  return new Promise((resolve, reject) => {
    const proc = spawn('git', ['clone', '--depth', '1', cloneUrl, destPath], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stderr = '';
    proc.stdout.on('data', () => {});
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        console.log('  Clone complete!');
        resolve(destPath);
      } else {
        // Clean up failed clone directory
        try { fs.rmSync(destPath, { recursive: true, force: true }); } catch (e) {}
        reject(new Error(`Git clone failed (exit code ${code}): ${stderr.trim()}`));
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to start git: ${err.message}. Is git installed?`));
    });
  });
}

/**
 * Clean up a temporary clone directory.
 */
function cleanupTempDir(tmpDir) {
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (err) {
    console.warn(`  Warning: Could not clean up temp directory: ${err.message}`);
  }
}

module.exports = { parseGitHubUrl, cloneRepo, cleanupTempDir };
