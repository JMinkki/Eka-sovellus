const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const INDEX_PATH = path.join(DATA_DIR, 'index.json');

function emptyIndex() {
  return {
    folderId: null,
    indexedAt: null,
    files: [], // { id, name, path, mimeType, webViewLink, modifiedTime }
    chunks: [], // { id, fileId, fileName, path, webViewLink, text }
  };
}

function load() {
  if (!fs.existsSync(INDEX_PATH)) return emptyIndex();
  try {
    return JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
  } catch {
    return emptyIndex();
  }
}

function save(index) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
}

module.exports = { load, save, emptyIndex };
