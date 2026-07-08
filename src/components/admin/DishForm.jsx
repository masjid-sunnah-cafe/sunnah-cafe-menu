import { useState, useRef } from 'react'
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from '../ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Switch } from '../ui/switch'
import { Badge } from '../ui/badge'
import { createDish, updateDish, uploadImage } from '../../hooks/useAdmin'
import { categories } from '../../data/i18n'
import { Upload, X, Plus } from 'lucide-react'
import { toast } from 'sonner'

// ── Predefined allergen presets ───────────────────────────────────────────────
const ALLERGEN_PRESETS = [
  { key: 'wheat',  label: { EN: 'Gluten (wheat)', FI: 'Gluteeni (vehnä)', SO: 'Gluten (qamadi)' }, color: 'wheat' },
  { key: 'dairy',  label: { EN: 'May contain dairy', FI: 'Saattaa sisältää maitoa', SO: 'Waxa laga yaabaa inuu leeyahay caano' }, color: 'dairy' },
  { key: 'shared', label: { EN: 'Cooked in shared kitchen', FI: 'Jaettu keittiö', SO: 'Jiko la wadaago' }, color: 'shared' },
  { key: 'nuts',   label: { EN: 'May contain nuts', FI: 'Saattaa sisältää pähkinöitä', SO: 'Waxa laga yaabaa inuu leeyahay kaad' }, color: 'shared' },
  { key: 'eggs',   label: { EN: 'Contains eggs', FI: 'Sisältää munia', SO: 'Waxaa ku jira ukun' }, color: 'shared' },
]

const SPICE_OPTIONS = {
  EN: ['No spice', 'Mild spice', 'Medium spice', 'Hot spice'],
  FI: ['Ei mausteita', 'Mieto', 'Keskivahva', 'Tulinen'],
  SO: ["Basbaas la'aan", 'Aad u yar', 'Dhexdhexaad', 'Kulul'],
}

const SERVES_OPTIONS = {
  EN: ['Serves 1', 'Serves 2', 'Serves 3–4'],
  FI: ['1 hengelle', '2 hengelle', '3–4 hengelle'],
  SO: ['1 qof', '2 qof', '3–4 qof'],
}

function empty() {
  return {
    name:            { EN: '', FI: '', SO: '' },
    subtitle:        { EN: '', FI: '', SO: '' },
    description:     { EN: '', FI: '', SO: '' },
    longDescription: { EN: '', FI: '', SO: '' },
    price:           '',
    category:        categories[0].id,
    image:           '',
    isPopular:       false,
    inStock:         true,
    ingredients:     { EN: '', FI: '', SO: '' },
    allergens:       [],
    meta: {
      halal:  true,
      spice:  { EN: 'No spice', FI: 'Ei mausteita', SO: "Basbaas la'aan" },
      serves: { EN: 'Serves 1', FI: '1 hengelle', SO: '1 qof' },
    },
  }
}

function dishToForm(dish) {
  return {
    name:            { ...dish.name },
    subtitle:        { ...dish.subtitle },
    description:     { ...dish.description },
    longDescription: { ...dish.longDescription },
    price:           String(dish.price),
    category:        dish.category,
    image:           dish.image || '',
    isPopular:       dish.isPopular,
    inStock:         dish.inStock,
    ingredients:     {
      EN: (dish.ingredients?.EN || []).join(', '),
      FI: (dish.ingredients?.FI || []).join(', '),
      SO: (dish.ingredients?.SO || []).join(', '),
    },
    allergens:       dish.allergens ? JSON.parse(JSON.stringify(dish.allergens)) : [],
    meta: {
      halal:  dish.meta?.halal ?? true,
      spice:  { ...dish.meta?.spice  } || { EN: 'No spice', FI: 'Ei mausteita', SO: "Basbaas la'aan" },
      serves: { ...dish.meta?.serves } || { EN: 'Serves 1', FI: '1 hengelle', SO: '1 qof' },
    },
  }
}

