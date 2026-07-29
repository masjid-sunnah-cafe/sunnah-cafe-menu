import { useEffect, useState, useRef } from 'react'
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
import { useAdminLang } from '../../lib/adminLang'
import { Upload, X, Plus } from 'lucide-react'
import { toast } from 'sonner'

const DEFAULT_DISH_IMAGE = '/images/sunnah-cafe-logo.png'

// ── Predefined allergen presets ───────────────────────────────────────────────
const ALLERGEN_PRESETS = [
  { key: 'wheat',  label: { EN: 'Gluten (wheat)', FI: 'Gluteeni (vehnä)' }, color: 'wheat' },
  { key: 'dairy',  label: { EN: 'Contains dairy', FI: 'Sisältää maitoa' }, color: 'dairy' },
  { key: 'lactose-free', label: { EN: 'Lactose-free', FI: 'Laktoositon' }, color: 'dairy' },
  { key: 'nuts',   label: { EN: 'May contain nuts', FI: 'Saattaa sisältää pähkinöitä' }, color: 'shared' },
  { key: 'eggs',   label: { EN: 'Contains eggs', FI: 'Sisältää munia' }, color: 'shared' },
]

const SPICE_OPTIONS = [
  { key: 'none', EN: 'No spice label', FI: 'Ei tulisuusmerkintää' },
  { key: 'mild', EN: 'Mild spice', FI: 'Mieto tulisuus' },
  { key: 'medium', EN: 'Medium spice', FI: 'Keskivahva tulisuus' },
  { key: 'hot', EN: 'Hot spice', FI: 'Tulinen' },
]

const SERVES_OPTIONS = {
  EN: ['Serves 1', 'Serves 2', 'Serves 3–4'],
  FI: ['1 hengelle', '2 hengelle', '3–4 hengelle'],
}

function empty(categories) {
  return {
    name:            { EN: '', FI: '' },
    subtitle:        { EN: '', FI: '' },
    description:     { EN: '', FI: '' },
    longDescription: { EN: '', FI: '' },
    price:           '',
    category:        categories[0]?.id || '',
    image:           DEFAULT_DISH_IMAGE,
    isPopular:       false,
    inStock:         true,
    ingredients:     { EN: '', FI: '' },
    allergens:       [],
    meta: {
      halal:  true,
      spice:  { EN: 'Mild spice', FI: 'Mieto tulisuus' },
      serves: { EN: 'Serves 1', FI: '1 hengelle' },
      optionGroups: [],
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
    },
    allergens:       dish.allergens ? JSON.parse(JSON.stringify(dish.allergens)) : [],
    meta: {
      halal:  dish.meta?.halal ?? true,
      spice:  dish.meta?.spice ? { ...dish.meta.spice } : null,
      serves: dish.meta?.serves ? { ...dish.meta.serves } : { EN: 'Serves 1', FI: '1 hengelle' },
      optionGroups: dish.meta?.optionGroups ? JSON.parse(JSON.stringify(dish.meta.optionGroups)) : [],
    },
  }
}

