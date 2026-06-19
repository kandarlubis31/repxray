async function uploadProject(apiUrl, projectData) {
  const url = `${apiUrl.replace(/\/+$/, '')}/api/projects`;

  const payload = {
    name: projectData.name,
    description: projectData.description,
    stack: projectData.stack || [],
    status: projectData.status || 'Unknown',
    progress: projectData.progress || 'Unknown',
    features: projectData.features || [],
    directory: projectData.directory,
    summary_json: projectData.summary_json || {},
    summary_md: projectData.summary_md || '',
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Server responded with ${response.status}: ${errorBody}`);
  }

  return response.json();
}

module.exports = { uploadProject };
