require('dotenv').config();

const path = require('path');
const express = require('express');

const googleAuth = require('./googleAuth');
const indexer = require('./indexer');
const store = require('./indexStore');
const searchIndex = require('./searchIndex');
const claudeClient = require('./claudeClient');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

function requireGoogleAuth(req, res, next) {
  if (!googleAuth.isAuthenticated()) {
    return res.status(401).json({ error: 'Not connected to Google Drive yet' });
  }
  next();
}

app.get('/api/auth/status', (req, res) => {
  res.json({ authenticated: googleAuth.isAuthenticated() });
});

app.get('/auth/google', (req, res) => {
  const client = googleAuth.createOAuthClient();
  res.redirect(googleAuth.getAuthUrl(client));
});

app.get('/auth/google/callback', async (req, res) => {
  const { code, error } = req.query;
  if (error) return res.status(400).send(`Google auth error: ${error}`);
  try {
    const client = googleAuth.createOAuthClient();
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    require('fs').mkdirSync(path.join(__dirname, '..', 'data'), {
      recursive: true,
    });
    require('fs').writeFileSync(
      path.join(__dirname, '..', 'data', 'google-token.json'),
      JSON.stringify(tokens, null, 2)
    );
    res.redirect('/?connected=1');
  } catch (err) {
    res.status(500).send(`Failed to complete Google auth: ${err.message}`);
  }
});

app.post('/api/auth/disconnect', (req, res) => {
  googleAuth.disconnect();
  res.json({ ok: true });
});

app.post('/api/index', requireGoogleAuth, (req, res) => {
  const { folder } = req.body || {};
  if (!folder) return res.status(400).json({ error: 'folder is required' });

  try {
    const client = googleAuth.createOAuthClient();
    indexer.startIndexing(client, folder);
    res.json({ ok: true, status: indexer.getStatus() });
  } catch (err) {
    res.status(409).json({ error: err.message });
  }
});

app.get('/api/index/status', (req, res) => {
  res.json(indexer.getStatus());
});

app.get('/api/files', (req, res) => {
  const index = store.load();
  res.json({
    folderId: index.folderId,
    indexedAt: index.indexedAt,
    files: index.files,
  });
});

app.post('/api/ask', async (req, res) => {
  const { question } = req.body || {};
  if (!question) return res.status(400).json({ error: 'question is required' });

  const index = store.load();
  if (index.chunks.length === 0) {
    return res.status(400).json({
      error: 'No files indexed yet. Index a Google Drive folder first.',
    });
  }

  try {
    const matches = searchIndex.search(index.chunks, question, 6);
    const answer = await claudeClient.answerQuestion(question, matches);
    const sources = [
      ...new Map(
        matches.map((m) => [
          m.fileId,
          { name: m.fileName, path: m.path, webViewLink: m.webViewLink },
        ])
      ).values(),
    ];
    res.json({ answer, sources });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`IT Agent server listening on http://localhost:${PORT}`);
});
