import Announcement from '../../models/Announcement.js';

function formatAnnouncementRecord(announcement) {
  return {
    id: announcement._id.toString(),
    title: announcement.title,
    content: announcement.content,
    date: announcement.date.toISOString(),
  };
}

/**
 * Fetch recent parish announcements.
 */
export async function getAnnouncements({ limit = 5 } = {}) {
  const announcements = await Announcement.find({ isActive: true })
    .sort({ date: -1 })
    .limit(limit);

  return announcements.map(formatAnnouncementRecord);
}
