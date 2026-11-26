import crypto from 'crypto';
import 'dotenv/config';

async function parseJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed. Use POST.' });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return sendJson(res, 500, {
      success: false,
      verified: false,
      error: 'RAZORPAY_KEY_SECRET is not configured on the server.'
    });
  }

  try {
    const body = await parseJsonBody(req);
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return sendJson(res, 400, {
        success: false,
        verified: false,
        error: 'Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature.'
      });
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const actualBuf = Buffer.from(String(razorpay_signature), 'utf8');
    const isValid =
      expectedBuf.length === actualBuf.length &&
      crypto.timingSafeEqual(expectedBuf, actualBuf);

    if (!isValid) {
      return sendJson(res, 400, {
        success: false,
        verified: false,
        error: 'Payment signature verification failed.'
      });
    }

    return sendJson(res, 200, {
      success: true,
      verified: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      verifiedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Razorpay verify-payment error:', err);
    return sendJson(res, 500, {
      success: false,
      verified: false,
      error: err?.message || 'Payment verification failed.'
    });
  }
}
