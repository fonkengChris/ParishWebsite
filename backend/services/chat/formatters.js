import { summarizeForChat } from './textSummarizer.js';

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

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function indentSummary(summary) {
  return summary
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n');
}

function truncateText(text, maxLength = 400) {
  if (!text || text.length <= maxLength) {
    return text || '';
  }
  return `${text.slice(0, maxLength).trim()}...`;
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

export async function formatEventsReply(events) {
  if (!events.length) {
    return 'There are no upcoming events scheduled right now. Check the Events page for updates.';
  }

  const lines = ['Here are the upcoming parish events:\n'];

  for (const event of events) {
    const dateLabel = formatDate(event.startDate);
    const location = event.location ? ` at ${event.location}` : '';
    lines.push(`• ${event.title} — ${dateLabel}${location}`);

    if (event.description) {
      const summary = await summarizeForChat(event.description, {
        title: event.title,
        kind: 'event',
      });
      if (summary) {
        lines.push(indentSummary(summary));
      }
    }

    lines.push('');
  }

  lines.push('Visit the Events page on our website for full details.');

  return lines.join('\n').trim();
}

export function formatPrayersReply(prayers, { category } = {}) {
  const categoryLabels = {
    morning: 'Morning Prayers',
    evening: 'Evening Prayers',
    devotions: 'Devotions',
    general: 'General Prayers',
    marian: 'Marian Prayers',
    special: 'Special Prayers',
    saint: 'Saints Prayers',
    other: 'Other',
  };

  const categoryLabel = category ? categoryLabels[category] || category : '';

  if (!prayers.length) {
    return categoryLabel
      ? `I couldn't find any ${categoryLabel.toLowerCase()}. Try the Prayers page or ask about another category like morning, evening, or Marian prayers.`
      : `I couldn't find any matching prayers. Try the Prayers page or ask about a category like morning, evening, Marian, or special prayers.`;
  }

  const lines = [
    categoryLabel
      ? `Here ${prayers.length === 1 ? 'is a prayer' : 'are some prayers'} from ${categoryLabel}:\n`
      : `Here ${prayers.length === 1 ? 'is a prayer' : 'are some prayers'}:\n`,
  ];

  for (const prayer of prayers) {
    const prayerCategory = prayer.category
      ? ` (${categoryLabels[prayer.category] || prayer.category})`
      : '';
    lines.push(`${prayer.title}${prayerCategory}`);
    lines.push(truncateText(prayer.content, 500));
    lines.push('');
  }

  lines.push('Visit the Prayers page for the full collection.');

  return lines.join('\n').trim();
}

export async function formatSermonsReply(sermons, { type } = {}) {
  const typeLabel =
    type === 'catechisis' ? 'catechism sessions' : type === 'sermon' ? 'sermons' : 'sermons and homilies';

  if (!sermons.length) {
    return `I couldn't find any recent ${typeLabel}. Check the Sermons page for the archive.`;
  }

  const lines = [`Here are recent ${typeLabel}:\n`];

  for (const sermon of sermons) {
    const dateLabel = formatDate(sermon.date);
    const preacher = sermon.preacher ? ` by ${sermon.preacher}` : '';
    const sessionLabel = sermon.type === 'catechisis' ? 'Catechism' : 'Sermon';
    lines.push(`• ${sermon.title} — ${dateLabel}${preacher} (${sessionLabel})`);

    if (sermon.reading) {
      lines.push(`  Reading: ${sermon.reading}`);
    }

    if (sermon.content) {
      const summary = await summarizeForChat(sermon.content, {
        title: sermon.title,
        kind: sermon.type === 'catechisis' ? 'catechisis' : 'sermon',
      });
      if (summary) {
        lines.push(indentSummary(summary));
      }
    }

    if (sermon.audioUrl || sermon.videoUrl) {
      lines.push('  Audio/video is available on the Sermons page.');
    }

    lines.push('');
  }

  lines.push('Visit the Sermons page for the full archive.');

  return lines.join('\n').trim();
}

export async function formatAnnouncementsReply(announcements) {
  if (!announcements.length) {
    return 'There are no recent announcements at the moment. Check the Announcements page for updates.';
  }

  const lines = ['Here are the latest parish announcements:\n'];

  for (const announcement of announcements) {
    const dateLabel = formatDate(announcement.date);
    lines.push(`• ${announcement.title} — ${dateLabel}`);

    if (announcement.content) {
      const summary = await summarizeForChat(announcement.content, {
        title: announcement.title,
        kind: 'announcement',
      });
      if (summary) {
        lines.push(indentSummary(summary));
      }
    }

    lines.push('');
  }

  lines.push('Visit the Announcements page for more news.');

  return lines.join('\n').trim();
}

export async function formatToolResult(toolName, result) {
  switch (toolName) {
    case 'getMassSchedule':
      return formatMassScheduleReply(result.schedules, { dayOfWeek: result.dayOfWeek });
    case 'getUpcomingEvents':
      return formatEventsReply(result.events);
    case 'getPrayers':
      return formatPrayersReply(result.prayers, { category: result.category });
    case 'getSermons':
      return formatSermonsReply(result.sermons, { type: result.type });
    case 'getAnnouncements':
      return formatAnnouncementsReply(result.announcements);
    default:
      return 'I found some information, but I could not format the response.';
  }
}
