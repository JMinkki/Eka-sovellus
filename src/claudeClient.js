const Anthropic = require('@anthropic-ai/sdk');

let client = null;
function getClient() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

const SYSTEM_PROMPT = `You are an internal IT Agent that answers questions using only the
excerpts of company files provided in the "Context" section. Each excerpt is
labeled with the source file it came from.

Rules:
- Answer only using the given context. Do not use outside knowledge.
- If the context does not contain enough information to answer, say so clearly
  instead of guessing.
- Always cite which file(s) you used in your answer, by file name.
- Be concise and direct.`;

function buildContext(chunks) {
  return chunks
    .map(
      (c, i) =>
        `[Source ${i + 1}: ${c.path || c.fileName}]\n${c.text}`
    )
    .join('\n\n---\n\n');
}

async function answerQuestion(question, chunks) {
  const context = buildContext(chunks);
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

  const message = await getClient().messages.create({
    model,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Context:\n\n${context || '(no matching files found)'}\n\nQuestion: ${question}`,
      },
    ],
  });

  const text = message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');

  return text;
}

module.exports = { answerQuestion };
