import { useState, useEffect, useRef } from "react";
import { SignInButton, SignUpButton, useAuth } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Footer from "../layout/Footer";
import { Sparkles, Zap, Shield, Calendar, Layers, Globe, MessageSquare, ArrowRight, CheckCircle2, ChevronDown, Menu, X } from "lucide-react";
import * as THREE from "three";

export default function LandingPage() {
  const { darkMode, setDarkMode } = useTheme();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [mockupTab, setMockupTab] = useState("linkedin");

  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    
    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8.5;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Create clock geometry groups
    const clockGroup = new THREE.Group();
    scene.add(clockGroup);

    // Dynamic color selection based on theme mode
    const getThemeColors = () => {
      return darkMode ? {
        dial: 0x334155,       // Slate 700
        glow: 0x3b82f6,       // Primary Blue
        hands: 0xf8fafc,      // Slate 50
        particles: 0x64748b,  // Slate 500
        linkedin: 0x0077b5,   // LinkedIn Blue
        twitter: 0x00aeef     // Twitter Cyan
      } : {
        dial: 0xcbced4,       // Light Slate
        glow: 0x2563eb,       // Primary Dark Blue
        hands: 0x0f172a,      // Slate 900
        particles: 0x94a3b8,  // Slate 400
        linkedin: 0x0a66c2,
        twitter: 0x1d9bf0
      };
    };

    let colors = getThemeColors();

    // 4a. Outer Dial Ring
    const dialGeom = new THREE.TorusGeometry(2.5, 0.03, 16, 100);
    const dialMat = new THREE.MeshBasicMaterial({ color: colors.dial, wireframe: true });
    const dial = new THREE.Mesh(dialGeom, dialMat);
    clockGroup.add(dial);

    // 4b. Inner ticking ring
    const innerRingGeom = new THREE.TorusGeometry(2.1, 0.015, 8, 80);
    const innerRingMat = new THREE.MeshBasicMaterial({ color: colors.glow, transparent: true, opacity: 0.4 });
    const innerRing = new THREE.Mesh(innerRingGeom, innerRingMat);
    clockGroup.add(innerRing);

    // 4c. Hour Hand (pointing to 11 o'clock: 150 degrees, or 5/6 * Math.PI)
    const hourHandGeom = new THREE.BoxGeometry(0.12, 1.4, 0.12);
    hourHandGeom.translate(0, 0.7, 0);
    const hourHandMat = new THREE.MeshBasicMaterial({ color: colors.hands });
    const hourHand = new THREE.Mesh(hourHandGeom, hourHandMat);
    hourHand.rotation.z = (5 / 6) * Math.PI; // 11 o'clock position
    clockGroup.add(hourHand);

    // 4d. Minute Hand (pointing to 12 o'clock: Math.PI)
    const minHandGeom = new THREE.BoxGeometry(0.08, 1.9, 0.08);
    minHandGeom.translate(0, 0.95, 0);
    const minHandMat = new THREE.MeshBasicMaterial({ color: colors.glow });
    const minHand = new THREE.Mesh(minHandGeom, minHandMat);
    minHand.rotation.z = Math.PI; // 12 o'clock position
    clockGroup.add(minHand);

    // 4e. Center Hub cap
    const hubGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.2, 32);
    hubGeom.rotateX(Math.PI / 2);
    const hubMat = new THREE.MeshBasicMaterial({ color: colors.hands });
    const hub = new THREE.Mesh(hubGeom, hubMat);
    clockGroup.add(hub);

    // 4f. Orbiting platform nodes (LinkedIn & X)
    const orbiterGroup = new THREE.Group();
    clockGroup.add(orbiterGroup);

    const nodeGeom = new THREE.SphereGeometry(0.2, 16, 16);
    const liMat = new THREE.MeshBasicMaterial({ color: colors.linkedin });
    const liNode = new THREE.Mesh(nodeGeom, liMat);
    orbiterGroup.add(liNode);

    const xMat = new THREE.MeshBasicMaterial({ color: colors.twitter });
    const xNode = new THREE.Mesh(nodeGeom, xMat);
    orbiterGroup.add(xNode);

    // 4g. Floating Starfield / Particles cloud
    const particleCount = 280;
    const particleGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const r = 5 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i+1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i+2] = r * Math.cos(phi);
    }
    particleGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: colors.particles,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });
    const starField = new THREE.Points(particleGeom, particleMat);
    scene.add(starField);

    // 5. Scroll Handler
    let scrollRatio = 0;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      scrollRatio = docHeight > 0 ? scrollY / docHeight : 0;
    };
    window.addEventListener("scroll", handleScroll);

    // 6. Window Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // 7. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Dynamic rotations
      starField.rotation.y = elapsedTime * 0.02 + scrollRatio * 0.5;
      starField.rotation.x = elapsedTime * 0.01;

      // Orbiting satellites
      const radius = 3.2;
      liNode.position.x = radius * Math.cos(elapsedTime * 0.4);
      liNode.position.y = radius * Math.sin(elapsedTime * 0.4);
      liNode.position.z = Math.sin(elapsedTime * 0.8) * 0.5;

      xNode.position.x = radius * Math.cos(elapsedTime * 0.3 + Math.PI);
      xNode.position.y = radius * Math.sin(elapsedTime * 0.3 + Math.PI);
      xNode.position.z = Math.cos(elapsedTime * 0.6) * 0.5;

      // Scroll interpolation mappings:
      clockGroup.rotation.y = scrollRatio * Math.PI * 2 + elapsedTime * 0.15;
      clockGroup.rotation.x = 0.8 + scrollRatio * 0.6;
      clockGroup.rotation.z = -0.3 + scrollRatio * 0.2;

      // Camera positions zoom in and fly-by
      camera.position.z = 8.5 - scrollRatio * 3.5;
      camera.position.y = scrollRatio * 1.5;
      camera.position.x = -scrollRatio * 1.5;

      renderer.render(scene, camera);
    };
    animate();

    // 8. Cleanup & Disposal
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);

      dialGeom.dispose();
      dialMat.dispose();
      innerRingGeom.dispose();
      innerRingMat.dispose();
      hourHandGeom.dispose();
      hourHandMat.dispose();
      minHandGeom.dispose();
      minHandMat.dispose();
      hubGeom.dispose();
      hubMat.dispose();
      nodeGeom.dispose();
      liMat.dispose();
      xMat.dispose();
      particleGeom.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [darkMode]);

  const faqs = [
    {
      q: "Which platforms does 11 o'clock support?",
      a: "11 o'clock natively supports LinkedIn and Twitter/X. You can connect your channels and cross-post directly from the workspace console."
    },
    {
      q: "How does the AI social media engine cross-post and optimize content?",
      a: "When you submit a prompt, our AI social media agent automatically adapts the formatting, character length, hashtags, and hooks to match the native guidelines of LinkedIn and Twitter/X."
    },
    {
      q: "Is my credential data secure?",
      a: "Yes. All integration tokens and profile credentials are encrypted securely. We prioritize secure authentication layers using modern industry OAuth standards."
    },
    {
      q: "Can I automate publishing and schedule posts?",
      a: "Yes. You can schedule posts and automate content distribution. The workspace scheduling calendar lets you plan dispatches for peak audience hours across connected channels."
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
        @keyframes hzFloat {
          0%, 100% { transform: translate3d(0, 0, 0) rotateX(55deg) rotateY(0deg) rotateZ(-15deg); }
          50% { transform: translate3d(0, -8px, 0) rotateX(51deg) rotateY(1deg) rotateZ(-12deg); }
        }
        @keyframes hzOrbitLink {
          0% { transform: translate3d(-50%, -50%, 0) rotate(0deg) translate3d(130px, 0, 10px) rotate(0deg); }
          100% { transform: translate3d(-50%, -50%, 0) rotate(360deg) translate3d(130px, 0, 10px) rotate(-360deg); }
        }
        @keyframes hzOrbitTwit {
          0% { transform: translate3d(-50%, -50%, 0) rotate(180deg) translate3d(130px, 0, 20px) rotate(-180deg); }
          100% { transform: translate3d(-50%, -50%, 0) rotate(540deg) translate3d(130px, 0, 20px) rotate(-540deg); }
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
        {/* Subtle radial ambient dark gradient matching the WebGL vibe */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(circle 800px at 50% -100px, ${darkMode ? "rgba(37,99,235,0.08)" : "rgba(37,99,235,0.05)"}, transparent 100%)
            `,
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
          }}
        />

        {/* Minimal fine layout grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: darkMode 
              ? 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)'
              : 'linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            WebkitMaskImage: 'radial-gradient(circle 600px at 50% 100px, black 30%, transparent 100%)',
            maskImage: 'radial-gradient(circle 600px at 50% 100px, black 30%, transparent 100%)',
          }}
        />
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
            <span className="hidden sm:inline-block text-[10px] font-mono text-muted-foreground bg-muted border border-custom px-2 py-0.5 rounded">
              v1 eleven
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#capabilities" className="hover:text-foreground transition-colors">Capabilities</a>
            <a href="#workflow" className="hover:text-foreground transition-colors">Workflow</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
            <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/guide" className="hover:text-foreground transition-colors">Guide</Link>
          </nav>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="hidden sm:inline-flex p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors cursor-pointer border border-transparent hover:border-custom"
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
                  <button className="hidden md:block text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors px-2">
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

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-custom rounded-xl transition-all">
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-custom bg-background/95 backdrop-blur-lg px-6 py-6 space-y-4 animate-fadeIn">
          
          {/* Mobile Theme Selector */}
          <div className="flex items-center justify-between border-b border-custom pb-3 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">App Theme</span>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-muted-foreground hover:bg-muted border border-custom flex items-center gap-2 text-xs font-semibold"
            >
              {darkMode ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.22 4.22l1.58 1.58m12.42 12.42l1.58 1.58M3 12h2.25m13.5 0H21M4.22 19.78l1.58-1.58m12.42-12.42l1.58-1.58M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" /></svg>
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 12.83A9.54 9.54 0 0112 21.75c-5.28 0-9.5-4.22-9.5-9.5a9.54 9.54 0 0112.58-9.04 7.46 7.46 0 001.92 6.13 7.46 7.46 0 006.25 3.49z" /></svg>
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>

           <nav className="flex flex-col gap-4 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-foreground transition-colors py-1">Features</a>
            <a href="#capabilities" onClick={() => setMobileMenuOpen(false)} className="hover:text-foreground transition-colors py-1">Capabilities</a>
            <a href="#workflow" onClick={() => setMobileMenuOpen(false)} className="hover:text-foreground transition-colors py-1">Workflow</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-foreground transition-colors py-1">FAQ</a>
            <Link to="/blog" onClick={() => setMobileMenuOpen(false)} className="hover:text-foreground transition-colors py-1">Blog</Link>
            <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-foreground transition-colors py-1">Pricing</Link>
            <Link to="/guide" onClick={() => setMobileMenuOpen(false)} className="hover:text-foreground transition-colors py-1">Guide</Link>
          </nav>
          
          <div className="pt-4 border-t border-custom flex flex-col gap-2">
            {isSignedIn ? (
              <button 
                onClick={() => { setMobileMenuOpen(false); navigate("/workspace"); }} 
                className="w-full py-2.5 text-center text-xs font-semibold rounded-lg bg-foreground text-background hover:opacity-90 transition-all"
              >
                Go to Console
              </button>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="w-full py-2.5 text-center text-xs font-semibold text-muted-foreground hover:text-foreground border border-custom rounded-lg transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="w-full py-2.5 text-center text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all">
                    Get Started
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <main className="relative flex-1 w-full max-w-6xl mx-auto px-6 pt-20 sm:pt-28 pb-20 z-10 space-y-32">
        
        {/* HERO HEADER */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-8 pb-12 overflow-visible">
          
          {/* Left Column: Title & Action Controls */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-[10px] font-mono font-bold tracking-wider text-primary border border-primary/20 uppercase shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              11 o'clock is Live
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-foreground">
              Best AI Social Media Automation Tool
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Stop manually rewriting posts. Meet the AI social media marketing and management tool that automatically writes, schedules, and cross-posts your content to LinkedIn and Twitter/X simultaneously.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-center pt-4 w-full sm:w-auto">
              {isSignedIn ? (
                <button 
                  onClick={() => navigate("/workspace")} 
                  className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/95 transition-all cursor-pointer shadow-lg shadow-primary/10 hover:shadow-primary/20"
                >
                  Go to Workspace Console
                </button>
              ) : (
                <SignUpButton mode="modal">
                  <button className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/95 transition-all cursor-pointer shadow-lg shadow-primary/10 hover:shadow-primary/20">
                    Start Writing Free
                  </button>
                </SignUpButton>
              )}
              <a 
                href="#workflow" 
                className="w-full sm:w-auto px-6 py-3 text-xs font-semibold bg-card border border-custom hover:bg-muted rounded-lg transition-all text-center cursor-pointer"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Right Column: Glass Viewport framing the background 3D canvas */}
          <div className="lg:col-span-5 flex items-center justify-center relative w-full h-[300px] sm:h-[380px] pointer-events-none select-none overflow-visible">
            {/* Ambient circular frame indicating active console zone */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-primary/10 bg-primary/[0.02] backdrop-blur-[1px] flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(37,99,235,0.03)]">
              <span className="text-[10px] font-mono text-primary/60 tracking-[0.25em] uppercase font-bold">11:00 Live View</span>
              {/* Spinning compass ticks inside viewport */}
              <div className="absolute inset-2 rounded-full border border-dashed border-muted-foreground/10 animate-spin" style={{ animationDuration: '60s' }} />
            </div>
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
              Try the AI Writing Tool
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Input Prompt Dock simulator */}
              <div className="md:col-span-1 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">Enter Your AI Prompt</div>
                  <div className="p-4 rounded-xl bg-background border border-custom space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                      <span className="text-[11px] font-mono text-foreground font-semibold">Write with AI</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      "Pivot our B2B SaaS from MVP to Production with multi-channel support."
                    </p>
                  </div>
                </div>

                {/* Platform selection tabs */}
                <div className="space-y-2">
                  <div className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">Select Social Network</div>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { id: "linkedin", label: "LinkedIn Preview" },
                      { id: "twitter", label: "Twitter / X Preview" }
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
        <section className="border-y border-custom py-8 text-center bg-card/5">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground/60 mb-6">Supported Social Channels</p>
          <div className="flex flex-row justify-center items-center gap-8 sm:gap-16 text-muted-foreground/40 hover:text-muted-foreground/80 transition-colors">
            
            {/* LinkedIn Badge */}
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider select-none hover:text-foreground transition-colors cursor-default">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              <span>LinkedIn</span>
            </div>

            {/* X / Twitter Badge */}
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider select-none hover:text-foreground transition-colors cursor-default">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>Twitter / X</span>
            </div>

          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="space-y-12">
          <div className="text-center space-y-2">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary font-bold">Two Modes of Generation</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Social Media Automation tailored to your cadence</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1 */}
            <div className="p-6 rounded-2xl border border-custom bg-card/40 flex flex-col gap-4 hover:border-primary/20 transition-all duration-300">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Instant AI Content Writer</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Type a simple idea or paste a rough outline. Our AI social media agent instantly generates high-performing, professionally formatted copy optimized for reading speed and maximum engagement.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl border border-custom bg-card/40 flex flex-col gap-4 hover:border-primary/20 transition-all duration-300">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">One-Click Cross-Posting</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect LinkedIn and Twitter/X. Write once, and our AI social media marketing tool automatically adapts your content’s tone and character count to match the native guidelines of each network.
              </p>
            </div>

          </div>
        </section>

        {/* CORE CAPABILITIES */}
        <section id="capabilities" className="space-y-12">
          <div className="text-center space-y-2">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary font-bold">Platform Capabilities</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">AI Social Media Agent features built for you</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="p-5 rounded-xl border border-custom bg-card/20 space-y-3">
              <Globe className="w-5 h-5 text-primary" />
              <h4 className="font-bold text-sm">Cross-Post to Multiple Networks</h4>
              <p className="text-xs text-muted-foreground">Publish your content to LinkedIn and Twitter/X at the same time. The AI tool handles layout adjustments and link formatting automatically.</p>
            </div>

            <div className="p-5 rounded-xl border border-custom bg-card/20 space-y-3">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h4 className="font-bold text-sm">Automated Content Scheduler</h4>
              <p className="text-xs text-muted-foreground">Schedule your posts in advance. The built-in AI scheduler queues your drafts to publish during peak active hours for your audience.</p>
            </div>

            <div className="p-5 rounded-xl border border-custom bg-card/20 space-y-3">
              <Shield className="w-5 h-5 text-primary" />
              <h4 className="font-bold text-sm">Safe OAuth Connection</h4>
              <p className="text-xs text-muted-foreground">Connect your official accounts securely with GoDaddy verified domain redirects and standard OAuth 2.0. We never store your passwords.</p>
            </div>

          </div>
        </section>

        {/* WORKFLOW 3-STEPS */}
        <section id="workflow" className="space-y-12">
          <div className="text-center space-y-2">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary font-bold">Operational Workflow</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Cross-post content in three simple steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-10 w-10 rounded-full border-2 border-primary flex items-center justify-center text-xs font-mono font-bold text-primary bg-background">
                01
              </div>
              <h4 className="font-bold text-sm">Link Your Accounts</h4>
              <p className="text-xs text-muted-foreground max-w-xs">
                Connect your LinkedIn and Twitter/X profiles securely using GoDaddy custom domain redirects.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-10 w-10 rounded-full border-2 border-primary flex items-center justify-center text-xs font-mono font-bold text-primary bg-background">
                02
              </div>
              <h4 className="font-bold text-sm">Type Your Prompt</h4>
              <p className="text-xs text-muted-foreground max-w-xs">
                Enter your outline or ideas in the simple text box. You can upload files or notes for extra context.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-10 w-10 rounded-full border-2 border-primary flex items-center justify-center text-xs font-mono font-bold text-primary bg-background">
                03
              </div>
              <h4 className="font-bold text-sm">Preview & Publish</h4>
              <p className="text-xs text-muted-foreground max-w-xs">
                Review the live social preview cards to check layout and character counts, then post or schedule instantly.
              </p>
            </div>

          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="space-y-12 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary font-bold">Common Questions</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Frequently Asked Questions about our AI Social Media Agent</h2>
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

      {/* Three.js Background Canvas */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 -z-10 w-full h-full pointer-events-none bg-transparent" 
      />

      {/* FOOTER */}
      <Footer />
    </div>
  );
}