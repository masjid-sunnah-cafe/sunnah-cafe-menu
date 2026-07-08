import { Router } from 'express'
import { queries } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Public — customer menu (in-stock only)
router.get('/', (_req, res) => {
  try {
    res.json(queries.getPublicDishes())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin — all dishes including out-of-stock
router.get('/all', requireAuth, (_req, res) => {
  try {
    res.json(queries.getAllDishes())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get single dish
router.get('/:id', (_req, res) => {
  try {
    const dish = queries.getDishById(res.req.params.id)
    if (!dish) return res.status(404).json({ error: 'Not found' })
    res.json(dish)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Create dish (admin)
router.post('/', requireAuth, (req, res) => {
  try {
    const dish = queries.createDish(req.body)
    res.status(201).json(dish)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Update dish (admin) — partial updates supported
router.patch('/:id', requireAuth, (req, res) => {
  try {
    const existing = queries.getDishById(req.params.id)
    if (!existing) return res.status(404).json({ error: 'Not found' })
    const updated = queries.updateDish(req.params.id, req.body)
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Delete dish (admin)
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const existing = queries.getDishById(req.params.id)
    if (!existing) return res.status(404).json({ error: 'Not found' })
    queries.deleteDish(req.params.id)
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
