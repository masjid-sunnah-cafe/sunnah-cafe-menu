import { useState, useEffect, useCallback } from 'react'

export function useDishes() {
  const [dishes, setDishes]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch('/api/dishes')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setDishes(await res.json())
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch_()
    // Poll every 60 s so the menu stays fresh without a refresh
    const id = setInterval(fetch_, 60_000)
    return () => clearInterval(id)
  }, [fetch_])

  return { dishes, loading, error, refetch: fetch_ }
}
