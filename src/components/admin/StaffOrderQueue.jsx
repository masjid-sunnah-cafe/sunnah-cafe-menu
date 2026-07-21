import { Banknote, Check, ChefHat, Clock3, CreditCard, MapPin, RefreshCw, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getL10n, getPaymentStatusLabel, UI } from '../../data/i18n'
import {
  getActiveOrders,
  markPaymentReceived,
  subscribeToOrders,
  transitionOrder,
  unsubscribeFromOrders,
} from '../../data/staffOrderRepository'
import { getOrderingMode, setOrderingMode } from '../../data/orderingRepository'
import { formatPrice } from '../../lib/format'
import { useAdminLang } from '../../lib/adminLang'
import { Button } from '../ui/button'

const copy = {
  EN: { empty: 'No active orders', refresh: 'Refresh orders', accept: 'Accept', ready: 'Mark ready', complete: 'Handed over / delivered', cancel: 'Reject / cancel', payment: 'Mark payment received', note: 'Order note', closed: 'Closed', approval_required: 'Approval required', instant: 'Instant orders' },
  FI: { empty: 'Ei aktiivisia tilauksia', refresh: 'Päivitä tilaukset', accept: 'Hyväksy', ready: 'Merkitse valmiiksi', complete: 'Luovutettu / toimitettu', cancel: 'Hylkää / peruuta', payment: 'Merkitse maksetuksi', note: 'Tilausohje', closed: 'Suljettu', approval_required: 'Vahvistus vaaditaan', instant: 'Pikatilaukset' },
  SO: { empty: 'Ma jiraan dalabyo firfircoon', refresh: 'Cusboonaysii dalabyada', accept: 'Aqbal', ready: 'Calaamadee diyaar', complete: 'La wareejiyay / la geeyay', cancel: 'Diid / jooji', payment: 'Calaamadee lacagta la helay', note: 'Faahfaahinta dalabka', closed: 'Xiran', approval_required: 'Ansixin ayaa loo baahan yahay', instant: 'Dalabyo degdeg ah' },
}

const nextActions = {
  awaiting_staff_approval: ['accepted', 'accept'],
  accepted: ['ready', 'ready'],
  preparing: ['ready', 'ready'],
  ready: ['completed', 'complete'],
}

export default function StaffOrderQueue() {
  const { lang } = useAdminLang()
  const labels = copy[lang]
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [orderingMode, setOrderingModeState] = useState('approval_required')

  const loadOrders = useCallback(async () => {
    try {
      const [nextOrders, nextMode] = await Promise.all([getActiveOrders(), getOrderingMode()])
      setOrders(nextOrders)
      setOrderingModeState(nextMode)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not load orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadOrders()
    const channel = subscribeToOrders(() => void loadOrders())
    return () => { void unsubscribeFromOrders(channel) }
  }, [loadOrders])

  async function run(orderId, action) {
    setBusyId(orderId)
    try {
      await action()
      await loadOrders()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Order update failed')
    } finally {
      setBusyId(null)
    }
  }

  async function changeOrderingMode(mode) {
    setBusyId('ordering-mode')
    try {
      await setOrderingMode(mode)
      setOrderingModeState(mode)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ordering mode update failed')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold text-brand-dark">{UI.orderStatusTitle[lang]}</h2>
        <Button variant="outline" size="icon" onClick={loadOrders} title={labels.refresh}>
          <RefreshCw className={loading ? 'animate-spin' : ''} size={17} />
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label="Ordering mode">
        {['closed', 'approval_required', 'instant'].map((mode) => (
          <Button
            key={mode}
            type="button"
            variant={orderingMode === mode ? 'gold' : 'outline'}
            className="min-h-12 whitespace-normal px-2 text-xs sm:text-sm"
            disabled={busyId === 'ordering-mode'}
            onClick={() => changeOrderingMode(mode)}
          >
            {labels[mode]}
          </Button>
        ))}
      </div>

      {!loading && orders.length === 0 && (
        <div className="mt-12 text-center text-brand-text-muted">
          <ChefHat className="mx-auto h-12 w-12 opacity-30" />
          <p className="mt-3 font-display text-lg font-bold text-brand-dark">{labels.empty}</p>
        </div>
      )}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {orders.map((order) => {
          const action = order.status === 'awaiting_staff_approval'
            ? [order.paymentMethod === 'sumup_online' ? 'awaiting_payment' : 'accepted', 'accept']
            : nextActions[order.status]
          const needsPayment = order.paymentMethod !== 'sumup_online' && order.paymentStatus === 'unpaid'
          const canComplete = order.status !== 'ready' || !needsPayment
          return (
            <article key={order.id} className="border border-brand-border border-l-4 border-l-brand-gold bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-xl font-bold">#{order.orderNumber} · {order.customerFirstName}</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-brand-text-muted">
                    <MapPin size={15} /> {UI.locations[order.fulfillmentLocation][lang]}
                  </p>
                </div>
                <span className="rounded-full bg-[#F7E8D5] px-3 py-1 text-xs font-bold text-brand-dark">
                  {UI.orderStatuses[order.status][lang]}
                </span>
              </div>

              <div className="mt-4 space-y-2 border-y border-brand-border py-4">
                {order.items.map((item) => (
                  <div key={item.dishId} className="flex justify-between gap-4 text-sm">
                    <span>{item.quantity} × {getL10n(item.name, lang)}</span>
                    <span className="font-bold">{formatPrice(item.lineTotalCents / 100)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 font-display font-bold">
                  <span>{UI.total[lang]}</span>
                  <span>{formatPrice(order.totalCents / 100)}</span>
                </div>
              </div>

              {order.customerNote && (
                <p className="mt-4 text-sm"><span className="font-bold">{labels.note}:</span> {order.customerNote}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-bold text-brand-text-muted">
                <Clock3 size={16} />
                <span>{new Date(order.createdAt).toLocaleTimeString(lang === 'FI' ? 'fi-FI' : lang === 'SO' ? 'so-SO' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                {order.paymentMethod === 'cash_on_fulfillment' ? <Banknote size={17} /> : <CreditCard size={17} />}
                <span>{getPaymentStatusLabel(order.paymentMethod, order.paymentStatus, lang)}</span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {needsPayment && (
                  <Button variant="outline" disabled={busyId === order.id} onClick={() => run(order.id, () => markPaymentReceived(order.id))}>
                    <CreditCard className="mr-2 h-4 w-4" /> {labels.payment}
                  </Button>
                )}
                {action && canComplete && (
                  <Button variant="brand" disabled={busyId === order.id} onClick={() => run(order.id, () => transitionOrder(order.id, action[0]))}>
                    <Check className="mr-2 h-4 w-4" /> {labels[action[1]]}
                  </Button>
                )}
                {order.status !== 'ready' && order.status !== 'awaiting_payment' && (
                  <Button variant="outline" disabled={busyId === order.id} onClick={() => run(order.id, () => transitionOrder(order.id, 'cancelled'))}>
                    <X className="mr-2 h-4 w-4" /> {labels.cancel}
                  </Button>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}