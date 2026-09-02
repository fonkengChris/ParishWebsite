export interface Announcement {
  _id: string;
  title: string;
  content: string;
  date: string;
  image?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: string;
  image?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MissionStation {
  _id: string;
  name: string;
  location?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MassSchedule {
  _id: string;
  missionStation: MissionStation | string;
  dayOfWeek: string;
  time: string;
  type: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MeetingSchedule {
  day?: string;
  time?: string;
  location?: string;
}

export interface Apostolate {
  _id: string;
  name: string;
  description: string;
  meetingSchedules?: MeetingSchedule[];
  photo?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Sacrament {
  _id: string;
  name: string;
  description?: string;
  availability?: string;
  procedure?: string;
  order?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ParishService {
  _id: string;
  name: string;
  description?: string;
  details?: string;
  order?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryItem {
  _id: string;
  title: string;
  imageUrl: string;
  eventId?: string;
  category?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type PrayerCategory = 'morning' | 'evening' | 'devotions' | 'marian' | 'general' | 'special' | 'saint' | 'other';

export interface Prayer {
  _id: string;
  title: string;
  content: string;
  category?: PrayerCategory;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Sermon {
  _id: string;
  title: string;
  content: string;
  preacher?: string;
  date: string;
  reading?: string;
  audioUrl?: string;
  videoUrl?: string;
  image?: string;
  type?: 'sermon' | 'catechisis';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  username?: string; // Optional for parishioner role
  email?: string; // Optional for admin/editor roles
  role: 'admin' | 'editor' | 'priest' | 'parish-priest' | 'parishioner';
}

export interface AuthResponse {
  accessToken?: string; // New refresh token pattern
  token?: string; // Legacy support
  user: User;
}

export interface Parishioner {
  _id: string;
  user?: {
    _id: string;
    email: string;
    role: string;
  } | string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  missionStation?: MissionStation | string;
  familyMembers?: Array<{
    name: string;
    relationship: string;
    dateOfBirth?: string;
  }>;
  sacraments?: {
    baptism?: { date?: string; location?: string };
    firstCommunion?: { date?: string; location?: string };
    confirmation?: { date?: string; location?: string };
    marriage?: { date?: string; location?: string };
  };
  apostolates?: (Apostolate | string)[];
  notes?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Saint {
  name: string;
  type: 'saint' | 'feast' | 'memorial' | 'optional' | 'ordinary' | 'none';
  description: string;
}

export interface SaintDay {
  date: string;
  timestamp: string;
  saints: Saint[];
}

export interface SaintsResponse {
  today: SaintDay;
  upcoming: SaintDay[];
  count: number;
}

export interface Donation {
  _id: string;
  donor: {
    name: string;
    email: string;
    phone?: string;
  };
  amount: number;
  currency: string;
  purpose: 'general' | 'charity' | 'mass' | 'other';
  purposeDescription?: string;
  paymentMethod: 'paypal' | 'mtn-mobile-money';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentId?: string;
  paymentDetails?: any;
  notes?: string;
  isAnonymous?: boolean;
  receiptSent?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatSource {
  type: 'mass-schedule' | 'event' | 'prayer' | 'sermon' | 'announcement';
  id?: string;
  url?: string;
  label?: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  history?: ChatMessage[];
}

export interface ChatResponse {
  reply: string;
  sources?: ChatSource[];
  conversationId?: string;
}

// Parish identity/branding — the singleton fetched from /api/parish-config.
export interface ParishConfig {
  name: string;
  diocese: string;
  dioceseUrl: string;
  city: string;
  region: string;
  country: string;
  coordinates: { lat: number; lng: number };
  neighbourhood: string;
  contact: {
    phone: string;
    email: string;
    address: string;
    officeHours: string[];
  };
  social: {
    facebook?: string;
    youtube?: string;
    instagram?: string;
    whatsapp?: string;
    twitter?: string;
  };
  tagline: string;
  patron: { name: string; descriptor: string };
  assets: { logoUrl: string; faviconUrl: string; heroUrl: string };
  currency: string;
}

// Editorial copy for the static pages — the singleton from /api/site-content.
export interface SiteContentCard {
  eyebrow: string;
  title: string;
  body: string;
  linkUrl: string;
  linkLabel: string;
}

export interface SiteContentIntro {
  heading: string;
  subhead: string;
}

export interface SiteContent {
  home: {
    heroHeadingLead: string;
    heroHeadingEmph: string;
    heroSubhead: string;
    sanctuaryEyebrow: string;
    sanctuaryHeadingLead: string;
    sanctuaryHeadingEmph: string;
    sanctuaryBody: string;
    formationHeading: string;
    formationSubhead: string;
    scriptureCard: SiteContentCard;
    doctrineCard: SiteContentCard;
    closingQuote: string;
    closingAttribution: string;
  };
  about: {
    subHero: string;
    historyParagraphs: string[];
    missionIntro: string;
    missionPoints: string[];
    pastoralTeam: Array<{ role: string; description: string }>;
    getInTouch: string;
  };
  pageIntros: {
    contact: SiteContentIntro;
    donations: SiteContentIntro;
    privacy: { heading: string; subhead: string; effectiveDate: string };
  };
}
