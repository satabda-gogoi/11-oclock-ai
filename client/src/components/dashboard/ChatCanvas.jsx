import { useState } from "react";
import { Sparkles, AlertTriangle, Globe, Plus, CheckCircle2, Copy, Check, Zap, Lock, Loader2, ExternalLink } from "lucide-react";

const LinkedinIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-2">
      <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg border border-white/10 text-muted-foreground hover:text-foreground hover:border-blue-500/30 hover:bg-blue-500/5 transition-all duration-200 select-none"
    >
      {copied ? (
        <><Check className="w-3 h-3 text-green-400" /><span className="text-green-400">Copied!</span></>
      ) : (
        <><Copy className="w-3 h-3" /><span>Copy</span></>
      )}
    </button>
  );
}

const PLAN_FEATURES = {
  starter: [
    "Limited daily chat sessions",
    "Standard AI generation models",
    "Email support",
  ],
  pro: [
    "Unlimited chat sessions",
    "Priority generation queue",
    "Early access to new platform releases",
    "Priority support",
  ],
};

export default function ChatCanvas({ 
  activeChat, 
  isExecuting, 
  statusMessage, 
  chatEndRef, 
  activeApp,
  masterApps = [],
  integrations = [],
  onChannelClick,
  isSubscribed,
  onUpgradeClick,
  onSubscribe,
  loadingPlan
}) {
  const iconMap = {
    linkedin: LinkedinIcon,
    twitter: TwitterIcon,
    instagram: Globe
  };

  const isCompleted = activeChat?.status === "completed";
  const isProcessing = activeChat?.status === "processing" || isExecuting;
  const platformLabel = activeApp?.name || "AI";

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full">
      
      {/* Top Header Banner */}
      <div className={`px-5 py-2.5 border-b flex items-center gap-2 flex-shrink-0 z-10 transition-colors duration-300 ${
        !isSubscribed
          ? "border-custom bg-card/30"
          : activeApp
            ? "border-custom bg-card/10"
            : "border-custom bg-card/5"
      }`}>
        {!isSubscribed ? (
          <>
            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">
              Premium Access Required
            </span>
          </>
        ) : activeApp ? (
          <>
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">
              {activeApp.name} · Content Workspace
            </span>
          </>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">
              Select a channel to begin
            </span>
          </>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-none">

        {/* ─── UNSUBSCRIBED PAYWALL VIEW ─── */}
        {!isSubscribed && (
          <div className="h-full flex flex-col items-center justify-center px-6 py-6">
            <div className="w-full max-w-2xl space-y-5">
              
              {/* Eyebrow + Headline */}
              <div className="text-center space-y-1.5">
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
                  11 o'clock · Subscription Plans
                </p>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Choose your workspace
                </h2>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Full channel access, AI generation, and automated scheduling.
                </p>
              </div>

              {/* Plan Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Starter */}
                <div className="p-4 rounded-xl border border-custom bg-card/40 flex flex-col gap-3">
                  <div className="flex items-baseline justify-between">
                    <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">Starter</p>
                    <p className="text-base font-bold text-foreground">₹999<span className="text-[10px] font-normal text-muted-foreground"> /mo</span></p>
                  </div>
                  <div className="h-px w-full bg-border" />
                  <ul className="space-y-1.5">
                    {PLAN_FEATURES.starter.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground leading-tight">
                        <Check className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => onSubscribe?.('starter')}
                    disabled={loadingPlan === 'starter'}
                    className="mt-auto w-full py-2 text-xs font-semibold rounded-lg border border-custom bg-card/60 hover:bg-muted text-foreground transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loadingPlan === 'starter' ? <><Loader2 className="w-3 h-3 animate-spin" /> Processing...</> : 'Get Started'}
                  </button>
                </div>

                {/* Pro */}
                <div className="p-4 rounded-xl border border-primary/25 bg-primary/[0.03] flex flex-col gap-3 relative">
                  <div className="absolute -top-2 left-4">
                    <span className="text-[9px] font-bold font-mono tracking-wider uppercase bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      Most Popular
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <p className="text-[10px] font-mono tracking-widest uppercase text-primary">Pro</p>
                    <p className="text-base font-bold text-foreground">₹2999<span className="text-[10px] font-normal text-muted-foreground"> /mo</span></p>
                  </div>
                  <div className="h-px w-full bg-primary/15" />
                  <ul className="space-y-1.5">
                    {PLAN_FEATURES.pro.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px] text-foreground/80 leading-tight">
                        <Check className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => onSubscribe?.('pro')}
                    disabled={loadingPlan === 'pro'}
                    className="mt-auto w-full py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loadingPlan === 'pro' ? <><Loader2 className="w-3 h-3 animate-spin" /> Processing...</> : 'Upgrade to Pro'}
                  </button>
                </div>
              </div>

              {/* Bottom note */}
              <p className="text-center text-[10px] text-muted-foreground">
                Billed monthly · Cancel anytime · Secure payments via Razorpay
              </p>
            </div>
          </div>
        )}


        {/* ─── APP SELECTOR (Subscribed, no active app) ─── */}
        {isSubscribed && !activeApp && (
          <div className="h-full flex flex-col items-center justify-center px-6 py-12 space-y-6 max-w-xl mx-auto">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold text-foreground tracking-tight">Select a platform</h2>
              <p className="text-xs text-muted-foreground">
                Choose a channel to start a new generation session.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {masterApps.map((app) => {
                const connectedAccount = integrations.find(
                  (link) => link.appId?._id === app._id || link.appId === app._id
                );
                const ChannelIcon = iconMap[app.iconKey] || Globe;
                
                return (
                  <button
                    key={app._id}
                    type="button"
                    onClick={() => onChannelClick?.(app, connectedAccount)}
                    className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer group ${
                      connectedAccount
                        ? "bg-card border-custom hover:border-primary/30"
                        : "bg-card/30 border-dashed border-custom/60 hover:border-primary/30 hover:bg-card/50"
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg flex-shrink-0 ${connectedAccount ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      <ChannelIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-sm text-foreground block">{app.name}</span>
                      {connectedAccount ? (
                        <span className="text-[11px] text-muted-foreground font-mono truncate block">@{connectedAccount.profileName}</span>
                      ) : (
                        <span className="text-[11px] text-primary/70 flex items-center gap-0.5 mt-0.5">
                          <Plus className="w-2.5 h-2.5" /> Connect account
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── READY STATE (App selected, no chat yet) ─── */}
        {isSubscribed && activeApp && !activeChat && !isExecuting && (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 space-y-3 max-w-sm mx-auto">
            <div className="h-10 w-10 rounded-xl border border-custom bg-card flex items-center justify-center text-primary">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-foreground">{activeApp.name} engine ready</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Describe your idea or topic below. Eleven will generate an optimized post tailored for your {activeApp.name} audience.
            </p>
          </div>
        )}

        {/* ─── CHAT THREAD ─── */}
        {activeChat && (
          <div className="px-4 py-8 space-y-6 max-w-3xl mx-auto w-full pb-36">
            
            {/* User Bubble */}
            <div className="flex flex-col items-end">
              <div className="max-w-[80%] bg-primary text-primary-foreground px-4 py-3 rounded-2xl text-sm shadow-sm whitespace-pre-wrap">
                {activeChat.prompt}
              </div>
            </div>

            {/* AI Response */}
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className="h-5 w-5 rounded-full bg-card border border-custom flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-2.5 h-2.5 text-primary" />
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground">11 o'clock</span>
                {isProcessing && !activeChat.response && (
                  <span className="text-[10px] font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full animate-pulse">
                    generating
                  </span>
                )}
              </div>

              {isProcessing && !activeChat.response ? (
                <div className="max-w-[85%] bg-card border border-custom px-5 py-4 rounded-2xl shadow-sm">
                  <TypingIndicator />
                </div>
              ) : activeChat.response ? (
                <div className="max-w-[90%] w-full">
                  <div className="bg-card border border-custom rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-5 text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 select-text">
                      {activeChat.response}
                    </div>
                    {(isCompleted || activeChat.postUrl) && (
                      <div className="flex items-center justify-between px-5 py-2.5 border-t border-custom/60 bg-card/20 flex-wrap gap-2">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                          <span className="text-[11px] font-mono text-green-400">Published</span>
                          {activeApp && (
                            <>
                              <span className="text-muted-foreground text-[11px] mx-1">·</span>
                              <span className="text-[11px] font-mono text-muted-foreground">
                                {platformLabel}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {activeChat.postUrl && (
                            <a
                              href={activeChat.postUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg border border-primary/30 text-primary bg-primary/10 hover:bg-primary/20 transition-all select-none cursor-pointer"
                              title="Open live post in new tab"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>View on {platformLabel}</span>
                            </a>
                          )}
                          <CopyButton text={activeChat.response} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Status pill */}
        {statusMessage.text && (
          <div className="flex justify-center py-2 px-4">
            <div className={`px-4 py-1.5 rounded-full border text-[11px] font-mono shadow-sm flex items-center gap-2 ${
              statusMessage.type === "error"
                ? "bg-red-500/10 border-red-500/20 text-red-400"
                : "bg-card border-custom text-muted-foreground"
            }`}>
              {isExecuting && <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
              {statusMessage.text}
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>
    </div>
  );
}