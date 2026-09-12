// Church leadership shown near the top of the Home page.
//
// This is parish-dependent: a deployed instance stores its own leadership on
// ParishConfig (`leadership.pope` + `leadership.bishops`, edited via the admin
// UI / seeded from env). The Holy Father is the same for the universal Church,
// but the bishop(s) depend on the diocese the parish belongs to, so both are
// configured per instance.
//
// The constants below are only *fallbacks* used when a parish hasn't configured
// its leadership yet (fresh instance, first paint before /api/parish-config
// resolves). Bishops fall back keyed by diocese name so a known Cameroonian
// diocese still renders sensibly.
//
// Images live in `frontend/public/images/`. Fallback photos are placeholders —
// real parishes should upload/point to their own.

import type { ChurchLeader, ParishConfig } from '../types';

export type { ChurchLeader };

// The Holy Father — default for the universal Church.
export const DEFAULT_POPE: ChurchLeader = {
  name: 'Pope Leo XIV',
  title: 'Bishop of Rome · Successor of St. Peter',
  image: '/images/Pope.jpeg',
};

// Local ordinary/ordinaries, keyed by diocese name. A diocese may list more
// than one bishop (e.g. an ordinary plus an auxiliary or emeritus).
export const BISHOPS_BY_DIOCESE: Record<string, ChurchLeader[]> = {
  'Buea Diocese': [
    {
      name: 'Most Rev. Michael Miabesue Bibi',
      title: 'Bishop of Buea',
      image: '/images/bishop.jpeg',
    },
  ],
  'Archdiocese of Bamenda': [
    {
      name: 'Most Rev. Andrew Fuanya Nkea',
      title: 'Archbishop of Bamenda',
      image: '/images/bishop.jpeg', // placeholder — swap for the Archbishop's photo
    },
  ],
};

// Resolve the fallback bishop(s) for a given diocese. Returns an empty array
// when the diocese has no configured entry so callers can render nothing.
export function getBishopsForDiocese(diocese: string): ChurchLeader[] {
  return BISHOPS_BY_DIOCESE[diocese] ?? [];
}

// Resolve the leadership list (Holy Father first, then bishop[s]) for a parish.
// Prefers what the instance has configured on ParishConfig; otherwise falls
// back to the built-in defaults so an unconfigured parish still renders.
export function getLeaders(parish: ParishConfig): ChurchLeader[] {
  const pope = parish.leadership?.pope?.name
    ? parish.leadership.pope
    : DEFAULT_POPE;

  const bishops = parish.leadership?.bishops?.length
    ? parish.leadership.bishops
    : getBishopsForDiocese(parish.diocese);

  return [pope, ...bishops];
}