// ── Language-specific fields component ───────────────────────────────────────
function LangFields({ lang, form, setField, setForm, t }) {
  const spiceOption = SPICE_OPTIONS.find((option) => (
    option.EN === form.meta.spice?.EN
    || option.FI === form.meta.spice?.FI
    || (option.key === 'mild' && form.meta.spice?.FI === 'Mieto')
    || (option.key === 'medium' && form.meta.spice?.FI === 'Keskivahva')
  )) || SPICE_OPTIONS[0]
  const servesIdx = SERVES_OPTIONS.EN.indexOf(form.meta.serves.EN)

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={`name-${lang}`}>{t.fName} *</Label>
        <Input
          id={`name-${lang}`}
          className="mt-1"
          value={form.name[lang]}
          onChange={e => setField('name', lang, e.target.value)}
          placeholder={t.ph.name(lang)}
          required
        />
      </div>
      <div>
        <Label htmlFor={`subtitle-${lang}`}>{t.fSubtitle} *</Label>
        <Input
          id={`subtitle-${lang}`}
          className="mt-1"
          value={form.subtitle[lang]}
          onChange={e => setField('subtitle', lang, e.target.value)}
          placeholder={t.ph.subtitle(lang)}
          required
        />
      </div>
      <div>
        <Label htmlFor={`desc-${lang}`}>{t.fShortDesc} * <span className="text-xs font-normal text-brand-text-muted">{t.fShortDescHint}</span></Label>
        <Input
          id={`desc-${lang}`}
          className="mt-1"
          value={form.description[lang]}
          onChange={e => setField('description', lang, e.target.value)}
          placeholder={t.ph.shortDesc(lang)}
          required
        />
      </div>
      <div>
        <Label htmlFor={`long-${lang}`}>{t.fLongDesc} * <span className="text-xs font-normal text-brand-text-muted">{t.fLongDescHint}</span></Label>
        <Textarea
          id={`long-${lang}`}
          className="mt-1"
          rows={3}
          value={form.longDescription[lang]}
          onChange={e => setField('longDescription', lang, e.target.value)}
          placeholder={t.ph.longDesc(lang)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`spice-${lang}`}>{t.fSpice}</Label>
          <select
            id={`spice-${lang}`}
            className="mt-1 h-10 w-full rounded-xl border border-brand-border bg-white px-3 text-sm text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-gold"
            value={spiceOption.key}
            onChange={e => {
              const option = SPICE_OPTIONS.find((item) => item.key === e.target.value)
              setForm((current) => ({
                ...current,
                meta: {
                  ...current.meta,
                  spice: option?.key === 'none'
                    ? null
                    : { EN: option.EN, FI: option.FI },
                },
              }))
            }}
          >
            {SPICE_OPTIONS.map((option) => <option key={option.key} value={option.key}>{option[lang]}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor={`serves-${lang}`}>{t.fServes} *</Label>
          <select
            id={`serves-${lang}`}
            className="mt-1 h-10 w-full rounded-xl border border-brand-border bg-white px-3 text-sm text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-gold"
            value={form.meta.serves[lang]}
            onChange={e => {
              const idx = SERVES_OPTIONS[lang].indexOf(e.target.value)
              setField('meta.serves', 'EN', SERVES_OPTIONS.EN[idx])
              setField('meta.serves', 'FI', SERVES_OPTIONS.FI[idx])
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
export default function DishForm({ dish, categories, open, onClose, onSaved }) {
  const { t, lang: adminLang } = useAdminLang()
  const isEdit = !!dish
  const [form, setForm]       = useState(() => dish ? dishToForm(dish) : empty(categories))
  const [saving, setSaving]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  // Reset form when its target dish changes or categories finish loading.
  useEffect(() => {
    setForm(dish ? dishToForm(dish) : empty(categories))
  }, [dish, categories])

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
      const matchesPreset = (allergen) => (
        allergen.color === preset.color
        && (allergen.label.EN === preset.label.EN
          || (preset.key === 'dairy' && allergen.label.EN === 'May contain dairy'))
      )
      const exists = prev.allergens.some(matchesPreset)
      return {
        ...prev,
        allergens: exists
          ? prev.allergens.filter((allergen) => !matchesPreset(allergen))
          : [...prev.allergens, { label: preset.label, color: preset.color }],
      }
    })
  }

  function addOptionGroup() {
    setForm((current) => ({
      ...current,
      meta: {
        ...current.meta,
        optionGroups: [...current.meta.optionGroups, {
          id: `option-group-${Date.now()}`,
          label: { FI: '', EN: '' },
          required: true,
          options: [],
        }],
      },
    }))
  }

  function updateOptionGroup(groupId, patch) {
    setForm((current) => ({
      ...current,
      meta: {
        ...current.meta,
        optionGroups: current.meta.optionGroups.map((group) => (
          group.id === groupId ? { ...group, ...patch } : group
        )),
      },
    }))
  }

  function removeOptionGroup(groupId) {
    setForm((current) => ({
      ...current,
      meta: {
        ...current.meta,
        optionGroups: current.meta.optionGroups.filter((group) => group.id !== groupId),
      },
    }))
  }

  function addOption(groupId) {
    const option = { id: `option-${Date.now()}`, label: { FI: '', EN: '' }, inStock: true, priceAdjustmentCents: 0 }
    const group = form.meta.optionGroups.find((item) => item.id === groupId)
    updateOptionGroup(groupId, { options: [...group.options, option] })
  }

  function updateOption(groupId, optionId, patch) {
    const group = form.meta.optionGroups.find((item) => item.id === groupId)
    updateOptionGroup(groupId, {
      options: group.options.map((option) => option.id === optionId ? { ...option, ...patch } : option),
    })
  }

  function removeOption(groupId, optionId) {
    const group = form.meta.optionGroups.find((item) => item.id === groupId)
    updateOptionGroup(groupId, { options: group.options.filter((option) => option.id !== optionId) })
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { url } = await uploadImage(file)
      setFlat('image', url)
      toast.success(t.imageUploaded)
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
        },
        allergens: form.allergens,
        meta: {
          halal:  form.meta.halal,
          spice:  form.meta.spice,
          serves: form.meta.serves,
          optionGroups: form.meta.optionGroups,
        },
      }
      const saved = isEdit
        ? await updateDish(dish.id, payload)
        : await createDish(payload)
      toast.success(isEdit ? t.dishUpdated : t.dishAdded)
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
        <DialogTitle className="sr-only">{isEdit ? t.edit : t.addNewDish}</DialogTitle>
        <DialogDescription className="sr-only">{t.allFieldsRequired}</DialogDescription>

        {/* Sticky header */}
        <div className="sticky top-0 z-10 border-b border-brand-border bg-brand-card px-5 py-4 md:px-6">
          <h2 className="font-display text-xl font-bold text-brand-dark">
            {isEdit ? `${t.editPrefix} ${dish.name[adminLang] || dish.name.EN}` : t.addNewDish}
          </h2>
          <p className="mt-0.5 text-xs text-brand-text-muted">{t.allFieldsRequired}</p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-8 pt-5 md:px-6">
          {/* Language tabs */}
          <Tabs defaultValue="FI">
            <TabsList className="mb-2">
              <TabsTrigger value="FI">🇫🇮 {t.tabFinnish}</TabsTrigger>
              <TabsTrigger value="EN">🇬🇧 {t.tabEnglish}</TabsTrigger>
            </TabsList>
            {['FI', 'EN'].map(lang => (
              <TabsContent key={lang} value={lang}>
                <LangFields lang={lang} form={form} setField={setField} setForm={setForm} t={t} />
              </TabsContent>
            ))}
          </Tabs>

          {/* Common fields divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-brand-border" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">{t.commonFields}</span>
            <div className="h-px flex-1 bg-brand-border" />
          </div>

          {/* Price + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">{t.fPrice} *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                className="mt-1"
                value={form.price}
                onChange={e => setFlat('price', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">{t.fCategory} *</Label>
              <select
                id="category"
                className="mt-1 h-10 w-full rounded-xl border border-brand-border bg-white px-3 text-sm text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-gold"
                value={form.category}
                onChange={e => setFlat('category', e.target.value)}
                disabled={categories.length === 0}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.label[adminLang]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Image */}
          <div className="mt-4">
            <Label>{t.fImage}</Label>
            <div className="mt-1 flex gap-2">
              <Input
                value={form.image}
                onChange={e => setFlat('image', e.target.value)}
                placeholder={t.imagePlaceholder}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                title={t.uploadTitle}
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
            <Label>{t.fAllergens}</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {ALLERGEN_PRESETS.map(p => {
                const active = form.allergens.some((allergen) => (
                  allergen.label.EN === p.label.EN
                  || (p.key === 'dairy' && allergen.label.EN === 'May contain dairy')
                ))
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => toggleAllergen(p)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${active ? 'border-tag-text-red/40 bg-tag-bg-red text-tag-text-red' : 'border-brand-border bg-white text-brand-text-muted hover:border-brand-gold/40'}`}
                  >
                    {active ? '✓ ' : ''}{p.label[adminLang]}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-6 border-t border-brand-border pt-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-brand-text-dark">{t.optionGroups}</h3>
                <p className="mt-0.5 text-xs text-brand-text-muted">{t.optionGroupsHint}</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addOptionGroup} className="gap-1.5">
                <Plus className="h-4 w-4" /> {t.addOptionGroup}
              </Button>
            </div>

            <div className="mt-4 space-y-4">
              {form.meta.optionGroups.map((group) => (
                <div key={group.id} className="rounded-lg border border-brand-border bg-brand-bg p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-brand-text-dark">{t.optionGroup}</p>
                    <button type="button" onClick={() => removeOptionGroup(group.id)} className="grid h-8 w-8 place-items-center rounded-md text-brand-red" title={t.removeOptionGroup}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {['FI', 'EN'].map((lang) => (
                      <div key={lang}>
                        <Label htmlFor={`${group.id}-${lang}`}>{t.optionGroupName} ({lang})</Label>
                        <Input
                          id={`${group.id}-${lang}`}
                          className="mt-1"
                          value={group.label[lang]}
                          onChange={(event) => updateOptionGroup(group.id, { label: { ...group.label, [lang]: event.target.value } })}
                          placeholder={t.optionGroupNamePlaceholder[lang]}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-md bg-white px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold text-brand-text-dark">{t.requiredOption}</p>
                      <p className="text-xs text-brand-text-muted">{t.requiredOptionHint}</p>
                    </div>
                    <Switch checked={group.required} onCheckedChange={(required) => updateOptionGroup(group.id, { required })} />
                  </div>

                  <div className="mt-3 space-y-2">
                    {group.options.map((option) => (
                      <div key={option.id} className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[1fr_1fr_100px_auto_auto]">
                        {['FI', 'EN'].map((lang) => (
                          <div key={lang}>
                            <Label htmlFor={`${option.id}-${lang}`} className="text-xs">{t.optionName} ({lang})</Label>
                            <Input
                              id={`${option.id}-${lang}`}
                              className="mt-1"
                              value={option.label[lang]}
                              onChange={(event) => updateOption(group.id, option.id, { label: { ...option.label, [lang]: event.target.value } })}
                            />
                          </div>
                        ))}
                        <div>
                          <Label htmlFor={`${option.id}-price`} className="text-xs">{t.optionPriceAdjustment}</Label>
                          <Input
                            id={`${option.id}-price`}
                            type="number"
                            min="0"
                            step="0.01"
                            className="mt-1"
                            value={(option.priceAdjustmentCents ?? 0) / 100}
                            onChange={(event) => updateOption(group.id, option.id, {
                              priceAdjustmentCents: Math.max(0, Math.round(Number(event.target.value || 0) * 100)),
                            })}
                          />
                        </div>
                        <div className="pb-1 text-center">
                          <Label className="text-xs">{t.optionInStock}</Label>
                          <Switch className="mt-2" checked={option.inStock} onCheckedChange={(inStock) => updateOption(group.id, option.id, { inStock })} />
                        </div>
                        <button type="button" onClick={() => removeOption(group.id, option.id)} className="mb-0.5 grid h-10 w-10 place-items-center rounded-md border border-brand-border text-brand-red" title={t.removeOption}>
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => addOption(group.id)}>
                    <Plus className="h-4 w-4" /> {t.addOption}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="mt-4 space-y-3">
            {[
              { key: 'inStock',   label: t.tInStock,  sub: t.tInStockSub },
              { key: 'isPopular', label: t.tPopular,  sub: t.tPopularSub },
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
                <p className="text-sm font-semibold text-brand-text-dark">{t.tHalal}</p>
                <p className="text-xs text-brand-text-muted">{t.tHalalSub}</p>
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
              {t.cancel}
            </Button>
            <Button type="submit" variant="default" className="flex-1" disabled={saving}>
              {saving ? t.saving : isEdit ? t.saveChanges : t.addToMenu}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
