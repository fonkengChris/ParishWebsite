import MassSchedule from '../../models/MassSchedule.js';

export const DAYS_OF_WEEK = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

const DAY_ALIASES = {
  sun: 'sunday',
  mon: 'monday',
  tue: 'tuesday',
  tues: 'tuesday',
  wed: 'wednesday',
  thu: 'thursday',
  thur: 'thursday',
  thurs: 'thursday',
  fri: 'friday',
  sat: 'saturday',
};

/**
 * Resolve natural language day references to a dayOfWeek enum value.
 */
export function resolveDayOfWeek(input) {
  if (!input) return null;

  const lower = String(input).toLowerCase().trim();

  if (lower === 'today') {
    return DAYS_OF_WEEK[new Date().getDay()];
  }

  if (lower === 'tomorrow') {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return DAYS_OF_WEEK[tomorrow.getDay()];
  }

  if (DAYS_OF_WEEK.includes(lower)) {
    return lower;
  }

  if (DAY_ALIASES[lower]) {
    return DAY_ALIASES[lower];
  }

  for (const day of DAYS_OF_WEEK) {
    if (lower.includes(day)) {
      return day;
    }
  }

  return null;
}

/**
 * Extract a day of week from free-form user text.
 */
export function resolveDayFromMessage(message) {
  const lower = message.toLowerCase();

  if (/\btoday\b/.test(lower)) {
    return resolveDayOfWeek('today');
  }

  if (/\btomorrow\b/.test(lower)) {
    return resolveDayOfWeek('tomorrow');
  }

  for (const day of DAYS_OF_WEEK) {
    if (lower.includes(day)) {
      return day;
    }
  }

  for (const [alias, day] of Object.entries(DAY_ALIASES)) {
    const pattern = new RegExp(`\\b${alias}\\b`, 'i');
    if (pattern.test(lower)) {
      return day;
    }
  }

  return null;
}

function formatScheduleRecord(schedule) {
  const station = schedule.missionStation;
  return {
    id: schedule._id.toString(),
    dayOfWeek: schedule.dayOfWeek,
    time: schedule.time,
    type: schedule.type,
    description: schedule.description || '',
    missionStation: {
      name: station?.name || 'Unknown station',
      location: station?.location || '',
    },
  };
}

/**
 * Fetch active mass schedules with optional filters.
 */
export async function getMassSchedule({
  dayOfWeek,
  missionStationName,
  type: scheduleType,
} = {}) {
  const query = { isActive: true };

  if (dayOfWeek) {
    const resolvedDay = resolveDayOfWeek(dayOfWeek);
    if (resolvedDay) {
      query.dayOfWeek = resolvedDay;
    }
  }

  if (scheduleType) {
    query.type = scheduleType;
  }

  let schedules = await MassSchedule.find(query)
    .populate('missionStation', 'name location')
    .sort({ dayOfWeek: 1, time: 1 });

  if (missionStationName) {
    const needle = missionStationName.toLowerCase().trim();
    schedules = schedules.filter((schedule) => {
      const station = schedule.missionStation;
      if (!station || typeof station === 'string') {
        return false;
      }
      return (
        station.name.toLowerCase().includes(needle) ||
        (station.location && station.location.toLowerCase().includes(needle))
      );
    });
  }

  return schedules.map(formatScheduleRecord);
}
