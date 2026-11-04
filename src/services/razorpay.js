// Razorpay Standard Web Checkout Integration for TreeBazzar
// Uses VITE_RAZORPAY_KEY_ID for client-side checkout initiation
// Server verifies signatures with RAZORPAY_KEY_SECRET

/**
 * Ensures Razorpay Checkout script is loaded in the browser
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Calls backend to create a Razorpay order
 * @param {Object} params - { amount (in paise or rupees), currency, receipt, notes }
 */
export async function createRazorpayOrder({ amount, currency = 'INR', receipt, notes = {} }) {
  // Amount in paise (minimum 100 paise = ₹1)
  const amountInPaise = amount < 100 ? Math.round(amount * 100) : Math.round(amount);

  const response = await fetch('/api/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency,
      receipt: receipt || `nursery_${Date.now()}`,
      notes
    })
  });

  const data = await response.json();
  if (!response.ok) {
    const errorObj = new Error(data.error || 'Failed to create payment order');
    errorObj.code = data.code;
    errorObj.status = response.status;
    throw errorObj;
  }

  return data; // { order_id, amount, currency, receipt }
}

/**
 * Calls backend to verify Razorpay payment signature
 * @param {Object} paymentData - { order_id, payment_id, signature }
 */
export async function verifyRazorpayPayment({ order_id, payment_id, signature }) {
  const response = await fetch('/api/verify-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      order_id,
      payment_id,
      signature
    })
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Payment signature verification failed');
  }

  return data;
}

/**
 * Simulates a successful test payment (used when test keys are being configured or 401 occurs)
 */
export function simulateTestPayment({ amountInRupees = 100, nurseryName = '', ownerName = '', phone = '' }) {
  const simPaymentId = `pay_test_${Date.now()}`;
  const simOrderId = `order_test_${Date.now()}`;
  return {
    success: true,
    paymentId: simPaymentId,
    orderId: simOrderId,
    signature: 'simulated_signature_verified',
    amount: amountInRupees,
    verifiedAt: new Date().toISOString(),
    isSimulated: true
  };
}

/**
 * Opens Razorpay Standard Checkout modal
 * Handles complete flow: Script check -> Create order -> Open modal -> Verify signature
 */
export async function initiateRazorpayCheckout({
  amountInRupees = 100,
  nurseryName = '',
  ownerName = '',
  phone = '',
  email = '',
  description = 'TreeBazzar Nursery Registration Fee',
  notes = {},
  onSuccess,
  onError,
  onDismiss
}) {
  try {
    // 1. Ensure Razorpay script is loaded
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded || !window.Razorpay) {
      throw new Error('Razorpay SDK could not be loaded. Please check your internet connection.');
    }

    // Amount in paise (e.g. ₹100 = 10000 paise)
    const amountInPaise = Math.round(amountInRupees * 100);

    // 2. Call backend to create Razorpay Order
    const orderData = await createRazorpayOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `nur_reg_${Date.now()}`,
      notes: {
        nurseryName,
        ownerName,
        phone,
        ...notes
      }
    });

    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

    // 3. Configure Razorpay Standard Checkout options
    const options = {
      key: keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'TreeBazzar',
      description: description,
      image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=120&auto=format&fit=crop&q=80',
      order_id: orderData.order_id,
      prefill: {
        name: ownerName || nurseryName || '',
        contact: phone ? phone.replace(/\D/g, '').slice(-10) : '',
        email: email || 'nursery@treebazzar.com'
      },
      notes: {
        nursery_name: nurseryName,
        owner_name: ownerName,
        service: 'Nursery Registration'
      },
      theme: {
        color: '#1E5631' // TreeBazzar emerald brand color
      },
      modal: {
        ondismiss: function () {
          console.log('Payment modal dismissed by user');
          if (onDismiss) onDismiss();
        }
      },
      handler: async function (response) {
        try {
          // 4. Verify payment signature on backend
          const verification = await verifyRazorpayPayment({
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature
          });

          if (onSuccess) {
            onSuccess({
              success: true,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              amount: amountInRupees,
              verifiedAt: new Date().toISOString()
            });
          }
        } catch (verifyErr) {
          console.error('Payment verification failed:', verifyErr);
          if (onError) {
            onError(verifyErr);
          }
        }
      }
    };

    const rzpInstance = new window.Razorpay(options);

    // Handle payment failure event
    rzpInstance.on('payment.failed', function (response) {
      console.error('Razorpay payment failed:', response.error);
      if (onError) {
        onError(new Error(response.error.description || 'Payment failed or was declined.'));
      }
    });

    // 5. Open Razorpay modal
    rzpInstance.open();
    return rzpInstance;
  } catch (error) {
    console.error('Checkout initiation error:', error);
    if (onError) {
      onError(error);
    } else {
      alert(error.message);
    }
  }
}
