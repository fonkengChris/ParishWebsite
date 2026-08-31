/**
 * Parish identity seeder.
 *
 * Upserts the ParishConfig singleton from the PARISH_* environment variables so
 * a freshly-provisioned instance renders its own identity without touching the
 * admin UI. Run once per parish during onboarding (step 4 of the runbook).
 *
 * SiteContent (the editorial page copy) is intentionally NOT seeded here: when
 * absent, the frontend renders its shipped defaults (data/defaultSiteContent.ts),
 * and the first save from the "Site Content" admin page creates the document.
 *
 * Idempotent: re-running updates the same singleton in place.
 *
 * Usage:
 *   MONGODB_URI="<uri>" node scripts/seedParishConfig.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import ParishConfig from '../models/ParishConfig.js';

dotenv.config();

const seed = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/parish-website';
  const masked = mongoURI.replace(/(\/\/[^:]*:)[^@]*@/, '$1****@');
  console.log(`Connecting to: ${masked}`);
  await mongoose.connect(mongoURI);
  console.log('Connected to MongoDB\n');

  const [lat, lng] = (process.env.PARISH_COORDINATES || '0,0')
    .split(',')
    .map((n) => parseFloat(n.trim()) || 0);

  const config = {
    key: 'default',
    name: process.env.PARISH_NAME || 'Parish Website',
    diocese: process.env.PARISH_DIOCESE || '',
    dioceseUrl: process.env.PARISH_DIOCESE_URL || '',
    city: process.env.PARISH_CITY || '',
    region: process.env.PARISH_REGION || '',
    country: process.env.PARISH_COUNTRY || '',
    coordinates: { lat, lng },
    neighbourhood: process.env.PARISH_NEIGHBOURHOOD || '',
    contact: {
      phone: process.env.PARISH_PHONE || '',
      email: process.env.PARISH_CONTACT_EMAIL || process.env.SMTP_FROM_EMAIL || '',
      address: process.env.PARISH_ADDRESS || '',
      officeHours: [
        'Monday - Friday: 9:00 AM - 5:00 PM',
        'Saturday: 9:00 AM - 12:00 PM',
        'Sunday: Closed'
      ]
    },
    tagline: process.env.PARISH_TAGLINE || '',
    patron: {
      name: process.env.PARISH_PATRON_NAME || '',
      descriptor: process.env.PARISH_PATRON_DESCRIPTOR || ''
    },
    currency: process.env.MTN_CURRENCY || 'XAF'
  };

  const doc = await ParishConfig.findOneAndUpdate(
    { key: 'default' },
    { $set: config },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  console.log('ParishConfig upserted:');
  console.log(`  name:    ${doc.name}`);
  console.log(`  diocese: ${doc.diocese}`);
  console.log(`  city:    ${doc.city}, ${doc.country}`);
  console.log(`  patron:  ${doc.patron.name} — ${doc.patron.descriptor}`);

  console.log('\nDone.');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(async (err) => {
  console.error('\nSeed failed:', err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