// ── Language-specific fields component ───────────────────────────────────────
function LangFields({ lang, form, setField }) {
  const spiceIdx  = SPICE_OPTIONS.EN.indexOf(form.meta.spice.EN)
  const servesIdx = SERVES_OPTIONS.EN.indexOf(form.meta.serves.EN)

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={`name-${lang}`}>Name *</Label>
        <Input
          id={`name-${lang}`}
          className="mt-1"
          value={form.name[lang]}
          onChange={e => setField('name', lang, e.target.value)}
          placeholder={`Dish name in ${lang}`}
          required
        />
      </div>
      <div>
        <Label htmlFor={`subtitle-${lang}`}>Subtitle *</Label>
        <Input
          id={`subtitle-${lang}`}
          className="mt-1"
          value={form.subtitle[lang]}
          onChange={e => setField('subtitle', lang, e.target.value)}
          placeholder={`Short tagline in ${lang}`}
          required
        />
      </div>
      <div>
        <Label htmlFor={`desc-${lang}`}>Short description * <span className="text-xs font-normal text-brand-text-muted">(shown on card)</span></Label>
        <Input
          id={`desc-${lang}`}
          className="mt-1"
          value={form.description[lang]}
          onChange={e => setField('description', lang, e.target.value)}
          placeholder={`1–2 sentence summary in ${lang}`}
          required
        />
      </div>
      <div>
        <Label htmlFor={`long-${lang}`}>Long description * <span className="text-xs font-normal text-brand-text-muted">(shown in detail view)</span></Label>
        <Textarea
          id={`long-${lang}`}
          className="mt-1"
          rows={3}
          value={form.longDescription[lang]}
          onChange={e => setField('longDescription', lang, e.target.value)}
          placeholder={`Full description in ${lang}`}
          required
        />
      </div>
      <div>
        <Label htmlFor={`ing-${lang}`}>Ingredients * <span className="text-xs font-normal text-brand-text-muted">(comma-separated)</span></Label>
        <Input
          id={`ing-${lang}`}
          className="mt-1"
          value={form.ingredients[lang]}
          onChange={e => setField('ingredients', lang, e.target.value)}
          placeholder={`e.g. Beef, Onion, Spices`}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`spice-${lang}`}>Spice level *</Label>
          <select
            id={`spice-${lang}`}
            className="mt-1 h-10 w-full rounded-xl border border-brand-border bg-white px-3 text-sm text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-gold"
            value={form.meta.spice[lang]}
            onChange={e => {
              const idx = SPICE_OPTIONS[lang].indexOf(e.target.value)
              setField('meta.spice', 'EN', SPICE_OPTIONS.EN[idx])
              setField('meta.spice', 'FI', SPICE_OPTIONS.FI[idx])
              setField('meta.spice', 'SO', SPICE_OPTIONS.SO[idx])
            }}
          >
            {SPICE_OPTIONS[lang].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor={`serves-${lang}`}>Serves *</Label>
          <select
            id={`serves-${lang}`}
            className="mt-1 h-10 w-full rounded-xl border border-brand-border bg-white px-3 text-sm text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-gold"
            value={form.meta.serves[lang]}
            onChange={e => {
              const idx = SERVES_OPTIONS[lang].indexOf(e.target.value)
              setField('meta.serves', 'EN', SERVES_OPTIONS.EN[idx])
              setField('meta.serves', 'FI', SERVES_OPTIONS.FI[idx])
              setField('meta.serves', 'SO', SERVES_OPTIONS.SO[idx])
            }}
          >
            {SERVES_OPTIONS[lang].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}

// ── Main form ─────────────────────────────────────────────────────────────────
export default function DishForm({ dish, open, onClose, onSaved }) {
  const isEdit = !!dish
  const [form, setForm]       = useState(() => dish ? dishToForm(dish) : empty())
  const [saving, setSaving]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  // Reset form when dish prop changes
  useState(() => { setForm(dish ? dishToForm(dish) : empty()) }, [dish])

  function setField(path, key, val) {
    setForm(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      if (path.includes('.')) {
        const [a, b] = path.split('.')
        next[a][b][key] = val
      } else {
        next[path][key] = val
      }
      return next
    })
  }

  function setFlat(key, val) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  function toggleAllergen(preset) {
    setForm(prev => {
      const exists = prev.allergens.some(a => a.color === preset.color && a.label.EN === preset.label.EN)
      return {
        ...prev,
        allergens: exists
          ? prev.allergens.filter(a => !(a.color === preset.color && a.label.EN === preset.label.EN))
          : [...prev.allergens, { label: preset.label, color: preset.color }],
      }
    })
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { url } = await uploadImage(file)
      setFlat('image', url)
      toast.success('Image uploaded')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name:            form.name,
        subtitle:        form.subtitle,
        description:     form.description,
        longDescription: form.longDescription,
        price:           parseFloat(form.price),
        category:        form.category,
        image:           form.image,
        isPopular:       form.isPopular,
        inStock:         form.inStock,
        ingredients: {
          EN: form.ingredients.EN.split(',').map(s => s.trim()).filter(Boolean),
          FI: form.ingredients.FI.split(',').map(s => s.trim()).filter(Boolean),
          SO: form.ingredients.SO.split(',').map(s => s.trim()).filter(Boolean),
        },
        allergens: form.allergens,
        meta: {
          halal:  form.meta.halal,
          spice:  form.meta.spice,
          serves: form.meta.serves,
        },
      }
      const saved = isEdit
        ? await updateDish(dish.id, payload)
        : await createDish(payload)
      toast.success(isEdit ? 'Dish updated!' : 'Dish added to menu!')
      onSaved(saved)
      onClose()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="max-h-[94dvh] w-[calc(100%-2rem)] max-w-[600px] overflow-y-auto p-0">
        <DialogTitle className="sr-only">{isEdit ? 'Edit dish' : 'Add new dish'}</DialogTitle>
        <DialogDescription className="sr-only">Fill in all three languages: English, Finnish, and Somali</DialogDescription>

        {/* Sticky header */}
        <div className="sticky top-0 z-10 border-b border-brand-border bg-brand-card px-5 py-4 md:px-6">
          <h2 className="font-display text-xl font-bold text-brand-dark">
            {isEdit ? `Edit — ${dish.name.EN}` : 'Add new dish'}
          </h2>
          <p className="mt-0.5 text-xs text-brand-text-muted">All fields in all three languages are required</p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-8 pt-5 md:px-6">
          {/* Language tabs */}
          <Tabs defaultValue="EN">
            <TabsList className="mb-2">
              <TabsTrigger value="EN">🇬🇧 English</TabsTrigger>
              <TabsTrigger value="FI">🇫🇮 Finnish</TabsTrigger>
              <TabsTrigger value="SO">🇸🇴 Somali</TabsTrigger>
            </TabsList>
            {['EN', 'FI', 'SO'].map(lang => (
              <TabsContent key={lang} value={lang}>
                <LangFields lang={lang} form={form} setField={setField} />
              </TabsContent>
            ))}
          </Tabs>

          {/* Common fields divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-brand-border" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">Common fields</span>
            <div className="h-px flex-1 bg-brand-border" />
          </div>

          {/* Price + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (€) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.5"
                className="mt-1"
                value={form.price}
                onChange={e => setFlat('price', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                className="mt-1 h-10 w-full rounded-xl border border-brand-border bg-white px-3 text-sm text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-gold"
                value={form.category}
                onChange={e => setFlat('category', e.target.value)}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.label.EN}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Image */}
          <div className="mt-4">
            <Label>Dish image</Label>
            <div className="mt-1 flex gap-2">
              <Input
                value={form.image}
                onChange={e => setFlat('image', e.target.value)}
                placeholder="https://… or upload →"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                title="Upload image file"
              >
                {uploading ? '…' : <Upload className="h-4 w-4" />}
              </Button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
            {form.image && (
              <div className="mt-2 relative w-24">
                <img src={form.image} alt="preview" className="h-20 w-24 rounded-xl object-cover border border-brand-border" />
                <button type="button" onClick={() => setFlat('image', '')} className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-red text-white">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* Allergens */}
          <div className="mt-4">
            <Label>Allergens</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {ALLERGEN_PRESETS.map(p => {
                const active = form.allergens.some(a => a.label.EN === p.label.EN)
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => toggleAllergen(p)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${active ? 'border-tag-text-red/40 bg-tag-bg-red text-tag-text-red' : 'border-brand-border bg-white text-brand-text-muted hover:border-brand-gold/40'}`}
                  >
                    {active ? '✓ ' : ''}{p.label.EN}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Toggles */}
          <div className="mt-4 space-y-3">
            {[
              { key: 'inStock',   label: 'In stock',      sub: 'Visible to customers when enabled' },
              { key: 'isPopular', label: 'Popular ⭐',     sub: 'Shows a star badge on the card' },
            ].map(({ key, label, sub }) => (
              <div key={key} className="flex items-center justify-between rounded-xl bg-brand-bg px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-brand-text-dark">{label}</p>
                  <p className="text-xs text-brand-text-muted">{sub}</p>
                </div>
                <Switch checked={form[key]} onCheckedChange={v => setFlat(key, v)} />
              </div>
            ))}
            <div className="flex items-center justify-between rounded-xl bg-brand-bg px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-brand-text-dark">Halal ✅</p>
                <p className="text-xs text-brand-text-muted">Shows halal badge in detail view</p>
              </div>
              <Switch
                checked={form.meta.halal}
                onCheckedChange={v => setForm(prev => ({ ...prev, meta: { ...prev.meta, halal: v } }))}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="mt-8 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="default" className="flex-1" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add to menu'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
