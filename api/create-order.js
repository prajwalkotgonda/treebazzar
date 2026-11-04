import Razorpay from 'razorpay';
import 'dotenv/config';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
    return;
  }

  try {
    // Parse JSON body
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    } else if (!body) {
      body = await new Promise((resolve) => {
        let data = '';
        req.on('data', chunk => { data += chunk; });
        req.on('end', () => {
          try { resolve(JSON.parse(data)); } catch (e) { resolve({}); }
        });
      });
    }

    const { amount, currency = 'INR', receipt, notes } = body || {};

    // Validate amount: must be at least 100 paise (₹1.00)
    const parsedAmount = parseInt(amount, 10);
    if (!amount || isNaN(parsedAmount) || parsedAmount < 100) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        error: 'Invalid amount. Minimum amount is 100 paise (₹1.00).' 
      }));
      return;
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        error: 'Razorpay API credentials not configured in environment variables (.env).',
        code: 'RAZORPAY_AUTH_FAILED'
      }));
      return;
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const order = await razorpay.orders.create({
      amount: parsedAmount,
      currency: (currency || 'INR').toUpperCase(),
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {}
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    }));
  } catch (error) {
    console.error('Error in /api/create-order:', error);
    const isAuthErr = error.statusCode === 401 || error.error?.description === 'Authentication failed';
    const statusCode = isAuthErr ? 401 : (error.statusCode || 500);
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: isAuthErr 
        ? 'Razorpay Authentication failed (401 Unauthorized). Your Test Key ID or Secret is invalid or expired. Please generate a new Test Key in Razorpay Dashboard (Settings > API Keys) and update .env.'
        : (error.description || error.message || 'Razorpay order creation failed'),
      code: isAuthErr ? 'RAZORPAY_AUTH_FAILED' : 'ORDER_FAILED',
      details: error.error || error
    }));
  }
}
