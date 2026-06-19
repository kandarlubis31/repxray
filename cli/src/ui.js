#!/usr/bin/env node

const API_URL = process.env.API_URL || 'http://localhost:7890';

// ─── Sort definitions ─────────────────────────────────────────
var SORT_MODES = [
  { key: 'name-asc',  label: 'Name \u2191',  sortFn: function (a, b) { return (a.name || '').localeCompare(b.name || ''); } },
  { key: 'name-desc', label: 'Name \u2193',  sortFn: function (a, b) { return (b.name || '').localeCompare(a.name || ''); } },
  { key: 'date-desc', label: 'Date \u2193',  sortFn: function (a, b) { return (b.created_at || '').localeCompare(a.created_at || ''); } },
  { key: 'date-asc',  label: 'Date \u2191',  sortFn: function (a, b) { return (a.created_at || '').localeCompare(b.created_at || ''); } },
  { key: 'stack-desc',label: 'Stack \u2193',  sortFn: function (a, b) {
    var ca = Array.isArray(a.stack) ? a.stack.length : 0;
    var cb = Array.isArray(b.stack) ? b.stack.length : 0;
    return cb - ca;
  }},
  { key: 'stack-asc', label: 'Stack \u2191',  sortFn: function (a, b) {
    var ca = Array.isArray(a.stack) ? a.stack.length : 0;
    var cb = Array.isArray(b.stack) ? b.stack.length : 0;
    return ca - cb;
  }},
];

