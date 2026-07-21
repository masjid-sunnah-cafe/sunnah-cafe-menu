import { useEffect, useState } from 'react'
import { Minus, Plus, ShoppingBag } from 'lucide-react'
import { UI, getL10n } from '../data/i18n'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../lib/format'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from './ui/dialog'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Separator } from './ui/separator'

const ALLERGEN_VARIANT = {
  wheat:  'allergen',
  dairy:  'allergen',
  shared: 'allergen',
}

export default function DishDetailSheet({ dish, onClose, lang }) {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  useEffect(() => {
    setQuantity(1)
  }, [dish?.id])

  function handleAddToCart() {
    addItem(dish.id, quantity)
    onClose()
  }

  return (
    <Dialog open={!!dish} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto p-0">
        {/* Visually hidden title for screen readers */}
        <DialogTitle className="sr-only">
          {dish ? getL10n(dish.name, lang) : 'Dish details'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {dish ? getL10n(dish.description, lang) : ''}
        </DialogDescription>

        {dish && (
          <>
            {/* Brand header bar */}
            <div className="flex items-center gap-2 px-5 pb-3 pt-5 md:px-6 md:pt-6">
              <span className="inline-block h-8 w-8 overflow-hidden rounded-full border border-brand-border bg-brand-bg">
                <img src="/images/sunnah-cafe-logo.png" alt="" className="h-full w-full object-cover" />
              </span>
              <p className="font-display text-lg font-semibold italic text-brand-text-muted">Sunnah Cafe</p>
            </div>

            {/* Hero image */}
            <div className="px-5 md:px-6">
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src={dish.image}
                  alt={getL10n(dish.name, lang)}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="absolute bottom-3 right-3 h-12 w-12 overflow-hidden rounded-full border-2 border-white/70 bg-brand-bg shadow-lg">
                  <img src="/images/sunnah-cafe-logo.png" alt="" className="h-full w-full object-cover" />
                </div>
              </div>
            </div>

            {/* Content body */}
            <div className="px-5 pb-8 pt-5 md:px-6 md:pb-10 md:pt-6">
              {/* Title & price */}
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-display text-2xl font-bold leading-tight text-brand-text-dark md:text-[28px]">
                  {getL10n(dish.name, lang)}
                </h2>
                <span className="whitespace-nowrap rounded-xl bg-brand-gold/20 px-3 py-1 font-display text-lg font-bold text-brand-gold md:text-xl">
                  {formatPrice(dish.price)}
                </span>
              </div>

              <p className="mt-1 text-sm text-brand-text-muted">{getL10n(dish.subtitle, lang)}</p>
              <p className="mt-3 text-sm leading-[1.7] text-brand-text-dark md:text-[15px]">
                {getL10n(dish.longDescription, lang)}
              </p>

              {/* Allergens */}
              {dish.allergens.length > 0 && (
                <>
                  <Separator className="mt-6" />
                  <h3 className="mt-4 text-[13px] font-bold uppercase tracking-[0.18em] text-brand-text-muted">
                    {UI.allergensLabel[lang]}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {dish.allergens.map((a) => (
                      <Badge
                        key={getL10n(a.label, lang)}
                        variant={ALLERGEN_VARIANT[a.color] || 'default'}
                      >
                        {getL10n(a.label, lang)}
                      </Badge>
                    ))}
                  </div>
                </>
              )}

              {/* Good to know */}
              <Separator className="mt-6" />
              <h3 className="mt-4 text-[13px] font-bold uppercase tracking-[0.18em] text-brand-text-muted">
                {UI.goodToKnowLabel[lang]}
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {dish.meta.halal && (
                  <Badge variant="halal">Halal</Badge>
                )}
                <Badge variant="meta">{getL10n(dish.meta.spice, lang)}</Badge>
                <Badge variant="meta">{getL10n(dish.meta.serves, lang)}</Badge>
              </div>

              <div className="mt-8 flex h-12 items-center justify-between rounded-xl border border-brand-border bg-brand-bg px-1">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  aria-label={UI.decreaseQuantity[lang]}
                  className="grid h-11 w-11 place-items-center rounded-lg"
                >
                  <Minus size={18} aria-hidden="true" />
                </button>
                <span className="font-display text-lg font-bold" aria-live="polite">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.min(99, value + 1))}
                  aria-label={UI.increaseQuantity[lang]}
                  className="grid h-11 w-11 place-items-center rounded-lg"
                >
                  <Plus size={18} aria-hidden="true" />
                </button>
              </div>

              <Button
                type="button"
                onClick={handleAddToCart}
                disabled={!dish.inStock}
                variant="default"
                className="mt-3 h-12 w-full gap-2 rounded-xl text-sm tracking-wide md:text-base"
              >
                <ShoppingBag size={18} aria-hidden="true" />
                {UI.addToCart[lang]} · {formatPrice(dish.price * quantity)}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
