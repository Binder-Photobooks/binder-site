// supabase/functions/verify-razorpay-payment/index.ts
// Verifies that a completed Razorpay payment is genuine by checking the
// HMAC-SHA256 signature Razorpay sends after a successful checkout.
// This MUST run server-side — the Key Secret must never be in the browser.

const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info'
      }
    })
  }

  if (req.method !== 'POST') return json(405, { error: 'POST only' })

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    await req.json().catch(() => ({}))

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return json(400, { error: 'razorpay_order_id, razorpay_payment_id and razorpay_signature all required' })
  }

  if (!RAZORPAY_KEY_SECRET) {
    return json(500, { error: 'RAZORPAY_KEY_SECRET not set in Edge Function secrets' })
  }

  // Razorpay signature = HMAC-SHA256(order_id + "|" + payment_id, key_secret)
  const body     = `${razorpay_order_id}|${razorpay_payment_id}`
  const encoder  = new TextEncoder()
  const keyData  = encoder.encode(RAZORPAY_KEY_SECRET)
  const msgData  = encoder.encode(body)

  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  )
  const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgData)
  const computed  = Array.from(new Uint8Array(sigBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  const verified = computed === razorpay_signature

  if (!verified) {
    console.warn('Signature mismatch — possible tampering', {
      razorpay_order_id, razorpay_payment_id
    })
  }

  return json(200, { verified, razorpay_payment_id, razorpay_order_id })
})
