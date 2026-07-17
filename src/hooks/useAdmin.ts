import { supabase } from '../lib/supabase'
import { RESTAURANT_SLUG } from '../config'
import type { Category, Dish, DishInput } from '../lib/types'
import * as repo from '../data/adminRepository'
import { uploadImage as upload } from '../data/imageUpload'

/**
 * Admin data access. Same public API as before, now backed by Supabase (with a
 * browser-local demo fallback) instead of the old Express server.
 *
 * Security note: real write protection lives in Supabase Row Level Security —
 * only authenticated users may modify dishes. This local flag only drives the
 * admin UI's logged-in/out state.
 */

const SESSION_KEY = 'zahiiba_admin_session'
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@zahiiba.fi'
const DEMO_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'zahiiba'

// ── Auth ─────────────────────────────────────────────────────────────────────
export const isLoggedIn = (): boolean => localStorage.getItem(SESSION_KEY) === '1'

export async function login(password: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password,
    })
    if (error) throw new Error(error.message)
  } else if (password !== DEMO_PASSWORD) {
    throw new Error('Invalid password')
  }
  localStorage.setItem(SESSION_KEY, '1')
}

export async function logout(): Promise<void> {
  localStorage.removeItem(SESSION_KEY)
  if (supabase) await supabase.auth.signOut()
}

// ── Dishes ───────────────────────────────────────────────────────────────────
export function fetchAllDishes(): Promise<Dish[]> {
  return repo.getAllDishes(RESTAURANT_SLUG)
}

export function createDish(data: DishInput): Promise<Dish> {
  return repo.createDish(RESTAURANT_SLUG, data)
}

export function updateDish(id: string, patch: Partial<DishInput>): Promise<Dish> {
  return repo.updateDish(RESTAURANT_SLUG, id, patch)
}

export function deleteDish(id: string): Promise<void> {
  return repo.deleteDish(RESTAURANT_SLUG, id)
}

export function fetchAllCategories(): Promise<Category[]> {
  return repo.getAllCategories(RESTAURANT_SLUG)
}

export function createCategory(label: Category['label']): Promise<Category> {
  return repo.createCategory(RESTAURANT_SLUG, label)
}

export function updateCategory(id: string, label: Category['label']): Promise<Category> {
  return repo.updateCategory(RESTAURANT_SLUG, id, label)
}

export function deleteCategory(id: string): Promise<void> {
  return repo.deleteCategory(RESTAURANT_SLUG, id)
}

// ── Image upload ─────────────────────────────────────────────────────────────
export function uploadImage(file: File): Promise<{ url: string }> {
  return upload(file)
}
