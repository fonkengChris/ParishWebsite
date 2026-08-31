// Church leadership shown near the top of the Home page.
//
// The Holy Father is the same for the whole Church, so he is fixed here.
// The Bishop (or Bishops) depend on the diocese the parish belongs to —
// keyed by diocese name so the site can be reused for a parish in another
// diocese by matching the diocese from ParishConfig (see contexts/ParishContext.tsx).
//
// Images live in `frontend/public/images/`. These are placeholders — swap the
// photos and confirm the names/titles for the real ordinary of the diocese.

export interface ChurchLeader {
  name: string;
  title: string;
  image: string;
}

// The Holy Father — fixed for the universal Church.
export const POPE: ChurchLeader = {
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
};

// Resolve the bishop(s) for a given diocese. Returns an empty array when the
// diocese has no configured entry so callers can render nothing gracefully.
export function getBishopsForDiocese(diocese: string): ChurchLeader[] {
  return BISHOPS_BY_DIOCESE[diocese] ?? [];
}
