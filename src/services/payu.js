// PayU Payment Gateway Integration for TreeBazzar
// Uses PAYU_MERCHANT_KEY, PAYU_MERCHANT_SALT, Client ID & Secret
// Supports both official PayU Web Checkout (Test & Production) and Test Simulation

/**
 * Loads PayU Bolt or checkout scripts if needed
 */
export function loadPayUScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.bolt) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'bolt';
    script.src = 'https://jssdk.payu.in/bolt/bolt.min.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Calls backend to initialize PayU payment and generate SHA-512 Hash
 */
export async function createPayUPaymentOrder({
  amount = 100,
  nurseryName = '',
  ownerName = '',
  phone = '',
  email = '',
  productinfo = 'TreeBazzar Nursery Registration Fee'
}) {
  const response = await fetch('/api/payu/create-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount,
      nurseryName,
      ownerName,
      phone,
      email,
      productinfo
    })
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to initialize PayU payment');
  }

  return data;
}

/**
 * Calls backend to verify PayU payment reverse hash
 */
export async function verifyPayUPayment(paymentData) {
  const response = await fetch('/api/payu/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData)
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'PayU Payment verification failed');
  }

  return data;
}

/**
 * Simulates a successful test payment for instant local testing
 */
export function simulatePayUTestPayment({
  amountInRupees = 100,
  nurseryName = '',
  ownerName = '',
  phone = ''
}) {
  const simTxnId = `TB_PAYU_${Date.now()}`;
  const simPayUId = `PAYU_MID_${Date.now()}`;
  return {
    success: true,
    paymentId: simPayUId,
    orderId: simTxnId,
    txnid: simTxnId,
    amount: amountInRupees,
    status: 'success',
    gateway: 'PayU',
    isSimulated: true,
    verifiedAt: new Date().toISOString()
  };
}

/**
 * Main Checkout flow:
 * 1. Opens PayU in a safe, dedicated popup window synchronously so browser popup blocker never blocks it
 * 2. Calls backend to generate PayU parameters & SHA-512 hash
 * 3. Submits form to popup so the Admin Dashboard is NEVER replaced or lost
 * 4. Listens for payment completion message from /api/payu/response
 */
export async function initiatePayUCheckout({
  amountInRupees = 100,
  nurseryName = '',
  ownerName = '',
  phone = '',
  email = '',
  description = 'TreeBazzar Nursery Registration Fee (₹100)',
  onSuccess,
  onError,
  onDismiss
}) {
  const popupName = `PayU_Checkout_${Date.now()}`;
  const popupWidth = 650;
  const popupHeight = 720;
  const left = typeof window !== 'undefined' && window.screen.width ? Math.max(0, (window.screen.width - popupWidth) / 2) : 100;
  const top = typeof window !== 'undefined' && window.screen.height ? Math.max(0, (window.screen.height - popupHeight) / 2) : 100;

  // 1. Open popup window SYNCHRONOUSLY before await to guarantee popup blockers do not block it
  let popup = null;
  if (typeof window !== 'undefined') {
    try {
      popup = window.open(
        'about:blank',
        popupName,
        `width=${popupWidth},height=${popupHeight},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
      );
      if (popup && !popup.closed) {
        popup.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <title>TreeBazzar - PayU Payment Gateway</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #F8FAF9; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                .card { text-align: center; background: white; padding: 36px 28px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #E2E8F0; max-width: 380px; width: 90%; }
                .spinner { width: 44px; height: 44px; border: 3px solid #E2E8F0; border-top-color: #1E5631; border-radius: 50%; animation: spin 0.9s linear infinite; margin: 0 auto 16px; }
                h3 { color: #1E5631; margin: 0 0 8px; font-size: 18px; font-weight: 700; }
                p { color: #64748B; font-size: 13px; margin: 0; line-height: 1.5; }
                @keyframes spin { to { transform: rotate(360deg); } }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="spinner"></div>
                <h3>PayU गेटवेशी जोडत आहे...</h3>
                <p>सुरक्षित PayU पेमेंट स्क्रीन लोड होत आहे, कृपया थांबा...<br><span style="font-size:11px;color:#94A3B8;">(Connecting to secure PayU Gateway...)</span></p>
              </div>
            </body>
          </html>
        `);
      }
    } catch (err) {
      console.warn('Could not open popup window synchronously:', err);
      popup = null;
    }
  }

  try {
    // 2. Get payment order details and cryptographic SHA-512 hash from backend
    const payuOrder = await createPayUPaymentOrder({
      amount: amountInRupees,
      nurseryName,
      ownerName,
      phone,
      email,
      productinfo: description
    });

    // 3. Target the already opened popup or fallback to new tab
    const targetName = (popup && !popup.closed) ? popupName : '_blank';
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = payuOrder.actionUrl;
    form.target = targetName;

    const fields = {
      key: payuOrder.key,
      txnid: payuOrder.txnid,
      amount: payuOrder.amount,
      productinfo: payuOrder.productinfo,
      firstname: payuOrder.firstname,
      email: payuOrder.email,
      phone: payuOrder.phone,
      surl: payuOrder.surl,
      furl: payuOrder.furl,
      service_provider: 'payu_paisa',
      hash: payuOrder.hash,
      udf1: '',
      udf2: '',
      udf3: '',
      udf4: '',
      udf5: ''
    };

    for (const [key, value] of Object.entries(fields)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }

    document.body.appendChild(form);

    // 4. Listen for postMessage from the PayU response popup
    let isCompleted = false;
    let checkClosedInterval = null;

    const cleanup = () => {
      window.removeEventListener('message', messageHandler);
      if (checkClosedInterval) clearInterval(checkClosedInterval);
    };

    const messageHandler = (event) => {
      if (event.data && event.data.type === 'PAYU_PAYMENT_RESPONSE') {
        isCompleted = true;
        cleanup();
        if (event.data.success) {
          if (onSuccess) {
            onSuccess({
              success: true,
              paymentId: event.data.mihpayid || `PAYU_${Date.now()}`,
              orderId: event.data.txnid || payuOrder.txnid,
              txnid: event.data.txnid || payuOrder.txnid,
              amount: amountInRupees,
              gateway: 'PayU',
              verifiedAt: new Date().toISOString()
            });
          }
        } else {
          if (onError) onError(new Error('PayU payment cancelled or failed.'));
        }
      }
    };
    window.addEventListener('message', messageHandler);

    // Monitor if user closed the popup before completing payment
    if (popup && !popup.closed) {
      checkClosedInterval = setInterval(() => {
        if (popup.closed) {
          cleanup();
          if (!isCompleted) {
            if (onDismiss) onDismiss();
          }
        }
      }, 1000);
    }

    form.submit();
    document.body.removeChild(form);

    return {
      order: payuOrder,
      confirmSimulation: () => {
        if (popup && !popup.closed) {
          try { popup.close(); } catch(e) {}
        }
        cleanup();
        const simulated = simulatePayUTestPayment({
          amountInRupees,
          nurseryName,
          ownerName,
          phone
        });
        if (onSuccess) onSuccess(simulated);
      }
    };
  } catch (error) {
    if (popup && !popup.closed) {
      try { popup.close(); } catch (e) {}
    }
    console.error('PayU checkout error:', error);
    if (onError) {
      onError(error);
    } else {
      alert(error.message);
    }
  }
}
