// Seed the Supabase `dishes` table from src/data/dishes.json.
// The service_role key bypasses RLS, so this runs server-side only.

import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import type { Dish, Localized } from '../src/lib/types'

const currentDirectory = dirname(fileURLToPath(import.meta.url))
const url = process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })
const dishes = JSON.parse(
  readFileSync(join(currentDirectory, '..', 'src', 'data', 'dishes.json'), 'utf8'),
) as Dish[]

type CategorySeed = { id: string; label: Localized; sort_order: number }

const categories: CategorySeed[] = [
  { id: 'food', label: { EN: 'Food', FI: 'Ruoka', SO: 'Cunto' }, sort_order: 0 },
  { id: 'pastry', label: { EN: 'Pastry', FI: 'Leivonnaiset', SO: 'Rooti' }, sort_order: 1 },
  { id: 'desserts', label: { EN: 'Desserts', FI: 'Jälkiruoat', SO: 'Macmacaan' }, sort_order: 2 },
  { id: 'warm-drinks', label: { EN: 'Warm Drinks', FI: 'Kuumat juomat', SO: 'Cabitaan kulul' }, sort_order: 3 },
  { id: 'cold-drinks', label: { EN: 'Cold Drinks', FI: 'Kylmät juomat', SO: 'Cabitaano qabow' }, sort_order: 4 },
]

const rows = dishes.map((dish) => ({
  id: dish.id,
  name: dish.name,
  subtitle: dish.subtitle,
  description: dish.description,
  long_description: dish.longDescription,
  price: dish.price,
  category: dish.category,
  image_url: dish.image ?? '',
  is_popular: !!dish.isPopular,
  in_stock: dish.inStock !== false,
  ingredients: dish.ingredients ?? { EN: [], FI: [], SO: [] },
  allergens: dish.allergens ?? [],
  meta: dish.meta ?? {},
  sort_order: dish.sortOrder ?? 0,
}))

const { error: categoryError } = await supabase
  .from('categories')
  .upsert(categories, { onConflict: 'id', ignoreDuplicates: true })

if (categoryError) {
  console.error('Category seed failed:', categoryError.message)
  process.exit(1)
}

const { error } = await supabase.from('dishes').upsert(rows, { onConflict: 'id' })

if (error) {
  console.error('Seed failed:', error.message)
  process.exit(1)
}

console.log(`Seeded ${categories.length} categories and ${rows.length} dishes into Supabase.`)