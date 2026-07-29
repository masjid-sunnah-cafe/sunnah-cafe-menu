import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

const locations = new Set([
  'counter_pickup',
  'womens_prayer_hall_door',
  'womens_cafe_hall',
  'mens_cafe_hall',
])
const paymentMethods = new Set([
  'sumup_online',
  'card_on_fulfillment',
  'cash_on_fulfillment',
])

interface CartItem {
  dishId: string
  quantity: number
  selections?: Array<{
    groupId: string
    optionId: string
  }>
}

interface CreateOrderBody {
  fulfillmentLocation: string
  customerNote?: string
  paymentMethod: string
  items: CartItem[]
  idempotencyKey: string
  statusToken: string
}

function validateBody(value: unknown): CreateOrderBody {
  if (!value || typeof value !== 'object') throw new Error('Invalid request body.')
  const body = value as Partial<CreateOrderBody>
  if (typeof body.fulfillmentLocation !== 'string' || !locations.has(body.fulfillmentLocation)) {
    throw new Error('Invalid fulfillment location.')
  }
  if (typeof body.paymentMethod !== 'string' || !paymentMethods.has(body.paymentMethod)) {
    throw new Error('Invalid payment method.')
  }
  if (typeof body.customerNote !== 'undefined' && (typeof body.customerNote !== 'string' || body.customerNote.length > 500)) {
    throw new Error('Order note is too long.')
  }
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 50 || body.items.some((item) => (
    typeof item?.dishId !== 'string'
    || !Number.isInteger(item?.quantity)
    || item.quantity < 1
    || item.quantity > 99
    || (item.selections != null && (!Array.isArray(item.selections)
      || item.selections.length > 20
      || item.selections.some((selection) => (
        typeof selection?.groupId !== 'string'
        || selection.groupId.length < 1
        || selection.groupId.length > 100
        || typeof selection?.optionId !== 'string'
        || selection.optionId.length < 1
        || selection.optionId.length > 100
      ))))
  ))) {
    throw new Error('Invalid cart.')
  }
  if (typeof body.idempotencyKey !== 'string' || body.idempotencyKey.length < 16 || body.idempotencyKey.length > 100) {
    throw new Error('Invalid request identifier.')
  }
  if (typeof body.statusToken !== 'string' || body.statusToken.length < 64 || body.statusToken.length > 200) {
    throw new Error('Invalid status token.')
  }
  return body as CreateOrderBody
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405)

  try {
    const body = validateBody(await request.json())
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceRoleKey) throw new Error('Order service is not configured.')

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: order, error: orderError } = await admin.rpc('create_order_from_menu', {
      customer_first_name: 'Order',
      fulfillment_location: body.fulfillmentLocation,
      customer_note: body.customerNote || '',
      payment_method: body.paymentMethod,
      cart_items: body.items,
      request_id: body.idempotencyKey,
      token_hash: await sha256(body.statusToken),
    }).single()

    if (orderError || !order) throw new Error(orderError?.message || 'Could not create order.')

    if (body.paymentMethod !== 'sumup_online' || order.status !== 'awaiting_payment') {
      return jsonResponse({
        orderId: order.id,
        orderNumber: order.order_number,
        statusToken: body.statusToken,
        checkoutUrl: null,
        expiresAt: order.expires_at,
      }, 201)
    }

    const sumupApiKey = Deno.env.get('SUMUP_API_KEY')
    const merchantCode = Deno.env.get('SUMUP_MERCHANT_CODE')
    const publicSiteUrl = Deno.env.get('PUBLIC_SITE_URL')
    if (!sumupApiKey || !merchantCode || !publicSiteUrl) throw new Error('SumUp is not configured.')

    const checkoutReference = `sunnah-${order.id}-${crypto.randomUUID()}`
    const { data: attempt, error: attemptError } = await admin
      .from('payment_attempts')
      .insert({
        order_id: order.id,
        checkout_reference: checkoutReference,
        amount_cents: order.total_cents,
      })
      .select('id')
      .single()
    if (attemptError || !attempt) throw new Error(attemptError?.message || 'Could not create payment attempt.')

    const checkoutResponse = await fetch('https://api.sumup.com/v0.1/checkouts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sumupApiKey!}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkout_reference: checkoutReference,
        amount: order.total_cents / 100,
        currency: 'EUR',
        merchant_code: merchantCode!,
        description: `Sunnah Cafe #${String(order.ticket_number).padStart(2, '0')}`,
        return_url: `${supabaseUrl}/functions/v1/sumup-webhook`,
        redirect_url: `${publicSiteUrl!.replace(/\/$/, '')}/order/${order.id}#token=${encodeURIComponent(body.statusToken)}`,
        hosted_checkout: { enabled: true },
        valid_until: order.expires_at,
      }),
    })
    const checkout = await checkoutResponse.json()
    const checkoutUrl = checkout.hosted_checkout_url || checkout.hosted_checkout?.hosted_checkout_url
    if (!checkoutResponse.ok || !checkout.id || !checkoutUrl) {
      await admin.from('payment_attempts').update({ status: 'failed' }).eq('id', attempt.id)
      await admin.from('orders').update({ payment_status: 'failed' }).eq('id', order.id)
      throw new Error(checkout.message || 'SumUp checkout creation failed.')
    }

    await admin
      .from('payment_attempts')
      .update({ sumup_checkout_id: checkout.id })
      .eq('id', attempt.id)

    return jsonResponse({
      orderId: order.id,
      orderNumber: order.order_number,
      statusToken: body.statusToken,
      checkoutUrl,
      expiresAt: order.expires_at,
    }, 201)
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Could not create order.' }, 400)
  }
})