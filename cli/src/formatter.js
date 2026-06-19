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

  lines.push(`# ${scanned.name}`);
  lines.push('');
  lines.push('## Description');
  lines.push(scanned.description || 'No description');
  lines.push('');

  if (scanned.stack && scanned.stack.length > 0) {
    lines.push('## Tech Stack');
    scanned.stack.forEach(item => lines.push(`- ${item}`));
    lines.push('');
  } else {
    lines.push('## Tech Stack\nNone\n');
  }

  if (scanned.features && scanned.features.length > 0) {
    lines.push('## Features');
    scanned.features.forEach(f => lines.push(`- ${f}`));
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
  lines.push(`**Status:** ${scanned.status || 'Unknown'}`);
  lines.push(`**Progress:** ${scanned.progress || 'Unknown'}`);

  return lines.join('\n');
}

module.exports = { generateSummaryJson, generateSummaryMd };
