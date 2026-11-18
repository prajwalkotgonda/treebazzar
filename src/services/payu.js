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
 * 1. Calls backend to generate PayU parameters & SHA-512 hash
 * 2. Opens PayU in a safe, non-intrusive popup so the Admin Dashboard is NEVER replaced or lost
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
  try {
    // 1. Get payment order details and cryptographic SHA-512 hash from backend
    const payuOrder = await createPayUPaymentOrder({
      amount: amountInRupees,
      nurseryName,
      ownerName,
      phone,
      email,
      productinfo: description
    });

    // Check if Bolt JS is available in the page
    if (typeof window !== 'undefined' && window.bolt && typeof window.bolt.launch === 'function') {
      window.bolt.launch({
        key: payuOrder.key,
        txnid: payuOrder.txnid,
        hash: payuOrder.hash,
        amount: payuOrder.amount,
        firstname: payuOrder.firstname,
        email: payuOrder.email,
        phone: payuOrder.phone,
        productinfo: payuOrder.productinfo,
        surl: payuOrder.surl,
        furl: payuOrder.furl,
        service_provider: 'payu_paisa',
        mode: 'dropout'
      }, {
        responseHandler: async function (boltResponse) {
          try {
            const verification = await verifyPayUPayment({
              txnid: payuOrder.txnid,
              amount: payuOrder.amount,
              status: boltResponse.response?.status || 'success',
              mihpayid: boltResponse.response?.mihpayid,
              hash: boltResponse.response?.hash
            });

            if (onSuccess) {
              onSuccess({
                success: true,
                paymentId: boltResponse.response?.mihpayid || `PAYU_${Date.now()}`,
                orderId: payuOrder.txnid,
                txnid: payuOrder.txnid,
                amount: amountInRupees,
                gateway: 'PayU',
                verifiedAt: new Date().toISOString()
              });
            }
          } catch (err) {
            if (onError) onError(err);
          }
        },
        catchException: function (boltErr) {
          console.error('PayU Bolt exception:', boltErr);
          if (onError) onError(new Error(boltErr.message || 'PayU checkout interrupted'));
        }
      });
      return;
    }

    // 2. Open PayU in a dedicated popup window so the main app is NEVER replaced!
    const popupName = 'PayUPaymentWindow';
    const popupWidth = 600;
    const popupHeight = 700;
    const left = window.screen.width ? (window.screen.width - popupWidth) / 2 : 100;
    const top = window.screen.height ? (window.screen.height - popupHeight) / 2 : 100;

    let popup = window.open(
      'about:blank',
      popupName,
      `width=${popupWidth},height=${popupHeight},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
    );

    // If popup was blocked by browser, warn gracefully without breaking the dashboard
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      console.warn('Popup blocked by browser. Using form target fallback.');
      popup = null;
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = payuOrder.actionUrl;
    form.target = popup ? popupName : '_blank'; // Never targets '_self' or current tab!

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
      hash: payuOrder.hash
    };

    for (const [key, value] of Object.entries(fields)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }

    document.body.appendChild(form);

    // Listen for postMessage from the PayU response popup
    const messageHandler = (event) => {
      if (event.data && event.data.type === 'PAYU_PAYMENT_RESPONSE') {
        window.removeEventListener('message', messageHandler);
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

    form.submit();
    document.body.removeChild(form);

    return {
      order: payuOrder,
      confirmSimulation: () => {
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
    console.error('PayU checkout error:', error);
    if (onError) {
      onError(error);
    } else {
      alert(error.message);
    }
  }
}
