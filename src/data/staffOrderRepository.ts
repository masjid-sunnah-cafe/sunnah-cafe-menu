import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Order, OrderStatus } from '../lib/types'

function requireSupabase() {
  if (!supabase) throw new Error('Staff orders require a configured Supabase project.')
  return supabase
}

function mapOrder(row: any): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    ticketDate: row.ticket_date,
    ticketNumber: row.ticket_number,
    customerFirstName: row.customer_first_name,
    fulfillmentLocation: row.fulfillment_location,
    customerNote: row.customer_note,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    status: row.status,
    totalCents: row.total_cents,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: (row.order_items || []).map((item: any) => ({
      dishId: item.dish_id,
      name: item.name,
      unitPriceCents: item.unit_price_cents,
      quantity: item.quantity,
      lineTotalCents: item.line_total_cents,
    })),
  }
}

export async function getActiveOrders(): Promise<Order[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('orders')
    .select(`
      id, order_number, ticket_date, ticket_number, customer_first_name, fulfillment_location, customer_note,
      payment_method, payment_status, status, total_cents, expires_at, created_at, updated_at,
      order_items (dish_id, name, unit_price_cents, quantity, line_total_cents)
    `)
    .not('status', 'in', '(completed,cancelled,expired)')
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return (data || []).map(mapOrder)
}

export async function getOrderHistory(ticketDate?: string, status?: 'completed' | 'cancelled' | 'expired'): Promise<Order[]> {
  const client = requireSupabase()
  let query = client
    .from('orders')
    .select(`
      id, order_number, ticket_date, ticket_number, customer_first_name, fulfillment_location, customer_note,
      payment_method, payment_status, status, total_cents, expires_at, created_at, updated_at,
      order_items (dish_id, name, unit_price_cents, quantity, line_total_cents)
    `)
    .in('status', status ? [status] : ['completed', 'cancelled', 'expired'])
    .order('created_at', { ascending: false })
    .limit(100)

  if (ticketDate) query = query.eq('ticket_date', ticketDate)
  else query = query.gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data || []).map(mapOrder)
}

export async function transitionOrder(orderId: string, status: OrderStatus): Promise<void> {
  const { error } = await requireSupabase().rpc('transition_order', {
    target_order_id: orderId,
    target_status: status,
  })
  if (error) throw new Error(error.message)
}

export async function markPaymentReceived(orderId: string): Promise<void> {
  const { error } = await requireSupabase().rpc('mark_fulfillment_payment_received', {
    target_order_id: orderId,
  })
  if (error) throw new Error(error.message)
}

export function subscribeToOrders(onChange: () => void): RealtimeChannel | null {
  if (!supabase) return null
  return supabase
    .channel('staff-order-queue')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, onChange)
    .subscribe()
}

export async function unsubscribeFromOrders(channel: RealtimeChannel | null): Promise<void> {
  if (channel && supabase) await supabase.removeChannel(channel)
}