import { supabase } from '../lib/supabase'
import type { Category, Dish } from '../lib/types'
import { rowToDish, type DishRow } from './dishRow'
import { getLocalCategories, getLocalDishes } from './localStore'

/**
 * Public (customer) menu reads.
 *
 * Falls back to bundled seed data when Supabase is not configured. Customers
 * only ever see in-stock dishes.
 */
export async function getPublicDishes(slug: string): Promise<Dish[]> {
  if (!supabase) {
    return getLocalDishes(slug).filter((d) => d.inStock)
  }

  const { data, error } = await supabase
    .from('dishes')
    .select('*')
    .eq('in_stock', true)
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data as DishRow[]).map(rowToDish)
}

export async function getPublicCategories(slug: string): Promise<Category[]> {
  if (!supabase) return getLocalCategories(slug)

  const { data, error } = await supabase
    .from('categories')
    .select('id, label, sort_order')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data.map((category) => ({
    id: category.id,
    label: category.label as Category['label'],
    sortOrder: category.sort_order,
  }))
}
