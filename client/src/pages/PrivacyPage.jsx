import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Footer from "../layout/Footer";
import { ArrowLeft, Shield, Lock, Eye, Database } from "lucide-react";

export default function PrivacyPage() {
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
                src={darkMode ? "/logo_black.png" : "/logo_white.png"} 
                alt="11 o'clock" 
                className="h-5 w-5 object-contain select-none pointer-events-none"
                draggable="false"
              />
            </div>
            <span className="font-bold tracking-tight text-sm text-foreground">11 o'clock Privacy</span>
          </div>
          
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 space-y-12">
        
        {/* Intro */}
        <section className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Last Updated: August 2026. This Privacy Policy describes how 11 o'clock ("we", "us", or "our") collects, uses, and safeguards your personal data and connected channel credentials when you use our platform.
          </p>
        </section>

        {/* Core Principles */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-custom bg-card/10 space-y-2">
            <Lock className="w-5 h-5 text-primary" />
            <h4 className="font-bold text-xs">AES-256 Encryption</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">All active credentials and tokens are secured via industrial-grade AES-256-GCM encryption before storing.</p>
          </div>
          <div className="p-4 rounded-xl border border-custom bg-card/10 space-y-2">
            <Eye className="w-5 h-5 text-primary" />
            <h4 className="font-bold text-xs">No Data Harvesting</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">We only inspect profile names for UI mapping. We do not read, scrape, or sell your social feed histories.</p>
          </div>
          <div className="p-4 rounded-xl border border-custom bg-card/10 space-y-2">
            <Database className="w-5 h-5 text-primary" />
            <h4 className="font-bold text-xs">Complete Deletion</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">Disconnecting a channel immediately wipes all associated access tokens from our live databases.</p>
          </div>
        </section>

        {/* Detailed Sections */}
        <section className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-foreground">1. Data We Collect</h3>
            <p>
              We collect minimal data required to authorize your workspace and publish posts:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li><strong>Authentication Data:</strong> Managed securely by Clerk. This includes your email, name, and user ID.</li>
              <li><strong>Integration Credentials:</strong> Access tokens and refresh tokens authorized via OAuth (X/Twitter) or provided manually (LinkedIn).</li>
              <li><strong>Workspace History:</strong> Draft outlines, configurations, and generated post text which you create in your Prompt Dock.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-foreground">2. Security of Connection Keys</h3>
            <p>
              Your integration credentials represent your identity on external platforms. We secure them with strict cryptographic barriers:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li>Every token is encrypted in-transit and stored at-rest using random initialization vectors (IVs) and authentication tags (GCM mode).</li>
              <li>Decryption occurs strictly in-memory during active publishing pipelines and is immediately dropped. Keys are never logged or exposed in standard API queries.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-foreground">3. Processing Payments</h3>
            <p>
              All premium billing transactions are managed securely by **Razorpay**. 11 o'clock does not store or process credit card numbers, CVVs, or cardholder banking credentials on our database servers. Transactions fall under Razorpay’s security and encryption protocols.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-foreground">4. Third-Party Integrations</h3>
            <p>
              By connecting your Twitter or LinkedIn channels, you instruct 11 o'clock to share your compiled post text with the respective platforms (using their official APIs) for publishing on your behalf. These actions are subject to the privacy settings and policies of LinkedIn and X.com.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-foreground">5. Your Control & Account Rights</h3>
            <p>
              You maintain complete ownership of your workspace:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li>You can delete your chat logs permanently from our database using the History Panel controls.</li>
              <li>You can disconnect any social network channel instantly using the active apps list, which immediately drops all access tokens.</li>
            </ul>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
