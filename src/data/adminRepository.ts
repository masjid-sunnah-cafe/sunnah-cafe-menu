import { supabase } from '../lib/supabase'
import type { Category, Dish, DishInput } from '../lib/types'
import { newId, slugify } from '../lib/slug'
import { rowToDish, dishToRow, type DishRow } from './dishRow'
import {
  getLocalCategories,
  getLocalDishes,
  setLocalCategories,
  setLocalDishes,
  resetLocalDishes,
} from './localStore'

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

// ── Categories ──────────────────────────────────────────────────────────────
function categoryFromRow(row: { id: string; label: Category['label']; sort_order: number }): Category {
  return { id: row.id, label: row.label, sortOrder: row.sort_order }
}

export async function getAllCategories(slug: string): Promise<Category[]> {
  if (local) return getLocalCategories(slug)
  const { data, error } = await supabase!
    .from('categories')
    .select('id, label, sort_order')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data.map(categoryFromRow)
}

export async function createCategory(slug: string, label: Category['label']): Promise<Category> {
  const id = slugify(label.EN) || newId()
  if (local) {
    const categories = getLocalCategories(slug)
    if (categories.some((category) => category.id === id)) throw new Error('Category already exists')
    const category = { id, label, sortOrder: categories.length }
    setLocalCategories(slug, [...categories, category])
    return category
  }
  const { data: existing, error: existingError } = await supabase!
    .from('categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
  if (existingError) throw existingError
  const { data, error } = await supabase!
    .from('categories')
    .insert({ id, label, sort_order: (existing[0]?.sort_order ?? -1) + 1 })
    .select('id, label, sort_order')
    .single()
  if (error) throw error
  return categoryFromRow(data)
}

export async function updateCategory(slug: string, id: string, label: Category['label']): Promise<Category> {
  if (local) {
    const categories = getLocalCategories(slug)
    const index = categories.findIndex((category) => category.id === id)
    if (index < 0) throw new Error('Category not found')
    const category = { ...categories[index], label }
    categories[index] = category
    setLocalCategories(slug, categories)
    return category
  }
  const { data, error } = await supabase!
    .from('categories')
    .update({ label })
    .eq('id', id)
    .select('id, label, sort_order')
    .single()
  if (error) throw error
  return categoryFromRow(data)
}

export async function deleteCategory(slug: string, id: string): Promise<void> {
  if (local) {
    if (getLocalDishes(slug).some((dish) => dish.category === id)) {
      throw new Error('Move dishes out of this category before deleting it')
    }
    setLocalCategories(slug, getLocalCategories(slug).filter((category) => category.id !== id))
    return
  }
  const { count, error: countError } = await supabase!
    .from('dishes')
    .select('id', { count: 'exact', head: true })
    .eq('category', id)
  if (countError) throw countError
  if (count) throw new Error('Move dishes out of this category before deleting it')
  const { error } = await supabase!.from('categories').delete().eq('id', id)
  if (error) throw error
}

/** Demo-only: restore the bundled seed data. No-op with Supabase. */
export function resetDemoMenu(slug: string): Dish[] | null {
  if (!local) return null
  return resetLocalDishes(slug)
}
