import { useState, useRef } from 'react'
import { Switch } from '../ui/switch'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Pencil, Trash2, Star, Package, GripVertical } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'
import { updateDish, deleteDish } from '../../hooks/useAdmin'
import { formatPrice } from '../../lib/format'
import { useAdminLang } from '../../lib/adminLang'
import { toast } from 'sonner'

export default function AdminDishCard({ dish, categories, onEdit, onDeleted, onUpdated, sortable, sortRef, sortStyle, sortAttributes, sortListeners, isDragging }) {
  const { t, lang } = useAdminLang()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)

  async function toggleStock() {
    setBusy(true)
    try {
      const updated = await updateDish(dish.id, { inStock: !dish.inStock })
      onUpdated(updated)
      toast.success(updated.inStock ? t.markedInStock : t.markedOutOfStock)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function togglePopular() {
    setBusy(true)
    try {
      const updated = await updateDish(dish.id, { isPopular: !dish.isPopular })
      onUpdated(updated)
      toast.success(updated.isPopular ? t.markedPopular : t.removedPopular)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    setBusy(true)
    try {
      await deleteDish(dish.id)
      onDeleted(dish.id)
      toast.success(t.deletedToast(dish.name[lang] || dish.name.EN))
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(false)
      setConfirmDelete(false)
    }
  }

  const categoryColors = {
    food:          'bg-brand-orange/15 text-brand-orange',
    pastry:        'bg-brand-gold/20 text-brand-dark',
    desserts:      'bg-brand-red/15 text-brand-red',
    'warm-drinks': 'bg-amber-100 text-amber-800',
    'cold-drinks': 'bg-blue-100 text-blue-700',
  }
  const categoryLabel = categories.find((category) => category.id === dish.category)?.label

  return (
    <>
      <div
        ref={sortRef}
        style={sortStyle}
        className={`relative flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-200 ${isDragging ? 'z-20 scale-[1.02] border-brand-gold shadow-lg' : !dish.inStock ? 'border-brand-border/50 opacity-60' : 'border-brand-border hover:border-brand-gold/60 hover:shadow-md'}`}
      >
        {sortable && (
          <button
            type="button"
            {...sortAttributes}
            {...sortListeners}
            className="absolute left-2 top-2 z-10 flex h-8 w-8 touch-none items-center justify-center rounded-md border border-brand-border/70 bg-white/90 text-brand-text-muted shadow-sm"
            title="Vedä järjestääksesi"
            aria-label="Vedä järjestääksesi"
          >
            <GripVertical className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        {/* Out of stock ribbon */}
        {!dish.inStock && (
          <div className="absolute top-3 left-3 z-10">
            <span className="rounded-full bg-brand-text-muted/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
              {t.outOfStockLabel}
            </span>
          </div>
        )}

        {/* Popular star */}
        {dish.isPopular && (
          <div className="absolute top-3 right-3 z-10">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gold shadow-md">
              <Star className="h-3.5 w-3.5 fill-white text-white" />
            </span>
          </div>
        )}

        {/* Image */}
        <div className="aspect-[4/3] w-full overflow-hidden bg-brand-border/30">
          {dish.image ? (
            <img src={dish.image} alt={dish.name.EN} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-10 w-10 text-brand-border" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-2 p-3">
          <div>
            <h3 className="font-display font-bold text-brand-dark text-sm leading-tight line-clamp-1">
              {dish.name[lang] || dish.name.EN}
            </h3>
            <p className="mt-0.5 text-xs text-brand-text-muted line-clamp-1">{dish.subtitle?.[lang] || dish.subtitle?.EN}</p>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-display font-bold text-brand-dark">{formatPrice(dish.price)}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${categoryColors[dish.category] || 'bg-brand-border text-brand-text-muted'}`}>
              {categoryLabel?.[lang] || categoryLabel?.EN || dish.category.replace(/-/g, ' ')}
            </span>
          </div>

          {/* In-stock toggle — the most common action, made large */}
          <div className="mt-1 flex items-center justify-between rounded-lg bg-brand-bg px-3 py-2">
            <span className="text-xs font-semibold text-brand-text-dark">
              {dish.inStock ? `✅ ${t.inStockLabel}` : `❌ ${t.outOfStockLabel}`}
            </span>
            <Switch
              checked={dish.inStock}
              onCheckedChange={toggleStock}
              disabled={busy}
              aria-label={t.toggleStock}
            />
          </div>

          {/* Action row */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={togglePopular}
              disabled={busy}
              title={dish.isPopular ? t.removePopular : t.markPopular}
              className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${dish.isPopular ? 'border-brand-gold bg-brand-gold/10 text-brand-gold' : 'border-brand-border text-brand-text-muted hover:border-brand-gold/50 hover:text-brand-gold'}`}
            >
              <Star className={`h-4 w-4 ${dish.isPopular ? 'fill-brand-gold' : ''}`} />
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(dish)}
              disabled={busy}
              className="flex-1 gap-1.5 text-xs"
            >
              <Pencil className="h-3.5 w-3.5" /> {t.edit}
            </Button>

            <button
              onClick={() => setConfirmDelete(true)}
              disabled={busy}
              title={t.deleteDish}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border text-brand-text-muted transition-colors hover:border-brand-red/50 hover:bg-brand-red/10 hover:text-brand-red"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-sm p-6" showClose={false}>
          <DialogTitle className="font-display text-xl font-bold text-brand-dark">
            {t.deleteConfirmTitle}
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-brand-text-muted">
            <strong>"{dish.name[lang] || dish.name.EN}"</strong> {t.deleteConfirmRest}
          </DialogDescription>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(false)}>
              {t.cancel}
            </Button>
            <Button
              onClick={handleDelete}
              disabled={busy}
              className="flex-1 bg-brand-red text-white hover:bg-brand-red/90"
            >
              {busy ? t.deleting : t.yesDelete}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
