import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export function useRazorpayCheckout(getToken) {
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

  const handleSubscribe = async (planType) => {
    try {
      setLoadingPlan(planType);

      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) {
        alert('Razorpay SDK failed to load. Please check your connection.');
        return;
      }

      const token = await getToken();

      const orderRes = await fetch(`${API_URL}/api/subscription/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planType }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        const msg = orderData.error || 'Failed to create subscription.';
        const detail = orderData.details ? ` (${orderData.details})` : '';
        alert(msg + detail);
        return;
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        subscription_id: orderData.subscriptionId,
        name: "11 o'clock",
        description: `${planType === 'starter' ? 'Starter' : 'Pro'} Plan · Monthly`,
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${API_URL}/api/subscription/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
                planType,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              // Reload the dashboard so subscription state refreshes
              navigate(0);
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch {
            alert('Error verifying payment. Please contact support.');
          }
        },
        theme: { color: '#2563eb' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return { handleSubscribe, loadingPlan };
}
