import axios from 'axios';
import { DAYS_OF_WEEK } from './massScheduleTool.js';
import { PRAYER_CATEGORIES } from './prayersTool.js';

const DEFAULT_BASE_URL = 'http://127.0.0.1:11434';
const DEFAULT_MODEL = 'qwen2.5:3b';

export function getOllamaConfig() {
  return {
    baseUrl: (process.env.OLLAMA_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, ''),
    model: process.env.OLLAMA_MODEL || DEFAULT_MODEL,
    enabled: process.env.OLLAMA_ENABLED !== 'false',
    timeoutMs: Number(process.env.OLLAMA_TIMEOUT_MS || 60000),
  };
}

export const MASS_SCHEDULE_TOOL = {
  type: 'function',
  function: {
    name: 'getMassSchedule',
    description:
      'Get weekly Mass, Confession, Adoration, or other service times. Mass times repeat every week on the given dayOfWeek.',
    parameters: {
      type: 'object',
      properties: {
        dayOfWeek: {
          type: 'string',
          enum: DAYS_OF_WEEK,
          description: 'Day of the week (sunday through saturday).',
        },
        missionStationName: {
          type: 'string',
          description: 'Optional mission station or chapel name to filter results.',
        },
        type: {
          type: 'string',
          enum: ['Mass', 'Confession', 'Adoration', 'Other'],
          description: 'Optional service type filter.',
        },
      },
    },
  },
};

export const UPCOMING_EVENTS_TOOL = {
  type: 'function',
  function: {
    name: 'getUpcomingEvents',
    description: 'Get upcoming parish events and activities with dates, locations, and descriptions.',
    parameters: {
      type: 'object',
      properties: {
        limit: {
          type: 'integer',
          description: 'Maximum number of events to return (default 8).',
        },
        daysAhead: {
          type: 'integer',
          description: 'How many days ahead to search (default 90).',
        },
      },
    },
  },
};

export const PRAYERS_TOOL = {
  type: 'function',
  function: {
    name: 'getPrayers',
    description: 'Get prayers by category or search by title/content keywords.',
    parameters: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: PRAYER_CATEGORIES,
          description: 'Prayer category filter.',
        },
        searchQuery: {
          type: 'string',
          description: 'Optional keyword search in prayer title or content.',
        },
        limit: {
          type: 'integer',
          description: 'Maximum number of prayers to return (default 2).',
        },
      },
    },
  },
};

export const SERMONS_TOOL = {
  type: 'function',
  function: {
    name: 'getSermons',
    description: 'Get recent sermons, homilies, or catechism sessions.',
    parameters: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['sermon', 'catechisis'],
          description: 'Filter by sermon or catechisis.',
        },
        searchQuery: {
          type: 'string',
          description: 'Optional keyword search in title, content, preacher, or reading.',
        },
        limit: {
          type: 'integer',
          description: 'Maximum number of results (default 3).',
        },
      },
    },
  },
};

export const ANNOUNCEMENTS_TOOL = {
  type: 'function',
  function: {
    name: 'getAnnouncements',
    description: 'Get recent parish announcements and news.',
    parameters: {
      type: 'object',
      properties: {
        limit: {
          type: 'integer',
          description: 'Maximum number of announcements to return (default 5).',
        },
      },
    },
  },
};

export const CHAT_TOOLS = [
  MASS_SCHEDULE_TOOL,
  UPCOMING_EVENTS_TOOL,
  PRAYERS_TOOL,
  SERMONS_TOOL,
  ANNOUNCEMENTS_TOOL,
];

export async function isOllamaAvailable() {
  const { baseUrl, enabled } = getOllamaConfig();
  if (!enabled) {
    return false;
  }

  try {
    const response = await axios.get(`${baseUrl}/api/tags`, { timeout: 2000 });
    return response.status === 200;
  } catch {
    return false;
  }
}

export function buildSystemPrompt() {
  const parishName = process.env.PARISH_NAME || 'our parish';

  return [
    `You are a warm, concise parish assistant for ${parishName}.`,
    'You help parishioners with Mass times, upcoming events, prayers, sermons, and announcements.',
    'Always use the available tools to fetch real parish data before answering.',
    'Tool guide:',
    '- getMassSchedule: Mass, confession, adoration, weekly service times.',
    '- getUpcomingEvents: activities, events, what is happening soon.',
    '- getPrayers: prayers by category or keyword.',
    '- getSermons: homilies, sermons, catechism sessions.',
    '- getAnnouncements: parish news and notices.',
    'Mass schedules are weekly recurring (day of week + time), not calendar dates.',
    'If the user says "today" or "tomorrow", convert that to the correct dayOfWeek before calling getMassSchedule.',
    'Answer only using tool results. If nothing is found, say so politely and suggest the relevant page on the website.',
    'Keep replies brief, friendly, and easy to read.',
  ].join(' ');
}

export async function chatWithTools({ messages, tools = CHAT_TOOLS }) {
  const { baseUrl, model, timeoutMs } = getOllamaConfig();

  const response = await axios.post(
    `${baseUrl}/api/chat`,
    {
      model,
      messages,
      tools,
      stream: false,
    },
    { timeout: timeoutMs }
  );

  return response.data?.message;
}
