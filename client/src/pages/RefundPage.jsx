import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { ArrowLeft, RefreshCw, CalendarOff, Receipt, Clock } from "lucide-react";
import Footer from "../layout/Footer";

export default function RefundPage() {
  const { darkMode } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased relative">
      
      {/* Ambient decorative blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-custom">
        <div className="w-full max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground uppercase">Back to Home</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 select-none pointer-events-none ${darkMode ? "bg-white" : "bg-black"}`}>
              <img 
                src={darkMode ? "/11oclock-ai-logo-black.png" : "/11oclock-ai-logo-white.png"} 
                alt="11 o'clock AI - Unified Content Publishing Engine Logo" 
                className="h-5 w-5 object-contain select-none pointer-events-none"
                draggable="false"
              />
            </div>
            <span className="font-bold tracking-tight text-sm text-foreground">11 o'clock Refund</span>
          </div>
          
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 space-y-12">
        
        {/* Intro */}
        <section className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Refund & Cancellation Policy</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Last Updated: August 2026. At 11 o'clock, we value customer satisfaction. This page outlines our conditions, processing times, and eligibility for subscription refunds and cancellations.
          </p>
        </section>

        {/* Core Rules */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-custom bg-card/10 space-y-2">
            <Clock className="w-5 h-5 text-primary" />
            <h4 className="font-bold text-xs">5 - 7 Days Processing</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">Approved refunds take approximately 5 to 7 business days to process and reflect in your original payment method.</p>
          </div>
          <div className="p-4 rounded-xl border border-custom bg-card/10 space-y-2">
            <Receipt className="w-5 h-5 text-primary" />
            <h4 className="font-bold text-xs">Usage Deductions</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">If you have consumed platform resources (like AI tokens/posts), a prorated amount is deducted from the refund.</p>
          </div>
          <div className="p-4 rounded-xl border border-custom bg-card/10 space-y-2">
            <CalendarOff className="w-5 h-5 text-primary" />
            <h4 className="font-bold text-xs">7-Day Hard Limit</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">Refund requests must be submitted within 7 days (1 week) of purchase. No refunds are available after this window.</p>
          </div>
        </section>

        {/* Detailed Sections */}
        <section className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-foreground">1. Subscription Cancellation</h3>
            <p>
              You can cancel your subscription at any time via your user dashboard. Upon cancellation, your premium plan benefits (such as active LinkedIn/Twitter scheduling and AI post generations) will remain active until the end of your current billing period. No further recurring charges will be made.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-foreground">2. Refund Eligibility & The 7-Day Window</h3>
            <p>
              We provide a conditional refund policy to protect users while preventing platform abuse:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li><strong>1-Week Limit:</strong> Refund requests must be initiated within 7 calendar days from the date of the subscription purchase or renewal. Once this 7-day window has expired, you are no longer eligible for a refund.</li>
              <li><strong>Prorated Resource Deductions:</strong> Because our platform consumes valuable external resources (such as LLM generation costs and server pipeline runtime) when you generate posts, we will deduct the cost of the resources you have consumed from the final refund amount. You will receive a partial refund reflecting the remaining unused balance of your subscription.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-foreground">3. Processing Timeline</h3>
            <p>
              Once a refund request is approved by our billing team, the transaction is processed through our payment gateway. It typically takes **5 to 7 business days** for the refunded amount to reflect in your bank account, credit card statement, or original payment method, depending on your banking institution.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-foreground">4. How to Request a Refund</h3>
            <p>
              To request a refund, please contact our support team at **support@11oclock.ai** (or visit our Contact page) within 7 days of purchase. Please include your registered account email, subscription date, and a brief explanation of why you are requesting a refund so we can process your request efficiently.
            </p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
