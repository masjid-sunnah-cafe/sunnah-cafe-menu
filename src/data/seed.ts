import type { Dish } from '../lib/types'
import dishes from './dishes.json'

/**
 * Bundled seed dishes (single source of truth in dishes.json). Used to seed
 * both the demo-mode browser store and the Supabase database (scripts/seed.mjs).
 */
export const SEED_DISHES: Dish[] = dishes as unknown as Dish[]
