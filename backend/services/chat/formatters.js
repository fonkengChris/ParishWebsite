const DAY_LABELS = {
  sunday: 'Sunday',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
};

function formatTime(time) {
  if (!time || typeof time !== 'string') {
    return time || '';
  }

  const trimmed = time.trim();

  // 12-hour format, e.g. "3:00 PM"
  const twelveHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (twelveHourMatch) {
    const hour = Number(twelveHourMatch[1]);
    const minutes = twelveHourMatch[2];
    const period = twelveHourMatch[3].toUpperCase();
    return `${hour}:${minutes} ${period}`;
  }

  // 24-hour format, e.g. "15:00"
  const twentyFourMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFourMatch) {
    const hours = Number(twentyFourMatch[1]);
    const minutes = twentyFourMatch[2];
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  }

  return trimmed;
}

/**
 * Format mass schedule records into a readable parish assistant reply.
 */
export function formatMassScheduleReply(schedules, { dayOfWeek } = {}) {
  const dayLabel = dayOfWeek ? DAY_LABELS[dayOfWeek] || dayOfWeek : 'the requested day';

  if (!schedules.length) {
    return `I couldn't find any scheduled services for ${dayLabel}. Please check our Mass Times page for the full schedule, or ask about another day.`;
  }

  const byStation = new Map();

  for (const entry of schedules) {
    const stationName = entry.missionStation.name;
    if (!byStation.has(stationName)) {
      byStation.set(stationName, []);
    }
    byStation.get(stationName).push(entry);
  }

  const lines = [`Here are the services for ${dayLabel}:\n`];

  for (const [stationName, entries] of byStation) {
    const location = entries[0]?.missionStation?.location;
    lines.push(`${stationName}${location ? ` (${location})` : ''}`);

    for (const entry of entries) {
      const timeLabel = formatTime(entry.time);
      const detail = entry.description ? ` — ${entry.description}` : '';
      lines.push(`• ${entry.type} at ${timeLabel}${detail}`);
    }

    lines.push('');
  }

  lines.push('Visit the Mass Times page on our website for the complete weekly schedule.');

  return lines.join('\n').trim();
}
