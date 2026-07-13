import { supabase } from '../lib/supabase'
import type { Dish, DishInput } from '../lib/types'
import { newId, slugify } from '../lib/slug'
import { rowToDish, dishToRow, type DishRow } from './dishRow'
import { getLocalDishes, setLocalDishes, resetLocalDishes } from './localStore'

/**
 * Admin write operations.
 *
 * In demo mode (no Supabase) everything runs against the browser-local store,
 * so the panel is fully interactive with zero backend. With Supabase
 * configured, the same calls hit the database (subject to RLS — only
 * authenticated users may write).
 *
 * `getAllDishes` returns *all* dishes including out-of-stock ones, since the
 * owner needs to manage them.
 */

const local = !supabase

export const isDemoMode = local

// ── Read ─────────────────────────────────────────────────────────────────────
export async function getAllDishes(slug: string): Promise<Dish[]> {
  if (local) return getLocalDishes(slug)

  const { data, error } = await supabase!
    .from('dishes')
    .select('*')
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data as DishRow[]).map(rowToDish)
}

// ── Create / update / delete ─────────────────────────────────────────────────
function buildId(input: DishInput): string {
  return input.id || slugify(input.name.EN) || newId()
}

export async function createDish(slug: string, input: DishInput): Promise<Dish> {
  const dish: Dish = { ...input, id: buildId(input) }

  if (local) {
    const dishes = getLocalDishes(slug)
    dish.sortOrder = dishes.filter((d) => d.category === dish.category).length
    dishes.unshift(dish)
    setLocalDishes(slug, dishes)
    return dish
  }

  const { data, error } = await supabase!
    .from('dishes')
    .insert(dishToRow(dish))
    .select('*')
    .single()
  if (error) throw error
  return rowToDish(data as DishRow)
}

export async function updateDish(
  slug: string,
  id: string,
  patch: Partial<DishInput>,
): Promise<Dish> {
  if (local) {
    const dishes = getLocalDishes(slug)
    const idx = dishes.findIndex((d) => d.id === id)
    if (idx < 0) throw new Error('Dish not found')
    const updated = { ...dishes[idx], ...patch, id }
    dishes[idx] = updated
    setLocalDishes(slug, dishes)
    return updated
  }

  // Only send the columns that were actually provided.
  const full = { ...(patch as DishInput), id }
  const row = dishToRow(full)
  const partialRow: Record<string, unknown> = {}
  if (patch.name) partialRow.name = row.name
  if (patch.subtitle) partialRow.subtitle = row.subtitle
  if (patch.description) partialRow.description = row.description
  if (patch.longDescription) partialRow.long_description = row.long_description
  if (patch.price != null) partialRow.price = row.price
  if (patch.category != null) partialRow.category = row.category
  if (patch.image != null) partialRow.image_url = row.image_url
  if (patch.isPopular != null) partialRow.is_popular = row.is_popular
  if (patch.inStock != null) partialRow.in_stock = row.in_stock
  if (patch.ingredients) partialRow.ingredients = row.ingredients
  if (patch.allergens) partialRow.allergens = row.allergens
  if (patch.meta) partialRow.meta = row.meta

  const { data, error } = await supabase!
    .from('dishes')
    .update(partialRow)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return rowToDish(data as DishRow)
}

export async function deleteDish(slug: string, id: string): Promise<void> {
  if (local) {
    const dishes = getLocalDishes(slug).filter((d) => d.id !== id)
    setLocalDishes(slug, dishes)
    return
  }
  const { error } = await supabase!.from('dishes').delete().eq('id', id)
  if (error) throw error
}

/** Demo-only: restore the bundled seed data. No-op with Supabase. */
export function resetDemoMenu(slug: string): Dish[] | null {
  if (!local) return null
  return resetLocalDishes(slug)
}
