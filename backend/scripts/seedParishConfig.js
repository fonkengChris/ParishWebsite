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

  // Office hours: '|'-separated list in PARISH_OFFICE_HOURS, else a sensible default.
  const officeHours = process.env.PARISH_OFFICE_HOURS
    ? process.env.PARISH_OFFICE_HOURS.split('|').map((s) => s.trim()).filter(Boolean)
    : [
        'Monday - Friday: 9:00 AM - 5:00 PM',
        'Saturday: 9:00 AM - 12:00 PM',
        'Sunday: Closed'
      ];

  // Leadership: the Holy Father (universal) plus the diocesan bishop(s).
  // Bishops are a ';'-separated list; each is 'Name | Title | ImageUrl'.
  //   PARISH_BISHOPS="Most Rev. Andrew Fuanya Nkea | Archbishop of Bamenda | /images/bishop.jpeg"
  const bishops = (process.env.PARISH_BISHOPS || '')
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [name = '', title = '', image = ''] = entry.split('|').map((s) => s.trim());
      return { name, title, image };
    });

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
      officeHours
    },
    tagline: process.env.PARISH_TAGLINE || '',
    patron: {
      name: process.env.PARISH_PATRON_NAME || '',
      descriptor: process.env.PARISH_PATRON_DESCRIPTOR || ''
    },
    leadership: {
      pope: {
        name: process.env.PARISH_POPE_NAME || 'Pope Leo XIV',
        title: process.env.PARISH_POPE_TITLE || 'Bishop of Rome · Successor of St. Peter',
        image: process.env.PARISH_POPE_IMAGE || '/images/Pope.jpeg'
      },
      bishops
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
  console.log(`  pope:    ${doc.leadership?.pope?.name || '(none)'}`);
  console.log(`  bishops: ${doc.leadership?.bishops?.map((b) => b.name).join(', ') || '(none)'}`);

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
