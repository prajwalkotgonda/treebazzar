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
      txnid,
      amount,
      productinfo = '',
      firstname = '',
      email = '',
      status = 'success',
      mihpayid,
      hash,
      additionalCharges = '',
      udf1 = '',
      udf2 = '',
      udf3 = '',
      udf4 = '',
      udf5 = ''
    } = body || {};

    const key = process.env.PAYU_MERCHANT_KEY || 'UR9xGD';
    const salt = process.env.PAYU_MERCHANT_SALT || 'avYLS16QeuyMg01GnKtbHAsy2Xaw2P1V';

    if (!salt) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'PayU salt is not configured.' }));
      return;
    }

    // Format amount
    const formattedAmount = parseFloat(amount || 100).toFixed(2);

    // Calculate reverse hash
    // Formula: sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
    let hashString = '';
    if (additionalCharges) {
      hashString = `${additionalCharges}|${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${formattedAmount}|${txnid}|${key}`;
    } else {
      hashString = `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${formattedAmount}|${txnid}|${key}`;
    }

    const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex').toLowerCase();
    const isHashValid = hash ? (calculatedHash === hash.toLowerCase()) : true; // Allow simulated or direct token verification

    const isSuccess = (status === 'success' || status === 'captured') && isHashValid;

    res.statusCode = isSuccess ? 200 : 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: isSuccess,
      status: isSuccess ? 'success' : 'failed',
      txnid,
      mihpayid: mihpayid || `PAYU_${Date.now()}`,
      amount: formattedAmount,
      isHashValid,
      verifiedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error in /api/payu/verify-payment:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: error.message || 'Payment verification failed',
      code: 'VERIFICATION_ERROR'
    }));
  }
}
