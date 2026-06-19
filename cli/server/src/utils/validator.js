function validateProject(body) {
  const errors = [];

  if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
    errors.push('name is required and must be a non-empty string');
  }

  if (!body.directory || typeof body.directory !== 'string' || body.directory.trim() === '') {
    errors.push('directory is required and must be a non-empty string');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function sanitizeArray(value) {
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? value : '[]';
    } catch {
      return '[]';
    }
  }
  return '[]';
}

function sanitizeString(value) {
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return JSON.stringify(value);
  return '';
}

module.exports = { validateProject, sanitizeArray, sanitizeString };
