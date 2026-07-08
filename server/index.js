import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { mkdirSync } from 'fs'

import authRouter   from './routes/auth.js'
import dishesRouter from './routes/dishes.js'
import uploadRouter from './routes/upload.js'
import { queries }  from './db.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR  = join(__dirname, '..', 'public')
const UPLOADS_DIR = join(PUBLIC_DIR, 'uploads')
const DIST_DIR    = join(__dirname, '..', 'dist')

// Ensure uploads directory exists
mkdirSync(UPLOADS_DIR, { recursive: true })

const app  = express()
const PORT = process.env.PORT || 3001

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }))
app.use(express.json())
app.use(express.static(PUBLIC_DIR))   // serves /images/* and /uploads/*
app.use(express.static(DIST_DIR))     // serves built frontend in production

// ── API routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',    authRouter)
app.use('/api/dishes',  dishesRouter)
app.use('/api/upload',  uploadRouter)
app.use('/api/categories', (_req, res) => res.json(queries.getAllCategories()))

// ── SPA fallback (production) ────────────────────────────────────────────────
app.get('/{*path}', (_req, res) => {
  const indexPath = join(DIST_DIR, 'index.html')
  res.sendFile(indexPath, (err) => {
    if (err) res.status(404).json({ error: 'Not found' })
  })
})

app.listen(PORT, () => {
  console.log(`\n🍽️  Zahiiba API running on http://localhost:${PORT}`)
  console.log(`   Admin dashboard → http://localhost:${PORT}/admin`)
})
