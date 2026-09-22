const { google } = require('googleapis');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const FOLDER_MIME = 'application/vnd.google-apps.folder';

const EXPORTABLE_MIME_MAP = {
  'application/vnd.google-apps.document': 'text/plain',
  'application/vnd.google-apps.spreadsheet': 'text/csv',
  'application/vnd.google-apps.presentation': 'text/plain',
};

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/** Accepts a raw folder ID or a full Drive URL and returns the folder ID. */
function extractFolderId(input) {
  const trimmed = (input || '').trim();
  const match = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  const idParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParam) return idParam[1];
  return trimmed;
}

function getDriveClient(authClient) {
  return google.drive({ version: 'v3', auth: authClient });
}

/** Recursively lists every non-folder file under a Drive folder. */
async function listFilesRecursive(drive, folderId, pathPrefix = '', onFolder) {
  let files = [];
  let pageToken;
  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields:
        'nextPageToken, files(id, name, mimeType, modifiedTime, webViewLink, size)',
      pageSize: 200,
      pageToken,
    });

    for (const file of res.data.files || []) {
      if (file.mimeType === FOLDER_MIME) {
        if (onFolder) onFolder(file);
        const nested = await listFilesRecursive(
          drive,
          file.id,
          `${pathPrefix}${file.name}/`,
          onFolder
        );
        files = files.concat(nested);
      } else {
        files.push({ ...file, path: `${pathPrefix}${file.name}` });
      }
    }
    pageToken = res.data.nextPageToken;
  } while (pageToken);

  return files;
}

/** Downloads and extracts plain text content for a single Drive file. */
async function extractFileText(drive, file) {
  const exportMime = EXPORTABLE_MIME_MAP[file.mimeType];

  if (exportMime) {
    const res = await drive.files.export(
      { fileId: file.id, mimeType: exportMime },
      { responseType: 'text' }
    );
    return res.data;
  }

  if (file.mimeType === 'application/pdf') {
    const res = await drive.files.get(
      { fileId: file.id, alt: 'media' },
      { responseType: 'arraybuffer' }
    );
    const parsed = await pdfParse(Buffer.from(res.data));
    return parsed.text;
  }

  if (file.mimeType === DOCX_MIME) {
    const res = await drive.files.get(
      { fileId: file.id, alt: 'media' },
      { responseType: 'arraybuffer' }
    );
    const result = await mammoth.extractRawText({
      buffer: Buffer.from(res.data),
    });
    return result.value;
  }

  if (
    file.mimeType &&
    (file.mimeType.startsWith('text/') || file.mimeType === 'application/json')
  ) {
    const res = await drive.files.get(
      { fileId: file.id, alt: 'media' },
      { responseType: 'text' }
    );
    return typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
  }

  return null; // unsupported binary type (image, video, zip, etc.)
}

module.exports = {
  extractFolderId,
  getDriveClient,
  listFilesRecursive,
  extractFileText,
};
