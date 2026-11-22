import type { ParishConfig } from '../types';
import { DEFAULT_BISHOP, DEFAULT_POPE } from './churchLeadership';

/**
 * Neutral first-paint fallback, used by ParishContext while /api/parish-config
 * loads and if the request fails. The codebase is shared by many parishes, so
 * nothing here names a particular one: the name comes from the build-time
 * VITE_PARISH_NAME (else the product name, "My Parish"), people and places
 * visitors see get generic titles ("The Diocesan Bishop", "The Diocese"), and
 * facts that would mislead if invented (contacts, hours, location) stay blank.
 * ParishContext also uses these titles for any field a parish leaves empty.
 */
export const DEFAULT_PARISH_CONFIG: ParishConfig = {
  name: import.meta.env.VITE_PARISH_NAME?.trim() || 'My Parish',
  diocese: 'The Diocese',
  dioceseUrl: '',
  city: '',
  region: '',
  country: '',
  coordinates: { lat: 0, lng: 0 },
  neighbourhood: '',
  contact: {
    phone: '',
    email: '',
    address: '',
    officeHours: [],
  },
  social: {},
  tagline: '',
  patron: {
    name: 'Our Patron Saint',
    descriptor: 'Patron of our parish',
  },
  leadership: {
    pope: DEFAULT_POPE,
    bishops: [DEFAULT_BISHOP],
  },
  assets: { logoUrl: '', faviconUrl: '', heroUrl: '' },
  currency: 'XAF',
};
