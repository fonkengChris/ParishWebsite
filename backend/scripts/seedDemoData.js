/**
 * Demo data seeder.
 *
 * Populates the database with sample content for live testing:
 *   - Mission station (needed by mass schedules)
 *   - Mass schedules ("mass times")
 *   - Announcements, Events, Prayers
 *   - Sermons (1 sermon + 1 catechesis)
 *   - A couple of users at every role level
 *
 * All seeded users share the password: Password123#
 *
 * Idempotent: existing records (matched by a natural key) are skipped, so the
 * script can be run repeatedly without creating duplicates.
 *
 * Usage:
 *   MONGODB_URI="<prod-uri>" node scripts/seedDemoData.js
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import User from '../models/User.js';
import Parishioner from '../models/Parishioner.js';
import MissionStation from '../models/MissionStation.js';
import MassSchedule from '../models/MassSchedule.js';
import Announcement from '../models/Announcement.js';
import Event from '../models/Event.js';
import Prayer from '../models/Prayer.js';
import Sermon from '../models/Sermon.js';

dotenv.config();

const DEMO_PASSWORD = 'Password123#';

// Small helpers ------------------------------------------------------------
const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

/** Find-or-create by a filter. Returns { doc, created }. */
async function ensure(Model, filter, data, label) {
  const existing = await Model.findOne(filter);
  if (existing) {
    console.log(`  = ${label} exists, skipping`);
    return { doc: existing, created: false };
  }
  const doc = await Model.create(data);
  console.log(`  + ${label} created`);
  return { doc, created: true };
}

