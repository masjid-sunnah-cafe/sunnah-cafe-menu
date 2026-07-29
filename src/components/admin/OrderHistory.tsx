import { CalendarDays, Clock3, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getL10n, getPaymentStatusLabel, UI } from '../../data/i18n'
import { getOrderHistory } from '../../data/staffOrderRepository'
import { formatPrice } from '../../lib/format'
import { useAdminLang } from '../../lib/adminLang'
import type { Order } from '../../lib/types'
import { Button } from '../ui/button'

const copy = {
  EN: { title: 'Order history', empty: 'No completed, cancelled or expired orders', refresh: 'Refresh history', all: 'All outcomes', completed: 'Handed over / delivered', cancelled: 'Cancelled', expired: 'Expired', date: 'Date', last30: 'Last 30 days', ticket: 'Pickup ticket', orderNumber: 'Order number' },
  FI: { title: 'Tilaushistoria', empty: 'Ei luovutettuja, peruttuja tai vanhentuneita tilauksia', refresh: 'Päivitä historia', all: 'Kaikki tilat', completed: 'Luovutettu / toimitettu', cancelled: 'Peruttu', expired: 'Vanhentunut', date: 'Päivä', last30: 'Viimeiset 30 päivää', ticket: 'Noutotunnus', orderNumber: 'Tilausnumero' },
}

type HistoryStatus = 'completed' | 'cancelled' | 'expired' | 'all'

function formatTicketDate(ticketDate: string, lang: 'FI' | 'EN') {
  return new Date(`${ticketDate}T12:00:00`).toLocaleDateString(lang === 'FI' ? 'fi-FI' : 'en-GB')
}

export default function OrderHistory() {
  const { lang } = useAdminLang()
  const language = lang === 'EN' ? 'EN' : 'FI'
  const labels = copy[language]
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [ticketDate, setTicketDate] = useState('')
  const [status, setStatus] = useState<HistoryStatus>('all')

  const loadHistory = useCallback(async () => {
    setLoading(true)
    try {
      setOrders(await getOrderHistory(ticketDate || undefined, status === 'all' ? undefined : status))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not load order history')
    } finally {
      setLoading(false)
    }
  }, [ticketDate, status])

  useEffect(() => { void loadHistory() }, [loadHistory])

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-brand-dark">{labels.title}</h2>
          <p className="mt-1 text-sm text-brand-text-muted">{ticketDate ? formatTicketDate(ticketDate, language) : labels.last30}</p>
        </div>
        <Button variant="outline" size="icon" onClick={loadHistory} disabled={loading} title={labels.refresh}>
          <RefreshCw className={loading ? 'animate-spin' : ''} size={17} />
        </Button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <label className="flex h-10 items-center gap-2 rounded-lg border border-brand-border bg-white px-3 text-sm text-brand-text-muted">
          <CalendarDays size={16} />
          <span className="sr-only">{labels.date}</span>
          <input className="min-w-0 flex-1 bg-transparent text-brand-text-dark outline-none" type="date" value={ticketDate} onChange={(event) => setTicketDate(event.target.value)} />
        </label>
        <select className="h-10 rounded-lg border border-brand-border bg-white px-3 text-sm text-brand-text-dark" value={status} onChange={(event) => setStatus(event.target.value as HistoryStatus)}>
          <option value="all">{labels.all}</option>
          <option value="completed">{labels.completed}</option>
          <option value="cancelled">{labels.cancelled}</option>
          <option value="expired">{labels.expired}</option>
        </select>
        {ticketDate && <Button variant="outline" onClick={() => setTicketDate('')}>{labels.last30}</Button>}
      </div>

      {!loading && orders.length === 0 && <p className="mt-12 text-center font-display font-bold text-brand-text-muted">{labels.empty}</p>}

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {orders.map((order) => (
          <article key={order.id} className="border border-brand-border border-l-4 border-l-brand-gold bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-xl font-bold">{labels.ticket} #{String(order.ticketNumber).padStart(2, '0')}</p>
                <p className="mt-1 text-xs font-bold text-brand-text-muted">{labels.orderNumber} #{order.orderNumber}</p>
                <p className="mt-1 text-sm text-brand-text-muted">{formatTicketDate(order.ticketDate, language)}</p>
              </div>
              <span className="rounded-full bg-[#F7E8D5] px-3 py-1 text-xs font-bold text-brand-dark">{UI.orderStatuses[order.status][lang]}</span>
            </div>
            <div className="mt-4 space-y-2 border-y border-brand-border py-3 text-sm">
              {order.items.map((item, index) => (
                <div key={`${item.dishId}-${index}`} className="flex justify-between gap-4">
                  <span>
                    {item.quantity} x {getL10n(item.name, lang)}
                    {item.selections?.map((selection) => (
                      <span key={selection.groupId} className="block text-brand-text-muted">
                        {getL10n(selection.groupLabel, lang)}: {getL10n(selection.optionLabel, lang)}
                      </span>
                    ))}
                  </span>
                  <span className="font-bold">{formatPrice(item.lineTotalCents / 100)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 font-display font-bold"><span>{UI.total[lang]}</span><span>{formatPrice(order.totalCents / 100)}</span></div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm font-bold text-brand-text-muted">
              <Clock3 size={16} />
              <span>{new Date(order.createdAt).toLocaleTimeString(language === 'FI' ? 'fi-FI' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
              <span>{getPaymentStatusLabel(order.paymentMethod, order.paymentStatus, lang)}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}