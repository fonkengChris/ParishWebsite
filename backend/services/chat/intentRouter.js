import {
  getMassSchedule,
  resolveDayFromMessage,
} from './massScheduleTool.js';

const MASS_INTENT_PATTERN =
  /\b(mass|masses|confession|adoration|church service|service times|mass time|mass schedule|mass times|when is mass|holy mass)\b/i;

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

/**
 * Rule-based fallback when Ollama is unavailable.
 * Returns null if the message is not about mass schedules.
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
    args: { dayOfWeek, type },
    schedules,
    dayOfWeek: dayOfWeek || schedules[0]?.dayOfWeek,
  };
}

export function getOutOfScopeReply() {
  return (
    'I can help with Mass times and schedules in Phase 1. ' +
    'Try asking something like "When is Mass on Sunday?" or "What are today\'s Mass times?" ' +
    'More topics like events, prayers, and sermons are coming soon.'
  );
}
