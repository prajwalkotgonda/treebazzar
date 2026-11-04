import React, { useState } from 'react';
import { CreditCard, Loader2, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { initiateRazorpayCheckout } from '../../services/razorpay';
import { useLanguage } from '../../context/LanguageContext';

export default function RazorpayPayButton({
  amount = 100,
  nurseryName = '',
  ownerName = '',
  phone = '',
  description = 'TreeBazzar Nursery Registration Fee',
  onSuccess,
  onError,
  className = '',
  buttonText,
  disabled = false
}) {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handlePayment = async () => {
    if (disabled || loading) return;
    setLoading(true);
    setErrorMessage(null);

    await initiateRazorpayCheckout({
      amountInRupees: amount,
      nurseryName,
      ownerName,
      phone,
      description,
      onSuccess: (result) => {
        setLoading(false);
        setPaymentSuccess(result);
        if (onSuccess) onSuccess(result);
      },
      onError: (err) => {
        setLoading(false);
        setErrorMessage(err.message || 'Payment failed');
        if (onError) onError(err);
      },
      onDismiss: () => {
        setLoading(false);
      }
    });
  };

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={handlePayment}
        disabled={disabled || loading}
        className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
          disabled || loading
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-[#1E5631] via-[#2E7D32] to-[#1E5631] hover:brightness-110 text-white shadow-emerald-950/20 active:scale-[0.99] cursor-pointer'
        } ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>{lang === 'mr' ? 'रेझरपे कनेक्ट होत आहे...' : 'Connecting to Razorpay...'}</span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 text-emerald-300" />
            <span>
              {buttonText || (lang === 'mr' ? `₹${amount} भरा आणि नोंदणी करा (Razorpay)` : `Pay ₹${amount} & Register via Razorpay`)}
            </span>
          </>
        )}
      </button>

      {errorMessage && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px]">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {paymentSuccess && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px]">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>
            {lang === 'mr' 
              ? `पेमेंट यशस्वी! आयडी: ${paymentSuccess.paymentId}` 
              : `Payment verified! ID: ${paymentSuccess.paymentId}`}
          </span>
        </div>
      )}
    </div>
  );
}
