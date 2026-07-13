import { supabase } from '../lib/supabase'
import { newId } from '../lib/slug'
import { RESTAURANT_SLUG } from '../config'

/**
 * Upload a menu image and return a URL usable as a dish's `image`.
 *
 * Demo mode (no Supabase): the file is downscaled in the browser and returned
 * as a compact data URL, so it can live alongside the menu in localStorage
 * without blowing the storage quota.
 *
 * Supabase mode: the file is uploaded to the `menu-images` Storage bucket and
 * its public URL is returned. (Create the bucket with supabase/storage.sql.)
 */
export async function uploadImage(file: File): Promise<{ url: string }> {
  if (!supabase) {
    return { url: await fileToResizedDataUrl(file) }
  }

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `${RESTAURANT_SLUG}/${newId()}.${ext}`
  const { error } = await supabase.storage.from('menu-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  const url = supabase.storage.from('menu-images').getPublicUrl(path).data.publicUrl
  return { url }
}

const RESIZABLE = new Set(['image/jpeg', 'image/png', 'image/webp'])

/** Downscale a raster image to at most `maxSize` px and return a JPEG data URL. */
async function fileToResizedDataUrl(
  file: File,
  maxSize = 900,
  quality = 0.82,
): Promise<string> {
  const original = await readAsDataUrl(file)
  if (!RESIZABLE.has(file.type)) return original

  const img = await loadImage(original)
  const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
  const width = Math.round(img.width * scale)
  const height = Math.round(img.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return original
  ctx.drawImage(img, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', quality)
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
