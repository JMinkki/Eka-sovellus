const CHUNK_SIZE = 1200;
const CHUNK_OVERLAP = 150;

/** Splits text into overlapping chunks, breaking on paragraph boundaries when possible. */
function chunkText(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const clean = (text || '').replace(/\r\n/g, '\n').trim();
  if (!clean) return [];

  const paragraphs = clean.split(/\n{2,}/);
  const chunks = [];
  let current = '';

  for (const para of paragraphs) {
    if ((current + '\n\n' + para).length > chunkSize && current) {
      chunks.push(current.trim());
      current = current.slice(Math.max(0, current.length - overlap));
    }
    current += (current ? '\n\n' : '') + para;

    while (current.length > chunkSize) {
      chunks.push(current.slice(0, chunkSize).trim());
      current = current.slice(chunkSize - overlap);
    }
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks.filter((c) => c.length > 0);
}

module.exports = { chunkText };
