/**
 * Parish services seeder.
 *
 * Seeds a starter set of pastoral services / formation offerings (youth
 * formation, small Christian communities, etc.) so a freshly-provisioned parish
 * has something to show on the public "Parish Services" page before staff
 * customise it. Each parish then edits these via the admin panel.
 *
 * By default it only seeds when the collection is empty, so re-running will NOT
 * overwrite a parish's customised content. Pass --force to wipe and reseed.
 *
 * Usage:
 *   MONGODB_URI="<uri>" node scripts/seedParishServices.js
 *   MONGODB_URI="<uri>" node scripts/seedParishServices.js --force
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import ParishService from '../models/ParishService.js';

dotenv.config();

const DEFAULT_SERVICES = [
  {
    name: 'Youth Formation',
    description: 'Faith formation, fellowship, and leadership for our young people.',
    details: [
      'Open to teenagers and young adults of the parish.',
      'Weekly gatherings with catechesis, prayer, and social activities.',
      'Opportunities to serve in the liturgy and in outreach.',
      'Speak with the youth coordinator or the parish office to join.',
    ].join('\n'),
    order: 1,
  },
  {
    name: 'Small Christian Communities',
    description: 'Neighbourhood groups that meet to pray, share the Word, and support one another.',
    details: [
      'The parish is organised into small Christian communities by neighbourhood.',
      'Members meet regularly in homes for prayer, Scripture sharing, and mutual support.',
      'A practical way to live the faith close to where you live.',
      'Ask at the parish office to find the community nearest you.',
    ].join('\n'),
    order: 2,
  },
  {
    name: 'Catechesis & RCIA',
    description: 'Preparation for children, and for adults seeking to become Catholic.',
    details: [
      'Catechism classes for children preparing for the sacraments.',
      'RCIA (Rite of Christian Initiation of Adults) for adults entering the Church.',
      'Ongoing adult faith formation throughout the year.',
      'Registration is through the parish office.',
    ].join('\n'),
    order: 3,
  },
  {
    name: 'Charitable Outreach',
    description: 'Serving the sick, the poor, and those in need in our community.',
    details: [
      'Visiting the sick and the homebound, in keeping with our patron.',
      'Support for families and individuals in need.',
      'Volunteers are always welcome — speak with the parish office.',
    ].join('\n'),
    order: 4,
  },
];

const seed = async () => {
  const force = process.argv.includes('--force');
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/parish-website';
  const masked = mongoURI.replace(/(\/\/[^:]*:)[^@]*@/, '$1****@');
  console.log(`Connecting to: ${masked}`);
  await mongoose.connect(mongoURI);
  console.log('Connected to MongoDB\n');

  const existing = await ParishService.countDocuments();
  if (existing > 0 && !force) {
    console.log(`Parish services collection already has ${existing} document(s). Skipping.`);
    console.log('Re-run with --force to wipe and reseed.');
    await mongoose.disconnect();
    process.exit(0);
  }

  if (force) {
    await ParishService.deleteMany({});
    console.log('Cleared existing parish services (--force).');
  }

  await ParishService.insertMany(DEFAULT_SERVICES);
  console.log(`Seeded ${DEFAULT_SERVICES.length} parish services:`);
  DEFAULT_SERVICES.forEach((s) => console.log(`  - ${s.name}`));

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
