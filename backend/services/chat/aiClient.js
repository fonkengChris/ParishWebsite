import { createOpenAI } from '@ai-sdk/openai';
import { DAYS_OF_WEEK } from './massScheduleTool.js';
import { PRAYER_CATEGORIES } from './prayersTool.js';

const DEFAULT_MODEL = 'gpt-4.1-nano';

export function getAiConfig() {
  return {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.CHAT_MODEL || DEFAULT_MODEL,
    enabled: process.env.CHAT_ENABLED !== 'false',
  };
}

/**
 * The chatbot only uses the LLM when an API key is configured. Otherwise the
 * service falls back to the rule-based router, so the widget keeps working.
 */
export function isAiAvailable() {
  const { apiKey, enabled } = getAiConfig();
  return enabled && Boolean(apiKey);
}

export function getChatModel() {
  const { apiKey, model } = getAiConfig();
  const openai = createOpenAI({ apiKey });
  return openai(model);
}

/**
 * JSON-schema parameter definitions for the five parish tools, keyed by tool
 * name. Reused verbatim by chatService via the AI SDK's jsonSchema() helper.
 */
export const TOOL_SCHEMAS = {
  getMassSchedule: {
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
  getUpcomingEvents: {
    description:
      'Get upcoming parish events and activities with dates, locations, and descriptions.',
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
  getPrayers: {
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
  getSermons: {
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
  getAnnouncements: {
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
    'If the user asks about several topics at once, call every relevant tool.',
    'Answer only using tool results. If nothing is found, say so politely and suggest the relevant page on the website.',
    'Keep replies brief, friendly, and easy to read.',
  ].join(' ');
}
