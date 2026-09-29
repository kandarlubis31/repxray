/* ═══════════════════════════════════════════════════════════
   Repxray — Application Logic
   ═══════════════════════════════════════════════════════════ */

/* ─── SVG Icon System ──────────────────────────────────── */
var ICONS = {
  brain:   '<path d="M12 2a4 4 0 0 1 4 4c0 2-2 4-4 4-2 0-4-2-4-4 0-2.2 1.8-4 4-4z"/><path d="M12 10c-3.3 0-6 2.7-6 6v2h12v-2c0-3.3-2.7-6-6-6z"/><path d="M8 18v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2"/><path d="M7 6.5A4.5 4.5 0 0 0 3 11v1"/><path d="M17 6.5A4.5 4.5 0 0 1 21 11v1"/>',
  search:  '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
  scan:    '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  folder:  '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
  trash:   '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  copy:    '<rect x="14" y="14" width="8" height="8" rx="2"/><rect x="2" y="2" width="8" height="8" rx="2"/><path d="M7 14v3a2 2 0 0 0 2 2h3"/>',
  check:   '<polyline points="20 6 9 17 4 12"/>',
  refresh: '<path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  x:       '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  alert:   '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  clock:   '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  code:    '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  file:    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  layers:  '<path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
  zap:     '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  time:    '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  edit:    '<path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/>',
  sort:    '<path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/>',
  hash:    '<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>',
  github:  '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>',
};

function icon(name, size) {
  size = size || 16;
  var paths = ICONS[name] || ICONS.hash;
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg>';
}

/* ─── Stack Category Mapping ───────────────────────────── */
var STACK_CATEGORIES = {
  // Frontend
  react: 'frontend', 'react-native': 'mobile', vue: 'frontend', svelte: 'frontend',
  angular: 'frontend', next: 'frontend', nuxt: 'frontend', 'next.js': 'frontend',
  'vue.js': 'frontend', 'sveltekit': 'frontend', gatsby: 'frontend', astro: 'frontend',
  tailwindcss: 'frontend', bootstrap: 'frontend', jquery: 'frontend',
  typescript: 'frontend', javascript: 'frontend',
  html: 'frontend', css: 'frontend', scss: 'frontend', sass: 'frontend',
  preact: 'frontend', 'styled-components': 'frontend',
  // Backend
  node: 'backend', express: 'backend', fastify: 'backend', koa: 'backend',
  nestjs: 'backend', django: 'backend', flask: 'backend', fastapi: 'backend',
  laravel: 'backend', symfony: 'backend', spring: 'backend', go: 'backend',
  rust: 'backend', python: 'backend', php: 'backend', java: 'backend',
  ruby: 'backend', csharp: 'backend', dotnet: 'backend', deno: 'backend',
  bun: 'backend', prisma: 'backend', typeorm: 'backend', sequelize: 'backend',
  graphql: 'backend', apollo: 'backend', socketio: 'backend',
  // Database
  postgres: 'database', 'postgresql': 'database', mysql: 'database',
  mongodb: 'database', redis: 'database', sqlite: 'database', sql: 'database',
  mariadb: 'database', cockroachdb: 'database', cassandra: 'database',
  // DevOps
  docker: 'devops', kubernetes: 'devops', terraform: 'devops', aws: 'devops',
  gcp: 'devops', azure: 'devops', ci: 'devops', cd: 'devops', github: 'devops',
  git: 'devops', nginx: 'devops', linux: 'devops',
};

function getStackCategory(name) {
  var key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (var k in STACK_CATEGORIES) {
    if (key === k || key.includes(k)) return STACK_CATEGORIES[k];
  }
  return 'other';
}

/* ─── State ─────────────────────────────────────────────── */
var REFRESH_INTERVAL = 10000;
var refreshTimer = null;
var isScanning = false;
var isTabVisible = true;

var state = {
  projects: [],
  selectedId: null,
  searchQuery: '',
  scanning: false,
};

/* ─── API ────────────────────────────────────────────────── */
var API = {
  async getProjects() {
    var res = await fetch('/api/projects');
    if (!res.ok) throw new Error('Failed to fetch projects');
    var json = await res.json();
    return json.data || [];
  },

  async getProject(id) {
    var res = await fetch('/api/projects/' + id);
    if (!res.ok) throw new Error('Project not found');
    var json = await res.json();
    return json.data;
  },

  async deleteProject(id) {
    var res = await fetch('/api/projects/' + id, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    return res.json();
  },

  async scanProject(path) {
    var res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: path }),
    });
    if (!res.ok) {
      var err = await res.json();
      throw new Error(err.error || 'Scan failed');
    }
    return res.json();
  },

  async scanAllProjects(parentPath) {
    var res = await fetch('/api/scan/all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: parentPath }),
    });
    if (!res.ok) {
      var err = await res.json();
      throw new Error(err.error || 'Batch scan failed');
    }
    return res.json();
  },

  async scanGitHubRepo(url) {
    var res = await fetch('/api/scan/github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url }),
    });
    if (!res.ok) {
      var err = await res.json();
      throw new Error(err.error || 'GitHub scan failed');
    }
    return res.json();
  },
};

/* ─── DOM References ─────────────────────────────────────── */
var $ = function (id) { return document.getElementById(id); };

