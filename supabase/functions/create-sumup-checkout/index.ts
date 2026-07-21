import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function getSumupErrorMessage(checkout: unknown): string {
  if (!checkout || typeof checkout !== 'object') return 'SumUp checkout creation failed.'
  const result = checkout as {
    detail?: unknown
    title?: unknown
    message?: unknown
    error_message?: unknown
    error?: { message?: unknown } | unknown
    errors?: Array<{ message?: unknown; error_message?: unknown; error_code?: unknown }>
  }
  if (typeof result.detail === 'string') return result.detail
  if (typeof result.message === 'string') return result.message
  if (typeof result.title === 'string') return result.title
  if (typeof result.error_message === 'string') return result.error_message
  if (result.error && typeof result.error === 'object' && typeof result.error.message === 'string') return result.error.message
  const firstError = result.errors?.[0]
  if (typeof firstError?.message === 'string') return firstError.message
  if (typeof firstError?.error_message === 'string') return firstError.error_message
  if (typeof firstError?.error_code === 'string') return `SumUp rejected the checkout: ${firstError.error_code}`
  return 'SumUp checkout creation failed.'
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
    const sumupApiKey = Deno.env.get('SUMUP_API_KEY')
    const merchantCode = Deno.env.get('SUMUP_MERCHANT_CODE')
    const publicSiteUrl = Deno.env.get('PUBLIC_SITE_URL')
    if (!supabaseUrl || !serviceRoleKey || !sumupApiKey || !merchantCode || !publicSiteUrl) throw new Error('Payment service is not configured.')

    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('id, ticket_number, total_cents, expires_at, payment_method, payment_status, status')
      .eq('id', orderId)
      .eq('status_token_hash', await sha256(statusToken))
      .maybeSingle()
    if (orderError || !order || order.payment_method !== 'sumup_online' || order.status !== 'awaiting_payment' || order.payment_status !== 'pending') {
      return jsonResponse({ error: 'Payment is not available for this order.' }, 409)
    }
    if (order.expires_at && new Date(order.expires_at).getTime() <= Date.now()) {
      return jsonResponse({ error: 'Payment window has expired.' }, 409)
    }

    const checkoutReference = `sunnah-${order.id}-${crypto.randomUUID()}`
    const { data: attempt, error: attemptError } = await admin
      .from('payment_attempts')
      .insert({ order_id: order.id, checkout_reference: checkoutReference, amount_cents: order.total_cents })
      .select('id')
      .single()
    if (attemptError || !attempt) throw new Error(attemptError?.message || 'Could not create payment attempt.')

    const response = await fetch('https://api.sumup.com/v0.1/checkouts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sumupApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        checkout_reference: checkoutReference,
        amount: order.total_cents / 100,
        currency: 'EUR',
        merchant_code: merchantCode,
        description: `Sunnah Cafe #${String(order.ticket_number).padStart(2, '0')}`,
        return_url: `${supabaseUrl}/functions/v1/sumup-webhook`,
        redirect_url: `${publicSiteUrl.replace(/\/$/, '')}/order/${order.id}#token=${encodeURIComponent(statusToken)}`,
        hosted_checkout: { enabled: true },
        valid_until: order.expires_at,
      }),
    })
    const checkout = await response.json()
    const checkoutUrl = checkout.hosted_checkout_url || checkout.hosted_checkout?.hosted_checkout_url
    if (!response.ok || !checkout.id || !checkoutUrl) {
      await admin.from('payment_attempts').update({ status: 'failed' }).eq('id', attempt.id)
      throw new Error(getSumupErrorMessage(checkout))
    }
    await admin.from('payment_attempts').update({ sumup_checkout_id: checkout.id }).eq('id', attempt.id)
    return jsonResponse({ checkoutUrl }, 201)
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Could not start payment.' }, 400)
  }
})