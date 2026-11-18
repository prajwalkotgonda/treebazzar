// Re-exporting PayU services for smooth backward compatibility
export {
  initiatePayUCheckout as initiateRazorpayCheckout,
  simulatePayUTestPayment as simulateTestPayment,
  createPayUPaymentOrder as createRazorpayOrder,
  verifyPayUPayment as verifyRazorpayPayment,
  loadPayUScript as loadRazorpayScript
} from './payu.js';
