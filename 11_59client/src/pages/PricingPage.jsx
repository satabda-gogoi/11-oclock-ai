import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PricingPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [plans, setPlans] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;
  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        if (!isLoaded || !isSignedIn) return;
        const token = await getToken();
        
        // Fetch current status
        const statusRes = await fetch(`${API_URL}/api/subscription/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const statusData = await statusRes.json();
        setCurrentStatus(statusData);

        // Init and fetch plans
        const plansRes = await fetch(`${API_URL}/api/subscription/plans`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const plansData = await plansRes.json();
        if (plansData.success) {
          setPlans(plansData.plans);
        }
      } catch (err) {
        console.error("Failed to load subscription data", err);
      } finally {
        setPageLoading(false);
      }
    };
    fetchInitData();
  }, [isLoaded, isSignedIn, getToken]);

  const handleSubscribe = async (planType) => {
    try {
      setLoadingPlan(planType);
      const res = await loadRazorpay();
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        return;
      }

      const token = await getToken();

      // Create subscription order on backend
      const orderRes = await fetch(`${API_URL}/api/subscription/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ planType })
      });
      
      const orderData = await orderRes.json();
      
      if (!orderData.success) {
        alert((orderData.error || 'Failed to create subscription.') + (orderData.details ? ` Details: ${orderData.details}` : ''));
        setLoadingPlan(null);
        return;
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        subscription_id: orderData.subscriptionId,
        name: "11 o'clock",
        description: `${planType === 'starter' ? 'Starter' : 'Pro'} Plan Subscription`,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyRes = await fetch(`${API_URL}/api/subscription/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
                planType
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              navigate('/workspace');
            } else {
              alert('Payment verification failed.');
            }
          } catch (err) {
            console.error(err);
            alert('Error verifying payment.');
          }
        },
        theme: {
          color: '#3B82F6',
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      
    } catch (err) {
      console.error(err);
      alert('Something went wrong during checkout.');
    } finally {
      setLoadingPlan(null);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // If user is admin or already active, they might just want to see status
  const isAdmin = currentStatus?.role === 'admin';
  const isActive = currentStatus?.subscriptionStatus === 'active';

  return (
    <div className="min-h-screen w-screen flex flex-col bg-background text-foreground antialiased">
      
      {/* Top Header */}
      <header className="h-16 border-b border-custom bg-card/10 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 select-none pointer-events-none ${darkMode ? "bg-white" : "bg-black"}`}>
            <img 
              src={darkMode ? "/logo_black.png" : "/logo_white.png"} 
              alt="11 o'clock" 
              className="h-5 w-5 object-contain select-none pointer-events-none"
              draggable="false"
            />
          </div>
          <span className="font-bold tracking-tight text-sm text-foreground">11 o'clock</span>
        </div>
        <button
          onClick={() => navigate('/workspace')}
          className="text-xs font-semibold text-muted-foreground hover:text-foreground border border-custom px-3 py-1.5 rounded-lg bg-card/50 hover:bg-muted transition-colors cursor-pointer"
        >
          ← Back to Workspace
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-3xl space-y-10">
          
          {/* Eyebrow + Headline */}
          <div className="text-center space-y-3">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
              11 o'clock · Pricing Plans
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Choose your workspace
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Unlock professional publishing engines, automated scheduling, and full platform workspace integration.
            </p>
            
            {(isAdmin || isActive) && (
              <div className="mt-4 inline-block px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-500 text-[11px] font-medium">
                ✓ You currently have {isAdmin ? 'Admin (Unlimited)' : 'Active Premium'} access.
              </div>
            )}
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Starter Plan */}
            <div className="p-6 rounded-2xl border border-custom bg-card/40 backdrop-blur-md flex flex-col gap-5 hover:border-primary/20 transition-all duration-300">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">Starter</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">₹{plans?.starter?.amount || 999}<span className="text-xs font-normal text-muted-foreground"> /mo</span></p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Perfect for individuals and small teams starting their content journey.
              </p>
              <div className="h-px w-full bg-border" />
              <ul className="space-y-3 flex-1">
                {['Standard AI Models', 'Limited Daily Chat Sessions', 'Standard Generation Queue', 'Email Support'].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground leading-tight">
                    <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe('starter')}
                disabled={loadingPlan || isAdmin || isActive}
                className="w-full py-2.5 text-xs font-semibold rounded-lg border border-custom bg-card/60 hover:bg-muted text-foreground transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingPlan === 'starter' ? <><Loader2 className="w-3 h-3 animate-spin" /> Processing...</> : (isAdmin || isActive) ? 'Already Active' : 'Subscribe to Starter'}
              </button>
            </div>

            {/* Pro Plan */}
            <div className="p-6 rounded-2xl border-2 border-primary/25 bg-primary/[0.03] backdrop-blur-md flex flex-col gap-5 hover:border-primary/45 transition-all duration-300 relative">
              <div className="absolute -top-2.5 left-6">
                <span className="text-[9px] font-bold font-mono tracking-wider uppercase bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full shadow-sm">
                  Most Popular
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <p className="text-[10px] font-mono tracking-widest uppercase text-primary">Pro</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">₹{plans?.pro?.amount || 2999}<span className="text-xs font-normal text-muted-foreground"> /mo</span></p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                For power creators and marketing agencies requiring absolute freedom.
              </p>
              <div className="h-px w-full bg-primary/15" />
              <ul className="space-y-3 flex-1">
                {['Standard AI Models', 'Unlimited Chat Sessions', 'Highest Generation Priority', 'Early Access to Premium Features'].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-foreground/80 leading-tight">
                    <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe('pro')}
                disabled={loadingPlan || isAdmin || isActive}
                className="w-full py-2.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-colors shadow-sm shadow-primary/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingPlan === 'pro' ? <><Loader2 className="w-3 h-3 animate-spin" /> Processing...</> : (isAdmin || isActive) ? 'Already Active' : 'Subscribe to Pro'}
              </button>
            </div>
            
          </div>

          {/* Bottom Trust Badge */}
          <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
            All subscriptions recur monthly. Upgrades apply instantly. Secure billing powered securely via Razorpay.
          </p>
          
        </div>
      </div>
    </div>
  );
}

