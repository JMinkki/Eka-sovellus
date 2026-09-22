const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const DATA_DIR = path.join(__dirname, '..', 'data');
const TOKEN_PATH = path.join(DATA_DIR, 'google-token.json');

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadStoredTokens() {
  if (!fs.existsSync(TOKEN_PATH)) return null;
  return JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
}

function saveTokens(tokens) {
  ensureDataDir();
  const existing = loadStoredTokens() || {};
  const merged = { ...existing, ...tokens };
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(merged, null, 2));
}

function createOAuthClient() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const stored = loadStoredTokens();
  if (stored) client.setCredentials(stored);

  client.on('tokens', (tokens) => saveTokens(tokens));

  return client;
}

function isAuthenticated() {
  return loadStoredTokens() !== null;
}

function getAuthUrl(client) {
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });
}

function disconnect() {
  if (fs.existsSync(TOKEN_PATH)) fs.unlinkSync(TOKEN_PATH);
}

module.exports = {
  createOAuthClient,
  isAuthenticated,
  getAuthUrl,
  disconnect,
};
