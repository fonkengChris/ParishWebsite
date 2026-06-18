import Event from '../../models/Event.js';

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatEventRecord(event) {
  return {
    id: event._id.toString(),
    title: event.title,
    description: event.description,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate ? event.endDate.toISOString() : null,
    location: event.location || '',
  };
}

/**
 * Fetch upcoming parish events/activities.
 */
export async function getUpcomingEvents({ limit = 10, daysAhead = 90 } = {}) {
  const today = startOfToday();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + daysAhead);

  const events = await Event.find({
    isActive: true,
    startDate: { $gte: today, $lte: endDate },
  })
    .sort({ startDate: 1 })
    .limit(limit);

  return events.map(formatEventRecord);
}
