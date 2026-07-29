import type { Category } from '../lib/types'

/** Default categories used for initial database and demo-mode setup. */
export const SEED_CATEGORIES: Category[] = [
  { id: 'food', label: { EN: 'Food', FI: 'Ruoka' }, sortOrder: 0 },
  { id: 'pastry', label: { EN: 'Pastry', FI: 'Leivonnaiset' }, sortOrder: 1 },
  { id: 'desserts', label: { EN: 'Desserts', FI: 'Jälkiruoat' }, sortOrder: 2 },
  { id: 'warm-drinks', label: { EN: 'Warm Drinks', FI: 'Kuumat juomat' }, sortOrder: 3 },
  { id: 'cold-drinks', label: { EN: 'Cold Drinks', FI: 'Kylmät juomat' }, sortOrder: 4 },
]