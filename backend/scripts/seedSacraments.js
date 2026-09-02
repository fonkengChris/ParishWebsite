/**
 * Sacraments seeder.
 *
 * Seeds a starter set of the seven sacraments (with generic availability and
 * procedure text) so a freshly-provisioned parish has something to show on the
 * public "Parish Services" page before staff customise it. Each parish then
 * edits availability/procedure to match its own practice via the admin panel.
 *
 * Idempotent-ish: by default it only seeds when the collection is empty, so
 * re-running will NOT overwrite a parish's customised content. Pass --force to
 * wipe and reseed.
 *
 * Usage:
 *   MONGODB_URI="<uri>" node scripts/seedSacraments.js
 *   MONGODB_URI="<uri>" node scripts/seedSacraments.js --force
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Sacrament from '../models/Sacrament.js';

dotenv.config();

const DEFAULT_SACRAMENTS = [
  {
    name: 'Baptism',
    description: 'The sacrament of initiation into the Christian faith.',
    availability: 'Celebrated on Sundays. Please contact the parish office at least two months in advance to arrange a date and preparation.',
    procedure: [
      'Parents must be registered parishioners.',
      'Attend the baptism preparation class.',
      'Choose godparents who are practising, confirmed Catholics.',
      "Provide the child's birth certificate.",
    ].join('\n'),
    order: 1,
  },
  {
    name: 'First Holy Communion',
    description: 'Receiving the Body and Blood of Christ for the first time.',
    availability: 'Prepared for through the parish catechism programme, with celebration once a year.',
    procedure: [
      'Child must be at least 7 years old.',
      'Complete the religious education / catechism programme.',
      'Attend Mass regularly.',
      'A parent/guardian meeting is required.',
    ].join('\n'),
    order: 2,
  },
  {
    name: 'Confirmation',
    description: 'The sacrament that completes the grace of Baptism.',
    availability: 'Prepared for through the parish programme; celebrated when the Bishop visits.',
    procedure: [
      'Complete the Confirmation preparation programme.',
      'Attend Mass regularly.',
      'Choose a sponsor who is a confirmed Catholic.',
      'Take an active part in parish life.',
    ].join('\n'),
    order: 3,
  },
  {
    name: 'Reconciliation (Confession)',
    description: "The sacrament of God's mercy and forgiveness.",
    availability: 'Available at the scheduled confession times each week, or by appointment.',
    procedure: [
      'Come during a scheduled confession time — no appointment needed.',
      'Examine your conscience beforehand.',
      'For special circumstances, contact the parish office to arrange a time.',
    ].join('\n'),
    order: 4,
  },
  {
    name: 'Anointing of the Sick',
    description: 'The sacrament of healing for those who are ill.',
    availability: 'Available for the seriously ill, the elderly, and those facing surgery. Can be administered at home or in hospital.',
    procedure: [
      'Contact the parish office to arrange a visit.',
      'In an emergency, ask for the priest at any time.',
    ].join('\n'),
    order: 5,
  },
  {
    name: 'Holy Matrimony',
    description: 'The sacrament of marriage, a lifelong covenant.',
    availability: 'By arrangement. Please contact the parish office at least six months in advance.',
    procedure: [
      'Contact the parish office at least six months before the intended date.',
      'Complete the marriage preparation programme (Pre-Cana).',
      'Provide freedom-to-marry documentation.',
      'Provide Baptism and Confirmation certificates.',
      'Attend the marriage preparation meetings with the priest.',
    ].join('\n'),
    order: 6,
  },
  {
    name: 'Holy Orders',
    description: 'The sacrament by which men are ordained as deacons, priests, or bishops.',
    availability: 'For those discerning a vocation to the priesthood or diaconate. Speak with the parish priest.',
    procedure: [
      'Speak with the parish priest about your discernment.',
      'You will be guided towards the diocesan vocations director and seminary formation.',
    ].join('\n'),
    order: 7,
  },
];

const seed = async () => {
  const force = process.argv.includes('--force');
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/parish-website';
  const masked = mongoURI.replace(/(\/\/[^:]*:)[^@]*@/, '$1****@');
  console.log(`Connecting to: ${masked}`);
  await mongoose.connect(mongoURI);
  console.log('Connected to MongoDB\n');

  const existing = await Sacrament.countDocuments();
  if (existing > 0 && !force) {
    console.log(`Sacraments collection already has ${existing} document(s). Skipping.`);
    console.log('Re-run with --force to wipe and reseed.');
    await mongoose.disconnect();
    process.exit(0);
  }

  if (force) {
    await Sacrament.deleteMany({});
    console.log('Cleared existing sacraments (--force).');
  }

  await Sacrament.insertMany(DEFAULT_SACRAMENTS);
  console.log(`Seeded ${DEFAULT_SACRAMENTS.length} sacraments:`);
  DEFAULT_SACRAMENTS.forEach((s) => console.log(`  - ${s.name}`));

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
