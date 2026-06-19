const fs = require('fs');
const path = require('path');

const PRIORITY_FILES = [
  'README.md',
  'package.json',
  'composer.json',
  'requirements.txt',
  'go.mod',
  'pom.xml',
  'Cargo.toml',
  'pyproject.toml',
  'Gemfile',
  'build.gradle',
  'CMakeLists.txt',
];

const LANG_MAP = {
  'package.json': { lang: 'JavaScript/TypeScript', deps: true },
  'composer.json': { lang: 'PHP', deps: true },
  'requirements.txt': { lang: 'Python', deps: true },
  'go.mod': { lang: 'Go', deps: true },
  'pom.xml': { lang: 'Java', deps: true },
  'Cargo.toml': { lang: 'Rust', deps: true },
  'pyproject.toml': { lang: 'Python', deps: true },
  'Gemfile': { lang: 'Ruby', deps: true },
  'build.gradle': { lang: 'Java/Kotlin', deps: true },
  'CMakeLists.txt': { lang: 'C/C++', deps: false },
};

function scanProject(folderPath) {
  const resolvedPath = path.resolve(folderPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error('Folder not found: ' + folderPath);
  }

  const stats = fs.statSync(resolvedPath);
  if (!stats.isDirectory()) {
    throw new Error('Path is not a directory: ' + folderPath);
  }

  const folderName = path.basename(resolvedPath);
  const projectFiles = readProjectFiles(resolvedPath);
  const info = extractInfo(folderName, projectFiles, resolvedPath);
  const structure = getFolderStructure(resolvedPath, 3);

  info.structure = structure;

  // Generate summaries
  const summaryJson = generateSummaryJson(info);
  const summaryMd = generateSummaryMd(info);

  return {
    ...info,
    summary_json: JSON.stringify(summaryJson),
    summary_md: summaryMd,
  };
}

function listSubdirectories(parentPath) {
  const resolvedPath = path.resolve(parentPath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error('Folder not found: ' + parentPath);
  }

  const entries = fs.readdirSync(resolvedPath, { withFileTypes: true });
  
  return entries
    .filter(function (entry) {
      return entry.isDirectory() && !entry.name.startsWith('.') && !IGNORE_DIRS.includes(entry.name);
    })
    .map(function (entry) {
      return path.join(resolvedPath, entry.name);
    });
}

function readProjectFiles(folderPath) {
  const files = {};
  const dirEntries = fs.readdirSync(folderPath);

  for (const entry of dirEntries) {
    if (PRIORITY_FILES.includes(entry)) {
      const filePath = path.join(folderPath, entry);
      if (fs.statSync(filePath).isFile()) {
        files[entry] = fs.readFileSync(filePath, 'utf-8');
      }
    }
  }

  for (const entry of dirEntries) {
    const entryPath = path.join(folderPath, entry);
    if (fs.statSync(entryPath).isDirectory() && ['src', 'app', 'lib', 'source'].includes(entry)) {
      try {
        const subFiles = fs.readdirSync(entryPath);
        for (const sf of subFiles) {
          if (PRIORITY_FILES.includes(sf) && !files[sf]) {
            files[sf] = fs.readFileSync(path.join(entryPath, sf), 'utf-8');
          }
        }
      } catch (err) {
        // Skip inaccessible directories
      }
    }
  }

  return files;
}

