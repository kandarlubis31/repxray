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
    throw new Error(`Folder not found: ${folderPath}`);
  }

  const stats = fs.statSync(resolvedPath);
  if (!stats.isDirectory()) {
    throw new Error(`Path is not a directory: ${folderPath}`);
  }

  const folderName = path.basename(resolvedPath);
  const projectFiles = readProjectFiles(resolvedPath);
  const info = extractInfo(folderName, projectFiles, resolvedPath);
  const structure = getFolderStructure(resolvedPath, 3);

  info.structure = structure;

  return info;
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

  // Also check common subdirectories like src/ or app/
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
      } catch {}
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

  // Extract from README.md
  if (files['README.md']) {
    const readme = files['README.md'];
    const lines = readme.split('\n');
    const trimmedLines = lines.map(l => l.trim());

    // Extract description: first paragraph after title, skipping code blocks
    let descLines = [];
    let inCodeBlock = false;
    let started = false;
    for (const line of lines) {
      const trimmed = line.trim();

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

    // Extract features: find all bullet points across the whole README
    // Prioritize sections under "Features" / "Fitur" headings
    let inFeatures = false;
    let foundFeatureSection = false;
    for (const line of lines) {
      const trimmed = line.trim();
      const lower = trimmed.toLowerCase();

      // Track headings
      if (trimmed.startsWith('## ')) {
        if (lower.includes('feature') || lower.includes('fitur')) {
          inFeatures = true;
          foundFeatureSection = true;
        } else if (foundFeatureSection) {
          break; // End of features section
        } else {
          inFeatures = false;
        }
        continue;
      }

      if (inFeatures && trimmed.startsWith('- ')) {
        const feature = trimmed.replace(/^- /, '').trim();
        if (feature && !feature.startsWith('[') && !feature.startsWith('`')) {
          info.features.push(feature);
        }
      }
    }

    // Fallback: if no Features section found, grab bullet points from any section
    if (!foundFeatureSection) {
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('- ') && !trimmed.startsWith('- [') && trimmed.length > 4) {
          const feature = trimmed.replace(/^- /, '').trim();
          if (feature && info.features.length < 10) {
            info.features.push(feature);
          }
        }
      }
    }
  }

  // Extract from package.json
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

      // Detect framework
      const allDeps = [...(Object.keys(pkg.dependencies || {})), ...(Object.keys(pkg.devDependencies || {}))];
      const frameworks = detectFrameworks(allDeps);
      info.stack.push(...frameworks);
    } catch {}
  }

  // Extract from composer.json
  if (files['composer.json']) {
    try {
      const comp = JSON.parse(files['composer.json']);
      info.stack.push('PHP');
      info.name = comp.name || info.name;
      info.description = comp.description || info.description;
      if (comp.require) info.stack.push(...Object.keys(comp.require));
    } catch {}
  }

  // Extract from requirements.txt
  if (files['requirements.txt']) {
    info.stack.push('Python');
    const deps = files['requirements.txt']
      .split('\n')
      .filter(l => l.trim() && !l.startsWith('#'))
      .map(l => l.split('==')[0].trim());
    info.stack.push(...deps);
  }

  // Extract from go.mod
  if (files['go.mod']) {
    info.stack.push('Go');
    const lines = files['go.mod'].split('\n');
    for (const line of lines) {
      const match = line.match(/^\s+(.+)$/);
      if (match) info.stack.push(match[1].trim().split(' ')[0]);
    }
  }

  // Extract from Cargo.toml
  if (files['Cargo.toml']) {
    info.stack.push('Rust');
    const deps = files['Cargo.toml'].match(/^\[dependencies\]([\s\S]*?)^\[/m);
    if (deps) {
      const depLines = deps[1].split('\n').filter(l => l.trim() && !l.startsWith('['));
      for (const line of depLines) {
        const name = line.split('=')[0]?.trim();
        if (name) info.stack.push(name);
      }
    }
  }

  // Deduplicate stack
  info.stack = [...new Set(info.stack)].filter(Boolean);

  // Determine status based on files present
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

function getFolderStructure(dirPath, maxDepth, currentDepth = 0) {
  if (currentDepth >= maxDepth) return '';

  const indent = '  '.repeat(currentDepth);
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let result = '';

  for (const entry of entries) {
    if (IGNORE_DIRS.includes(entry.name)) continue;
    if (entry.name.startsWith('.')) continue;

    if (entry.isDirectory()) {
      result += `${indent}${entry.name}/\n`;
      result += getFolderStructure(path.join(dirPath, entry.name), maxDepth, currentDepth + 1);
    } else {
      result += `${indent}${entry.name}\n`;
    }
  }

  return result;
}

function tryGetPkgDescription(pkgContent) {
  try {
    const pkg = JSON.parse(pkgContent);
    return pkg.description || 'No description';
  } catch {
    return 'No description';
  }
}

const IGNORE_DIRS = ['node_modules', '.git', '.next', 'dist', 'build', 'target', 'vendor', '__pycache__', '.cache'];

module.exports = { scanProject, IGNORE_DIRS };
