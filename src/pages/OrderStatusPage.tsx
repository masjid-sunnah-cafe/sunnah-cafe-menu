import { ArrowLeft, CheckCircle2, Clock3, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getOrderStatus, startSumupPayment } from '../data/orderRepository'
import { getL10n, getPaymentStatusLabel, UI } from '../data/i18n'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../lib/format'
import { Button } from '../components/ui/button'

function getCurrentLang() {
  const saved = localStorage.getItem('sunnah-cafe-lang')
  return saved === 'EN' ? saved : 'FI'
}

const finishedStatuses = new Set(['completed', 'cancelled', 'expired'])

export default function OrderStatusPage() {
  const { orderId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { clearCart } = useCart()
  const lang = getCurrentLang()
  const tokenFromUrl = new URLSearchParams(location.hash.slice(1)).get('token')
  const token = orderId ? tokenFromUrl || sessionStorage.getItem(`sunnah-cafe-order:${orderId}`) : null
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [startingPayment, setStartingPayment] = useState(false)

  async function refresh() {
    if (!orderId || !token) return
    setRefreshing(true)
    try {
      const nextOrder = await getOrderStatus(orderId, token)
      setOrder(nextOrder)
      setError('')
      clearCart()
    } catch {
      setError(UI.orderStatusFailed[lang])
    } finally {
      setRefreshing(false)
    }
  }

  async function handlePayment() {
    if (!orderId || !token || startingPayment) return
    setStartingPayment(true)
    try {
      window.location.assign(await startSumupPayment(orderId, token))
    } catch (paymentError) {
      console.error('SumUp checkout could not be created:', paymentError)
      setError(UI.paymentStartFailed[lang])
      setStartingPayment(false)
    }
  }

  useEffect(() => {
    if (orderId && tokenFromUrl) sessionStorage.setItem(`sunnah-cafe-order:${orderId}`, tokenFromUrl)
  }, [orderId, tokenFromUrl])

  useEffect(() => {
    if (!orderId || !token) return undefined
    void refresh()
    const interval = window.setInterval(() => {
      if (!finishedStatuses.has(order?.status)) void refresh()
    }, 10000)
    return () => window.clearInterval(interval)
  }, [orderId, token, order?.status])

  if (!token) {
    return (
      <main className="grid min-h-screen place-items-center bg-brand-bg px-4 text-center">
        <div>
          <p className="font-display text-2xl font-bold text-brand-text-dark">{UI.orderStatusMissing[lang]}</p>
          <Button className="mt-5" onClick={() => navigate('/')}>{UI.browseMenu[lang]}</Button>
        </div>
      </main>
    )
  }

  const activeStatus = order ? UI.orderStatuses[order.status][lang] : UI.loading[lang]

  return (
    <main className="min-h-screen bg-brand-bg px-4 py-6 text-brand-text-dark md:px-6 md:py-10">
      <div className="mx-auto max-w-2xl">
        <button onClick={() => navigate('/')} className="inline-flex min-h-11 items-center gap-2 font-display font-bold text-brand-text-muted">
          <ArrowLeft size={20} aria-hidden="true" />
          {UI.backToMenu[lang].replace('← ', '')}
        </button>

        <header className="mt-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">{UI.orderStatusTitle[lang]}</h1>
            {order && <p className="mt-1 text-brand-text-muted">{UI.orderNumber[lang]} #{String(order.ticketNumber).padStart(2, '0')}</p>}
          </div>
          <Button type="button" variant="outline" size="icon" onClick={refresh} disabled={refreshing} title={UI.orderStatusTitle[lang]}>
            <RefreshCw className={refreshing ? 'animate-spin' : ''} size={18} aria-hidden="true" />
          </Button>
        </header>

        <section className="mt-8 border-y border-brand-border py-8 text-center">
          {order?.status === 'completed'
            ? <CheckCircle2 className="mx-auto text-emerald-700" size={42} aria-hidden="true" />
            : <Clock3 className="mx-auto text-brand-gold" size={42} aria-hidden="true" />}
          <p className="mt-4 font-display text-2xl font-bold">{activeStatus}</p>
          {order && <p className="mt-2 text-sm font-bold text-brand-text-muted">{getPaymentStatusLabel(order.paymentMethod, order.paymentStatus, lang)}</p>}
        </section>

        {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-sm font-bold text-brand-red">{error}</p>}

        {order?.status === 'awaiting_payment' && order.paymentMethod === 'sumup_online' && (
          <Button className="mt-5 h-12 w-full text-base" disabled={startingPayment} onClick={handlePayment}>
            {startingPayment ? UI.startingPayment[lang] : UI.payNow[lang]}
          </Button>
        )}

        {order && (
          <section className="mt-8">
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.dishId} className="flex justify-between gap-4 text-sm">
                  <span>{item.quantity} × {getL10n(item.name, lang)}</span>
                  <span className="font-bold">{formatPrice(item.lineTotalCents / 100)}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-between border-t border-brand-border pt-5 font-display text-xl font-bold">
              <span>{UI.total[lang]}</span>
              <span>{formatPrice(order.totalCents / 100)}</span>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}