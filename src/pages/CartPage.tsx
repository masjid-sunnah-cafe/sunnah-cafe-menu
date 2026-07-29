import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { UI, getL10n } from '../data/i18n'
import { useCart } from '../hooks/useCart'
import { useDishes } from '../hooks/useDishes'
import { formatPrice } from '../lib/format'
import { Button } from '../components/ui/button'

export default function CartPage({ lang = 'FI' }) {
  const savedLang = localStorage.getItem('sunnah-cafe-lang')
  const currentLang = savedLang === 'FI' ? savedLang : lang
  const navigate = useNavigate()
  const { items, setQuantity, removeItem } = useCart()
  const { dishes, loading } = useDishes()
  const rows = items.flatMap((item) => {
    const dish = dishes.find((candidate) => candidate.id === item.dishId)
    return dish ? [{ ...item, dish }] : []
  })
  const total = rows.reduce((sum, row) => (
    sum + (row.dish.price + row.selections.reduce((extra, selection) => extra + selection.priceAdjustmentCents, 0) / 100) * row.quantity
  ), 0)

  return (
    <main className="min-h-screen bg-brand-bg px-4 py-6 text-brand-text-dark md:px-6 md:py-10">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex min-h-11 items-center gap-2 font-display font-bold text-brand-text-muted"
        >
          <ArrowLeft size={20} aria-hidden="true" />
          {UI.backToMenu[currentLang]}
        </button>

        <div className="mt-5 flex items-center gap-3 border-b border-brand-border pb-5">
          <ShoppingBag size={28} aria-hidden="true" />
          <h1 className="font-display text-3xl font-bold">{UI.cartTitle[currentLang]}</h1>
        </div>

        {loading ? (
          <p className="py-12 text-center text-brand-text-muted">{UI.loading[currentLang]}</p>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingBag className="mx-auto text-brand-gold" size={42} aria-hidden="true" />
            <p className="mt-4 font-display text-xl font-bold">{UI.emptyCart[currentLang]}</p>
            <Button className="mt-6" onClick={() => navigate('/')}>{UI.browseMenu[currentLang]}</Button>
          </div>
        ) : (
          <>
            <div className="divide-y divide-brand-border">
              {rows.map(({ dish, quantity, key, selections }) => {
                const unitPrice = dish.price + selections.reduce((sum, selection) => sum + selection.priceAdjustmentCents, 0) / 100
                return (
                <article key={key} className="grid grid-cols-[72px_1fr_auto] gap-3 py-5 md:grid-cols-[88px_1fr_auto]">
                  <img
                    src={dish.image}
                    alt=""
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <h2 className="font-display text-lg font-bold leading-tight">{getL10n(dish.name, currentLang)}</h2>
                    {selections.map((selection) => (
                      <p key={selection.groupId} className="mt-1 text-sm text-brand-text-muted">
                        {getL10n(selection.groupLabel, currentLang)}: {getL10n(selection.optionLabel, currentLang)}
                        {selection.priceAdjustmentCents > 0 && ` (+${formatPrice(selection.priceAdjustmentCents / 100)})`}
                      </p>
                    ))}
                    <p className="mt-1 font-bold text-brand-gold">{formatPrice(unitPrice * quantity)}</p>
                    <div className="mt-3 flex h-11 w-fit items-center rounded-lg border border-brand-border bg-brand-card">
                      <button
                        type="button"
                        onClick={() => setQuantity(key, quantity - 1)}
                        aria-label={UI.decreaseQuantity[currentLang]}
                        className="grid h-11 w-11 place-items-center"
                      >
                        <Minus size={17} aria-hidden="true" />
                      </button>
                      <span className="w-9 text-center font-bold" aria-live="polite">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(key, quantity + 1)}
                        aria-label={UI.increaseQuantity[currentLang]}
                        className="grid h-11 w-11 place-items-center"
                      >
                        <Plus size={17} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(key)}
                    aria-label={UI.removeItem[currentLang]}
                    className="grid h-11 w-11 place-items-center text-brand-red"
                  >
                    <Trash2 size={19} aria-hidden="true" />
                  </button>
                </article>
                )
              })}
            </div>
            <div className="sticky bottom-0 -mx-4 border-t border-brand-border bg-brand-bg/95 px-4 py-4 backdrop-blur md:static md:mx-0 md:mt-5 md:px-0">
              <div className="mb-4 flex items-center justify-between font-display text-xl font-bold">
                <span>{UI.total[currentLang]}</span>
                <span>{formatPrice(total)}</span>
              </div>
              <Button className="h-12 w-full text-base" onClick={() => navigate('/checkout')}>
                {UI.continueToCheckout[currentLang]}
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}