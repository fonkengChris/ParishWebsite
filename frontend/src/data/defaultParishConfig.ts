import type { ParishConfig } from '../types';

/**
 * Default parish identity — the current St. John of God values. Used by
 * ParishContext as the first-paint fallback while /api/parish-config loads and
 * if the request fails. Once the DB singleton (or env fallback) is fetched it
 * takes over, so a differently-configured instance renders its own identity
 * with no rebuild.
 */
export const DEFAULT_PARISH_CONFIG: ParishConfig = {
  name: 'St. John of God Parish',
  diocese: 'Buea Diocese',
  dioceseUrl: 'https://bueadiocese.org',
  city: 'Limbe',
  region: 'Southwest Region',
  country: 'Cameroon',
  coordinates: { lat: 4.055278, lng: 9.228056 },
  neighbourhood: 'Bonadikombo',
  contact: {
    phone: '+237 333 22 11 00',
    email: 'info@parishlimbe.cm',
    address: 'Bonadikombo, Limbe',
    officeHours: [
      'Monday - Friday: 9:00 AM - 5:00 PM',
      'Saturday: 9:00 AM - 12:00 PM',
      'Sunday: Closed',
    ],
  },
  social: {},
  tagline: 'Holy Ground',
  patron: { name: 'St. John of God', descriptor: 'Patron of the Sick' },
  assets: { logoUrl: '', faviconUrl: '', heroUrl: '' },
  currency: 'XAF',
};
