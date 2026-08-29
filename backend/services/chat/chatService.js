import { randomUUID } from 'crypto';
import { generateText, tool, jsonSchema, stepCountIs } from 'ai';
import { getMassSchedule, resolveDayOfWeek } from './massScheduleTool.js';
import { getUpcomingEvents } from './eventsTool.js';
import { getPrayers } from './prayersTool.js';
import { getSermons } from './sermonsTool.js';
import { getAnnouncements } from './announcementsTool.js';
import { formatToolResult } from './formatters.js';
import { buildResourceLink } from './resourceLinks.js';
import {
  routeIntents,
  getOutOfScopeReply,
  buildRuleBasedReply,
  buildRuleBasedSources,
} from './intentRouter.js';
import {
  buildSystemPrompt,
  getChatModel,
  isAiAvailable,
  TOOL_SCHEMAS,
} from './aiClient.js';
import Conversation from '../../models/Conversation.js';
import logger from '../../utils/logger.js';

const MAX_TOOL_ITERATIONS = 6;
const REPLY_DIVIDER = '\n\n———\n\n';

const SOURCE_LABELS = {
  'mass-schedule': 'Mass times',
  event: 'Event',
  prayer: 'Prayer',
  sermon: 'Sermon',
  announcement: 'Announcement',
};

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

/**
 * Attach a frontend url + human label to each source and drop duplicates so the
 * widget can render clickable "Sources" chips. Shared by both response paths.
 */
function enrichSources(sources = []) {
  const seen = new Set();
  const enriched = [];

  for (const source of sources) {
    const url = buildResourceLink(source.type, source.id) || undefined;
    const dedupeKey = url || `${source.type}:${source.id}`;
    if (seen.has(dedupeKey)) {
      continue;
    }
    seen.add(dedupeKey);

    enriched.push({
      type: source.type,
      id: source.id,
      url,
      label: SOURCE_LABELS[source.type] || source.type,
    });
  }

  return enriched;
}

/**
 * Format every tool execution and join them, so a single message that touches
 * several topics (e.g. Mass times AND events) answers all of them.
 */
async function formatExecutions(executions) {
  const parts = await Promise.all(
    executions.map((execution) => formatToolResult(execution.tool, execution.result))
  );
  return parts.filter(Boolean).join(REPLY_DIVIDER);
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

async function runAiChat(message, history = []) {
  const toolExecutions = [];
  const collectedSources = [];

  const tools = Object.fromEntries(
    Object.entries(TOOL_SCHEMAS).map(([name, schema]) => [
      name,
      tool({
        description: schema.description,
        inputSchema: jsonSchema(schema.parameters),
        execute: async (args) => {
          const execution = await executeTool(name, args || {});
          toolExecutions.push(execution);
          collectedSources.push(...execution.sources);
          return execution.result;
        },
      }),
    ])
  );

  const result = await generateText({
    model: getChatModel(),
    system: buildSystemPrompt(),
    messages: [...buildHistoryMessages(history), { role: 'user', content: message }],
    tools,
    stopWhen: stepCountIs(MAX_TOOL_ITERATIONS),
  });

  if (toolExecutions.length) {
    return {
      reply: await formatExecutions(toolExecutions),
      sources: enrichSources(collectedSources),
      mode: 'ai',
    };
  }

  return {
    reply: result.text?.trim() || getOutOfScopeReply(),
    sources: [],
    mode: 'ai',
  };
}

async function runRuleBasedChat(message) {
  const routed = await routeIntents(message);

  if (!routed.length) {
    return {
      reply: getOutOfScopeReply(),
      sources: [],
      mode: 'rules',
    };
  }

  return {
    reply: await buildRuleBasedReply(routed),
    sources: enrichSources(buildRuleBasedSources(routed)),
    mode: 'rules',
  };
}

/**
 * Load a prior conversation's messages as fallback history when the client did
 * not send any but supplied a known conversationId (server-side memory).
 */
async function loadStoredHistory(conversationId) {
  if (!conversationId) {
    return [];
  }

  try {
    const conversation = await Conversation.findOne({ conversationId }).lean();
    return conversation?.messages?.slice(-8) || [];
  } catch (error) {
    logger.warn({ err: error }, 'Failed to load stored chat history');
    return [];
  }
}

async function persistConversation(conversationId, userMessage, reply, mode) {
  try {
    await Conversation.updateOne(
      { conversationId },
      {
        $push: {
          messages: {
            $each: [
              { role: 'user', content: userMessage },
              { role: 'assistant', content: reply },
            ],
          },
        },
        $inc: { messageCount: 2 },
        $set: { lastMode: mode },
      },
      { upsert: true }
    );
  } catch (error) {
    logger.warn({ err: error }, 'Failed to persist chat conversation');
  }
}

/**
 * Process a parish chat message.
 */
export async function processChatMessage({ message, history = [], conversationId }) {
  const trimmedMessage = message.trim();
  const id = conversationId || randomUUID();

  const effectiveHistory =
    history.length > 0 ? history : await loadStoredHistory(conversationId);

  let result;

  if (isAiAvailable()) {
    try {
      result = await runAiChat(trimmedMessage, effectiveHistory);
    } catch (error) {
      logger.warn({ err: error }, 'AI chat failed, falling back to rules');
      result = await runRuleBasedChat(trimmedMessage);
      result.mode = 'ai-fallback';
    }
  } else {
    result = await runRuleBasedChat(trimmedMessage);
  }

  await persistConversation(id, trimmedMessage, result.reply, result.mode);

  return {
    reply: result.reply,
    sources: result.sources,
    conversationId: id,
    mode: result.mode,
  };
}
