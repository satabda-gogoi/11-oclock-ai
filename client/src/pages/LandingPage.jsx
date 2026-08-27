import { useState, useEffect } from "react";
import { SignInButton, SignUpButton, useAuth } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Footer from "../layout/Footer";
import { Sparkles, Zap, Shield, Calendar, Layers, Globe, MessageSquare, ArrowRight, CheckCircle2, ChevronDown } from "lucide-react";

export default function LandingPage() {
  const { darkMode, setDarkMode } = useTheme();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [mockupTab, setMockupTab] = useState("linkedin");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const faqs = [
    {
      q: "Which platforms does 11 o'clock support?",
      a: "11 o'clock natively supports LinkedIn and Twitter/X. You can connect your accounts and publish directly from the workspace console."
    },
    {
      q: "How does the cross-platform optimization work?",
      a: "When you write a prompt, our AI engine automatically adapts the formatting, length, hashtags, and hooks to match the culture and guidelines of the specific platform you select."
    },
    {
      q: "Is my credential data secure?",
      a: "Yes. All integration tokens and profile credentials are encrypted at rest and in transit. We prioritize secure authentication layers using modern industry standards."
    },
    {
      q: "Can I manage multiple channels simultaneously?",
      a: "Absolutely. You can switch between active channels (e.g. LinkedIn Hub, Twitter Desk) on the fly and manage independent publishing history for each."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased relative isolate overflow-hidden">

      {/* ── HERO BACKGROUND DECORATION ─────────────────────────── */}
      {/* Signature motif: "Broadcast" — content goes up from one source and pings out to
          every channel, like a radar sweep. Rebuilt for performance: every animated element
          here only ever animates `transform` and/or `opacity`, so the browser compositor
          handles it on the GPU without re-painting or re-layouting each frame. No animated
          SVG strokes, no animated filters/backdrop-blur, no blend-mode layers — those were
          the expensive parts of the previous version. Static layers (grid, mesh, dots) are
          painted once and never touched again. */}
      <style>{`
        @keyframes hzBlobA {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(-3%, 2%, 0); }
        }
        @keyframes hzBlobB {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(3%, -2%, 0); }
        }
        @keyframes hzPing {
          0% { transform: scale(0.35); opacity: 0.5; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes hzBob {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -6px, 0); }
        }
        @keyframes hzPulse {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 0.85; }
        }
        .horizon-anim { will-change: transform; }
        @media (prefers-reduced-motion: reduce) {
          .horizon-anim { animation: none !important; will-change: auto; }
        }
      `}</style>

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '780px',
          zIndex: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          contain: 'strict',
        }}
      >
        {/* Static mesh gradient base — painted once */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(ellipse 620px 420px at 16% 10%, rgba(99,102,241,0.24) 0%, transparent 70%),
              radial-gradient(ellipse 680px 460px at 86% 6%, rgba(34,211,238,0.20) 0%, transparent 70%),
              radial-gradient(ellipse 900px 520px at 50% -6%, rgba(37,99,235,0.30) 0%, transparent 65%)
            `,
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
          }}
        />

        {/* Two soft aurora blobs — blur is set once (static), only transform animates */}
        <div
          className="horizon-anim"
          style={{
            position: 'absolute', top: '-140px', left: '8%', width: '460px', height: '460px',
            borderRadius: '50%', background: 'rgba(37,99,235,0.28)', filter: 'blur(70px)',
            animation: 'hzBlobA 16s ease-in-out infinite',
          }}
        />
        <div
          className="horizon-anim"
          style={{
            position: 'absolute', top: '-100px', right: '6%', width: '420px', height: '420px',
            borderRadius: '50%', background: 'rgba(34,211,238,0.20)', filter: 'blur(70px)',
            animation: 'hzBlobB 18s ease-in-out infinite',
          }}
        />

        {/* Fine structural grid — static */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(96,150,255,0.13) 1px, transparent 1px),
              linear-gradient(90deg, rgba(96,150,255,0.13) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
            WebkitMaskImage: 'radial-gradient(ellipse 85% 60% at 50% 0%, black 20%, transparent 100%)',
            maskImage: 'radial-gradient(ellipse 85% 60% at 50% 0%, black 20%, transparent 100%)',
          }}
        />

        {/* Crosshair accent — blueprint-style tick marks instead of plain dots, static */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36'%3E%3Cpath d='M18 12v12M12 18h12' stroke='rgba(120,165,255,0.4)' stroke-width='1' stroke-linecap='round'/%3E%3C/svg%3E\")",
            backgroundSize: '36px 36px',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 50% at 50% 4%, black 25%, transparent 100%)',
            maskImage: 'radial-gradient(ellipse 70% 50% at 50% 4%, black 25%, transparent 100%)',
          }}
        />

        {/* Broadcast source + radar pings — only transform/opacity animate */}
        <div style={{ position: 'absolute', top: '86px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0 }}>
          <div style={{ position: 'absolute', top: -5, left: -5, width: 10, height: 10, borderRadius: '50%', background: 'rgba(37,99,235,0.95)', boxShadow: '0 0 16px 4px rgba(37,99,235,0.45)' }} />
          {[0, 1.3, 2.6].map((delay) => (
            <div
              key={delay}
              className="horizon-anim"
              style={{
                position: 'absolute', top: -70, left: -70, width: 140, height: 140,
                borderRadius: '50%', border: '1px solid rgba(96,150,255,0.55)',
                animation: `hzPing 3.9s ease-out ${delay}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Channel nodes the broadcast reaches — static position, one shared gentle bob each */}
        {[
          { label: 'in', top: 232, left: '20%', color: 'rgba(37,99,235,0.9)', bg: 'rgba(37,99,235,0.10)', border: 'rgba(37,99,235,0.25)', delay: '0s' },
          { label: '𝕏', top: 268, left: '78%', color: 'rgba(14,150,170,0.95)', bg: 'rgba(34,211,238,0.10)', border: 'rgba(34,211,238,0.25)', delay: '0.6s' },
        ].map((chip) => (
          <div
            key={chip.label}
            className="horizon-anim"
            style={{
              position: 'absolute', top: chip.top, left: chip.left,
              padding: '6px 10px', borderRadius: '999px',
              background: chip.bg, border: `1px solid ${chip.border}`,
              fontSize: '10px', fontFamily: 'monospace', fontWeight: 700, color: chip.color,
              animation: `hzBob 6s ease-in-out ${chip.delay} infinite`,
            }}
          >
            {chip.label}
          </div>
        ))}
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-custom">
        <div className="w-full max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          
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
            <span className="text-[10px] font-mono text-muted-foreground bg-muted border border-custom px-2 py-0.5 rounded">
              v1 eleven
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#capabilities" className="hover:text-foreground transition-colors">Capabilities</a>
            <a href="#workflow" className="hover:text-foreground transition-colors">Workflow</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
            <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/guide" className="hover:text-foreground transition-colors">Guide</Link>
          </nav>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors cursor-pointer border border-transparent hover:border-custom"
              aria-label="Toggle Theme"
            >
              {darkMode ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.22 4.22l1.58 1.58m12.42 12.42l1.58 1.58M3 12h2.25m13.5 0H21M4.22 19.78l1.58-1.58m12.42-12.42l1.58-1.58M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 12.83A9.54 9.54 0 0112 21.75c-5.28 0-9.5-4.22-9.5-9.5a9.54 9.54 0 0112.58-9.04 7.46 7.46 0 001.92 6.13 7.46 7.46 0 006.25 3.49z" /></svg>
              )}
            </button>

            {isSignedIn ? (
              <button 
                onClick={() => navigate("/workspace")} 
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-foreground text-background hover:opacity-90 cursor-pointer shadow transition-all"
              >
                Go to Console
              </button>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="hidden sm:block text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors px-2">
                    Sign In
                  </button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <button className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer shadow transition-all">
                    Get Started
                  </button>
                </SignUpButton>
              </>
            )}

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-muted-foreground border border-custom rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-custom bg-card/90 backdrop-blur-lg px-6 py-4 space-y-3">
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground">Features</a>
          <a href="#capabilities" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground">Capabilities</a>
          <a href="#workflow" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground">Workflow</a>
          <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground">FAQ</a>
          <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
          <Link to="/guide" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground">Guide</Link>
        </div>
      )}

      {/* HERO SECTION */}
      <main className="relative flex-1 w-full max-w-6xl mx-auto px-6 pt-20 sm:pt-28 pb-20 z-10 space-y-32">
        
        {/* HERO HEADER */}
        <section className="flex flex-col items-center justify-center text-center space-y-6">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-[10px] font-mono font-bold tracking-wider text-primary border border-primary/25 uppercase"
            style={{ boxShadow: '0 0 0 1px rgba(37,99,235,0.05), 0 4px 24px -6px rgba(37,99,235,0.35)' }}
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            11 o'clock is Live
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight max-w-3xl leading-tight">
            Unified Content Engine for Professional Publishing
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Write, optimize, and schedule high-performing social copy across your professional channels. Build presence without context switching.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
            {isSignedIn ? (
              <button 
                onClick={() => navigate("/workspace")} 
                className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/95 transition-all cursor-pointer shadow"
              >
                Go to Workspace Console
              </button>
            ) : (
              <SignUpButton mode="modal">
                <button className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/95 transition-all cursor-pointer shadow">
                  Start Writing Free
                </button>
              </SignUpButton>
            )}
            <a 
              href="#workflow" 
              className="w-full sm:w-auto px-6 py-3 text-xs font-semibold bg-card border border-custom hover:bg-muted rounded-lg transition-all text-center"
            >
              See how it works
            </a>
          </div>
        </section>

        {/* INTERACTIVE WORKSPACE MOCKUP PREVIEW */}
        <div className="relative w-full max-w-4xl mx-auto">
          {/* static gradient frame, blur set once; only opacity breathes (cheap, GPU-composited) */}
          <div
            aria-hidden="true"
            className="horizon-anim"
            style={{
              position: 'absolute',
              inset: '-1px',
              borderRadius: '1.15rem',
              background: 'linear-gradient(135deg, rgba(37,99,235,0.5), rgba(34,211,238,0.25), rgba(99,102,241,0.5))',
              filter: 'blur(4px)',
              animation: 'hzPulse 5s ease-in-out infinite',
              zIndex: 0,
            }}
          />
          <section className="relative w-full rounded-2xl border border-custom bg-card/30 backdrop-blur-md shadow-2xl p-5 sm:p-7 space-y-6" style={{ zIndex: 1 }}>
            <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-mono tracking-widest uppercase font-bold">
              Interactive Simulator
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Input Prompt Dock simulator */}
              <div className="md:col-span-1 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">Operational Input</div>
                  <div className="p-4 rounded-xl bg-background border border-custom space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                      <span className="text-[11px] font-mono text-foreground font-semibold">Prompt Dock</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      "Pivot our B2B SaaS from MVP to Production with multi-channel support."
                    </p>
                  </div>
                </div>

                {/* Platform selection tabs */}
                <div className="space-y-2">
                  <div className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">Select Platform Target</div>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { id: "linkedin", label: "LinkedIn Workspace" },
                      { id: "twitter", label: "Twitter / X Feed" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setMockupTab(tab.id)}
                        className={`w-full text-left px-3 py-2 text-xs rounded-lg border transition-all cursor-pointer font-medium ${
                          mockupTab === tab.id
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-background/40 border-custom text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generated Output Preview canvas */}
              <div className="md:col-span-2 flex flex-col bg-background rounded-xl border border-custom overflow-hidden min-h-[220px]">
                <div className="px-4 py-2 bg-card/25 border-b border-custom/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Optimized Post Content</span>
                  </div>
                  <span className="text-[9px] font-mono text-primary font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                    Compiled
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between text-left">
                  {mockupTab === "linkedin" && (
                    <div className="space-y-3 text-xs leading-relaxed text-foreground/90 font-sans select-text">
                      <p>🚀 Big milestone today: We are officially graduating our SaaS from MVP to a full production-ready workspace!</p>
                      <p>What started as a single-channel experiment has evolved into a complete multi-platform hub. Starting today, you can orchestrate your LinkedIn and Twitter posts directly from one secure console.</p>
                      <p>Thank you to our early adopters for the feedback. Onwards! 📈</p>
                      <p className="text-primary">#SaaS #Launch #Productivity #Founders</p>
                    </div>
                  )}

                  {mockupTab === "twitter" && (
                    <div className="space-y-3 text-xs leading-relaxed text-foreground/90 font-sans select-text">
                      <p className="border-l-2 border-primary/30 pl-3">1/ We're officially out of beta! Eleven is graduating from MVP to a full production-ready workspace. 🚀<br/><br/>Here is what is new in v1.2:</p>
                      <p className="border-l-2 border-primary/30 pl-3">2/ Multi-Platform support is live. Link your LinkedIn and Twitter/X channels to compile and distribute content from a single secure dock.</p>
                      <p className="border-l-2 border-primary/30 pl-3">3/ Our optimized generation engines tailor tags, hooks, and spacing natively for each feed. Try it out free today!</p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-custom/60 flex items-center justify-between text-[11px] text-muted-foreground mt-4">
                    <span>Character count: {mockupTab === "linkedin" ? 346 : 402}</span>
                    <span className="font-mono text-primary font-semibold">Copy Content</span>
                  </div>
                </div>
              </div>

            </div>
          </section>
        </div>

        {/* LOGO TICKER */}
        <section className="border-y border-custom py-6 text-center">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-4">Supported Social Channels</p>
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-16 text-sm font-semibold tracking-widest text-foreground/50 uppercase font-mono">
            <span>LinkedIn</span>
            <span>Twitter / X</span>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="space-y-12">
          <div className="text-center space-y-2">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary font-bold">Two Modes of Generation</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Tailored to your content cadence</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1 */}
            <div className="p-6 rounded-2xl border border-custom bg-card/40 flex flex-col gap-4 hover:border-primary/20 transition-all duration-300">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Direct Instant Generation</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Provide a brief prompt, rough copy paste, or basic conceptual thought. Eleven instantly transforms it into professional, clean paragraphs optimized for reading time and post formatting.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl border border-custom bg-card/40 flex flex-col gap-4 hover:border-primary/20 transition-all duration-300">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Workspace Platform Channels</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect multiple active channels like LinkedIn or Twitter. Keep your feeds separate, adapt styles dynamically based on the native target feed, and stay organized.
              </p>
            </div>

          </div>
        </section>

        {/* CORE CAPABILITIES */}
        <section id="capabilities" className="space-y-12">
          <div className="text-center space-y-2">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary font-bold">Platform Capabilities</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Everything you need to publish</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="p-5 rounded-xl border border-custom bg-card/20 space-y-3">
              <Globe className="w-5 h-5 text-primary" />
              <h4 className="font-bold text-sm">Omni-Channel Sync</h4>
              <p className="text-xs text-muted-foreground">Switch targets instantly. Format tags, media, and copy structures natively per platform guidelines.</p>
            </div>

            <div className="p-5 rounded-xl border border-custom bg-card/20 space-y-3">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h4 className="font-bold text-sm">Interactive Prompt Dock</h4>
              <p className="text-xs text-muted-foreground">Attach images, copy scripts, or context files. Eleven compiles details to render highly precise posts.</p>
            </div>

            <div className="p-5 rounded-xl border border-custom bg-card/20 space-y-3">
              <Shield className="w-5 h-5 text-primary" />
              <h4 className="font-bold text-sm">Secure Authentication</h4>
              <p className="text-xs text-muted-foreground">Modern OAuth security layers to keep channel tokens safe. 11 o'clock does not inspect or store personal keys.</p>
            </div>

          </div>
        </section>

        {/* WORKFLOW 3-STEPS */}
        <section id="workflow" className="space-y-12">
          <div className="text-center space-y-2">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary font-bold">Operational Workflow</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Publish in three simple steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-10 w-10 rounded-full border-2 border-primary flex items-center justify-center text-xs font-mono font-bold text-primary bg-background">
                01
              </div>
              <h4 className="font-bold text-sm">Connect Channel</h4>
              <p className="text-xs text-muted-foreground max-w-xs">
                Activate your LinkedIn or Twitter channel integrations securely via Clerk settings.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-10 w-10 rounded-full border-2 border-primary flex items-center justify-center text-xs font-mono font-bold text-primary bg-background">
                02
              </div>
              <h4 className="font-bold text-sm">Submit Outline</h4>
              <p className="text-xs text-muted-foreground max-w-xs">
                Provide instructions inside the prompt deck. Compile files or script directions easily.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-10 w-10 rounded-full border-2 border-primary flex items-center justify-center text-xs font-mono font-bold text-primary bg-background">
                03
              </div>
              <h4 className="font-bold text-sm">Optimize & Publish</h4>
              <p className="text-xs text-muted-foreground max-w-xs">
                Verify reading times, click copy to transfer content, or dispatch direct publish calls natively.
              </p>
            </div>

          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="space-y-12 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary font-bold">Common Questions</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="border border-custom bg-card/10 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${activeFaq === idx ? "rotate-180" : ""}`} />
                </button>
                {activeFaq === idx && (
                  <div className="p-5 pt-0 text-xs text-muted-foreground leading-relaxed border-t border-custom/40 bg-card/5">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA BOTTOM BANNER */}
        <section className="p-8 rounded-2xl border border-primary/20 bg-primary/[0.02] text-center space-y-6">
          <h3 className="text-2xl font-bold text-foreground">Ready to scale your reach?</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Get instant workspace setup. Link channels, run optimization pipelines, and publish posts in seconds.
          </p>
          <div>
            {isSignedIn ? (
              <button 
                onClick={() => navigate("/workspace")} 
                className="px-6 py-3 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/95 transition-all shadow cursor-pointer"
              >
                Go to Workspace Console
              </button>
            ) : (
              <SignUpButton mode="modal">
                <button className="px-6 py-3 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/95 transition-all shadow cursor-pointer">
                  Start Writing Now
                </button>
              </SignUpButton>
            )}
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}