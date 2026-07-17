// Seed the Supabase `dishes` table from src/data/dishes.json.
//
// Usage:
//   1. Copy .env.example to .env and fill VITE_SUPABASE_URL +
//      SUPABASE_SERVICE_ROLE_KEY (service_role, never exposed to the browser).
//   2. Run the SQL in supabase/schema.sql (and storage.sql) once.
//   3. npm run seed
//
// The service_role key bypasses RLS, so this runs server-side only.

import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const url = process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error(
    '✖ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.\n' +
      '  Fill them in before running the seed.',
  )
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
})

const dishes = JSON.parse(
  readFileSync(join(__dirname, '..', 'src', 'data', 'dishes.json'), 'utf8'),
)

const categories = [
  { id: 'food', label: { EN: 'Food', FI: 'Ruoka', SO: 'Cunto' }, sort_order: 0 },
  { id: 'pastry', label: { EN: 'Pastry', FI: 'Leivonnaiset', SO: 'Rooti' }, sort_order: 1 },
  { id: 'desserts', label: { EN: 'Desserts', FI: 'Jälkiruoat', SO: 'Macmacaan' }, sort_order: 2 },
  { id: 'warm-drinks', label: { EN: 'Warm Drinks', FI: 'Kuumat juomat', SO: 'Cabitaan kulul' }, sort_order: 3 },
  { id: 'cold-drinks', label: { EN: 'Cold Drinks', FI: 'Kylmät juomat', SO: 'Cabitaano qabow' }, sort_order: 4 },
]

const rows = dishes.map((d) => ({
  id: d.id,
  name: d.name,
  subtitle: d.subtitle,
  description: d.description,
  long_description: d.longDescription,
  price: d.price,
  category: d.category,
  image_url: d.image ?? '',
  is_popular: !!d.isPopular,
  in_stock: d.inStock !== false,
  ingredients: d.ingredients ?? { EN: [], FI: [], SO: [] },
  allergens: d.allergens ?? [],
  meta: d.meta ?? {},
  sort_order: d.sortOrder ?? 0,
}))

const { error: categoryError } = await supabase
  .from('categories')
  .upsert(categories, { onConflict: 'id', ignoreDuplicates: true })

if (categoryError) {
  console.error('✖ Category seed failed:', categoryError.message)
  process.exit(1)
}

const { error } = await supabase.from('dishes').upsert(rows, { onConflict: 'id' })

if (error) {
  console.error('✖ Seed failed:', error.message)
  process.exit(1)
}

console.log(`✔ Seeded ${categories.length} categories and ${rows.length} dishes into Supabase.`)