const seed = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/parish-website';
  const masked = mongoURI.replace(/(\/\/[^:]*:)[^@]*@/, '$1****@');
  console.log(`Connecting to: ${masked}`);
  await mongoose.connect(mongoURI);
  console.log('Connected to MongoDB\n');

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // --- Mission station (mass schedules reference one) ---------------------
  console.log('Mission station:');
  const { doc: station } = await ensure(
    MissionStation,
    { name: 'St. John of God (Main Parish)' },
    {
      name: 'St. John of God (Main Parish)',
      location: 'Limbe, Buea Diocese, Cameroon',
      description: 'Main parish church — Holy Ground.',
      isActive: true,
    },
    'St. John of God (Main Parish)'
  );

  // --- Mass schedules (a.k.a. "mass times") -------------------------------
  console.log('\nMass schedules:');
  const massTimes = [
    { dayOfWeek: 'sunday', time: '7:00 AM', type: 'Mass', description: 'First Sunday Mass' },
    { dayOfWeek: 'sunday', time: '9:30 AM', type: 'Mass', description: 'Main Sunday Mass (English)' },
    { dayOfWeek: 'sunday', time: '5:00 PM', type: 'Mass', description: 'Evening Sunday Mass' },
    { dayOfWeek: 'wednesday', time: '6:30 AM', type: 'Mass', description: 'Weekday Morning Mass' },
    { dayOfWeek: 'friday', time: '6:00 PM', type: 'Mass', description: 'Weekday Evening Mass' },
    { dayOfWeek: 'saturday', time: '4:00 PM', type: 'Confession', description: 'Confessions' },
    { dayOfWeek: 'saturday', time: '5:00 PM', type: 'Mass', description: 'Vigil Mass' },
    { dayOfWeek: 'thursday', time: '5:00 PM', type: 'Adoration', description: 'Eucharistic Adoration' },
  ];
  for (const m of massTimes) {
    await ensure(
      MassSchedule,
      { missionStation: station._id, dayOfWeek: m.dayOfWeek, time: m.time, type: m.type },
      { ...m, missionStation: station._id, isActive: true },
      `${m.dayOfWeek} ${m.time} (${m.type})`
    );
  }

  // --- Announcements ------------------------------------------------------
  console.log('\nAnnouncements:');
  const announcements = [
    {
      title: 'Harvest Thanksgiving Sunday',
      content:
        'Our annual Harvest Thanksgiving will be celebrated at the 9:30 AM Mass next Sunday. ' +
        'All parishioners are encouraged to bring produce and offerings to support the parish.',
      date: daysFromNow(3),
    },
    {
      title: 'Catechism Classes Resume',
      content:
        'Catechism classes for First Holy Communion and Confirmation resume this Saturday at 10:00 AM ' +
        'in the parish hall. New registrations are welcome.',
      date: daysFromNow(1),
    },
    {
      title: 'Parish Council Meeting',
      content:
        'The Parish Pastoral Council will meet on the last Sunday of the month after the evening Mass. ' +
        'All ministry heads are requested to attend.',
      date: daysFromNow(7),
    },
    {
      title: 'Support the Sick and Homebound',
      content:
        'As a parish under the patronage of St. John of God, patron of the sick, we invite volunteers ' +
        'to join our ministry visiting the sick and homebound. Please see Fr. Parish Priest after Mass.',
      date: daysFromNow(-2),
    },
  ];
  for (const a of announcements) {
    await ensure(Announcement, { title: a.title }, { ...a, isActive: true }, a.title);
  }

  // --- Events -------------------------------------------------------------
  console.log('\nEvents:');
  const events = [
    {
      title: 'Feast of St. John of God',
      description:
        'Solemn celebration of our patron saint with a special Mass, procession, and reception. ' +
        'A day to honour the patron of the sick, hospitals, and nurses.',
      startDate: daysFromNow(14),
      endDate: daysFromNow(14),
      location: 'St. John of God Parish, Limbe',
    },
    {
      title: 'Parish Youth Retreat',
      description:
        'A weekend retreat for the parish youth featuring talks, adoration, confessions, and fellowship. ' +
        'Registration is open at the parish office.',
      startDate: daysFromNow(21),
      endDate: daysFromNow(23),
      location: 'Parish Hall & Grounds',
    },
    {
      title: 'Diocesan Charismatic Convention',
      description:
        'Buea Diocese charismatic renewal convention. Parishioners travelling together should register ' +
        'with their ministry leaders.',
      startDate: daysFromNow(30),
      endDate: daysFromNow(31),
      location: 'Buea Diocese Grounds',
    },
    {
      title: 'Fundraising Bazaar',
      description:
        'Annual parish bazaar in support of the church building fund. Food, crafts, music, and games ' +
        'for the whole family.',
      startDate: daysFromNow(45),
      endDate: daysFromNow(45),
      location: 'Parish Grounds',
    },
  ];
  for (const e of events) {
    await ensure(Event, { title: e.title }, { ...e, isActive: true }, e.title);
  }

  // --- Prayers ------------------------------------------------------------
  console.log('\nPrayers:');
  const prayers = [
    {
      title: 'Morning Offering',
      category: 'morning',
      content:
        'O Jesus, through the Immaculate Heart of Mary, I offer You my prayers, works, joys, and ' +
        'sufferings of this day for all the intentions of Your Sacred Heart. Amen.',
    },
    {
      title: 'Evening Prayer',
      category: 'evening',
      content:
        'O my God, at the end of this day I thank You most heartily for all the graces I have received ' +
        'from You. Watch over me and my loved ones through the night. Amen.',
    },
    {
      title: 'Prayer to St. John of God',
      category: 'saint',
      content:
        'O glorious St. John of God, patron of the sick and of hospitals, intercede for all who suffer ' +
        'in body and soul. Obtain for us the grace of charity toward the poor and the sick. Amen.',
    },
    {
      title: 'The Memorare',
      category: 'marian',
      content:
        'Remember, O most gracious Virgin Mary, that never was it known that anyone who fled to your ' +
        'protection, implored your help, or sought your intercession was left unaided. Amen.',
    },
    {
      title: 'Prayer for the Sick',
      category: 'special',
      content:
        'Lord Jesus, who went about doing good and healing the sick, look with compassion on all who ' +
        'are ill. Grant them healing, patience, and hope. Amen.',
    },
  ];
  for (const p of prayers) {
    await ensure(Prayer, { title: p.title }, { ...p, isActive: true }, p.title);
  }

  // --- Sermons (1 sermon + 1 catechesis) ----------------------------------
  console.log('\nSermons:');
  const sermons = [
    {
      title: 'The Good Samaritan: Mercy in Action',
      type: 'sermon',
      preacher: 'Fr. Parish Priest',
      reading: 'Luke 10:25-37',
      date: daysFromNow(-7),
      content:
        'Dear brothers and sisters, the parable of the Good Samaritan calls each of us to see Christ in ' +
        'the wounded stranger by the roadside. As a parish under the patronage of St. John of God, we are ' +
        'reminded that true worship overflows into concrete acts of mercy toward the sick and the poor. ' +
        'Let us ask ourselves today: who is the neighbour God is placing before me, and will I stop to help?',
    },
    {
      title: 'Understanding the Sacraments of Initiation',
      type: 'catechisis',
      preacher: 'Fr. Assistant Priest',
      reading: 'CCC 1212-1419',
      date: daysFromNow(-3),
      content:
        'In this catechesis we explore the three Sacraments of Christian Initiation: Baptism, Confirmation, ' +
        'and the Holy Eucharist. Baptism cleanses us of sin and makes us children of God; Confirmation ' +
        'strengthens us with the gifts of the Holy Spirit; and the Eucharist nourishes us with the Body ' +
        'and Blood of Christ. Together they form the foundation of our life in the Church.',
    },
  ];
  for (const s of sermons) {
    await ensure(Sermon, { title: s.title }, { ...s, isActive: true }, s.title);
  }

  // --- Users: a couple at each role level ---------------------------------
  console.log('\nUsers (password for all: ' + DEMO_PASSWORD + '):');

  // Staff roles log in with a USERNAME.
  const staffUsers = [
    { username: 'admin1', role: 'admin' },
    { username: 'admin2', role: 'admin' },
    { username: 'editor1', role: 'editor' },
    { username: 'editor2', role: 'editor' },
    { username: 'priest1', role: 'priest' },
    { username: 'priest2', role: 'priest' },
    { username: 'parishpriest1', role: 'parish-priest' },
    { username: 'parishpriest2', role: 'parish-priest' },
  ];
  for (const u of staffUsers) {
    await ensure(
      User,
      { username: u.username },
      { username: u.username, passwordHash, role: u.role },
      `${u.role}: ${u.username}`
    );
  }

  // Parishioners log in with an EMAIL and get a linked Parishioner profile.
  const parishioners = [
    { email: 'parishioner1@example.com', firstName: 'Mary', lastName: 'Njoh' },
    { email: 'parishioner2@example.com', firstName: 'Peter', lastName: 'Ndive' },
  ];
  for (const p of parishioners) {
    const existing = await User.findOne({ email: p.email });
    if (existing) {
      console.log(`  = parishioner: ${p.email} exists, skipping`);
      continue;
    }
    const user = await User.create({
      email: p.email,
      passwordHash,
      role: 'parishioner',
    });
    const profile = await Parishioner.create({
      user: user._id,
      firstName: p.firstName,
      lastName: p.lastName,
      missionStation: station._id,
      isActive: true,
    });
    user.parishioner = profile._id;
    await user.save();
    console.log(`  + parishioner: ${p.email} (${p.firstName} ${p.lastName})`);
  }

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
