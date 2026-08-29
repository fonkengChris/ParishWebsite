import { getMassSchedule, resolveDayFromMessage } from './massScheduleTool.js';
import { getUpcomingEvents } from './eventsTool.js';
import { getPrayers, resolvePrayerCategory, extractPrayerSearchQuery } from './prayersTool.js';
import { getSermons, resolveSermonType } from './sermonsTool.js';
import { getAnnouncements } from './announcementsTool.js';
import { formatToolResult } from './formatters.js';

const MASS_INTENT_PATTERN =
  /\b(mass|masses|confession|adoration|church service|service times|mass time|mass schedule|mass times|when is mass|holy mass|vigil mass)\b/i;

const EVENTS_INTENT_PATTERN =
  /\b(event|events|activity|activities|upcoming|happening|what'?s on|what is on|this week|next week|parish event)\b/i;

const PRAYERS_INTENT_PATTERN =
  /\b(prayer|prayers|devotion|devotions|marian|rosary|hail mary|our father|morning prayer|evening prayer)\b/i;

const SERMONS_INTENT_PATTERN =
  /\b(sermon|sermons|homily|homilies|catechism|catechisis|catechesis|preaching|latest homily|latest sermon)\b/i;

const ANNOUNCEMENTS_INTENT_PATTERN =
  /\b(announcement|announcements|parish news|what'?s new|notice|notices|latest news)\b/i;

function detectScheduleType(message) {
  if (/\bconfession\b/i.test(message)) {
    return 'Confession';
  }
  if (/\badoration\b/i.test(message)) {
    return 'Adoration';
  }
  if (/\bmass\b/i.test(message)) {
    return 'Mass';
  }
  return undefined;
}

function extractSearchQuery(message, keywordsToRemove = []) {
  let query = message.trim();

  for (const keyword of keywordsToRemove) {
    query = query.replace(keyword, ' ');
  }

  query = query.replace(/\b(show|find|get|give|me|a|an|the|please|about|for|any|some|recent|latest|upcoming)\b/gi, ' ');
  query = query.replace(/\s+/g, ' ').trim();

  return query.length >= 3 ? query : undefined;
}

/**
 * Rule-based fallback when Ollama is unavailable.
 */
export async function routeMassScheduleIntent(message) {
  if (!MASS_INTENT_PATTERN.test(message)) {
    return null;
  }

  const dayOfWeek = resolveDayFromMessage(message) || undefined;
  const type = detectScheduleType(message);
  const schedules = await getMassSchedule({ dayOfWeek, type });

  return {
    tool: 'getMassSchedule',
    result: {
      schedules,
      dayOfWeek: dayOfWeek || schedules[0]?.dayOfWeek,
    },
  };
}

export async function routeEventsIntent(message) {
  if (!EVENTS_INTENT_PATTERN.test(message)) {
    return null;
  }

  const events = await getUpcomingEvents({ limit: 8 });

  return {
    tool: 'getUpcomingEvents',
    result: { events },
  };
}

export async function routePrayersIntent(message) {
  if (!PRAYERS_INTENT_PATTERN.test(message)) {
    return null;
  }

  const category = resolvePrayerCategory(message);
  const searchQuery = extractPrayerSearchQuery(message, category);
  const { prayers, category: resolvedCategory } = await getPrayers({
    category,
    searchQuery,
    limit: 2,
  });

  return {
    tool: 'getPrayers',
    result: { prayers, category: resolvedCategory },
  };
}

export async function routeSermonsIntent(message) {
  if (!SERMONS_INTENT_PATTERN.test(message)) {
    return null;
  }

  const type = resolveSermonType(message);
  const searchQuery = extractSearchQuery(message);
  const sermons = await getSermons({ type, searchQuery, limit: 3 });

  return {
    tool: 'getSermons',
    result: { sermons, type },
  };
}

export async function routeAnnouncementsIntent(message) {
  if (!ANNOUNCEMENTS_INTENT_PATTERN.test(message)) {
    return null;
  }

  const announcements = await getAnnouncements({ limit: 5 });

  return {
    tool: 'getAnnouncements',
    result: { announcements },
  };
}

const ROUTERS = [
  routeMassScheduleIntent,
  routeEventsIntent,
  routePrayersIntent,
  routeSermonsIntent,
  routeAnnouncementsIntent,
];

const REPLY_DIVIDER = '\n\n———\n\n';

export async function routeIntent(message) {
  for (const router of ROUTERS) {
    const routed = await router(message);
    if (routed) {
      return routed;
    }
  }
  return null;
}

/**
 * Run every router so a single message can answer several intents at once
 * (e.g. "Mass times and any upcoming events?").
 */
export async function routeIntents(message) {
  const routed = await Promise.all(ROUTERS.map((router) => router(message)));
  return routed.filter(Boolean);
}

export function getOutOfScopeReply() {
  return (
    'I can help with Mass times, upcoming events, prayers, sermons, and parish announcements. ' +
    'Try asking something like "When is Mass on Sunday?", "What events are coming up?", ' +
    '"Share a morning prayer", or "What is the latest announcement?"'
  );
}

const SOURCE_TYPE_MAP = {
  getMassSchedule: 'mass-schedule',
  getUpcomingEvents: 'event',
  getPrayers: 'prayer',
  getSermons: 'sermon',
  getAnnouncements: 'announcement',
};

export async function buildRuleBasedReply(routedList) {
  const parts = await Promise.all(
    routedList.map((routed) => formatToolResult(routed.tool, routed.result))
  );
  return parts.filter(Boolean).join(REPLY_DIVIDER);
}

function buildSourcesForRouted(routed) {
  const { tool, result } = routed;
  const sourceType = SOURCE_TYPE_MAP[tool];
  if (!sourceType) {
    return [];
  }

  const items =
    result.schedules ||
    result.events ||
    result.prayers ||
    result.sermons ||
    result.announcements ||
    [];

  return items.map((item) => ({ type: sourceType, id: item.id }));
}

export function buildRuleBasedSources(routedList) {
  return routedList.flatMap((routed) => buildSourcesForRouted(routed));
}
