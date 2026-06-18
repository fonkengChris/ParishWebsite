import axios from 'axios';
import { DAYS_OF_WEEK } from './massScheduleTool.js';

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
          description:
            'Day of the week. Use today/tomorrow mapping before calling: sunday through saturday.',
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
    'You help parishioners find Mass times and weekly service schedules.',
    'Always call getMassSchedule when users ask about Mass, confession, adoration, or service times.',
    'Mass schedules are weekly recurring (day of week + time), not one-off calendar dates.',
    'If the user says "today" or "tomorrow", convert that to the correct dayOfWeek before calling the tool.',
    'Answer only using tool results. If nothing is found, say so politely and suggest the Mass Times page.',
    'Keep replies brief and easy to read.',
  ].join(' ');
}

export async function chatWithTools({ messages, tools = [MASS_SCHEDULE_TOOL] }) {
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
