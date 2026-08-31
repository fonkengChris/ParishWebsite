import mongoose from 'mongoose';

/**
 * ParishConfig — singleton document (one parish per database).
 * Holds parish identity, contacts, branding and asset URLs. Fetched publicly
 * on every page load; edited by admins. Enforced as a singleton via a fixed
 * `key: 'default'` unique field — always read/write the one document.
 */
const parishConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    default: 'default',
    unique: true,
    index: true
  },
  name: { type: String, default: '' },
  diocese: { type: String, default: '' },
  dioceseUrl: { type: String, default: '' },
  city: { type: String, default: '' },
  region: { type: String, default: '' },
  country: { type: String, default: '' },
  coordinates: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },
  neighbourhood: { type: String, default: '' },
  contact: {
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    officeHours: { type: [String], default: [] }
  },
  social: {
    facebook: { type: String, default: '' },
    youtube: { type: String, default: '' },
    instagram: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    twitter: { type: String, default: '' }
  },
  tagline: { type: String, default: '' },
  patron: {
    name: { type: String, default: '' },
    descriptor: { type: String, default: '' }
  },
  assets: {
    logoUrl: { type: String, default: '' },
    faviconUrl: { type: String, default: '' },
    heroUrl: { type: String, default: '' }
  },
  currency: { type: String, default: 'XAF' }
}, {
  timestamps: true
});

export default mongoose.model('ParishConfig', parishConfigSchema);
