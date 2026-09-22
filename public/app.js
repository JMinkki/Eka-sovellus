const authStatusEl = document.getElementById('auth-status');
const connectBtn = document.getElementById('connect-btn');
const disconnectBtn = document.getElementById('disconnect-btn');

const folderInput = document.getElementById('folder-input');
const indexBtn = document.getElementById('index-btn');
const indexStatusEl = document.getElementById('index-status');
const skippedListEl = document.getElementById('skipped-list');
const filesListEl = document.getElementById('files-list');

const chatEl = document.getElementById('chat');
const questionInput = document.getElementById('question-input');
const askBtn = document.getElementById('ask-btn');

let pollTimer = null;

async function refreshAuthStatus() {
  const res = await fetch('/api/auth/status');
  const data = await res.json();
  if (data.authenticated) {
    authStatusEl.textContent = 'Connected to Google Drive.';
    connectBtn.style.display = 'none';
    disconnectBtn.style.display = 'inline-flex';
  } else {
    authStatusEl.textContent = 'Not connected yet.';
    connectBtn.style.display = 'inline-flex';
    disconnectBtn.style.display = 'none';
  }
}

disconnectBtn.addEventListener('click', async () => {
  await fetch('/api/auth/disconnect', { method: 'POST' });
  refreshAuthStatus();
});

async function refreshFiles() {
  const res = await fetch('/api/files');
  const data = await res.json();
  if (!data.files || data.files.length === 0) {
    filesListEl.innerHTML = '';
    return;
  }
  filesListEl.innerHTML =
    `<strong>${data.files.length} file(s) indexed</strong><ul>` +
    data.files
      .map(
        (f) =>
          `<li>${f.webViewLink ? `<a href="${f.webViewLink}" target="_blank" rel="noopener">${f.path}</a>` : f.path}</li>`
      )
      .join('') +
    '</ul>';
}

function renderStatus(status) {
  if (status.status === 'idle') {
    indexStatusEl.textContent = '';
  } else if (status.status === 'error') {
    indexStatusEl.textContent = `Error: ${status.error}`;
  } else if (status.status === 'done') {
    indexStatusEl.textContent = status.message;
  } else {
    indexStatusEl.textContent = status.message || 'Working...';
  }

  skippedListEl.innerHTML = (status.skipped || [])
    .map((s) => `<li>${s.name}: ${s.reason}</li>`)
    .join('');
}

async function pollStatus() {
  const res = await fetch('/api/index/status');
  const status = await res.json();
  renderStatus(status);

  if (status.status === 'listing' || status.status === 'extracting') {
    pollTimer = setTimeout(pollStatus, 1200);
  } else {
    clearTimeout(pollTimer);
    refreshFiles();
  }
}

indexBtn.addEventListener('click', async () => {
  const folder = folderInput.value.trim();
  if (!folder) return;

  indexBtn.disabled = true;
  try {
    const res = await fetch('/api/index', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder }),
    });
    const data = await res.json();
    if (!res.ok) {
      indexStatusEl.textContent = `Error: ${data.error}`;
      return;
    }
    pollStatus();
  } finally {
    indexBtn.disabled = false;
  }
});

function addMessage(role, html) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.innerHTML = html;
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;
}

async function askQuestion() {
  const question = questionInput.value.trim();
  if (!question) return;

  addMessage('user', escapeHtml(question));
  questionInput.value = '';
  askBtn.disabled = true;

  try {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    if (!res.ok) {
      addMessage('agent', `Error: ${escapeHtml(data.error)}`);
      return;
    }

    const sourcesHtml =
      data.sources && data.sources.length
        ? `<div class="sources">Sources: ${data.sources
            .map((s) =>
              s.webViewLink
                ? `<a href="${s.webViewLink}" target="_blank" rel="noopener">${escapeHtml(s.path || s.name)}</a>`
                : escapeHtml(s.path || s.name)
            )
            .join(', ')}</div>`
        : '';

    addMessage('agent', `${escapeHtml(data.answer)}${sourcesHtml}`);
  } catch (err) {
    addMessage('agent', `Error: ${escapeHtml(err.message)}`);
  } finally {
    askBtn.disabled = false;
  }
}

askBtn.addEventListener('click', askQuestion);
questionInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') askQuestion();
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

refreshAuthStatus();
refreshFiles();
pollStatus();
