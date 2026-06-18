import Prayer from '../../models/Prayer.js';

export const PRAYER_CATEGORIES = [
  'morning',
  'evening',
  'devotions',
  'general',
  'marian',
  'special',
  'saint',
  'other',
];

const CATEGORY_ALIASES = {
  morning: 'morning',
  evening: 'evening',
  night: 'evening',
  devotion: 'devotions',
  devotions: 'devotions',
  marian: 'marian',
  mary: 'marian',
  rosary: 'devotions',
  general: 'general',
  special: 'special',
  saint: 'saint',
  saints: 'saint',
};

const CATEGORY_PHRASES = [
  { pattern: /\bmorning prayers?\b/i, category: 'morning' },
  { pattern: /\bevening prayers?\b/i, category: 'evening' },
  { pattern: /\bmarian prayers?\b/i, category: 'marian' },
  { pattern: /\bgeneral prayers?\b/i, category: 'general' },
  { pattern: /\bspecial prayers?\b/i, category: 'special' },
  { pattern: /\bsaints? prayers?\b/i, category: 'saint' },
  { pattern: /\bdevotions?\b/i, category: 'devotions' },
  { pattern: /\brosary\b/i, category: 'devotions' },
];

const PRAYER_STOP_WORDS =
  /\b(prayer|prayers|share|show|find|get|give|me|a|an|the|please|about|for|any|some|recent|latest|read|tell|what|are|is|there|do|you|have|can|could|would|like|to|of|my|our|us)\b/gi;

/**
 * Detect prayer category from user message.
 */
export function resolvePrayerCategory(message) {
  const lower = message.toLowerCase();

  for (const { pattern, category } of CATEGORY_PHRASES) {
    if (pattern.test(lower)) {
      return category;
    }
  }

  for (const [keyword, category] of Object.entries(CATEGORY_ALIASES)) {
    const pattern = new RegExp(`\\b${keyword}\\b`, 'i');
    if (pattern.test(lower)) {
      return category;
    }
  }

  return undefined;
}

export function extractPrayerSearchQuery(message, category) {
  let query = message.trim();

  for (const { pattern } of CATEGORY_PHRASES) {
    query = query.replace(pattern, ' ');
  }

  if (category) {
    query = query.replace(new RegExp(`\\b${category}\\b`, 'gi'), ' ');
  }

  query = query.replace(PRAYER_STOP_WORDS, ' ');
  query = query.replace(/\s+/g, ' ').trim();

  return query.length >= 3 ? query : undefined;
}

function matchesSearch(prayer, searchQuery) {
  if (!searchQuery) {
    return true;
  }

  const needle = searchQuery.toLowerCase().trim();
  return (
    prayer.title.toLowerCase().includes(needle) ||
    prayer.content.toLowerCase().includes(needle)
  );
}

function formatPrayerRecord(prayer) {
  return {
    id: prayer._id.toString(),
    title: prayer.title,
    content: prayer.content,
    category: prayer.category,
  };
}

/**
 * Fetch prayers with optional category or title/content search.
 */
export async function getPrayers({ category, searchQuery, limit = 3 } = {}) {
  const fetchPrayers = async ({ category: cat, searchQuery: search, limit: max }) => {
    const query = { isActive: true };

    if (cat && PRAYER_CATEGORIES.includes(cat)) {
      query.category = cat;
    }

    let prayers = await Prayer.find(query).sort({ createdAt: -1 });

    if (search) {
      prayers = prayers.filter((prayer) => matchesSearch(prayer, search));
    }

    return prayers.slice(0, max).map(formatPrayerRecord);
  };

  if (category) {
    let prayers = await fetchPrayers({ category, searchQuery, limit });

    if (!prayers.length && searchQuery) {
      prayers = await fetchPrayers({ category, limit });
    }

    return { prayers, category };
  }

  let prayers = await fetchPrayers({ searchQuery, limit });

  if (!prayers.length) {
    prayers = await fetchPrayers({ limit });
  }

  return { prayers, category: undefined };
}