var dom = {
  // Sidebar
  projectList: $('projectList'),
  projectCount: $('projectCount'),
  sortBtn: $('sortBtn'),
  projectStats: $('projectStats'),
  statTotal: $('statTotal'),
  statActive: $('statActive'),
  statErrors: $('statErrors'),

  // Header
  searchInput: $('searchInput'),
  clearSearch: $('clearSearch'),
  searchCommand: $('searchCommand'),

  // Scan
  scanTabs: $('scanTabs'),
  scanInputGroup: $('scanInputGroup'),
  scanInputIcon: $('scanInputIcon'),
  scanPath: $('scanPath'),
  scanGitHubBtnBar: $('scanGitHubBtnBar'),
  scanBtn: $('scanBtn'),
  scanAllBtn: $('scanAllBtn'),
  scanBtnBar: $('scanBtnBar'),
  scanAllBtnBar: $('scanAllBtnBar'),

  // Detail
  detailEmpty: $('detailEmpty'),
  detailContent: $('detailContent'),
  detailName: $('detailName'),
  detailStatus: $('detailStatus'),
  detailStatusText: $('detailStatusText'),
  statusDot: $('statusDot'),
  detailProgress: $('detailProgress'),
  progressBar: $('progressBar'),
  progressTrack: $('progressTrack'),
  detailFeatureCount: $('detailFeatureCount'),
  detailId: $('detailId'),
  detailDir: $('detailDir'),
  detailTime: $('detailTime'),
  detailDesc: $('detailDesc'),
  detailStack: $('detailStack'),
  stackSection: $('stackSection'),
  stackCount: $('stackCount'),
  detailFeatures: $('detailFeatures'),
  featuresSection: $('featuresSection'),
  featureCount: $('featureCount'),
  summarySection: $('summarySection'),
  summaryJson: $('summaryJson'),
  summaryMd: $('summaryMd'),
  summaryPreview: $('summaryPreview'),
  tabCopyBtn: $('tabCopyBtn'),
  detailCreated: $('detailCreated'),
  detailUpdated: $('detailUpdated'),
  copyJsonBtn: $('copyJsonBtn'),
  copyMdBtn: $('copyMdBtn'),
  deleteBtn: $('deleteBtn'),

  // Overlays
  paletteOverlay: $('paletteOverlay'),
  paletteInput: $('paletteInput'),
  paletteResults: $('paletteResults'),
  deleteOverlay: $('deleteOverlay'),
  deleteProjectName: $('deleteProjectName'),
  deleteProjectDir: $('deleteProjectDir'),
  deleteProjectDate: $('deleteProjectDate'),
  cancelDelete: $('cancelDelete'),
  confirmDelete: $('confirmDelete'),

  // Toast
  toastContainer: $('toastContainer'),

  // Misc
  refreshIndicator: $('refreshIndicator'),
  emptyScanBtn: $('emptyScanBtn'),
  overviewCards: $('overviewCards'),
};

/* ─── Helper ─────────────────────────────────────────────── */
function escapeHtml(str) {
  if (str == null) return '';
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(String(str)));
  return div.innerHTML;
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  var now = new Date();
  var d = new Date(dateStr.replace(' ', 'T') + 'Z');
  var diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

function estimateProgress(project) {
  // Smart heuristic: presence of various fields = more complete
  var score = 0;
  if (project.description && project.description !== 'No description') score += 20;
  if (Array.isArray(project.stack) && project.stack.length > 0) score += Math.min(project.stack.length * 10, 30);
  if (Array.isArray(project.features) && project.features.length > 0) score += Math.min(project.features.length * 10, 20);
  if (project.status && project.status !== 'Unknown') score += 10;
  if (project.progress && project.progress !== 'Unknown') score += 10;
  if (project.summary_json) score += 10;
  return Math.min(score, 100);
}

/* ─── Skeleton Loaders ──────────────────────────────────── */
function renderSkeletons() {
  var html = '';
  for (var i = 0; i < 5; i++) {
    html += '<div class="skeleton-item">' +
      '<div class="skeleton-line short" style="animation-delay:' + (i * 0.1) + 's"></div>' +
      '<div class="skeleton-line tiny" style="animation-delay:' + (i * 0.1 + 0.05) + 's"></div>' +
      '<div class="skeleton-line tiny" style="animation-delay:' + (i * 0.1 + 0.1) + 's; width:40%"></div>' +
    '</div>';
  }
  dom.projectList.innerHTML = html;
}

/* ═══════════════════════════════════════════════════════════
   RENDER FUNCTIONS
   ═══════════════════════════════════════════════════════════ */