function extractInfo(folderName, files, folderPath) {
  const info = {
    name: folderName,
    description: '',
    stack: [],
    status: 'Unknown',
    progress: 'Unknown',
    features: [],
    directory: folderPath,
  };

  if (files['README.md']) {
    const readme = files['README.md'];
    const lines = readme.split('\n');
    const trimmedLines = lines.map(function (l) { return l.trim(); });

    // Extract description: first paragraph after title, skipping code blocks
    var descLines = [];
    var inCodeBlock = false;
    var started = false;
    for (var i = 0; i < lines.length; i++) {
      var trimmed = lines[i].trim();

      // Track code blocks
      if (trimmed.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (inCodeBlock) continue;

      // Skip empty lines before content starts
      if (!started && !trimmed) continue;

      // Skip title
      if (!started && trimmed.startsWith('# ')) continue;

      // Stop at any heading
      if (trimmed.startsWith('#')) break;

      if (trimmed) {
        started = true;
        // Clean up inline code markers
        descLines.push(trimmed.replace(/`/g, ''));
        if (descLines.length >= 3) break;
      } else if (started) {
        // Empty line after content started = end of paragraph
        break;
      }
    }
    info.description = descLines.join(' ') || (files['package.json'] ? tryGetPkgDescription(files['package.json']) : 'No description');

    // Extract features: find bullet points under "Features" / "Fitur" sections
    var inFeatures = false;
    var foundFeatureSection = false;
    for (var j = 0; j < lines.length; j++) {
      var line = lines[j];
      var t = line.trim();
      var lower = t.toLowerCase();

      if (t.startsWith('## ')) {
        if (lower.includes('feature') || lower.includes('fitur')) {
          inFeatures = true;
          foundFeatureSection = true;
        } else if (foundFeatureSection) {
          break;
        } else {
          inFeatures = false;
        }
        continue;
      }

      if (inFeatures && t.startsWith('- ')) {
        var feature = t.replace(/^- /, '').trim();
        if (feature && !feature.startsWith('[') && !feature.startsWith('`')) {
          info.features.push(feature);
        }
      }
    }

    // Fallback: grab bullet points from any section if no Features section found
    if (!foundFeatureSection) {
      for (var k = 0; k < lines.length; k++) {
        var l = lines[k].trim();
        if (l.startsWith('- ') && !l.startsWith('- [') && l.length > 4) {
          var feat = l.replace(/^- /, '').trim();
          if (feat && info.features.length < 10) {
            info.features.push(feat);
          }
        }
      }
    }
  }

  if (files['package.json']) {
    try {
      const pkg = JSON.parse(files['package.json']);
      info.name = pkg.name || info.name;
      info.description = pkg.description || info.description;

      if (pkg.dependencies) {
        info.stack.push(...Object.keys(pkg.dependencies));
      }
      if (pkg.devDependencies) {
        info.stack.push(...Object.keys(pkg.devDependencies));
      }

      const allDeps = [...(Object.keys(pkg.dependencies || {})), ...(Object.keys(pkg.devDependencies || {}))];
      const frameworks = detectFrameworks(allDeps);
      info.stack.push(...frameworks);
    } catch (err) {
      // Invalid JSON
    }
  }

  if (files['composer.json']) {
    try {
      const comp = JSON.parse(files['composer.json']);
      info.stack.push('PHP');
      info.name = comp.name || info.name;
      info.description = comp.description || info.description;
      if (comp.require) info.stack.push(...Object.keys(comp.require));
    } catch (err) {
      // Invalid JSON
    }
  }

  if (files['requirements.txt']) {
    info.stack.push('Python');
    const deps = files['requirements.txt']
      .split('\n')
      .filter(function (l) { return l.trim() && !l.startsWith('#'); })
      .map(function (l) { return l.split('==')[0].trim(); });
    info.stack.push(...deps);
  }

  if (files['go.mod']) {
    info.stack.push('Go');
    const lines = files['go.mod'].split('\n');
    for (const line of lines) {
      const match = line.match(/^\s+(.+)$/);
      if (match) info.stack.push(match[1].trim().split(' ')[0]);
    }
  }

  if (files['Cargo.toml']) {
    info.stack.push('Rust');
    const deps = files['Cargo.toml'].match(/^\[dependencies\]([\s\S]*?)^\[/m);
    if (deps) {
      const depLines = deps[1].split('\n').filter(function (l) { return l.trim() && !l.startsWith('['); });
      for (const line of depLines) {
        const name = line.split('=')[0]?.trim();
        if (name) info.stack.push(name);
      }
    }
  }

  info.stack = [...new Set(info.stack)].filter(Boolean);

  if (files['package.json'] || files['Cargo.toml'] || files['go.mod'] || files['composer.json']) {
    info.status = 'Active';
    info.progress = 'In Development';
  } else if (files['README.md']) {
    info.status = 'Active';
    info.progress = 'Unknown';
  }

  return info;
}

function detectFrameworks(deps) {
  const frameworkMap = {
    'react': 'React',
    'vue': 'Vue.js',
    'next': 'Next.js',
    'express': 'Express.js',
    'fastify': 'Fastify',
    'koa': 'Koa.js',
    'nestjs': 'NestJS',
    'prisma': 'Prisma',
    'typeorm': 'TypeORM',
    'sequelize': 'Sequelize',
    'tailwindcss': 'Tailwind CSS',
    'bootstrap': 'Bootstrap',
    'nuxt': 'Nuxt.js',
    'svelte': 'Svelte',
    'angular': 'Angular',
    'django': 'Django',
    'flask': 'Flask',
    'fastapi': 'FastAPI',
    'laravel': 'Laravel',
    'symfony': 'Symfony',
    'spring': 'Spring',
    'jquery': 'jQuery',
  };

  const found = [];
  for (const dep of deps) {
    for (const [key, name] of Object.entries(frameworkMap)) {
      if (dep.toLowerCase().includes(key)) {
        found.push(name);
      }
    }
  }
  return [...new Set(found)];
}

function getFolderStructure(dirPath, maxDepth, currentDepth) {
  if (currentDepth === undefined) currentDepth = 0;
  if (currentDepth >= maxDepth) return '';

  const indent = '  '.repeat(currentDepth);
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let result = '';

  for (const entry of entries) {
    if (IGNORE_DIRS.includes(entry.name)) continue;
    if (entry.name.startsWith('.')) continue;

    if (entry.isDirectory()) {
      result += indent + entry.name + '/\n';
      result += getFolderStructure(path.join(dirPath, entry.name), maxDepth, currentDepth + 1);
    } else {
      result += indent + entry.name + '\n';
    }
  }

  return result;
}

function generateSummaryJson(scanned) {
  return {
    name: scanned.name,
    description: scanned.description,
    stack: scanned.stack,
    status: scanned.status,
    progress: scanned.progress,
    features: scanned.features,
    directory: scanned.directory,
    structure: scanned.structure || '',
  };
}

function generateSummaryMd(scanned) {
  const lines = [];

  lines.push('# ' + scanned.name);
  lines.push('');
  lines.push('## Description');
  lines.push(scanned.description || 'No description');
  lines.push('');

  if (scanned.stack && scanned.stack.length > 0) {
    lines.push('## Tech Stack');
    scanned.stack.forEach(function (item) { lines.push('- ' + item); });
    lines.push('');
  } else {
    lines.push('## Tech Stack\nNone\n');
  }

  if (scanned.features && scanned.features.length > 0) {
    lines.push('## Features');
    scanned.features.forEach(function (f) { lines.push('- ' + f); });
    lines.push('');
  } else {
    lines.push('## Features\nNone\n');
  }

  if (scanned.structure) {
    lines.push('## Structure');
    lines.push('```');
    lines.push(scanned.structure.trim());
    lines.push('```');
    lines.push('');
  }

  lines.push('## Status');
  lines.push('**Status:** ' + (scanned.status || 'Unknown'));
  lines.push('**Progress:** ' + (scanned.progress || 'Unknown'));

  return lines.join('\n');
}

function tryGetPkgDescription(pkgContent) {
  try {
    var pkg = JSON.parse(pkgContent);
    return pkg.description || 'No description';
  } catch (err) {
    return 'No description';
  }
}

const IGNORE_DIRS = ['node_modules', '.git', '.next', 'dist', 'build', 'target', 'vendor', '__pycache__', '.cache'];

module.exports = {
  scanProject,
  listSubdirectories,
  IGNORE_DIRS,
};
