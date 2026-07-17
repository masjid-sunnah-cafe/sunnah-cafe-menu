import type { Category } from '../lib/types'

/** Default categories used for initial database and demo-mode setup. */
export const SEED_CATEGORIES: Category[] = [
  { id: 'food', label: { EN: 'Food', FI: 'Ruoka', SO: 'Cunto' }, sortOrder: 0 },
  { id: 'pastry', label: { EN: 'Pastry', FI: 'Leivonnaiset', SO: 'Rooti' }, sortOrder: 1 },
  { id: 'desserts', label: { EN: 'Desserts', FI: 'Jälkiruoat', SO: 'Macmacaan' }, sortOrder: 2 },
  { id: 'warm-drinks', label: { EN: 'Warm Drinks', FI: 'Kuumat juomat', SO: 'Cabitaan kulul' }, sortOrder: 3 },
  { id: 'cold-drinks', label: { EN: 'Cold Drinks', FI: 'Kylmät juomat', SO: 'Cabitaano qabow' }, sortOrder: 4 },
]