/* ─── Render Project List (Sidebar) ─────────────────────── */
function renderProjectList() {
  var query = state.searchQuery.toLowerCase();
  var filtered = query
    ? state.projects.filter(function (p) {
        return (
          (p.name && p.name.toLowerCase().includes(query)) ||
          (Array.isArray(p.stack) && p.stack.some(function (s) { return s.toLowerCase().includes(query); })) ||
          (p.description && p.description.toLowerCase().includes(query))
        );
      })
    : state.projects;

  dom.projectCount.textContent = filtered.length;

  // Stats
  dom.statTotal.textContent = state.projects.length;
  dom.statActive.textContent = state.projects.filter(function (p) { return (p.status || '').toLowerCase() === 'active'; }).length;
  dom.statErrors.textContent = state.projects.filter(function (p) { return (p.status || '').toLowerCase() === 'error'; }).length;

  if (state.projects.length === 0) {
    dom.projectList.innerHTML = '<div class="no-projects">' + icon('folder', 32) + '<br><br>No projects yet.<br>Scan a project to get started.</div>';
    return;
  }

  if (filtered.length === 0) {
    dom.projectList.innerHTML = '<div class="no-projects">' + icon('search', 32) + '<br><br>No projects match "' + escapeHtml(state.searchQuery) + '"</div>';
    return;
  }

  dom.projectList.innerHTML = filtered.map(function (p, idx) {
    var isActive = p.id === state.selectedId;
    var stack = Array.isArray(p.stack) ? p.stack : [];
    var statusClass = (p.status || '').toLowerCase() === 'active' ? 'active' : 'unknown';
    var progress = estimateProgress(p);
    var date = timeAgo(p.updated_at || p.created_at);

    // Stack chips (max 3)
    var chips = stack.slice(0, 3).map(function (s) {
      var cat = getStackCategory(s);
      return '<span class="stack-chip cat-' + cat + '">' + escapeHtml(s) + '</span>';
    }).join('');
    if (stack.length > 3) chips += '<span class="stack-chip">+' + (stack.length - 3) + '</span>';

    return '<div class="project-item' + (isActive ? ' active' : '') + '" data-id="' + p.id + '" style="animation-delay:' + (idx * 0.03) + 's">' +
      '<div class="project-name">' +
        escapeHtml(p.name || 'Unnamed') +
        (progress > 0 ? '<span class="project-progress"><span class="project-progress-bar" style="width:' + progress + '%"></span></span>' : '') +
      '</div>' +
      '<div class="project-meta">' +
        '<span class="status-badge ' + statusClass + '">' + escapeHtml(p.status || 'Unknown') + '</span>' +
        '<span class="project-date">' + date + '</span>' +
      '</div>' +
      (chips ? '<div class="project-stack-chips">' + chips + '</div>' : '') +
    '</div>';
  }).join('');
}

/* ─── Render Detail Panel ───────────────────────────────── */
function renderDetail() {
  var project = state.projects.find(function (p) { return p.id === state.selectedId; });
  if (!project) {
    dom.detailEmpty.classList.remove('hidden');
    dom.detailContent.classList.add('hidden');
    return;
  }

  dom.detailEmpty.classList.add('hidden');
  dom.detailContent.classList.remove('hidden');

  // Hero
  dom.detailName.textContent = project.name || 'Unnamed';
  dom.detailStatusText.textContent = project.status || 'Unknown';
  var isActive = (project.status || '').toLowerCase() === 'active';
  dom.statusDot.className = 'status-dot ' + (isActive ? 'active' : 'unknown');
  dom.detailId.textContent = '#' + project.id;
  dom.detailDir.textContent = project.directory || '';
  dom.detailTime.textContent = timeAgo(project.updated_at || project.created_at);

  // Overview Cards
  dom.detailProgress.textContent = estimateProgress(project) + '%';
  dom.progressBar.style.width = estimateProgress(project) + '%';
  var featCount = Array.isArray(project.features) ? project.features.length : 0;
  dom.detailFeatureCount.textContent = featCount;

  // Description
  dom.detailDesc.textContent = project.description || 'No description available.';

  // Tech Stack
  var stack = Array.isArray(project.stack) ? project.stack : [];
  if (stack.length > 0) {
    dom.stackSection.classList.remove('hidden');

    // Group by category
    var groups = {};
    var categoryLabels = { frontend: 'Frontend', backend: 'Backend', database: 'Database', devops: 'DevOps', mobile: 'Mobile', other: 'Other' };
    var categoryOrder = ['frontend', 'backend', 'database', 'devops', 'mobile', 'other'];

    stack.forEach(function (s) {
      var cat = getStackCategory(s);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    });

    dom.stackCount.textContent = stack.length;

    dom.detailStack.innerHTML = categoryOrder.map(function (cat) {
      if (!groups[cat] || groups[cat].length === 0) return '';
      return '<div class="stack-group">' +
        '<span class="stack-group-label">' + categoryLabels[cat] + '</span>' +
        '<div class="stack-group-items">' +
          groups[cat].map(function (s) {
            return '<span class="tag cat-' + cat + '">' + escapeHtml(s) + '</span>';
          }).join('') +
        '</div>' +
      '</div>';
    }).join('');
  } else {
    dom.stackSection.classList.add('hidden');
  }

  // Features
  var features = Array.isArray(project.features) ? project.features : [];
  if (features.length > 0) {
    dom.featuresSection.classList.remove('hidden');
    dom.featureCount.textContent = features.length;
    dom.detailFeatures.innerHTML = features.map(function (f) {
      return '<li>' + escapeHtml(f) + '</li>';
    }).join('');
  } else {
    dom.featuresSection.classList.add('hidden');
  }

  // Summary tabs
  var summaryJson = typeof project.summary_json === 'object'
    ? JSON.stringify(project.summary_json, null, 2)
    : project.summary_json || '{}';
  var summaryMd = project.summary_md || '# No markdown summary available.';

  dom.summaryJson.innerHTML = '<code>' + highlightJson(summaryJson) + '</code>';
  dom.summaryMd.innerHTML = '<code>' + escapeHtml(summaryMd) + '</code>';
  dom.summaryPreview.innerHTML = renderMarkdown(summaryMd);

  // Timestamps
  dom.detailCreated.textContent = project.created_at || 'N/A';
  dom.detailUpdated.textContent = project.updated_at || 'N/A';

  // Store project ID
  dom.detailContent.dataset.projectId = project.id;
}

