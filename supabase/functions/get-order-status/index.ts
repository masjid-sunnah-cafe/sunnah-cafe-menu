import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405)

  try {
    const { orderId, statusToken } = await request.json()
    if (typeof orderId !== 'string' || typeof statusToken !== 'string' || statusToken.length < 64) {
      return jsonResponse({ error: 'Order not found.' }, 404)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceRoleKey) throw new Error('Order service is not configured.')

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: order, error } = await admin
      .from('orders')
      .select(`
        id,
        order_number,
        ticket_number,
        customer_first_name,
        fulfillment_location,
        customer_note,
        payment_method,
        payment_status,
        status,
        total_cents,
        expires_at,
        created_at,
        updated_at,
        order_items (dish_id, name, unit_price_cents, quantity, line_total_cents)
      `)
      .eq('id', orderId)
      .eq('status_token_hash', await sha256(statusToken))
      .maybeSingle()

    if (error || !order) return jsonResponse({ error: 'Order not found.' }, 404)

    return jsonResponse({
      id: order.id,
      orderNumber: order.order_number,
      ticketNumber: order.ticket_number,
      customerFirstName: order.customer_first_name,
      fulfillmentLocation: order.fulfillment_location,
      customerNote: order.customer_note,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      status: order.status,
      totalCents: order.total_cents,
      expiresAt: order.expires_at,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items: order.order_items.map((item) => ({
        dishId: item.dish_id,
        name: item.name,
        unitPriceCents: item.unit_price_cents,
        quantity: item.quantity,
        lineTotalCents: item.line_total_cents,
      })),
    }, 200)
  } catch {
    return jsonResponse({ error: 'Could not load order.' }, 400)
  }
})