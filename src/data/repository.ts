import { supabase } from '../lib/supabase'
import type { Dish } from '../lib/types'
import { rowToDish, type DishRow } from './dishRow'
import { getLocalDishes } from './localStore'

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
