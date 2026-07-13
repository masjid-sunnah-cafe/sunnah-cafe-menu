import type { Dish } from '../lib/types'
import { SEED_DISHES } from './seed'

/**
 * Browser-local dish store used in demo mode (when Supabase is not configured).
 *
 * Dishes are kept in localStorage, seeded from the bundled data on first
 * access. Admin edits are written back here, so they persist across refreshes
 * and appear on the live customer page — a full working demo with no backend.
 */

const keyFor = (slug: string) => `zahiiba-menu:${slug}`

export function getLocalDishes(slug: string): Dish[] {
  const raw = localStorage.getItem(keyFor(slug))
  if (raw) {
    try {
      return JSON.parse(raw) as Dish[]
    } catch {
      // Corrupt entry — fall through to reseed.
    }
  }
  const clone = structuredClone(SEED_DISHES)
  localStorage.setItem(keyFor(slug), JSON.stringify(clone))
  return clone
}

export function setLocalDishes(slug: string, dishes: Dish[]): void {
  localStorage.setItem(keyFor(slug), JSON.stringify(dishes))
}

/** Reset the menu back to its bundled seed data. */
export function resetLocalDishes(slug: string): Dish[] {
  localStorage.removeItem(keyFor(slug))
  return getLocalDishes(slug)
}
