// Razorpay Standard Web Checkout Service
// Uses VITE_RAZORPAY_KEY_ID on client; RAZORPAY_KEY_SECRET stays strictly on backend.

const RAZORPAY_CHECKOUT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

/**
 * Ensures the Razorpay Standard Checkout script is loaded on window.Razorpay
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.querySelector(`script[src="${RAZORPAY_CHECKOUT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(Boolean(window.Razorpay)), { once: true });
      existing.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_CHECKOUT_URL;
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Calls backend POST /api/create-order to create a Razorpay order (amount in paise)
 */
export async function createRazorpayOrder({
  amount,
  currency = 'INR',
  receipt = `rcpt_${Date.now()}`,
  notes = {}
}) {
  const response = await fetch('/api/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount,
      currency,
      receipt,
      notes
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.order_id) {
    throw new Error(data.error || 'Failed to create Razorpay order');
  }

  return data;
}

/**
 * Calls backend POST /api/verify-payment to verify HMAC-SHA256 signature
 */
export async function verifyRazorpayPayment({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature
}) {
  const response = await fetch('/api/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success || !data.verified) {
    throw new Error(data.error || 'Payment signature verification failed');
  }

  return data;
}

/**
 * Full Razorpay Standard Checkout flow:
 * 1. Load checkout.js
 * 2. Create order via backend /api/create-order
 * 3. Open Razorpay modal
 * 4. Verify signature via backend /api/verify-payment
 */
export async function initiateRazorpayCheckout({
  amountInRupees = 100,
  nurseryName = '',
  ownerName = '',
  phone = '',
  email = '',
  description = 'TreeBazzar Payment',
  notes = {},
  onSuccess,
  onError,
  onDismiss
}) {
  try {
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!keyId) {
      throw new Error('VITE_RAZORPAY_KEY_ID is not configured in environment variables.');
    }

    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      throw new Error('Failed to load Razorpay Checkout SDK. Please check your internet connection.');
    }

    const amountInPaise = Math.round(Number(amountInRupees) * 100);
    if (!Number.isFinite(amountInPaise) || amountInPaise < 100) {
      throw new Error('Minimum payable amount is ₹1 (100 paise).');
    }

    const order = await createRazorpayOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `tb_${Date.now()}`,
      notes: {
        nurseryName: nurseryName || 'TreeBazzar Nursery',
        ...notes
      }
    });

    let settled = false;

    const options = {
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'TreeBazzar',
      description,
      order_id: order.order_id,
      prefill: {
        name: ownerName || nurseryName || '',
        email: email || '',
        contact: phone || ''
      },
      notes: {
        nurseryName: nurseryName || '',
        ...notes
      },
      theme: {
        color: '#1E5631'
      },
      handler: async (response) => {
        try {
          const verified = await verifyRazorpayPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
          settled = true;
          if (onSuccess) onSuccess(verified);
        } catch (verifyErr) {
          settled = true;
          if (onError) onError(verifyErr);
        }
      },
      modal: {
        ondismiss: () => {
          if (!settled && onDismiss) {
            onDismiss();
          }
        }
      }
    };

    const rzp = new window.Razorpay(options);

    rzp.on('payment.failed', (failureResponse) => {
      const errDesc =
        failureResponse?.error?.description ||
        failureResponse?.error?.reason ||
        'Payment failed. Please try again.';
      settled = true;
      if (onError) onError(new Error(errDesc));
    });

    rzp.open();
  } catch (err) {
    if (onError) onError(err);
  }
}
