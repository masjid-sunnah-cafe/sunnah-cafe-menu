import zahiibaLogo from '../assets/images/Zahiiba.png'
import { UI } from '../data/i18n'
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
  return (
    <Dialog open={!!dish} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto p-0">
        {/* Visually hidden title for screen readers */}
        <DialogTitle className="sr-only">
          {dish?.name[lang] ?? 'Dish details'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {dish?.description[lang] ?? ''}
        </DialogDescription>

        {dish && (
          <>
            {/* Brand header bar */}
            <div className="flex items-center gap-2 px-5 pb-3 pt-5 md:px-6 md:pt-6">
              <img src={zahiibaLogo} alt="" className="h-8 w-8 rounded-full object-cover" />
              <p className="font-display text-lg font-semibold italic text-brand-text-muted">Zahiiba</p>
            </div>

            {/* Hero image */}
            <div className="px-5 md:px-6">
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src={dish.image}
                  alt={dish.name[lang]}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="absolute bottom-3 right-3 h-12 w-12 overflow-hidden rounded-full border-2 border-white/60 shadow-lg">
                  <img src={zahiibaLogo} alt="" className="h-full w-full object-cover" />
                </div>
              </div>
            </div>

            {/* Content body */}
            <div className="px-5 pb-8 pt-5 md:px-6 md:pb-10 md:pt-6">
              {/* Title & price */}
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-display text-2xl font-bold leading-tight text-brand-text-dark md:text-[28px]">
                  {dish.name[lang]}
                </h2>
                <span className="whitespace-nowrap rounded-xl bg-brand-gold/20 px-3 py-1 font-display text-lg font-bold text-brand-gold md:text-xl">
                  ${dish.price.toFixed(2)}
                </span>
              </div>

              <p className="mt-1 text-sm text-brand-text-muted">{dish.subtitle[lang]}</p>
              <p className="mt-3 text-sm leading-[1.7] text-brand-text-dark md:text-[15px]">
                {dish.longDescription[lang]}
              </p>

              {/* Ingredients */}
              <Separator className="mt-6" />
              <h3 className="mt-4 text-[13px] font-bold uppercase tracking-[0.18em] text-brand-text-muted">
                {UI.ingredientsLabel[lang]}
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {dish.ingredients[lang].map((ing) => (
                  <Badge key={ing} variant="default">{ing}</Badge>
                ))}
              </div>

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
                        key={a.label[lang]}
                        variant={ALLERGEN_VARIANT[a.color] || 'default'}
                      >
                        {a.label[lang]}
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
                <Badge variant="meta">{dish.meta.spice[lang]}</Badge>
                <Badge variant="meta">{dish.meta.serves[lang]}</Badge>
              </div>

              {/* Close CTA */}
              <Button
                type="button"
                onClick={onClose}
                variant="default"
                className="mt-8 w-full rounded-2xl py-3.5 text-sm tracking-wide md:py-4 md:text-base"
              >
                {UI.backToMenu[lang]}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