// ─── Entry Point ───────────────────────────────────────────────
async function launchUI() {
  // Dynamic import because Ink v7+ is ESM-only
  var ink = await import('ink');
  var React = await import('react');

  var useState = React.useState;
  var useEffect = React.useEffect;
  var useMemo = React.useMemo;
  var h = React.createElement;

  var render = ink.render;
  var Box = ink.Box;
  var Text = ink.Text;
  var useInput = ink.useInput;
  var useApp = ink.useApp;
  var Static = ink.Static;

  // ── Fetcher ─────────────────────────────────────────────────
  async function fetchFromApi(path) {
    var url = (API_URL.replace(/\/+$/, '') + path);
    var res = await fetch(url);
    if (!res.ok) throw new Error('Server responded with ' + res.status);
    return res.json();
  }

  // ── Separator ───────────────────────────────────────────────
  function sep(width) {
    return '\u2500'.repeat(Math.min(width || 50, 80));
  }

  // ── App Component ───────────────────────────────────────────
  function App(props) {
    var initialProjects = props.projects || [];

    var _useState = useState(initialProjects);
    var projects = _useState[0];
    var setProjects = _useState[1];

    var _useState2 = useState(0);
    var selectedIndex = _useState2[0];
    var setSelectedIndex = _useState2[1];

    var _useState3 = useState('');
    var searchQuery = _useState3[0];
    var setSearchQuery = _useState3[1];

    var _useState4 = useState(false);
    var searching = _useState4[0];
    var setSearching = _useState4[1];

    var _useState5 = useState('');
    var searchBuffer = _useState5[0];
    var setSearchBuffer = _useState5[1];

    var _useState6 = useState('browse');
    var mode = _useState6[0];
    var setMode = _useState6[1];

    var _useState7 = useState('');
    var exportContent = _useState7[0];
    var setExportContent = _useState7[1];

    var _useState8 = useState('');
    var exportTitle = _useState8[0];
    var setExportTitle = _useState8[1];

    var _useState9 = useState(null);
    var deleteTarget = _useState9[0];
    var setDeleteTarget = _useState9[1];

    var _useState10 = useState('');
    var statusMsg = _useState10[0];
    var setStatusMsg = _useState10[1];

    // ── Sort state ──
    var _useState11 = useState(0);
    var sortIndex = _useState11[0];
    var setSortIndex = _useState11[1];

    var currentSort = SORT_MODES[sortIndex] || SORT_MODES[0];

    var _useApp = useApp();
    var exit = _useApp.exit;

    // Filter + sort projects
    var visibleProjects = useMemo(function () {
      var result = projects;

      // Filter by search
      if (searchQuery) {
        var q = searchQuery.toLowerCase();
        result = result.filter(function (p) {
          return (
            (p.name && p.name.toLowerCase().includes(q)) ||
            (Array.isArray(p.stack) && p.stack.some(function (s) { return s.toLowerCase().includes(q); })) ||
            (p.description && p.description.toLowerCase().includes(q))
          );
        });
      }

      // Sort
      result = result.slice().sort(currentSort.sortFn);

      return result;
    }, [projects, searchQuery, sortIndex]);

    var selectedProject = visibleProjects[selectedIndex] || null;

    // Reset selected index when list changes
    useEffect(function () {
      if (selectedIndex >= visibleProjects.length) {
        setSelectedIndex(Math.max(0, visibleProjects.length - 1));
      }
    }, [visibleProjects.length]);

    // Auto-exit after rendering export content via Static
    useEffect(function () {
      if (mode === 'json' || mode === 'md') {
        var timer = setTimeout(function () { exit(); }, 100);
        return function () { clearTimeout(timer); };
      }
    }, [mode, exit]);

    // Cycle to next sort mode
    function nextSort() {
      var nextIndex = (sortIndex + 1) % SORT_MODES.length;
      setSortIndex(nextIndex);
      setStatusMsg('Sort: ' + SORT_MODES[nextIndex].label + ' \u2022 Press S again to change');
    }

    // Keyboard input
    useInput(function (input, key) {
      // ── Search mode ──
      if (searching) {
        if (key.escape) {
          setSearching(false);
          setSearchBuffer('');
        } else if (key.return) {
          setSearchQuery(searchBuffer);
          setSearching(false);
          setSelectedIndex(0);
        } else if (key.backspace || key.delete) {
          setSearchBuffer(function (prev) { return prev.slice(0, -1); });
        } else if (input && input.length === 1 && !key.ctrl && !key.meta) {
          setSearchBuffer(function (prev) { return prev + input; });
        }
        return;
      }

      // ── Delete confirmation ──
      if (mode === 'confirmDelete') {
        if (input === 'y' || input === 'Y') {
          doDelete();
        }
        setMode('browse');
        return;
      }

      // ── Browse mode ──

      // Quit
      if (key.escape || input === 'q') {
        exit();
        return;
      }

      // Search
      if (input === '/') {
        setSearching(true);
        setSearchBuffer('');
        return;
      }

      // Sort cycle
      if (input === 's') {
        nextSort();
        return;
      }

      // Navigation
      if (key.upArrow || input === 'k') {
        setSelectedIndex(Math.max(0, selectedIndex - 1));
        return;
      }

      if (key.downArrow || input === 'j') {
        setSelectedIndex(Math.min(visibleProjects.length - 1, selectedIndex + 1));
        return;
      }

      if (!selectedProject) return;

      // Export JSON (uppercase J)
      if (input === 'J') {
        var jsonContent = JSON.stringify(selectedProject.summary_json || selectedProject, null, 2);
        setExportContent(jsonContent);
        setExportTitle('JSON Export: ' + selectedProject.name);
        setMode('json');
        return;
      }

      // Export Markdown (uppercase M)
      if (input === 'M') {
        var mdContent = selectedProject.summary_md || '# No markdown summary available';
        setExportContent(mdContent);
        setExportTitle('Markdown Export: ' + selectedProject.name);
        setMode('md');
        return;
      }

      // Delete
      if (input === 'd') {
        setDeleteTarget(selectedProject);
        setMode('confirmDelete');
        return;
      }
    });

    async function doDelete() {
      if (!deleteTarget) return;
      try {
        await fetchFromApi('/api/projects/' + deleteTarget.id);
        setProjects(projects.filter(function (p) { return p.id !== deleteTarget.id; }));
        var newIndex = Math.min(selectedIndex, visibleProjects.length - 2);
        setSelectedIndex(Math.max(0, newIndex));
        setStatusMsg('Deleted: ' + deleteTarget.name);
      } catch (err) {
        setStatusMsg('Delete failed: ' + err.message);
      }
      setDeleteTarget(null);
    }

    // ── Render Export Modes ──
    if (mode === 'json') {
      return h(Box, { flexDirection: 'column' },
        h(Static, null,
          h(Text, { key: 'jh' }, '\n' + exportTitle),
          h(Text, { key: 'js' }, '\n' + sep(60)),
          h(Text, { key: 'jc' }, '\n' + exportContent + '\n')
        ),
        h(Text, null, '')
      );
    }

    if (mode === 'md') {
      return h(Box, { flexDirection: 'column' },
        h(Static, null,
          h(Text, { key: 'mh' }, '\n' + exportTitle),
          h(Text, { key: 'ms' }, '\n' + sep(60)),
          h(Text, { key: 'mc' }, '\n' + exportContent + '\n')
        ),
        h(Text, null, '')
      );
    }

    // ── Render Browse Mode ──
    return h(Box, { flexDirection: 'column', width: '100%' },
      // Header bar
      h(Box, {
        height: 1,
        backgroundColor: '#00bcd4',
        paddingX: 1,
        justifyContent: 'space-between',
        width: '100%'
      },
        h(Text, { bold: true, color: 'black' }, '  Repxray \u2014 Project Browser  '),
        h(Text, { color: 'black' },
          searching
            ? '  Search: ' + searchBuffer + '\u2588  '
            : searchQuery
              ? '  \u2191/' + searchQuery + '/ (' + visibleProjects.length + '/' + projects.length + ')  '
              : '  ' + currentSort.label + ' | ' + projects.length + ' projects  '
        )
      ),

      // Main content: side-by-side panels
      h(Box, { flexGrow: 1, flexDirection: 'row', width: '100%' },

        // ── Left: Project List ──
        h(Box, {
          width: '30%',
          borderStyle: 'round',
          borderColor: '#00bcd4',
          flexDirection: 'column',
          minWidth: 24
        },
          h(Text, { bold: true, color: '#00bcd4' }, '  Projects'),
          h(Box, { marginTop: 1, flexDirection: 'column' },
            visibleProjects.length === 0
              ? h(Text, { dimColor: true }, '   No matching projects')
              : visibleProjects.map(function (project, i) {
                  return h(Box, {
                    key: project.id,
                    paddingX: 1,
                    backgroundColor: i === selectedIndex ? '#00bcd4' : 'transparent'
                  },
                    h(Text, {
                      color: i === selectedIndex ? 'white' : undefined,
                      bold: i === selectedIndex
                    },
                      (i === selectedIndex ? '\u25b6 ' : '  ') + (project.name || 'Unnamed')
                    )
                  );
                })
          )
        ),

        // ── Right: Project Detail ──
        h(Box, {
          flexGrow: 1,
          borderStyle: 'round',
          borderColor: '#4caf50',
          flexDirection: 'column',
          paddingX: 1
        },
          selectedProject
            ? renderDetail(selectedProject, h, Box, Text)
            : h(Box, { justifyContent: 'center', alignItems: 'center', flexGrow: 1 },
                h(Text, { dimColor: true }, 'Select a project from the list')
              )
        )
      ),

      // Status bar
      statusMsg
        ? h(Box, { paddingX: 1, backgroundColor: '#333', width: '100%' },
            h(Text, { color: 'yellow' }, '  ' + statusMsg)
          )
        : null,

      // Action bar
      h(Box, {
        height: 1,
        backgroundColor: 'black',
        paddingX: 1,
        width: '100%'
      },
        [
          { key: '\u2191\u2193', label: 'Nav' },
          { key: 'J', label: 'JSON' },
          { key: 'M', label: 'MD' },
          { key: 's', label: 'Sort' },
          { key: 'd', label: 'Delete' },
          { key: '/', label: 'Search' },
          { key: 'q', label: 'Quit' }
        ].map(function (item, i) {
          return h(Box, { key: i, marginRight: 3 },
            h(Text, { color: '#00bcd4' }, ' ' + item.key + ' '),
            h(Text, { color: 'white' }, item.label)
          );
        })
      )
    );
  }

  // ── Detail Panel ────────────────────────────────────────────
  function renderDetail(project, h, Box, Text) {
    var stack = Array.isArray(project.stack) ? project.stack : [];
    var features = Array.isArray(project.features) ? project.features : [];
    var detailItems = [];

    // Name
    detailItems.push(h(Text, { key: 'name', bold: true, underline: true },
      '  ' + (project.name || 'Unnamed')
    ));

    // Status rows
    detailItems.push(renderInfoRow('Status', project.status || 'Unknown', 'green'));
    detailItems.push(renderInfoRow('Progress', project.progress || 'Unknown'));
    detailItems.push(renderInfoRow('ID', String(project.id)));

    // Description
    if (project.description) {
      detailItems.push(h(Box, { key: 'desc', marginTop: 1 },
        h(Text, { dimColor: true }, '  ' + project.description)
      ));
    }

    // Tech Stack
    if (stack.length > 0) {
      detailItems.push(h(Text, { key: 'stack-h', marginTop: 1, bold: true }, '  Tech Stack:'));
      var stackItems = stack.slice(0, 15).map(function (s, i) {
        return h(Box, { key: 's' + i, marginLeft: 2 },
          h(Text, { color: '#ff9800' }, '  \u2022 '),
          h(Text, {}, s)
        );
      });
      if (stack.length > 15) {
        stackItems.push(h(Box, { key: 's-more', marginLeft: 2 },
          h(Text, { dimColor: true }, '  ... and ' + (stack.length - 15) + ' more')
        ));
      }
      detailItems.push(h(Box, { key: 'stack-list', flexDirection: 'column' }, ...stackItems));
    }

    // Features
    if (features.length > 0) {
      detailItems.push(h(Text, { key: 'feat-h', marginTop: 1, bold: true }, '  Features:'));
      var featItems = features.slice(0, 8).map(function (f, i) {
        return h(Box, { key: 'f' + i, marginLeft: 2 },
          h(Text, { color: '#4caf50' }, '  \u2022 '),
          h(Text, {}, f)
        );
      });
      if (features.length > 8) {
        featItems.push(h(Box, { key: 'f-more', marginLeft: 2 },
          h(Text, { dimColor: true }, '  ... and ' + (features.length - 8) + ' more')
        ));
      }
      detailItems.push(h(Box, { key: 'feat-list', flexDirection: 'column' }, ...featItems));
    }

    // Timestamps
    if (project.created_at) {
      detailItems.push(h(Box, { key: 'created', marginTop: 1 },
        h(Text, { dimColor: true }, '  Created: ' + project.created_at)
      ));
    }
    if (project.updated_at) {
      detailItems.push(h(Box, { key: 'updated' },
        h(Text, { dimColor: true }, '  Updated: ' + project.updated_at)
      ));
    }

    // Action hint
    detailItems.push(h(Box, { key: 'hint', marginTop: 2 },
      h(Text, { dimColor: true }, '  [s] Sort  [J] Export JSON  [M] Export MD  [d] Delete')
    ));

    return h(Box, { flexDirection: 'column', paddingX: 1 }, ...detailItems);
  }

  function renderInfoRow(label, value, color) {
    return h(Box, { key: label },
      h(Text, { dimColor: true, width: 12 }, '  ' + label + ': '),
      h(Text, { color: color || undefined }, value)
    );
  }

  // ── Bootstrap ──────────────────────────────────────────────
  try {
    var raw = await fetchFromApi('/api/projects');
    var projects = raw.data || [];

    var instance = render(h(App, { projects: projects }));
    await instance.waitUntilExit();
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      console.error('\n  Error: Cannot connect to Repxray server.');
      console.error('  Make sure the server is running on ' + API_URL + '\n');
    } else {
      console.error('\n  Error: ' + err.message + '\n');
    }
    process.exit(1);
  }
}

module.exports = { launchUI };
