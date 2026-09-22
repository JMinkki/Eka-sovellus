const {
  extractFolderId,
  getDriveClient,
  listFilesRecursive,
  extractFileText,
} = require('./driveService');
const { chunkText } = require('./chunker');
const store = require('./indexStore');
const searchIndex = require('./searchIndex');

const state = {
  status: 'idle', // idle | listing | extracting | done | error
  message: '',
  total: 0,
  processed: 0,
  skipped: [],
  error: null,
};

function getStatus() {
  return { ...state };
}

function resetState(message) {
  state.status = 'listing';
  state.message = message;
  state.total = 0;
  state.processed = 0;
  state.skipped = [];
  state.error = null;
}

async function runIndexing(authClient, folderInput) {
  const folderId = extractFolderId(folderInput);
  const drive = getDriveClient(authClient);

  resetState('Listing files in folder...');

  let files;
  try {
    files = await listFilesRecursive(drive, folderId);
  } catch (err) {
    state.status = 'error';
    state.error = err.message || String(err);
    throw err;
  }

  state.status = 'extracting';
  state.total = files.length;
  state.message = `Extracting text from ${files.length} file(s)...`;

  const indexedFiles = [];
  const chunks = [];

  for (const file of files) {
    state.processed += 1;
    state.message = `Processing (${state.processed}/${state.total}): ${file.path}`;
    try {
      const text = await extractFileText(drive, file);
      if (!text) {
        state.skipped.push({ name: file.path, reason: 'unsupported type' });
        continue;
      }

      const fileChunks = chunkText(text);
      fileChunks.forEach((chunkTextValue, i) => {
        chunks.push({
          id: `${file.id}-${i}`,
          fileId: file.id,
          fileName: file.name,
          path: file.path,
          webViewLink: file.webViewLink,
          text: chunkTextValue,
        });
      });

      indexedFiles.push({
        id: file.id,
        name: file.name,
        path: file.path,
        mimeType: file.mimeType,
        webViewLink: file.webViewLink,
        modifiedTime: file.modifiedTime,
      });
    } catch (err) {
      state.skipped.push({
        name: file.path,
        reason: err.message || String(err),
      });
    }
  }

  const index = {
    folderId,
    indexedAt: new Date().toISOString(),
    files: indexedFiles,
    chunks,
  };
  store.save(index);
  searchIndex.invalidate();

  state.status = 'done';
  state.message = `Indexed ${indexedFiles.length} file(s), ${chunks.length} chunk(s). Skipped ${state.skipped.length}.`;

  return index;
}

/** Fires the indexing job in the background and returns immediately. */
function startIndexing(authClient, folderInput) {
  if (state.status === 'listing' || state.status === 'extracting') {
    throw new Error('Indexing already in progress');
  }
  runIndexing(authClient, folderInput).catch((err) => {
    state.status = 'error';
    state.error = err.message || String(err);
  });
}

module.exports = { startIndexing, getStatus };
