import { useCallback, useEffect, useState } from 'react'
import { RESTAURANT_SLUG } from '../config'
import type { Category, Dish } from '../lib/types'
import { getPublicCategories, getPublicDishes } from '../data/repository'

/**
 * Customer menu data. Loads in-stock dishes from Supabase (or bundled seed data
 * in demo mode) and refreshes periodically so the menu stays current.
 */
export function useDishes() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const [dishData, categoryData] = await Promise.all([
        getPublicDishes(RESTAURANT_SLUG),
        getPublicCategories(RESTAURANT_SLUG),
      ])
      setDishes(dishData)
      setCategories(categoryData)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load menu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    // Poll every 60 s so the menu stays fresh without a refresh.
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [load])

  return { dishes, categories, loading, error, refetch: load }
}
