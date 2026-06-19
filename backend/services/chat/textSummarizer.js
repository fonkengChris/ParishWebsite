import axios from 'axios';
import { getOllamaConfig, isOllamaAvailable } from './ollamaClient.js';

const SUMMARY_LENGTH_THRESHOLD = 120;
const PRIORITY_PATTERNS = {
  default:
    /\b(meeting|mass|event|invite|invited|held|held at|at|on|from|until|register|contact|all|everyone|must|please|will be|shall be|required|attend|join|celebration|feast)\b/i,
  sermon:
    /\b(god|christ|jesus|gospel|scripture|faith|love|call|teach|lesson|sin|grace|mercy|church|homily|message|theme|brothers|sisters|today|lord)\b/i,
  catechisis:
    /\b(catechism|teaching|learn|faith|church|doctrine|sacrament|scripture|lesson|question|answer|children|youth|church)\b/i,
};

const KIND_CONFIG = {
  event: {
    label: 'Event',
    prompt:
      'Summarize this parish event in 1-2 short bullet points with only the main facts: what is happening, when, where, who should attend, and any action needed. Maximum 30 words per bullet. Do not add an introduction or closing sentence.',
  },
  announcement: {
    label: 'Announcement',
    prompt:
      'Summarize this parish announcement in 1-2 short bullet points with only the main facts: what is happening, when, where, who is involved, and any action needed. Maximum 30 words per bullet. Do not add an introduction or closing sentence.',
  },
  sermon: {
    label: 'Sermon/Homily',
    prompt:
      'Summarize this homily in 1-2 short bullet points with the main message or theme and any key scripture reference. Maximum 30 words per bullet. Do not add an introduction or closing sentence.',
  },
  catechisis: {
    label: 'Catechism session',
    prompt:
      'Summarize this catechism session in 1-2 short bullet points with the main teaching point or lesson. Maximum 30 words per bullet. Do not add an introduction or closing sentence.',
  },
};

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
export function summarizeLocally(text, { maxPoints = 2, kind = 'announcement' } = {}) {
  const normalized = normalizeText(text);
  if (!normalized) {
    return '';
  }

  if (normalized.length <= SUMMARY_LENGTH_THRESHOLD) {
    return normalized;
  }

  const priorityPattern = PRIORITY_PATTERNS[kind] || PRIORITY_PATTERNS.default;
  const sentences = splitSentences(normalized);
  const ranked = [...sentences].sort((left, right) => {
    const leftScore = priorityPattern.test(left) ? 1 : 0;
    const rightScore = priorityPattern.test(right) ? 1 : 0;
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
  const config = KIND_CONFIG[kind] || KIND_CONFIG.announcement;

  const response = await axios.post(
    `${baseUrl}/api/chat`,
    {
      model,
      messages: [
        {
          role: 'system',
          content: config.prompt,
        },
        {
          role: 'user',
          content: `${config.label} title: ${title || 'Untitled'}\n\nFull text:\n${text}`,
        },
      ],
      stream: false,
    },
    { timeout: 20000 }
  );

  return response.data?.message?.content?.trim() || null;
}

/**
 * Summarize long parish content into main points for chat replies.
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

  return summarizeLocally(normalized, { kind });
}
