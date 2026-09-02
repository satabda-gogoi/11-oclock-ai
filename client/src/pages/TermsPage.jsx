import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { ArrowLeft, Scale, ShieldAlert, Info, AlertTriangle } from "lucide-react";
import Footer from "../layout/Footer";

export default function TermsPage() {
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
            <span className="font-bold tracking-tight text-sm text-foreground">11 o'clock Terms</span>
          </div>
          
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 space-y-12">
        
        {/* Intro */}
        <section className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Terms & Conditions</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Last Updated: August 2026. Please read these Terms & Conditions ("Terms") carefully before using the 11 o'clock platform. By accessing or using our services, you agree to be bound by these Terms.
          </p>
        </section>

        {/* Pillars */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-custom bg-card/10 space-y-2">
            <Scale className="w-5 h-5 text-primary" />
            <h4 className="font-bold text-xs">Responsible Use</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">You agree to use our automation features in compliance with LinkedIn and X (Twitter) policies.</p>
          </div>
          <div className="p-4 rounded-xl border border-custom bg-card/10 space-y-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <h4 className="font-bold text-xs">Credential Safety</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">You are responsible for the confidentiality of authorization tokens generated for your connected accounts.</p>
          </div>
          <div className="p-4 rounded-xl border border-custom bg-card/10 space-y-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            <h4 className="font-bold text-xs">No Spamming</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">We strictly prohibit automated bulk spamming or posting malicious content using our scheduling tools.</p>
          </div>
        </section>

        {/* Detailed Sections */}
        <section className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-foreground">1. Acceptance of Terms</h3>
            <p>
              By creating an account through Clerk and connecting your social profiles, you consent to these Terms and our Privacy Policy. If you do not agree, you must immediately terminate use of our services and disconnect your integrations.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-foreground">2. Account Registration and Security</h3>
            <p>
              Your login credentials are managed securely by Clerk. You must provide accurate, current, and complete information. You are solely responsible for all activities occurring under your account and for taking reasonable security measures to protect your credentials.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-foreground">3. Social Integration and API Usage</h3>
            <p>
              Our platform allows you to connect external accounts (LinkedIn and Twitter/X) and publish content using official API workflows. You represent and warrant that you hold all rights and permissions necessary to connect these profiles and publish content on them. We are not liable for any account suspension, throttling, or actions taken by third-party platforms in response to your posted content.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-foreground">4. Prohibited Content and Conduct</h3>
            <p>
              You agree not to use 11 o'clock to schedule or publish:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li>Spam, automated scam content, or deceptively repetitive messaging.</li>
              <li>Hate speech, harassment, threats, or explicit/harmful media.</li>
              <li>Content that violates copyright, trademark, or intellectual property rights.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-foreground">5. Service Fees, Subscriptions, and Cancellation</h3>
            <p>
              Premium features (AI content generation, active channel scheduling) require an active paid subscription processed securely via Razorpay. Subscriptions are billed on a recurring cycle. You may cancel your subscription at any time through the billing dashboard. Upon cancellation, your premium features will remain active until the end of the current billing cycle.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-foreground">6. Limitation of Liability</h3>
            <p>
              To the maximum extent permitted by law, 11 o'clock is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages (including loss of profile reputation, account suspension, data loss, or server downtime) arising from your use of the platform.
            </p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
