import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405)

  try {
    const notification = await request.json()
    const checkoutId = notification?.id
    if (typeof checkoutId !== 'string' || !checkoutId) {
      return jsonResponse({ error: 'Invalid notification.' }, 400)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const sumupApiKey = Deno.env.get('SUMUP_API_KEY')
    const merchantCode = Deno.env.get('SUMUP_MERCHANT_CODE')
    if (!supabaseUrl || !serviceRoleKey || !sumupApiKey || !merchantCode) {
      throw new Error('Payment service is not configured.')
    }

    const verificationResponse = await fetch(`https://api.sumup.com/v0.1/checkouts/${encodeURIComponent(checkoutId)}`, {
      headers: { Authorization: `Bearer ${sumupApiKey}` },
    })
    if (!verificationResponse.ok) throw new Error('Could not verify SumUp checkout.')

    const checkout = await verificationResponse.json()
    if (checkout.id !== checkoutId || checkout.merchant_code !== merchantCode || checkout.currency !== 'EUR') {
      throw new Error('Checkout verification failed.')
    }

    const status = String(checkout.status || '').toUpperCase()
    if (!['PENDING', 'PAID', 'FAILED', 'EXPIRED'].includes(status)) {
      return jsonResponse({ received: true })
    }

    const transactionId = checkout.transaction_id || checkout.transactions?.[0]?.id || ''
    const amountCents = Math.round(Number(checkout.amount) * 100)
    if (!Number.isSafeInteger(amountCents) || amountCents < 0) {
      throw new Error('Invalid checkout amount.')
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { error } = await admin.rpc('reconcile_sumup_payment', {
      checkout_id: checkoutId,
      remote_status: status,
      transaction_id: transactionId,
      paid_amount_cents: amountCents,
    })
    if (error) throw new Error(error.message)

    return jsonResponse({ received: true })
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Webhook failed.' }, 400)
  }
})