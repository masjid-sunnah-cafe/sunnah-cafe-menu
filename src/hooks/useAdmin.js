const TOKEN_KEY = 'zahiiba_admin_token'

// ── Token helpers ────────────────────────────────────────────────────────────
export const getToken  = ()          => localStorage.getItem(TOKEN_KEY)
export const setToken  = (t)         => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = ()         => localStorage.removeItem(TOKEN_KEY)
export const isLoggedIn = ()         => !!getToken()

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' }
}

async function handle(res) {
  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

const API_URL = import.meta.env.VITE_API_URL || ''

// ── Auth ─────────────────────────────────────────────────────────────────────
export async function login(password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  const data = await handle(res)
  setToken(data.token)
  return data
}

export function logout() {
  clearToken()
}

// ── Dishes ───────────────────────────────────────────────────────────────────
export async function fetchAllDishes() {
  const res = await fetch(`${API_URL}/api/dishes/all`, { headers: authHeaders() })
  return handle(res)
}

export async function createDish(data) {
  const res = await fetch(`${API_URL}/api/dishes`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return handle(res)
}

export async function updateDish(id, data) {
  const res = await fetch(`${API_URL}/api/dishes/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return handle(res)
}

export async function deleteDish(id) {
  const res = await fetch(`${API_URL}/api/dishes/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  return handle(res)
}

// ── Image upload ─────────────────────────────────────────────────────────────
export async function uploadImage(file) {
  const form = new FormData()
  form.append('image', file)
  const res = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` }, // no Content-Type; browser sets multipart boundary
    body: form,
  })
  return handle(res)
}