/* ─── JSON Syntax Highlighting ──────────────────────────── */
function highlightJson(jsonStr) {
  return escapeHtml(jsonStr)
    .replace(/(&quot;[^&]*&quot;)(\s*)(:)/g, function(match, key, space, colon) {
      return '<span class="json-key">' + key + '</span>' + space + colon;
    })
    .replace(/(:)(\s*)(&quot;[^&]*&quot;)/g, function(match, colon, space, val) {
      return colon + space + '<span class="json-string">' + val + '</span>';
    })
    .replace(/:\s*(true|false)/g, function(match) {
      return match.replace('true', '<span class="json-boolean">true</span>')
                  .replace('false', '<span class="json-boolean">false</span>');
    })
    .replace(/:\s*null/g, ': <span class="json-null">null</span>')
    .replace(/:\s*(\d+\.?\d*)/g, ': <span class="json-number">$1</span>');
}

/* ─── Minimal Markdown Renderer ─────────────────────────── */
function renderMarkdown(md) {
  if (!md) return '<p class="empty-hint">No markdown content available.</p>';

  var lines = md.split('\n');
  var html = '';
  var inCodeBlock = false;
  var codeBuffer = [];

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];

    // Code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        html += '<pre><code>' + escapeHtml(codeBuffer.join('\n')) + '</code></pre>';
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Headings
    if (line.startsWith('### ')) { html += '<h3>' + inlineMarkdown(line.slice(4)) + '</h3>'; continue; }
    if (line.startsWith('## '))  { html += '<h2>' + inlineMarkdown(line.slice(3)) + '</h2>'; continue; }
    if (line.startsWith('# '))   { html += '<h1>' + inlineMarkdown(line.slice(2)) + '</h1>'; continue; }

    // Horizontal rules
    if (line.trim() === '---') { html += '<hr>'; continue; }

    // Bullet points
    if (line.trim().startsWith('- ')) {
      html += '<li>' + inlineMarkdown(line.trim().slice(2)) + '</li>';
      // Check if next line is also a bullet
      var next = lines[i + 1];
      if (!next || !next.trim().startsWith('- ')) {
        html = html.replace(/<li>([\s\S]*?)<\/li>$/, '<ul>$&</ul>');
      }
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      // Close any open ul
      if (html.endsWith('</li>')) html += '</ul>';
      continue;
    }

    // Paragraph
    html += '<p>' + inlineMarkdown(line) + '</p>';
  }

  // Close any remaining code block
  if (inCodeBlock && codeBuffer.length > 0) {
    html += '<pre><code>' + escapeHtml(codeBuffer.join('\n')) + '</code></pre>';
  }

  return html || '<p class="empty-hint">No content</p>';
}

function inlineMarkdown(text) {
  var escaped = escapeHtml(text);
  // Inline code
  escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Bold
  escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic
  escaped = escaped.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return escaped;
}

/* ═══════════════════════════════════════════════════════════
   TOAST SYSTEM
   ═══════════════════════════════════════════════════════════ */
var toastTimers = {};

function showToast(message, type, action) {
  type = type || 'info';
  var id = 'toast-' + Date.now();

  var el = document.createElement('div');
  el.className = 'toast ' + type;
  el.id = id;

  var iconMap = { success: 'check', error: 'alert', warning: 'alert', info: 'search' };

  el.innerHTML =
    '<span class="toast-icon">' + icon(iconMap[type] || 'hash', 16) + '</span>' +
    '<span class="toast-msg">' + escapeHtml(message) + '</span>' +
    (action ? '<button class="toast-action" data-action="' + escapeHtml(action.label) + '">' + escapeHtml(action.label) + '</button>' : '') +
    '<button class="toast-close" data-toast="' + id + '">' + icon('x', 14) + '</button>';

  dom.toastContainer.appendChild(el);

  // Auto-dismiss
  toastTimers[id] = setTimeout(function () {
    dismissToast(id);
  }, action ? 8000 : 4000);

  // Click to dismiss
  el.querySelector('.toast-close').addEventListener('click', function () {
    dismissToast(id);
  });

  // Action button
  if (action) {
    el.querySelector('.toast-action').addEventListener('click', function () {
      action.fn();
      dismissToast(id);
    });
  }

  // Hover pauses dismiss
  el.addEventListener('mouseenter', function () {
    clearTimeout(toastTimers[id]);
  });
  el.addEventListener('mouseleave', function () {
    toastTimers[id] = setTimeout(function () {
      dismissToast(id);
    }, 2000);
  });

  // Limit to 5 visible toasts
  while (dom.toastContainer.children.length > 5) {
    dom.toastContainer.firstChild.classList.add('removing');
    setTimeout(function (el) { if (el.parentNode) el.parentNode.removeChild(el); }, 300, dom.toastContainer.firstChild);
  }

  return id;
}

