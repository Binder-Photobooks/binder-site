// supabase/functions/create-razorpay-order/index.ts
// Creates a Razorpay order server-side so the amount is locked on the server,
// not set by the browser. The client then opens Razorpay Checkout with this
// order ID, and Razorpay verifies the amount matches before charging.

const RAZORPAY_KEY_ID     = Deno.env.get('RAZORPAY_KEY_ID')!
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })

Deno.serve(async (req) => {
  // Handle CORS preflight
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

  const { amount, currency = 'INR', receipt } = await req.json().catch(() => ({}))

  if (!amount || typeof amount !== 'number' || amount < 100) {
    return json(400, { error: 'amount (paise, min 100) required' })
  }

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return json(500, { error: 'Razorpay credentials not configured in Edge Function secrets' })
  }

  // Create the order via Razorpay API
  const credentials = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)

  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: Math.round(amount),   // paise — e.g. ₹2200 = 220000
      currency,
      receipt: receipt || `bdr-${Date.now()}`,
      payment_capture: 1            // auto-capture on successful payment
    })
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Razorpay order creation failed:', err)
    return json(502, { error: 'Razorpay API error', detail: err })
  }

  const order = await res.json()
  return json(200, { order })
})
