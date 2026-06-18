import { randomUUID } from 'crypto';
import { getMassSchedule, resolveDayOfWeek } from './massScheduleTool.js';
import { formatMassScheduleReply } from './formatters.js';
import { routeMassScheduleIntent, getOutOfScopeReply } from './intentRouter.js';
import {
  buildSystemPrompt,
  chatWithTools,
  isOllamaAvailable,
  MASS_SCHEDULE_TOOL,
} from './ollamaClient.js';

const MAX_TOOL_ITERATIONS = 4;

async function executeTool(name, args = {}) {
  if (name !== 'getMassSchedule') {
    throw new Error(`Unknown tool: ${name}`);
  }

  const schedules = await getMassSchedule(args);
  const dayOfWeek =
    resolveDayOfWeek(args.dayOfWeek) || schedules[0]?.dayOfWeek || args.dayOfWeek;

  return {
    schedules,
    dayOfWeek,
    sources: schedules.map((schedule) => ({
      type: 'mass-schedule',
      id: schedule.id,
    })),
  };
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
  let lastDayOfWeek;

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration += 1) {
    const assistantMessage = await chatWithTools({
      messages,
      tools: [MASS_SCHEDULE_TOOL],
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

      const toolResult = await executeTool(toolName, toolArgs);
      lastDayOfWeek = toolResult.dayOfWeek;
      collectedSources.push(...toolResult.sources);

      messages.push({
        role: 'tool',
        name: toolName,
        content: JSON.stringify({
          schedules: toolResult.schedules,
          dayOfWeek: toolResult.dayOfWeek,
        }),
      });
    }
  }

  const fallbackSchedules = lastDayOfWeek
    ? await getMassSchedule({ dayOfWeek: lastDayOfWeek })
    : [];

  return {
    reply: formatMassScheduleReply(fallbackSchedules, { dayOfWeek: lastDayOfWeek }),
    sources: collectedSources,
    mode: 'ollama-fallback',
  };
}

async function runRuleBasedChat(message) {
  const routed = await routeMassScheduleIntent(message);

  if (!routed) {
    return {
      reply: getOutOfScopeReply(),
      sources: [],
      mode: 'rules',
    };
  }

  return {
    reply: formatMassScheduleReply(routed.schedules, {
      dayOfWeek: routed.dayOfWeek || routed.args.dayOfWeek,
    }),
    sources: routed.schedules.map((schedule) => ({
      type: 'mass-schedule',
      id: schedule.id,
    })),
    mode: 'rules',
  };
}

/**
 * Process a parish chat message (Phase 1: Mass schedule only).
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
