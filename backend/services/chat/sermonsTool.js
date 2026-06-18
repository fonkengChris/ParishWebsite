import Sermon from '../../models/Sermon.js';

function matchesSearch(sermon, searchQuery) {
  if (!searchQuery) {
    return true;
  }

  const needle = searchQuery.toLowerCase().trim();
  return (
    sermon.title.toLowerCase().includes(needle) ||
    sermon.content.toLowerCase().includes(needle) ||
    (sermon.preacher && sermon.preacher.toLowerCase().includes(needle)) ||
    (sermon.reading && sermon.reading.toLowerCase().includes(needle))
  );
}

function formatSermonRecord(sermon) {
  return {
    id: sermon._id.toString(),
    title: sermon.title,
    content: sermon.content,
    preacher: sermon.preacher || '',
    date: sermon.date.toISOString(),
    reading: sermon.reading || '',
    type: sermon.type,
    audioUrl: sermon.audioUrl || '',
    videoUrl: sermon.videoUrl || '',
  };
}

/**
 * Detect sermon type from user message.
 */
export function resolveSermonType(message) {
  if (/\b(catechism|catechisis|catechesis)\b/i.test(message)) {
    return 'catechisis';
  }
  if (/\b(sermon|sermons|homily|homilies|preaching)\b/i.test(message)) {
    return 'sermon';
  }
  return undefined;
}

/**
 * Fetch sermons or catechism sessions.
 */
export async function getSermons({ type, searchQuery, limit = 3 } = {}) {
  const query = { isActive: true };

  if (type === 'sermon' || type === 'catechisis') {
    query.type = type;
  }

  let sermons = await Sermon.find(query).sort({ date: -1 }).limit(50);

  if (searchQuery) {
    sermons = sermons.filter((sermon) => matchesSearch(sermon, searchQuery));
  }

  return sermons.slice(0, limit).map(formatSermonRecord);
}
