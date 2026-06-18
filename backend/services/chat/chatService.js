import { randomUUID } from 'crypto';
import { getMassSchedule, resolveDayOfWeek } from './massScheduleTool.js';
import { getUpcomingEvents } from './eventsTool.js';
import { getPrayers } from './prayersTool.js';
import { getSermons } from './sermonsTool.js';
import { getAnnouncements } from './announcementsTool.js';
import { formatToolResult } from './formatters.js';
import {
  routeIntent,
  getOutOfScopeReply,
  buildRuleBasedReply,
  buildRuleBasedSources,
} from './intentRouter.js';
import {
  buildSystemPrompt,
  chatWithTools,
  isOllamaAvailable,
  CHAT_TOOLS,
} from './ollamaClient.js';

const MAX_TOOL_ITERATIONS = 6;

async function executeTool(name, args = {}) {
  switch (name) {
    case 'getMassSchedule': {
      const schedules = await getMassSchedule(args);
      const dayOfWeek =
        resolveDayOfWeek(args.dayOfWeek) || schedules[0]?.dayOfWeek || args.dayOfWeek;

      return {
        tool: name,
        result: { schedules, dayOfWeek },
        sources: schedules.map((schedule) => ({
          type: 'mass-schedule',
          id: schedule.id,
        })),
      };
    }
    case 'getUpcomingEvents': {
      const events = await getUpcomingEvents(args);
      return {
        tool: name,
        result: { events },
        sources: events.map((event) => ({
          type: 'event',
          id: event.id,
        })),
      };
    }
    case 'getPrayers': {
      const { prayers, category: resolvedCategory } = await getPrayers(args);
      return {
        tool: name,
        result: { prayers, category: resolvedCategory ?? args.category },
        sources: prayers.map((prayer) => ({
          type: 'prayer',
          id: prayer.id,
        })),
      };
    }
    case 'getSermons': {
      const sermons = await getSermons(args);
      return {
        tool: name,
        result: { sermons, type: args.type },
        sources: sermons.map((sermon) => ({
          type: 'sermon',
          id: sermon.id,
        })),
      };
    }
    case 'getAnnouncements': {
      const announcements = await getAnnouncements(args);
      return {
        tool: name,
        result: { announcements },
        sources: announcements.map((announcement) => ({
          type: 'announcement',
          id: announcement.id,
        })),
      };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function buildHistoryMessages(history = []) {
  return history
    .filter((entry) => entry.role === 'user' || entry.role === 'assistant')
    .slice(-8)
    .map((entry) => ({
      role: entry.role,
      content: entry.content,
    }));
}

async function runOllamaChat(message, history = []) {
  const messages = [
    { role: 'system', content: buildSystemPrompt() },
    ...buildHistoryMessages(history),
    { role: 'user', content: message },
  ];

  const collectedSources = [];
  let lastToolExecution;

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration += 1) {
    const assistantMessage = await chatWithTools({
      messages,
      tools: CHAT_TOOLS,
    });

    if (!assistantMessage) {
      break;
    }

    messages.push(assistantMessage);

    const toolCalls = assistantMessage.tool_calls || [];
    if (!toolCalls.length) {
      return {
        reply: assistantMessage.content?.trim() || getOutOfScopeReply(),
        sources: collectedSources,
        mode: 'ollama',
      };
    }

    for (const toolCall of toolCalls) {
      const toolName = toolCall.function?.name;
      let toolArgs = {};

      try {
        toolArgs = JSON.parse(toolCall.function?.arguments || '{}');
      } catch {
        toolArgs = {};
      }

      const toolExecution = await executeTool(toolName, toolArgs);
      lastToolExecution = toolExecution;
      collectedSources.push(...toolExecution.sources);

      messages.push({
        role: 'tool',
        name: toolName,
        content: JSON.stringify(toolExecution.result),
      });
    }
  }

  if (lastToolExecution) {
    return {
      reply: await formatToolResult(lastToolExecution.tool, lastToolExecution.result),
      sources: collectedSources,
      mode: 'ollama-fallback',
    };
  }

  return {
    reply: getOutOfScopeReply(),
    sources: collectedSources,
    mode: 'ollama-fallback',
  };
}

async function runRuleBasedChat(message) {
  const routed = await routeIntent(message);

  if (!routed) {
    return {
      reply: getOutOfScopeReply(),
      sources: [],
      mode: 'rules',
    };
  }

  return {
    reply: await buildRuleBasedReply(routed),
    sources: buildRuleBasedSources(routed),
    mode: 'rules',
  };
}

/**
 * Process a parish chat message.
 */
export async function processChatMessage({ message, history = [], conversationId }) {
  const trimmedMessage = message.trim();
  const id = conversationId || randomUUID();

  let result;

  if (await isOllamaAvailable()) {
    try {
      result = await runOllamaChat(trimmedMessage, history);
    } catch (error) {
      console.warn('Ollama chat failed, falling back to rules:', error.message);
      result = await runRuleBasedChat(trimmedMessage);
    }
  } else {
    result = await runRuleBasedChat(trimmedMessage);
  }

  return {
    reply: result.reply,
    sources: result.sources,
    conversationId: id,
    mode: result.mode,
  };
}
