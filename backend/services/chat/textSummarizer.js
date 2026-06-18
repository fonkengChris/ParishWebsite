import axios from 'axios';
import { getOllamaConfig, isOllamaAvailable } from './ollamaClient.js';

const SUMMARY_LENGTH_THRESHOLD = 120;
const PRIORITY_PATTERN =
  /\b(meeting|mass|event|invite|invited|held|held at|at|on|from|until|register|contact|all|everyone|must|please|will be|shall be|required|attend|join|celebration|feast)\b/i;

function normalizeText(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function protectAbbreviations(text) {
  return text
    .replace(/\bSt\./g, 'St§')
    .replace(/\bDr\./g, 'Dr§')
    .replace(/\bMr\./g, 'Mr§')
    .replace(/\bMrs\./g, 'Mrs§')
    .replace(/\bMs\./g, 'Ms§')
    .replace(/\bFr\./g, 'Fr§')
    .replace(/\bRev\./g, 'Rev§')
    .replace(/\betc\./gi, 'etc§');
}

function restoreAbbreviations(text) {
  return text.replace(/§/g, '.');
}

function splitSentences(text) {
  const protectedText = protectAbbreviations(text);

  return protectedText
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => restoreAbbreviations(sentence.trim()))
    .filter((sentence) => sentence.length > 0);
}

function formatAsBullets(points) {
  if (points.length === 1) {
    return points[0];
  }

  return points.map((point) => `• ${point}`).join('\n');
}

/**
 * Rule-based summary for when Ollama is unavailable.
 */
export function summarizeLocally(text, { maxPoints = 2 } = {}) {
  const normalized = normalizeText(text);
  if (!normalized) {
    return '';
  }

  if (normalized.length <= SUMMARY_LENGTH_THRESHOLD) {
    return normalized;
  }

  const sentences = splitSentences(normalized);
  const ranked = [...sentences].sort((left, right) => {
    const leftScore = PRIORITY_PATTERN.test(left) ? 1 : 0;
    const rightScore = PRIORITY_PATTERN.test(right) ? 1 : 0;
    return rightScore - leftScore;
  });

  const points = [];

  for (const sentence of ranked) {
    if (points.length >= maxPoints) {
      break;
    }

    if (sentence.length < 12) {
      continue;
    }

    if (points.includes(sentence)) {
      continue;
    }

    points.push(sentence);
  }

  if (!points.length) {
    return sentences[0] || normalized.slice(0, 160);
  }

  return formatAsBullets(points);
}

async function summarizeWithOllama(text, { title, kind }) {
  const { baseUrl, model } = getOllamaConfig();
  const label = kind === 'event' ? 'Event' : 'Announcement';

  const response = await axios.post(
    `${baseUrl}/api/chat`,
    {
      model,
      messages: [
        {
          role: 'system',
          content:
            'Summarize parish website content for a chatbot. Return 1-2 short bullet points with only the main facts: what is happening, when, where, who should attend, and any action needed. Maximum 30 words per bullet. Do not add an introduction or closing sentence.',
        },
        {
          role: 'user',
          content: `${label} title: ${title || 'Untitled'}\n\nFull text:\n${text}`,
        },
      ],
      stream: false,
    },
    { timeout: 20000 }
  );

  return response.data?.message?.content?.trim() || null;
}

/**
 * Summarize long event/announcement text into main points for chat replies.
 */
export async function summarizeForChat(text, { title = '', kind = 'announcement' } = {}) {
  const normalized = normalizeText(text);
  if (!normalized) {
    return '';
  }

  if (normalized.length <= SUMMARY_LENGTH_THRESHOLD) {
    return normalized;
  }

  if (await isOllamaAvailable()) {
    try {
      const summary = await summarizeWithOllama(normalized, { title, kind });
      if (summary) {
        return summary;
      }
    } catch (error) {
      console.warn('Ollama summarization failed, using local summary:', error.message);
    }
  }

  return summarizeLocally(normalized);
}