function dismissToast(id) {
  var el = document.getElementById(id);
  if (!el) return;
  clearTimeout(toastTimers[id]);
  delete toastTimers[id];
  el.classList.add('removing');
  setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
}

/* ─── Scan Progress Toast ──────────────────────────────── */
var scanToastId = null;

function showScanToast(path) {
  if (scanToastId) dismissToast(scanToastId);

  var id = 'scan-toast-' + Date.now();
  scanToastId = id;

  var el = document.createElement('div');
  el.className = 'toast scanning';
  el.id = id;
  el.innerHTML =
    '<div class="toast-row">' +
      '<span class="toast-icon">' + icon('scan', 16) + '</span>' +
      '<span class="toast-msg">Scanning <strong>' + escapeHtml(path) + '</strong>...</span>' +
      '<button class="toast-close" data-toast="' + id + '">' + icon('x', 14) + '</button>' +
    '</div>' +
    '<div class="scan-toast-progress"><div class="scan-toast-bar"></div></div>';

  dom.toastContainer.appendChild(el);

  el.querySelector('.toast-close').addEventListener('click', function () {
    dismissToast(id);
  });

  return id;
}

function dismissScanToast() {
  if (scanToastId) {
    dismissToast(scanToastId);
    scanToastId = null;
  }
}

/* ═══════════════════════════════════════════════════════════
   COMMAND PALETTE
   ═══════════════════════════════════════════════════════════ */
var paletteSelectedIndex = -1;
var paletteItems = [];

function openPalette() {
  dom.paletteOverlay.classList.remove('hidden');
  dom.paletteInput.value = '';
  dom.paletteInput.focus();
  paletteSelectedIndex = -1;
  updatePaletteResults();
}

function closePalette() {
  dom.paletteOverlay.classList.add('hidden');
}

function updatePaletteResults() {
  var q = dom.paletteInput.value.toLowerCase().trim();

  // Build items
  var projectItems = state.projects
    .filter(function (p) { return !q || p.name.toLowerCase().includes(q) || (Array.isArray(p.stack) && p.stack.some(function (s) { return s.toLowerCase().includes(q); })); })
    .slice(0, 6)
    .map(function (p) {
      return {
        type: 'project',
        id: p.id,
        title: p.name || 'Unnamed',
        desc: (Array.isArray(p.stack) ? p.stack.slice(0, 3).join(', ') : '') || 'No stack',
      };
    });

  var actionItems = [
    { type: 'action', action: 'scan', title: 'Scan a directory', desc: 'Start scanning a project folder' },
    { type: 'action', action: 'scan-all', title: 'Scan all subdirectories', desc: 'Batch scan a parent folder' },
    { type: 'action', action: 'scan-github', title: 'Scan GitHub repo', desc: 'Clone and scan a GitHub repository' },
    { type: 'action', action: 'refresh', title: 'Refresh projects', desc: 'Reload the project list' },
  ];

  paletteItems = q ? projectItems : projectItems.concat(actionItems);
  paletteSelectedIndex = -1;

  if (paletteItems.length === 0) {
    dom.paletteResults.innerHTML = '<div class="palette-no-results">' + icon('search', 24) + '<br><br>No results for "' + escapeHtml(q) + '"</div>';
    return;
  }

  dom.paletteResults.innerHTML = paletteItems.map(function (item, i) {
    var iconType = item.type === 'project' ? 'folder' : (item.action === 'scan' ? 'scan' : 'refresh');
    var iconStyle = item.type === 'project' ? 'project-item-icon' : 'action-item-icon';
    return '<div class="palette-item" data-index="' + i + '">' +
      '<span class="palette-item-icon ' + iconStyle + '">' + icon(iconType, 16) + '</span>' +
      '<div class="palette-item-info">' +
        '<div class="palette-item-title">' + escapeHtml(item.title) + '</div>' +
        '<div class="palette-item-desc">' + escapeHtml(item.desc) + '</div>' +
      '</div>' +
      '<div class="palette-item-actions">' +
        (item.type === 'project' ? '<kbd>&crarr;</kbd>' : '') +
      '</div>' +
    '</div>';
  }).join('');

  // Click handlers
  dom.paletteResults.querySelectorAll('.palette-item').forEach(function (el) {
    el.addEventListener('click', function () {
      var idx = parseInt(el.dataset.index);
      executePaletteItem(idx);
    });
  });
}

function executePaletteItem(index) {
  if (index < 0 || index >= paletteItems.length) return;
  var item = paletteItems[index];
  closePalette();

  if (item.type === 'project') {
    state.selectedId = item.id;
    renderProjectList();
    renderDetail();
    showToast('Opened ' + item.title, 'info');
  } else if (item.action === 'scan') {
    dom.scanPath.focus();
    dom.scanPath.scrollIntoView({ behavior: 'smooth' });
  } else if (item.action === 'scan-all') {
    promptScanAll();
  } else if (item.action === 'scan-github') {
    switchScanMode('github');
    dom.scanPath.focus();
  } else if (item.action === 'refresh') {
    loadProjects();
  }
}

function promptScanAll() {
  var path = dom.scanPath.value.trim() || './';
  dom.scanPath.value = path;
  handleScanAll();
}

