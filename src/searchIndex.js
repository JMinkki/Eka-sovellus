const lunr = require('lunr');

let cachedLunrIndex = null;
let cachedChunkCount = -1;
let chunksById = new Map();

function build(chunks) {
  chunksById = new Map(chunks.map((c) => [c.id, c]));
  cachedLunrIndex = lunr(function () {
    this.ref('id');
    this.field('text');
    this.field('fileName');
    this.metadataWhitelist = ['position'];
    chunks.forEach((c) => this.add(c));
  });
  cachedChunkCount = chunks.length;
}

function ensureBuilt(chunks) {
  if (!cachedLunrIndex || cachedChunkCount !== chunks.length) {
    build(chunks);
  }
}

function sanitizeQuery(query) {
  return query
    .replace(/[^\w\sÀ-ÿ]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => `${term} ${term}*`)
    .join(' ');
}

/** Returns the top matching chunks for a natural-language question. */
function search(chunks, query, topN = 6) {
  ensureBuilt(chunks);
  if (chunks.length === 0) return [];

  let results = [];
  try {
    results = cachedLunrIndex.search(query);
  } catch {
    results = [];
  }

  if (results.length === 0) {
    try {
      results = cachedLunrIndex.search(sanitizeQuery(query));
    } catch {
      results = [];
    }
  }

  return results
    .slice(0, topN)
    .map((r) => chunksById.get(r.ref))
    .filter(Boolean);
}

function invalidate() {
  cachedLunrIndex = null;
  cachedChunkCount = -1;
}

module.exports = { search, invalidate };
