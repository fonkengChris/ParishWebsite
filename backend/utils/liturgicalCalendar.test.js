/**
 * Tests for the liturgical colour engine.
 *
 * The saint-calendar function is wired the same way routes/liturgicalColor.js wires it, but the
 * DB override model is intentionally left unset so no MongoDB connection is required.
 */
import {
  getLiturgicalColor,
  setSaintCalendarFunction,
  calculateEaster,
} from './liturgicalCalendar.js';
import { getSaintsForDate } from './saintCalendar.js';

setSaintCalendarFunction(getSaintsForDate);

// Build a Date at local midnight (matching how the app constructs calendar dates).
const d = (y, m, day) => new Date(y, m - 1, day);
// Colour name for a given local date (optionally with a time-of-day, to mimic `new Date()`).
const colorOn = async (date) => (await getLiturgicalColor(date)).name;

describe('calculateEaster', () => {
  it.each([
    [2024, 2, 31],
    [2025, 3, 20],
    [2026, 3, 5],
    [2027, 2, 28],
  ])('Easter %i falls on the expected date', (year, monthIndex, day) => {
    const easter = calculateEaster(year);
    expect(easter.getMonth()).toBe(monthIndex);
    expect(easter.getDate()).toBe(day);
  });
});

describe('liturgical seasons and special days (2026, Easter = Apr 5)', () => {
  it.each([
    ['Ash Wednesday (Feb 18)', d(2026, 2, 18), 'purple'],
    ['Laetare Sunday (Mar 15)', d(2026, 3, 15), 'rose'],
    ['Palm Sunday (Mar 29)', d(2026, 3, 29), 'red'],
    ['Holy Thursday (Apr 2)', d(2026, 4, 2), 'white'],
    ['Good Friday (Apr 3)', d(2026, 4, 3), 'red'],
    ['Holy Saturday (Apr 4)', d(2026, 4, 4), 'white'],
    ['Easter Sunday (Apr 5)', d(2026, 4, 5), 'white'],
    ['Easter weekday (Apr 20)', d(2026, 4, 20), 'white'],
    ['Pentecost (May 24)', d(2026, 5, 24), 'red'],
    ['Ordinary Time weekday (Feb 12)', d(2026, 2, 12), 'green'],
    ['Ordinary Time weekday (Sep 30)', d(2026, 9, 30), 'green'],
    ['Christmas (Dec 25)', d(2026, 12, 25), 'white'],
    ['All Souls (Nov 2)', d(2026, 11, 2), 'purple'],
    ['Immaculate Conception in Advent (Dec 8)', d(2026, 12, 8), 'white'],
    ['Assumption (Aug 15)', d(2026, 8, 15), 'white'],
  ])('%s -> %s', async (_label, date, expected) => {
    expect(await colorOn(date)).toBe(expected);
  });
});

describe('Gaudete Sunday (Advent 2025)', () => {
  it('3rd Sunday of Advent (Dec 14, 2025) is rose', async () => {
    expect(await colorOn(d(2025, 12, 14))).toBe('rose');
  });
});

describe('martyrs -> red, gated correctly', () => {
  it('obligatory memorial of a martyr in Ordinary Time is red (St Justin, Jun 1)', async () => {
    expect(await colorOn(d(2026, 6, 1))).toBe('red');
  });

  it('St Stephen (Dec 26), a feast of a martyr, is red within the Christmas octave', async () => {
    expect(await colorOn(d(2026, 12, 26))).toBe('red');
  });

  it('The Holy Innocents (Dec 28), martyrs, are red', async () => {
    expect(await colorOn(d(2026, 12, 28))).toBe('red');
  });

  it('St John the Evangelist (Dec 27), not a martyr, stays white in the octave', async () => {
    expect(await colorOn(d(2026, 12, 27))).toBe('white');
  });

  it('an optional memorial of martyrs does not turn the day red (Cosmas & Damian, Sep 26)', async () => {
    expect(await colorOn(d(2026, 9, 26))).toBe('green');
  });
});

describe('regression: a time-of-day must not break special-day detection', () => {
  it('Palm Sunday with an afternoon time is still red', async () => {
    expect(await colorOn(new Date(2026, 2, 29, 14, 30))).toBe('red');
  });

  it('Pentecost with a morning time is still red', async () => {
    expect(await colorOn(new Date(2026, 4, 24, 9, 0))).toBe('red');
  });

  it('Gaudete Sunday with a time is still rose', async () => {
    expect(await colorOn(new Date(2025, 11, 14, 11, 15))).toBe('rose');
  });
});

describe('transference of solemnities off privileged days', () => {
  it('Immaculate Conception on a Sunday of Advent: Sunday stays violet, Monday is white (2024)', async () => {
    expect(await colorOn(d(2024, 12, 8))).toBe('purple'); // Dec 8 2024 was a Sunday of Advent
    expect(await colorOn(d(2024, 12, 9))).toBe('white'); // transferred to Monday
  });

  it('St Joseph on Laetare Sunday: Sunday stays rose, Monday is white in Lent (2023)', async () => {
    expect(await colorOn(d(2023, 3, 19))).toBe('rose'); // Mar 19 2023 was Laetare Sunday
    expect(await colorOn(d(2023, 3, 20))).toBe('white'); // transferred to the Lenten Monday
  });

  it('Annunciation impeded by Holy Week: nominal date is violet, observed date is white (2024)', async () => {
    expect(await colorOn(d(2024, 3, 25))).toBe('purple'); // Monday of Holy Week 2024
    expect(await colorOn(d(2024, 4, 8))).toBe('white'); // Monday after the Second Sunday of Easter
  });

  it('unimpeded solemnities are still white on their nominal date', async () => {
    expect(await colorOn(d(2026, 3, 19))).toBe('white'); // St Joseph, a Lenten Thursday
    expect(await colorOn(d(2026, 3, 25))).toBe('white'); // Annunciation, a Lenten Wednesday
    expect(await colorOn(d(2026, 12, 8))).toBe('white'); // Immaculate Conception, an Advent weekday
  });
});

describe('Easter Sunday across years is white', () => {
  it.each([
    [2024, d(2024, 3, 31)],
    [2025, d(2025, 4, 20)],
    [2027, d(2027, 3, 28)],
  ])('Easter %i', async (_year, date) => {
    expect(await colorOn(date)).toBe('white');
  });
});
