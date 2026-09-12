import type { ParishConfig } from '../types';

/**
 * Default parish identity — St. Edmund of Abingdon Parish, Mulang. Used by
 * ParishContext as the first-paint fallback while /api/parish-config loads and
 * if the request fails. Once the DB singleton (or env fallback) is fetched it
 * takes over, so a differently-configured instance renders its own identity
 * with no rebuild. (This build is the dedicated Mulang instance; the defaults
 * are set to Mulang so there is no first-paint flash of another parish.)
 */
export const DEFAULT_PARISH_CONFIG: ParishConfig = {
  name: 'St. Edmund of Abingdon Parish, Mulang',
  diocese: 'Archdiocese of Bamenda',
  dioceseUrl: 'https://www.bamendaarchdiocese.org',
  city: 'Bamenda',
  region: 'North West Region',
  country: 'Cameroon',
  coordinates: { lat: 5.976625, lng: 10.153081 },
  neighbourhood: 'Mulang',
  contact: {
    phone: '',
    email: '',
    address: '',
    officeHours: [
      'Monday - Friday: 8:00 AM - 12:30 PM, 3:30 PM - 5:00 PM',
      'Saturday: 8:00 AM - 12:30 PM',
      'Sunday: Closed',
    ],
  },
  social: {},
  tagline: 'A Community of Disciples journeying with Jesus Christ in His Church',
  patron: {
    name: 'St. Edmund of Abingdon',
    descriptor: 'Scholar, Archbishop of Canterbury and Martyr',
  },
  leadership: {
    pope: {
      name: 'Pope Leo XIV',
      title: 'Bishop of Rome · Successor of St. Peter',
      image: '/images/Pope.jpeg',
    },
    bishops: [
      {
        name: 'Most Rev. Andrew Fuanya Nkea',
        title: 'Archbishop of Bamenda',
        image: '/images/bishop.jpeg',
      },
    ],
  },
  assets: { logoUrl: '', faviconUrl: '', heroUrl: '' },
  currency: 'XAF',
};
