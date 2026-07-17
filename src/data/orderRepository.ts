import { supabase } from '../lib/supabase'
import type { CartItem, FulfillmentLocation, Order, PaymentMethod } from '../lib/types'

interface CreateOrderInput {
  customerFirstName: string
  fulfillmentLocation: FulfillmentLocation
  customerNote: string
  paymentMethod: PaymentMethod
  items: CartItem[]
  idempotencyKey: string
  statusToken: string
}

export interface CreateOrderResult {
  orderId: string
  orderNumber: number
  statusToken: string
  checkoutUrl: string | null
  expiresAt: string | null
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  if (!supabase) {
    throw new Error('Ordering requires a configured Supabase project.')
  }

  const { data, error } = await supabase.functions.invoke<CreateOrderResult>('create-order', {
    body: input,
  })

  if (error) throw new Error(error.message || 'Could not create order.')
  if (!data?.orderId) throw new Error('The order service returned an invalid response.')
  return data
}

export async function getOrderStatus(orderId: string, statusToken: string): Promise<Order> {
  if (!supabase) {
    throw new Error('Ordering requires a configured Supabase project.')
  }

  const { data, error } = await supabase.functions.invoke<Order>('get-order-status', {
    body: { orderId, statusToken },
  })

  if (error) throw new Error(error.message || 'Could not load order.')
  if (!data?.id) throw new Error('The order service returned an invalid response.')
  return data
}