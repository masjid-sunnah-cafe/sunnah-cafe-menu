import { useCallback, useEffect, useState } from 'react'
import { RESTAURANT_SLUG } from '../config'
import type { Dish } from '../lib/types'
import { getPublicDishes } from '../data/repository'

/**
 * Customer menu data. Loads in-stock dishes from Supabase (or bundled seed data
 * in demo mode) and refreshes periodically so the menu stays current.
 */
export function useDishes() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await getPublicDishes(RESTAURANT_SLUG)
      setDishes(data)
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

  return { dishes, loading, error, refetch: load }
}