/* ─── Palette Keyboard Navigation ──────────────────────── */
dom.paletteInput.addEventListener('input', updatePaletteResults);

dom.paletteInput.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closePalette();
    return;
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    paletteSelectedIndex = Math.min(paletteSelectedIndex + 1, paletteItems.length - 1);
    highlightPaletteItem();
    return;
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault();
    paletteSelectedIndex = Math.max(paletteSelectedIndex - 1, -1);
    highlightPaletteItem();
    return;
  }

  if (e.key === 'Enter') {
    e.preventDefault();
    if (paletteSelectedIndex < 0 && paletteItems.length > 0) paletteSelectedIndex = 0;
    executePaletteItem(paletteSelectedIndex);
    return;
  }
});

function highlightPaletteItem() {
  dom.paletteResults.querySelectorAll('.palette-item').forEach(function (el, i) {
    el.classList.toggle('selected', i === paletteSelectedIndex);
  });
  if (paletteSelectedIndex >= 0) {
    var selected = dom.paletteResults.children[paletteSelectedIndex];
    if (selected) selected.scrollIntoView({ block: 'nearest' });
  }
}

// Close palette on Escape
dom.paletteOverlay.addEventListener('click', function (e) {
  if (e.target === dom.paletteOverlay) closePalette();
});

/* ═══════════════════════════════════════════════════════════
   DELETE CONFIRMATION
   ═══════════════════════════════════════════════════════════ */
var pendingDeleteId = null;

function showDeleteConfirm(projectId) {
  var project = state.projects.find(function (p) { return p.id === projectId; });
  if (!project) return;

  pendingDeleteId = projectId;
  dom.deleteProjectName.textContent = project.name || 'Unnamed';
  dom.deleteProjectDir.textContent = project.directory || '';
  dom.deleteProjectDate.textContent = 'Scanned on: ' + (project.created_at || 'Unknown date');
  dom.deleteOverlay.classList.remove('hidden');

  // Focus trap
  dom.cancelDelete.focus();
}

function closeDeleteConfirm() {
  dom.deleteOverlay.classList.add('hidden');
  pendingDeleteId = null;
}

/* ─── Event Handlers ─────────────────────────────────────── */

// ── Project list click delegation ──
dom.projectList.addEventListener('click', function (e) {
  var item = e.target.closest('.project-item');
  if (item) {
    state.selectedId = parseInt(item.dataset.id);
    renderProjectList();
    renderDetail();
  }
});

// ── Search ──
dom.searchInput.addEventListener('input', function () {
  state.searchQuery = dom.searchInput.value;
  dom.clearSearch.style.display = state.searchQuery ? 'block' : 'none';
  renderProjectList();

  if (state.selectedId) {
    var query = state.searchQuery.toLowerCase();
    var found = state.projects.find(function (p) {
      return p.id === state.selectedId && (
        (p.name && p.name.toLowerCase().includes(query)) ||
        (Array.isArray(p.stack) && p.stack.some(function (s) { return s.toLowerCase().includes(query); })) ||
        (p.description && p.description.toLowerCase().includes(query))
      );
    });
    if (!found && query) {
      state.selectedId = null;
      renderDetail();
    }
  }
});

dom.clearSearch.addEventListener('click', function () {
  dom.searchInput.value = '';
  state.searchQuery = '';
  dom.clearSearch.style.display = 'none';
  renderProjectList();
});

/* ─── Scan Mode Tabs ─────────────────────────────────────── */
var scanMode = 'path'; // 'path' | 'github'

