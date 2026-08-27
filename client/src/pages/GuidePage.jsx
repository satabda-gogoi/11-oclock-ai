import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { 
  Sparkles, 
  Zap, 
  Shield, 
  Globe, 
  MessageSquare, 
  Trash2, 
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function GuidePage() {
  const { darkMode } = useTheme();
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "twitter", label: "Twitter / X Setup" },
    { id: "linkedin", label: "LinkedIn Setup" },
    { id: "publishing", label: "Composing & Posting" },
    { id: "management", label: "Channel Management" },
    { id: "faq", label: "FAQ & Troubleshooting" }
  ];

  const handleScrollTo = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased relative">
      
      {/* Background Orbs */}
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
            <span className="font-bold tracking-tight text-sm text-foreground">11 o'clock Guide</span>
          </div>
          
          <div className="w-20"></div> {/* Spacer for alignment */}
        </div>
      </header>

      <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-10">
        
        {/* Sticky Sidebar Navigation */}
        <aside className="md:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-4">
            <div className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground px-3">
              Sections
            </div>
            <nav className="flex flex-col gap-1">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => handleScrollTo(sec.id)}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg border transition-all cursor-pointer font-medium ${
                    activeSection === sec.id
                      ? "bg-primary/10 border-primary/20 text-primary font-semibold"
                      : "bg-transparent border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 max-w-3xl space-y-16">
          
          {/* Overview */}
          <section id="overview" className="scroll-mt-24 space-y-4">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              User Connection & Publishing Guide
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Welcome to the 11 o'clock user documentation! This guide helps you securely link your social media profiles, customize tone options, and post content directly across professional networks.
            </p>

            <div className="p-4 rounded-xl border border-custom bg-card/20 space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-primary font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Seamless Distribution
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Eleven operates as a unified post engine. When you trigger a generation outline, we process and format spacing, tags, and spacing natively per channel, sending it straight to your live account.
              </p>
            </div>
          </section>

          {/* Twitter Setup */}
          <section id="twitter" className="scroll-mt-24 space-y-4">
            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded text-xs font-mono text-primary">1-Click</span>
              Twitter / X Connection
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Twitter integration is powered by secure 1-click **OAuth 2.0**. You do not need to manually configure API keys, purchase developer portal credits, or handle token lifetimes.
            </p>

            <div className="space-y-3">
              <h3 className="text-xs font-bold font-mono text-foreground uppercase">Connection Steps:</h3>
              <ol className="list-decimal pl-5 text-xs text-muted-foreground space-y-2">
                <li>In your dashboard sidebar, click <strong className="text-foreground">Connect</strong> next to Twitter/X app icon.</li>
                <li>You will be redirected securely to the official authorization portal on <strong className="text-foreground">X.com</strong>.</li>
                <li>Log in to your target account if required, and click <strong className="text-foreground">Authorize App</strong>.</li>
                <li>Once complete, X redirects back to your Eleven dashboard. Your profile name (e.g. <code className="text-primary">@username</code>) will appear.</li>
              </ol>
            </div>

            <div className="p-4 rounded-xl border border-blue-500/25 bg-blue-500/5 text-blue-400 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Zap className="w-4 h-4 flex-shrink-0" />
                Bundled Platform API Credits
              </div>
              <p className="text-xs text-blue-400/90 leading-relaxed">
                X API writes require paid developer plan tiers. 11 o'clock completely bundles these API costs inside your subscription. We pay for your post calls, saving you from purchasing Twitter developer packages separately.
              </p>
            </div>
          </section>

          {/* LinkedIn Setup */}
          <section id="linkedin" className="scroll-mt-24 space-y-4">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              LinkedIn Token Connection
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              LinkedIn connections currently use token-based credential parameters. <em>(1-click OAuth integration is coming in a future update)</em>.
            </p>

            <div className="space-y-3">
              <h3 className="text-xs font-bold font-mono text-foreground uppercase">Connection Steps:</h3>
              <ol className="list-decimal pl-5 text-xs text-muted-foreground space-y-2">
                <li>Click <strong className="text-foreground">Connect</strong> next to the LinkedIn app node.</li>
                <li>In the popup modal, enter your <strong className="text-foreground">Profile Handle</strong>, <strong className="text-foreground">Client ID</strong>, and <strong className="text-foreground">OAuth Access Token</strong> from your developer page.</li>
                <li>Click <strong className="text-foreground">Save Connection</strong> to register the credentials securely.</li>
              </ol>
            </div>
          </section>

          {/* Composing & Publishing */}
          <section id="publishing" className="scroll-mt-24 space-y-4">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Composing & Posting
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We do not save drafts. Your inputs are compiled into optimized post texts and sent directly to your connected channels.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-custom bg-card/10 space-y-2">
                <div className="text-[10px] font-mono text-primary font-bold">STEP 01</div>
                <h4 className="font-bold text-xs">Set Target</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">Select your target platform in the sidebar (LinkedIn or Twitter) to load environment configurations.</p>
              </div>
              <div className="p-4 rounded-xl border border-custom bg-card/10 space-y-2">
                <div className="text-[10px] font-mono text-primary font-bold">STEP 02</div>
                <h4 className="font-bold text-xs">Prompt Engine</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">Input conceptual outlines, upload image assets, or paste raw notes inside the Prompt Dock dock.</p>
              </div>
              <div className="p-4 rounded-xl border border-custom bg-card/10 space-y-2">
                <div className="text-[10px] font-mono text-primary font-bold">STEP 03</div>
                <h4 className="font-bold text-xs">Direct Post</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">Review spacing hooks and limits. Hit dispatch to post the content instantly to your live profile.</p>
              </div>
            </div>
          </section>

          {/* Channel Management */}
          <section id="management" className="scroll-mt-24 space-y-4">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Channel Management
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You can easily delete connection credentials or purge old chats from the sidebar drawer:
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-custom bg-card/25 space-y-2">
                <h4 className="font-semibold text-xs text-foreground flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-red-400" />
                  Disconnect Account Integrations
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Hover your cursor over the active account channel list in the sidebar. Click the red **Trash** icon that appears and confirm. This completely removes token payloads from our databases. You can re-authenticate anytime.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-custom bg-card/25 space-y-2">
                <h4 className="font-semibold text-xs text-foreground flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-red-400" />
                  Purge History Logs
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  To remove past generated items, hover over a log item in the sidebar **History** drawer, and click the revealable trash icon to instantly drop the MongoDB reference.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ & Troubleshooting */}
          <section id="faq" className="scroll-mt-24 space-y-4">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              FAQ & Troubleshooting
            </h2>

            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-foreground">Q: Why did Twitter/X return "Something went wrong" when I clicked Connect?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A: This occurs if there is a session mismatch or cached cookies inside your browser from a previous login session. Simply log out of Twitter.com in your browser, return to Horizon, and click Connect again.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-xs text-foreground">Q: How do Token expirations work?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A: Twitter access tokens expire every 2 hours. Horizon AI automatically uses secure refresh tokens to fetch updated credentials in the background before starting dispatch workflows, meaning you never have to re-login manually.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-xs text-foreground">Q: Do I need separate accounts or API keys for posting?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A: No. Billing limits and post API calls are fully managed on our side and included in your subscription.
                </p>
              </div>
            </div>
          </section>

        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-custom py-8 w-full bg-card/20 mt-20">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">11 o'clock</span>
            <span>© 2026. Secure publishing guide index.</span>
          </div>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
