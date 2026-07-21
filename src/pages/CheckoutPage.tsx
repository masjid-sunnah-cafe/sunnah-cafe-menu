import { ArrowLeft, Banknote, CreditCard, Globe2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrder } from '../data/orderRepository'
import { getOrderingMode } from '../data/orderingRepository'
import { UI, getL10n } from '../data/i18n'
import { useCart } from '../hooks/useCart'
import { useDishes } from '../hooks/useDishes'
import { formatPrice } from '../lib/format'
import { Button } from '../components/ui/button'
import type { FulfillmentLocation, PaymentMethod } from '../lib/types'

const LOCATIONS: FulfillmentLocation[] = [
  'counter_pickup',
  'womens_prayer_hall_door',
  'womens_cafe_hall',
  'mens_cafe_hall',
]

const PAYMENT_OPTIONS: { id: PaymentMethod; icon: typeof Globe2 }[] = [
  { id: 'sumup_online', icon: Globe2 },
  { id: 'card_on_fulfillment', icon: CreditCard },
  { id: 'cash_on_fulfillment', icon: Banknote },
]

function getCurrentLang() {
  const saved = localStorage.getItem('sunnah-cafe-lang')
  return saved === 'EN' ? saved : 'FI'
}

export default function CheckoutPage() {
  const lang = getCurrentLang()
  const navigate = useNavigate()
  const { items } = useCart()
  const { dishes, loading } = useDishes()
  const [location, setLocation] = useState<FulfillmentLocation>('counter_pickup')
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('sumup_online')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [orderingMode, setOrderingMode] = useState('approval_required')

  useEffect(() => {
    void getOrderingMode().then(setOrderingMode).catch(() => {})
  }, [])

  const rows = items.flatMap((item) => {
    const dish = dishes.find((candidate) => candidate.id === item.dishId)
    return dish ? [{ ...item, dish }] : []
  })
  const total = rows.reduce((sum, row) => sum + row.dish.price * row.quantity, 0)

  async function handleSubmit(event) {
    event.preventDefault()
    if (rows.length === 0 || submitting || orderingMode === 'closed') return

    setSubmitting(true)
    setError('')
    const statusToken = `${crypto.randomUUID()}${crypto.randomUUID()}`
    try {
      const result = await createOrder({
        fulfillmentLocation: location,
        customerNote: note.trim(),
        paymentMethod,
        items: rows.map((row) => ({ dishId: row.dishId, quantity: row.quantity })),
        idempotencyKey: crypto.randomUUID(),
        statusToken,
      })
      sessionStorage.setItem(`sunnah-cafe-order:${result.orderId}`, result.statusToken)
      const orderUrl = `/order/${result.orderId}#token=${encodeURIComponent(result.statusToken)}`
      if (result.checkoutUrl) {
        window.location.assign(result.checkoutUrl)
      } else {
        navigate(orderUrl)
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : UI.orderFailed[lang])
      setSubmitting(false)
    }
  }

  if (!loading && rows.length === 0) {
    return (
      <main className="grid min-h-screen place-items-center bg-brand-bg px-4 text-center">
        <div>
          <p className="font-display text-2xl font-bold text-brand-text-dark">{UI.emptyCart[lang]}</p>
          <Button className="mt-5" onClick={() => navigate('/')}>{UI.browseMenu[lang]}</Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-brand-bg px-4 py-6 text-brand-text-dark md:px-6 md:py-10">
      <form className="mx-auto max-w-3xl" onSubmit={handleSubmit}>
        <button
          type="button"
          onClick={() => navigate('/cart')}
          className="inline-flex min-h-11 items-center gap-2 font-display font-bold text-brand-text-muted"
        >
          <ArrowLeft size={20} aria-hidden="true" />
          {UI.backToCart[lang]}
        </button>
        <h1 className="mt-5 font-display text-3xl font-bold">{UI.checkoutTitle[lang]}</h1>
        {orderingMode === 'closed' && <p role="status" className="mt-5 rounded-lg bg-red-50 p-4 text-sm font-bold text-brand-red">{UI.orderingClosed[lang]}</p>}
        {orderingMode === 'approval_required' && <p className="mt-5 rounded-lg bg-brand-gold/10 p-4 text-sm font-bold text-brand-text-dark">{UI.approvalRequired[lang]}</p>}

        <fieldset className="mt-8 border-t border-brand-border pt-6">
          <legend className="font-display text-xl font-bold">{UI.fulfillmentLocation[lang]}</legend>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {LOCATIONS.map((value) => (
              <label key={value} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 ${location === value ? 'border-brand-dark bg-brand-card' : 'border-brand-border'}`}>
                <input type="radio" name="location" value={value} checked={location === value} onChange={() => setLocation(value)} />
                <span className="font-bold">{UI.locations[value][lang]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-8 border-t border-brand-border pt-6">
          <legend className="font-display text-xl font-bold">{UI.paymentMethod[lang]}</legend>
          <div className="mt-4 grid gap-2">
            {PAYMENT_OPTIONS.map(({ id, icon: Icon }) => (
              <label key={id} className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-4 ${paymentMethod === id ? 'border-brand-dark bg-brand-card' : 'border-brand-border'}`}>
                <input className="mt-1" type="radio" name="payment" value={id} checked={paymentMethod === id} onChange={() => setPaymentMethod(id)} />
                <Icon className="mt-0.5 flex-none" size={20} aria-hidden="true" />
                <span>
                  <span className="block font-bold">{UI.paymentOptions[id][lang]}</span>
                  <span className="mt-1 block text-sm leading-5 text-brand-text-muted">
                    {id === 'card_on_fulfillment' && location !== 'counter_pickup'
                      ? UI.cardDeliveredHelp[lang]
                      : UI.paymentHelp[id][lang]}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <section className="mt-8 border-t border-brand-border pt-6">
          <label className="font-display text-xl font-bold" htmlFor="order-note">{UI.orderNote[lang]}</label>
          <textarea
            id="order-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={500}
            rows={3}
            className="mt-4 w-full resize-y rounded-lg border border-brand-border bg-brand-card p-4 text-base outline-none focus:border-brand-gold"
          />
        </section>

        <section className="mt-8 border-t border-brand-border pt-6">
          <h2 className="font-display text-xl font-bold">{UI.orderSummary[lang]}</h2>
          <div className="mt-4 space-y-2">
            {rows.map((row) => (
              <div key={row.dishId} className="flex justify-between gap-4 text-sm">
                <span>{row.quantity} × {getL10n(row.dish.name, lang)}</span>
                <span className="font-bold">{formatPrice(row.dish.price * row.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-brand-border pt-4 font-display text-xl font-bold">
            <span>{UI.total[lang]}</span>
            <span>{formatPrice(total)}</span>
          </div>
        </section>

        {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-sm font-bold text-brand-red">{error}</p>}

        <div className="sticky bottom-0 -mx-4 mt-6 border-t border-brand-border bg-brand-bg/95 px-4 py-4 backdrop-blur md:static md:mx-0 md:px-0">
          <Button type="submit" disabled={submitting || loading || orderingMode === 'closed'} className="h-12 w-full text-base">
            {submitting ? UI.submittingOrder[lang] : UI.placeOrder[lang]}
          </Button>
        </div>
      </form>
    </main>
  )
}