function switchScanMode(mode) {
  scanMode = mode;

  // Update tab styles
  dom.scanTabs.querySelectorAll('.scan-tab').forEach(function (tab) {
    tab.classList.toggle('active', tab.dataset.mode === mode);
  });

  if (mode === 'github') {
    dom.scanInputIcon.innerHTML = icon('github', 16).replace(/^<svg[^>]*>|'<\/svg>$/g, '');
    dom.scanPath.placeholder = 'Enter GitHub URL — e.g. user/repo or full URL';
    dom.scanBtnBar.classList.add('hidden');
    dom.scanAllBtnBar.classList.add('hidden');
    dom.scanGitHubBtnBar.classList.remove('hidden');
  } else {
    dom.scanInputIcon.innerHTML = icon('folder', 16).replace(/^<svg[^>]*>|'<\/svg>$/g, '');
    dom.scanPath.placeholder = 'Enter path to scan — e.g. ./my-project or /absolute/path';
    dom.scanBtnBar.classList.remove('hidden');
    dom.scanAllBtnBar.classList.remove('hidden');
    dom.scanGitHubBtnBar.classList.add('hidden');
  }
}

dom.scanTabs.addEventListener('click', function (e) {
  var tab = e.target.closest('.scan-tab');
  if (tab) {
    switchScanMode(tab.dataset.mode);
    dom.scanPath.value = '';
    dom.scanPath.focus();
  }
});

// ── Scan Buttons (header + toolbar) ──
function handleScan() {
  var path = dom.scanPath.value.trim();
  if (!path) {
    showToast('Please enter a ' + (scanMode === 'github' ? 'GitHub URL' : 'path') + ' to scan', 'error');
    dom.scanPath.focus();
    return;
  }

  if (scanMode === 'github') {
    handleGitHubScan();
    return;
  }

  isScanning = true;
  stopAutoRefresh();
  dom.scanBtn.disabled = true;
  dom.scanBtnBar.disabled = true;

  var toastId = showScanToast(path);

  API.scanProject(path).then(function (result) {
    dismissScanToast();
    showToast('"' + (result.name || 'Unnamed') + '" scanned successfully!', 'success');
    dom.scanPath.value = '';
    return loadProjects().then(function () {
      if (result.id) {
        state.selectedId = result.id;
        renderDetail();
      }
    });
  }).catch(function (err) {
    dismissScanToast();
    showToast('Scan failed: ' + err.message, 'error');
  }).then(function () {
    isScanning = false;
    dom.scanBtn.disabled = false;
    dom.scanBtnBar.disabled = false;
    startAutoRefresh();
  });
}

function handleGitHubScan() {
  var url = dom.scanPath.value.trim();
  if (!url) {
    showToast('Please enter a GitHub URL', 'error');
    dom.scanPath.focus();
    return;
  }

  isScanning = true;
  stopAutoRefresh();
  dom.scanGitHubBtnBar.disabled = true;

  var toastId = showScanToast(url);

  API.scanGitHubRepo(url).then(function (result) {
    dismissScanToast();
    showToast('"' + (result.name || 'Unnamed') + '" cloned & scanned!', 'success');
    dom.scanPath.value = '';
    return loadProjects().then(function () {
      if (result.id) {
        state.selectedId = result.id;
        renderDetail();
      }
    });
  }).catch(function (err) {
    dismissScanToast();
    showToast('GitHub scan failed: ' + err.message, 'error');
  }).then(function () {
    isScanning = false;
    dom.scanGitHubBtnBar.disabled = false;
    startAutoRefresh();
  });
}

function handleScanAll() {
  var path = dom.scanPath.value.trim();
  if (!path) {
    showToast('Please enter a parent directory path', 'error');
    dom.scanPath.focus();
    return;
  }

  isScanning = true;
  stopAutoRefresh();
  dom.scanAllBtn.disabled = true;
  dom.scanAllBtnBar.disabled = true;

  // Use overlay for batch (it's heavier)
  var overlay = document.createElement('div');
  overlay.className = 'scanning-overlay';
  overlay.innerHTML = '<div class="scanning-modal"><div class="spinner"></div><p>Scanning all subdirectories in <strong>' + escapeHtml(path) + '</strong>...</p></div>';
  document.body.appendChild(overlay);

  API.scanAllProjects(path).then(function (result) {
    overlay.remove();
    var scanned = result.scanned || [];
    var msg = 'Scanned ' + scanned.length + ' project(s) successfully!';
    if (result.errors && result.errors.length > 0) msg += ' (' + result.errors.length + ' error(s))';
    showToast(msg, result.errors && result.errors.length > 0 ? 'warning' : 'success');
    dom.scanPath.value = '';
    return loadProjects();
  }).catch(function (err) {
    overlay.remove();
    showToast('Batch scan failed: ' + err.message, 'error');
  }).then(function () {
    isScanning = false;
    dom.scanAllBtn.disabled = false;
    dom.scanAllBtnBar.disabled = false;
    startAutoRefresh();
  });
}

dom.scanBtn.addEventListener('click', handleScan);
dom.scanBtnBar.addEventListener('click', handleScan);
dom.scanPath.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') handleScan();
});
dom.scanAllBtn.addEventListener('click', handleScanAll);
dom.scanAllBtnBar.addEventListener('click', handleScanAll);
dom.scanGitHubBtnBar.addEventListener('click', handleGitHubScan);

// ── Detail Actions ──
var _copyJsonOriginal = '';
dom.copyJsonBtn.addEventListener('click', function () {
  var content = dom.summaryJson.textContent;
  copyToClipboard(content, 'JSON copied to clipboard!', dom.copyJsonBtn);
});

dom.copyMdBtn.addEventListener('click', function () {
  var content = dom.summaryMd.textContent;
  copyToClipboard(content, 'Markdown copied to clipboard!', dom.copyMdBtn);
});

dom.deleteBtn.addEventListener('click', function () {
  var id = parseInt(dom.detailContent.dataset.projectId);
  if (id) showDeleteConfirm(id);
});

// ── Tab Copy Button ──
dom.tabCopyBtn.addEventListener('click', function () {
  var activeTab = document.querySelector('.tab-pane.active');
  if (activeTab) {
    copyToClipboard(activeTab.textContent, 'Copied!', dom.tabCopyBtn);
  }
});

// ── Copy directory path ──
dom.detailDir.addEventListener('click', function () {
  var text = dom.detailDir.textContent;
  if (text) copyToClipboard(text, 'Path copied!');
});

function copyToClipboard(text, successMsg, btn) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () {
      showToast(successMsg || 'Copied!', 'success');
      if (btn) {
        btn.classList.add('copied');
        setTimeout(function () { btn.classList.remove('copied'); }, 2000);
      }
    }).catch(function () {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  var textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast('Copied to clipboard!', 'success');
  } catch (err) {
    showToast('Failed to copy', 'error');
  }
  document.body.removeChild(textarea);
}

