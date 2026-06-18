import type { PrayerCategory } from '../types';

export const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

export type MassScheduleType = 'Mass' | 'Confession' | 'Adoration' | 'Other';
export const MASS_SCHEDULE_TYPES: MassScheduleType[] = ['Mass', 'Confession', 'Adoration', 'Other'];

export const PRAYER_CATEGORY_OPTIONS: Array<{ value: PrayerCategory; label: string }> = [
  { value: 'morning', label: 'Morning Prayers' },
  { value: 'evening', label: 'Evening Prayers' },
  { value: 'devotions', label: 'Devotions' },
  { value: 'marian', label: 'Marian Prayers' },
  { value: 'general', label: 'General Prayers' },
  { value: 'special', label: 'Special Prayers' },
  { value: 'saint', label: 'Saints Prayers' },
  { value: 'other', label: 'Other' },
];

export type PrayerFilterValue = 'all' | PrayerCategory;
export const PRAYER_FILTER_OPTIONS: Array<{ value: PrayerFilterValue; label: string }> = [
  { value: 'all', label: 'All Prayers' },
  ...PRAYER_CATEGORY_OPTIONS,
];

export const GALLERY_CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'events', label: 'Events' },
  { value: 'ministries', label: 'Ministries' },
  { value: 'mass', label: 'Mass' },
  { value: 'community', label: 'Community' },
  { value: 'other', label: 'Other' },
] as const;

