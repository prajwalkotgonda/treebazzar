import crypto from 'crypto';
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

    const { 
      amount = 100, 
      nurseryName = 'TreeBazzar Nursery', 
      ownerName = 'Owner', 
      phone = '9822012345', 
      email = 'nursery@treebazzar.com',
      productinfo = 'TreeBazzar Nursery Registration Fee',
      udf1 = '',
      udf2 = '',
      udf3 = '',
      udf4 = '',
      udf5 = ''
    } = body || {};

    const key = process.env.PAYU_MERCHANT_KEY || 'UR9xGD';
    const salt = process.env.PAYU_MERCHANT_SALT || 'avYLS16QeuyMg01GnKtbHAsy2Xaw2P1V';
    const env = (process.env.PAYU_ENV || 'test').toLowerCase();

    if (!key || !salt) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        error: 'PayU credentials not configured in environment variables (.env).',
        code: 'PAYU_CONFIG_MISSING'
      }));
      return;
    }

    // Format amount (float formatted to 2 decimals)
    const numericAmount = Math.max(1, Number(amount) || 100);
    const formattedAmount = numericAmount.toFixed(2);

    // Generate unique transaction ID (alphanumeric, max 25 chars)
    const cleanPrefix = 'TB';
    const timestamp = Date.now().toString().slice(-8);
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const txnid = `${cleanPrefix}_${timestamp}_${randomSuffix}`;

    // Clean customer info
    const cleanFirstName = (ownerName || nurseryName || 'Customer').trim().replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 50) || 'Partner';
    const cleanProductInfo = (productinfo || 'Nursery Registration Fee').trim().replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 90);
    const cleanPhone = (phone || '9822012345').replace(/\D/g, '').slice(-10) || '9822012345';
    const cleanEmail = (email && email.includes('@')) ? email.trim() : 'nursery@treebazzar.com';

    // Base URL for callbacks
    const origin = req.headers.origin || req.headers.referer ? new URL(req.headers.referer || req.headers.origin).origin : 'http://localhost:3001';
    const surl = `${origin}/api/payu/response?status=success`;
    const furl = `${origin}/api/payu/response?status=failure`;

    // SHA-512 Hash Generation Formula:
    // sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt)
    const hashSequence = `${key}|${txnid}|${formattedAmount}|${cleanProductInfo}|${cleanFirstName}|${cleanEmail}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
    const hash = crypto.createHash('sha512').update(hashSequence).digest('hex').toLowerCase();

    // PayU Action Endpoint
    const actionUrl = env === 'prod' || env === 'production' 
      ? 'https://secure.payu.in/_payment' 
      : 'https://test.payu.in/_payment';

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      key,
      txnid,
      amount: formattedAmount,
      productinfo: cleanProductInfo,
      firstname: cleanFirstName,
      email: cleanEmail,
      phone: cleanPhone,
      surl,
      furl,
      hash,
      service_provider: 'payu_paisa',
      actionUrl,
      mode: env,
      isTestMode: env !== 'prod' && env !== 'production',
      createdAt: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error in /api/payu/create-payment:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: error.message || 'Failed to initialize PayU payment',
      code: 'PAYU_INIT_ERROR'
    }));
  }
}