// ── Tab Switching ──
document.querySelector('.tabs').addEventListener('click', function (e) {
  var tab = e.target.closest('.tab');
  if (!tab) return;

  document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
  document.querySelectorAll('.tab-pane').forEach(function (p) { p.classList.remove('active'); });

  tab.classList.add('active');
  tab.setAttribute('aria-selected', 'true');
  var paneId = 'summary' + tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1);
  document.getElementById(paneId).classList.add('active');
});

// ── Delete Modal ──
dom.cancelDelete.addEventListener('click', closeDeleteConfirm);
dom.confirmDelete.addEventListener('click', function () {
  if (pendingDeleteId != null) {
    handleDelete(pendingDeleteId);
  }
  closeDeleteConfirm();
});
dom.deleteOverlay.addEventListener('click', function (e) {
  if (e.target === dom.deleteOverlay) closeDeleteConfirm();
});

// ── Sort button ──
var sortAscending = false;
dom.sortBtn.addEventListener('click', function () {
  sortAscending = !sortAscending;
  state.projects.sort(function (a, b) {
    var cmp = (a.name || '').localeCompare(b.name || '');
    return sortAscending ? cmp : -cmp;
  });
  renderProjectList();
  showToast('Sorted ' + (sortAscending ? 'A-Z' : 'Z-A'), 'info');
});

// ── Empty State CTA ──
dom.emptyScanBtn.addEventListener('click', function () {
  dom.scanPath.focus();
  dom.scanPath.scrollIntoView({ behavior: 'smooth' });
});

/* ═══════════════════════════════════════════════════════════
   DATA LOADING
   ═══════════════════════════════════════════════════════════ */
async function loadProjects() {
  try {
    state.projects = await API.getProjects();
    renderProjectList();
    if (state.selectedId) {
      renderDetail();
    }
  } catch (err) {
    showToast('Failed to load projects: ' + err.message, 'error');
  }
}

async function handleDelete(id) {
  stopAutoRefresh();

  // Save for potential undo
  var deletedProject = state.projects.find(function (p) { return p.id === id; });

  try {
    await API.deleteProject(id);
    showToast('"' + (deletedProject ? deletedProject.name : 'Project') + '" deleted', 'success', {
      label: 'Undo',
      fn: function () {
        // Can't undo a server-side delete easily, but we can re-scan
        if (deletedProject && deletedProject.directory) {
          showToast('Re-scanning ' + deletedProject.name + '...', 'info');
          API.scanProject(deletedProject.directory).then(function () {
            loadProjects();
            showToast('Project restored!', 'success');
          }).catch(function () {
            showToast('Undo failed: directory not found', 'error');
          });
        }
      }
    });
    if (state.selectedId === id) state.selectedId = null;
    await loadProjects();
  } catch (err) {
    showToast('Delete failed: ' + err.message, 'error');
  }

  startAutoRefresh();
}

/* ═══════════════════════════════════════════════════════════
   AUTO-REFRESH
   ═══════════════════════════════════════════════════════════ */
function startAutoRefresh() {
  if (refreshTimer) return;

  dom.refreshIndicator.classList.add('active');

  refreshTimer = setInterval(async function () {
    if (isScanning || !isTabVisible) return;

    dom.refreshIndicator.classList.add('loading');

    try {
      var freshData = await API.getProjects();

      var changed = freshData.length !== state.projects.length;
      if (!changed) {
        for (var i = 0; i < freshData.length; i++) {
          if (JSON.stringify(freshData[i]) !== JSON.stringify(state.projects[i])) {
            changed = true;
            break;
          }
        }
      }

      if (changed) {
        var oldSelectedId = state.selectedId;
        state.projects = freshData;
        renderProjectList();

        if (oldSelectedId) {
          var stillExists = freshData.some(function (p) { return p.id === oldSelectedId; });
          if (stillExists) {
            state.selectedId = oldSelectedId;
            renderDetail();
          } else {
            state.selectedId = null;
            renderDetail();
          }
        }
      }
    } catch (err) {
      dom.refreshIndicator.classList.remove('active');
    } finally {
      dom.refreshIndicator.classList.remove('loading');
    }
  }, REFRESH_INTERVAL);
}

function stopAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
  dom.refreshIndicator.classList.remove('active', 'loading');
}

document.addEventListener('visibilitychange', function () {
  isTabVisible = !document.hidden;
  if (isTabVisible) {
    dom.refreshIndicator.classList.add('active');
  } else {
    dom.refreshIndicator.classList.remove('active');
  }
});

/* ═══════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
   ═══════════════════════════════════════════════════════════ */
document.addEventListener('keydown', function (e) {
  // Cmd+K / Ctrl+K → command palette
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    if (dom.paletteOverlay.classList.contains('hidden')) {
      openPalette();
    } else {
      closePalette();
    }
    return;
  }

  // Escape → close overlays
  if (e.key === 'Escape') {
    if (!dom.paletteOverlay.classList.contains('hidden')) {
      closePalette();
      return;
    }
    if (!dom.deleteOverlay.classList.contains('hidden')) {
      closeDeleteConfirm();
      return;
    }
  }
});

/* ═══════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════ */

// Show skeletons on initial load
renderSkeletons();

// Load data
loadProjects();
startAutoRefresh();
