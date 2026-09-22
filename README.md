# IT Agent

An internal IT Agent that indexes files from a Google Drive folder (recursively,
including subfolders) and answers natural-language questions about their
content, with sources cited. Includes a small web frontend to run it.

How it works:
- **Index**: connects to Google Drive via OAuth, walks a folder tree, extracts
  text from Google Docs/Sheets/Slides, PDFs, `.docx`, and plain text/JSON
  files, splits it into overlapping chunks, and builds a local full-text
  search index (no external vector DB needed).
- **Search**: a question is matched against indexed chunks with a full-text
  search index ([lunr](https://lunrjs.com/)).
- **Answer**: the best-matching chunks are sent to Claude (Anthropic API) as
  context, which answers strictly from that context and the app returns the
  answer along with links to the source files.

## 1. Prerequisites

- Node.js 18+
- A Google Cloud project with the **Google Drive API** enabled
- An OAuth 2.0 Client ID (type: **Web application**)
  - Add an Authorized redirect URI, e.g. `http://localhost:3000/auth/google/callback`
- An [Anthropic API key](https://console.anthropic.com/)

## 2. Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=claude-sonnet-5
```

## 3. Run

```bash
npm start
```

Open http://localhost:3000, then:

1. **Connect Google Drive** — you'll be redirected to Google's consent
   screen and asked for read-only Drive access.
2. **Index a folder** — paste a Drive folder URL (or just its ID) and click
   *Index folder*. Progress and any skipped/unsupported files are shown.
3. **Ask a question** — ask anything about the indexed files; the answer
   includes links back to the source files it used.

The Google OAuth token and the built file index are stored locally under
`data/` (git-ignored) so you don't have to re-authenticate or re-index on
every restart. Re-run indexing any time to pick up changes in the folder.

## Supported file types

Google Docs, Google Sheets, Google Slides, PDF, `.docx`, and plain
text/JSON files. Other file types (images, archives, etc.) are listed as
"skipped" after indexing.

## Project structure

```
src/
  server.js        Express app and API routes
  googleAuth.js     Google OAuth2 client + token storage
  driveService.js   Recursive Drive listing + text extraction per file type
  chunker.js        Splits extracted text into overlapping chunks
  indexer.js         Orchestrates indexing and tracks progress
  indexStore.js      Persists the built index to data/index.json
  searchIndex.js     Full-text search over indexed chunks (lunr)
  claudeClient.js    Builds context from matched chunks and asks Claude
public/              Static web frontend (connect, index, ask UI)
```
