import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth, useSession } from "@clerk/clerk-react";
import Header from "../layout/Header";
import Sidebar from "../layout/Sidebar"; 

import ChatCanvas from "../components/dashboard/ChatCanvas";
import PromptDock from "../components/dashboard/PromptDock";
import IntegrationModal from "../components/dashboard/IntegrationModal";
import { useRazorpayCheckout } from "../hooks/useRazorpayCheckout";

export default function DashboardPage() {
  const { session } = useSession();
  const { getToken } = useAuth();
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { handleSubscribe, loadingPlan } = useRazorpayCheckout(getToken);
  const [promptInput, setPromptInput] = useState("");
  
  // Layout Controls & Core Matrix States
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [promptHistory, setPromptHistory] = useState([]);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [masterApps, setMasterApps] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [activeApp, setActiveApp] = useState(null);
  const [pendingPlatform, setPendingPlatform] = useState(null);
  
  // Pipeline Operational Thread Monitoring
  const [activeChat, setActiveChat] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: null, text: "" });
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Credential Modal UI Control States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  // Paywall Modal State
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Splash Screen UI state
  const [showSplash, setShowSplash] = useState(true);
  
  const chatEndRef = useRef(null);
  // 💡 POLLING REFERENCE ANCHOR: Tracks the interval ID across render states securely
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2400); // 2.4s covers sweep + fadeout
    return () => clearTimeout(timer);
  }, []);

  // 💡 FIXED GUARDRAIL: Single point of truth for initial data load
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const token = await getToken();
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}/api/subscription/status`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.role === 'admin' || data.subscriptionStatus === 'active') {
            setIsSubscribed(true);
          } else {
            setIsSubscribed(false);
          }
        }
      } catch (err) {
        console.error("Error checking subscription status:", err);
      }
    };

    if (session) {
      checkSubscription();
      fetchWorkspaceHistory();
      fetchMasterApps();
      fetchConnectedIntegrations();
      fetchScheduledPosts();
    }
    
    // Cleanup active polling intervals if the user navigates away from the dashboard
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [session]);

  // Helper function to poll status of a specific processing chat
  const pollChatStatus = async (targetChatId) => {
    try {
      const token = await getToken();
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/dashboard/chat/${targetChatId}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.chat) {
          if (data.chat.status !== 'processing') {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            setIsExecuting(false);
            setStatusMessage({ type: null, text: "" });
            setActiveChat({
              prompt: data.chat.inputPrompt,
              response: data.chat.generatedContent,
              status: data.chat.status
            });
            fetchWorkspaceHistory();
          } else {
            setActiveChat({
              prompt: data.chat.inputPrompt,
              response: data.chat.generatedContent || null,
              status: 'processing'
            });
          }
        }
      }
    } catch (err) {
      console.error("Error polling chat status:", err);
    }
  };

  // Fetch active chat details if chatId changes
  useEffect(() => {
    if (!session) return;

    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }

    let active = true;

    const fetchChatDetails = async () => {
      try {
        const token = await getToken();
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}/api/dashboard/chat/${chatId}`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (!active) return;

        if (response.ok) {
          const data = await response.json();
          if (data.chat) {
            setActiveChat({
              prompt: data.chat.inputPrompt,
              response: data.chat.generatedContent || null,
              status: data.chat.status
            });
            // Automatically detect the app platform for this chat, falling back to 'linkedin' for legacy chats
            const platformKey = data.chat.platform || "linkedin";
            setPendingPlatform(platformKey);

            if (data.chat.status === 'processing') {
              setIsExecuting(true);
              setStatusMessage({ type: "info", text: "Generating content in the background..." });
              
              if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = setInterval(() => {
                pollChatStatus(chatId);
              }, 4000);
            } else {
              setIsExecuting(false);
              setStatusMessage({ type: null, text: "" });
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
              }
            }
          }
        } else {
          console.error("Failed to fetch chat or unauthorized");
          navigate("/workspace", { replace: true });
        }
      } catch (err) {
        console.error("Error fetching chat by URL ID:", err);
        navigate("/workspace", { replace: true });
      }
    };

    if (chatId) {
      fetchChatDetails();
    } else {
      setActiveChat(null);
      setActiveApp(null);
      setPendingPlatform(null);
      setIsExecuting(false);
      setStatusMessage({ type: null, text: "" });
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    return () => {
      active = false;
    };
  }, [chatId, session]);

  // Resolve pending platform from loaded chat into activeApp state
  useEffect(() => {
    if (pendingPlatform && masterApps.length > 0) {
      const app = masterApps.find(a => a.iconKey.toLowerCase() === pendingPlatform.toLowerCase());
      if (app) {
        setActiveApp(app);
      }
      setPendingPlatform(null);
    }
  }, [pendingPlatform, masterApps]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat, isExecuting, statusMessage]);

  // Query parameter listener for OAuth redirects
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthStatus = params.get("oauthStatus");
    const platform = params.get("platform");
    const error = params.get("error");

    if (oauthStatus) {
      if (oauthStatus === "success") {
        setStatusMessage({
          type: "info",
          text: `Successfully linked your ${platform === "twitter" ? "Twitter / X" : platform} channel!`
        });
        // Clear status message after 5 seconds
        setTimeout(() => setStatusMessage({ type: null, text: "" }), 5000);
        // Refresh integrations list
        fetchConnectedIntegrations();
      } else if (oauthStatus === "error") {
        setStatusMessage({
          type: "error",
          text: `OAuth Connection Failed: ${error || "Unknown Error"}`
        });
      }
      
      // Clean query params from the URL cleanly
      navigate("/workspace", { replace: true });
    }
  }, [navigate]);

  const fetchMasterApps = async () => {
    try {
      const token = await getToken();
      console.log("🎫 Current Clerk Token Generated:", token);

      if (!token) {
        console.warn("⚠️ Warning: Clerk returned an empty token string. Request will fail.");
      }
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/dashboard/master-apps`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMasterApps(data.apps);
      }
    } catch (error) {
      console.error("Failed syncing master apps catalog:", error);
    }
  };

  const fetchConnectedIntegrations = async () => {
    try {
      const token = await getToken();
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/dashboard/integrations`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.integrations);
      }
    } catch (error) {
      console.error("Failed syncing platform channels:", error);
    }
  };

  const fetchWorkspaceHistory = async () => {
    try {
      const token = await getToken();
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/dashboard/history`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Could not sync logs.");
      
      const resData = await response.json();
      setPromptHistory(resData.history);
    } catch (error) {
      console.error("History sync error:", error);
    }
  };

  const fetchScheduledPosts = async () => {
    try {
      const token = await getToken();
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/dashboard/scheduled`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setScheduledPosts(data.scheduledPosts || []);
      }
    } catch (error) {
      console.error("Failed syncing scheduled posts:", error);
    }
  };

  const handleCancelSchedule = async (scheduleId) => {
    try {
      setStatusMessage({ type: "info", text: "Cancelling scheduled post..." });
      const token = await getToken();
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/dashboard/scheduled/${scheduleId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        setStatusMessage({ type: "info", text: "Scheduled post cancelled successfully." });
        setTimeout(() => setStatusMessage({ type: null, text: "" }), 3000);
        fetchScheduledPosts();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server status ${response.status}`);
      }
    } catch (error) {
      console.error("Cancel schedule error:", error);
      setStatusMessage({ type: "error", text: `Failed to cancel schedule: ${error.message}` });
    }
  };

  const handleSelectHistoricalToken = (item) => {
    // Clear any polling interval when switching chats
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    navigate(`/workspace/chat/${item._id}`);
  };

  const handleChannelActionTrigger = (app, existingIntegration) => {
    // Clear any polling interval when switching channels
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    // Marketing genius block: Unsubscribed users cannot connect channels
    if (!isSubscribed) {
      setIsUpgradeModalOpen(true);
      return;
    }

    if (!existingIntegration) {
      if (app.iconKey.toLowerCase() === 'twitter' || app.iconKey.toLowerCase() === 'linkedin') {
        // Trigger OAuth 2.0 Redirection
        const platform = app.iconKey.toLowerCase();
        const platformDisplayName = platform === 'twitter' ? 'Twitter / X' : 'LinkedIn';
        (async () => {
          try {
            setStatusMessage({ type: "info", text: `Connecting to ${platformDisplayName}...` });
            const token = await getToken();
            const API_URL = import.meta.env.VITE_API_URL;
            const res = await fetch(`${API_URL}/api/dashboard/integrations/${platform}/oauth-url`, {
              headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(`Failed to get ${platformDisplayName} auth URL`);
            const data = await res.json();
            if (data.url) {
              window.location.href = data.url;
            } else {
              alert(`${platformDisplayName} OAuth URL not generated. Verify server configuration.`);
              setStatusMessage({ type: null, text: "" });
            }
          } catch (error) {
            console.error(`${platformDisplayName} OAuth error:`, error);
            setStatusMessage({ type: "error", text: `Could not initiate ${platformDisplayName} connection.` });
          }
        })();
      } else {
        setSelectedApp(app);
        setIsModalOpen(true);
      }
    } else {
      setActiveApp(app);
      navigate("/workspace");
    }
  };

  const handleDisconnectIntegration = async (integrationId) => {
    try {
      setStatusMessage({ type: "info", text: "Disconnecting account channel..." });
      const token = await getToken();
      const API_URL = import.meta.env.VITE_API_URL;
      
      const response = await fetch(`${API_URL}/api/dashboard/integrations/${integrationId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        setStatusMessage({ type: "info", text: "Account channel disconnected successfully." });
        setTimeout(() => setStatusMessage({ type: null, text: "" }), 3000);
        
        // If the active app matches the disconnected app, clear active app
        const integration = integrations.find(link => link._id === integrationId);
        if (integration && activeApp) {
          const matchingAppId = integration.appId?._id || integration.appId;
          if (matchingAppId === activeApp._id) {
            setActiveApp(null);
          }
        }

        fetchConnectedIntegrations();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server status ${response.status}`);
      }
    } catch (error) {
      console.error("Disconnect integration error:", error);
      setStatusMessage({ type: "error", text: `Failed to disconnect account channel: ${error.message}` });
    }
  };

  const handleDeleteHistory = async (targetChatId) => {
    try {
      setStatusMessage({ type: "info", text: "Deleting chat history record..." });
      const token = await getToken();
      const API_URL = import.meta.env.VITE_API_URL;

      const response = await fetch(`${API_URL}/api/dashboard/chat/${targetChatId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        setStatusMessage({ type: "info", text: "Chat history deleted successfully." });
        setTimeout(() => setStatusMessage({ type: null, text: "" }), 3000);

        // If the active chat is the one deleted, navigate to dashboard root & clear activeChat state
        if (chatId === targetChatId) {
          setActiveChat(null);
          navigate("/workspace");
        }

        fetchWorkspaceHistory();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server status ${response.status}`);
      }
    } catch (error) {
      console.error("Delete chat error:", error);
      setStatusMessage({ type: "error", text: `Failed to delete chat: ${error.message}` });
    }
  };

  const executePipelineDispatch = async (e, attachments = [], schedulingConfig = null) => { 
    e.preventDefault();
    if ((!promptInput.trim() && attachments.length === 0) || !activeApp || isExecuting) return;

    const userPromptPayload = promptInput;
    setPromptInput(""); 

    if (schedulingConfig) {
      setStatusMessage({ type: "info", text: "Scheduling your post..." });
      try {
        const token = await getToken();
        const API_URL = import.meta.env.VITE_API_URL;
        
        const response = await fetch(`${API_URL}/api/dashboard/scheduled`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            prompt: userPromptPayload,
            platform: activeApp.iconKey,
            scheduleType: schedulingConfig.scheduleType,
            scheduledTime: schedulingConfig.scheduledTime,
            dailyTime: schedulingConfig.dailyTime,
            timeZone: schedulingConfig.timeZone,
            attachments: attachments
          })
        });

        if (response.status === 403) {
          setStatusMessage({ type: null, text: "" });
          setIsUpgradeModalOpen(true);
          return;
        }

        if (!response.ok) throw new Error(`Server Fault: ${response.status}`);
        
        setStatusMessage({ type: "info", text: "Post scheduled successfully!" });
        setTimeout(() => setStatusMessage({ type: null, text: "" }), 4000);
        fetchScheduledPosts();
      } catch (error) {
        console.error("Scheduling execution failure error:", error);
        setStatusMessage({ type: "error", text: "Something went wrong scheduling your post. Please try again." });
      }
      return;
    }

    setIsExecuting(true);
    setStatusMessage({ type: "info", text: "Compiling assets, compiling scripts, and updating channels..." });
    setActiveChat({ prompt: userPromptPayload || "Attached file payload analysis dispatch.", response: null });

    try {
      const token = await getToken();
      const API_URL = import.meta.env.VITE_API_URL;
      
      const response = await fetch(`${API_URL}/api/dashboard/dispatch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: userPromptPayload,
          scheduling: "instant",
          targetPlatform: activeApp.iconKey,
          attachments: attachments
        })
      });
      
      if (response.status === 403) {
        setIsExecuting(false);
        setActiveChat(null);
        setStatusMessage({ type: null, text: "" });
        setIsUpgradeModalOpen(true);
        return;
      }

      if (!response.ok) throw new Error(`Server Fault: ${response.status}`);
      const outcomeJson = await response.json();

      if (response.status === 202 && outcomeJson.recordId) {
        console.log(`📡 Job accepted with Reference Token: ${outcomeJson.recordId}. Initializing poll cycle via navigate...`);
        navigate(`/workspace/chat/${outcomeJson.recordId}`);
        fetchWorkspaceHistory();
      }

    } catch (error) {
      console.error("Transmission execution failure error:", error);
      setStatusMessage({ type: "error", text: "Something went wrong processing your dispatch. Please try again." });
      setIsExecuting(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground antialiased overflow-hidden">
      
      {showSplash && (
        <div 
          className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center select-none"
          style={{
            animation: "splashFadeOut 0.4s ease-in-out 2.0s forwards",
            willChange: "opacity"
          }}
        >
          <style>{`
            @keyframes clockHandSweep {
              0% { transform: rotate(0deg); }
              70% { transform: rotate(342deg); }
              100% { transform: rotate(330deg); }
            }
            @keyframes dialPulse {
              0%, 100% { transform: scale(1); opacity: 0.8; }
              50% { transform: scale(1.03); opacity: 1; }
            }
            @keyframes ringRotate {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes textFadeIn {
              0% { opacity: 0; transform: translateY(12px); letter-spacing: 0.1em; }
              100% { opacity: 1; transform: translateY(0); letter-spacing: 0.25em; }
            }
            @keyframes splashFadeOut {
              0% { opacity: 1; pointer-events: auto; }
              100% { opacity: 0; pointer-events: none; visibility: hidden; }
            }
          `}</style>

          <div className="relative flex flex-col items-center justify-center">
            {/* Outer concentric pulsed ring */}
            <div 
              className="absolute w-48 h-48 rounded-full border border-dashed border-primary/20 animate-[ringRotate_20s_linear_infinite]"
              style={{ pointerEvents: 'none' }}
            />
            
            {/* Clock Face Dial Container */}
            <div 
              className="relative w-36 h-36 rounded-full border border-custom bg-card/45 flex items-center justify-center shadow-2xl shadow-primary/5 animate-[dialPulse_2.5s_ease-in-out_infinite]"
            >
              {/* Dial ticks at 12, 3, 6, 9 */}
              <span className="absolute top-2 w-0.5 h-1.5 bg-muted-foreground/40 rounded-full" />
              <span className="absolute right-2 w-1.5 h-0.5 bg-muted-foreground/40 rounded-full" />
              <span className="absolute bottom-2 w-0.5 h-1.5 bg-muted-foreground/40 rounded-full" />
              <span className="absolute left-2 w-1.5 h-0.5 bg-muted-foreground/40 rounded-full" />

              {/* Center Pin */}
              <div className="w-2.5 h-2.5 rounded-full bg-primary z-20 shadow-sm" />

              {/* Hour Hand (Sweep from 12 o'clock to 11 o'clock) */}
              <div 
                className="absolute bottom-1/2 left-1/2 w-0.5 h-12 bg-primary origin-bottom -translate-x-1/2 z-10 rounded-full"
                style={{
                  animation: "clockHandSweep 1.6s cubic-bezier(0.25, 1, 0.5, 1.15) 0.3s forwards",
                  transform: "rotate(0deg)",
                  willChange: "transform"
                }}
              />
              
              {/* Minute Hand (stays static at 12 o'clock) */}
              <div className="absolute bottom-1/2 left-1/2 w-0.5 h-14 bg-muted-foreground/30 origin-bottom -translate-x-1/2 z-0 rounded-full" />
            </div>

            {/* Platform Text Banner */}
            <div className="text-center mt-8 space-y-1.5">
              <h1 className="text-sm font-bold font-mono tracking-[0.25em] text-foreground uppercase animate-[textFadeIn_1s_cubic-bezier(0.16,1,0.3,1)_0.6s_both]">
                11 o'clock
              </h1>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] animate-[textFadeIn_1.2s_cubic-bezier(0.16,1,0.3,1)_0.8s_both]">
                Workspace Console
              </p>
            </div>
          </div>
        </div>
      )}

      <Header onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Mobile Sidebar Backdrop Overlay */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
          />
        )}

        <Sidebar 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen} 
          history={promptHistory}
          onSelectHistory={handleSelectHistoricalToken}
          masterApps={masterApps}
          integrations={integrations}
          onChannelClick={handleChannelActionTrigger}
          activeApp={activeApp} 
          onDisconnectChannel={handleDisconnectIntegration}
          onDeleteHistory={handleDeleteHistory}
          scheduledPosts={scheduledPosts}
          onCancelSchedule={handleCancelSchedule}
        />

        <div className="flex-1 flex flex-col relative h-[calc(100vh-4rem)] bg-background/20">
          
          <ChatCanvas 
            activeChat={activeChat}
            isExecuting={isExecuting}
            statusMessage={statusMessage}
            chatEndRef={chatEndRef}
            activeApp={activeApp} 
            masterApps={masterApps}
            integrations={integrations}
            onChannelClick={handleChannelActionTrigger}
            isSubscribed={isSubscribed}
            onUpgradeClick={() => setIsUpgradeModalOpen(true)}
            onSubscribe={handleSubscribe}
            loadingPlan={loadingPlan}
          />

          <PromptDock 
            promptInput={promptInput}
            setPromptInput={setPromptInput}
            isExecuting={isExecuting}
            onSubmit={executePipelineDispatch}
            activeApp={activeApp} 
            isSubscribed={isSubscribed}
            onUpgradeClick={() => setIsUpgradeModalOpen(true)}
          />

        </div>
      </div>

      <IntegrationModal 
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        selectedApp={selectedApp}
        setSelectedApp={setSelectedApp}
        getToken={getToken}
        onSuccess={fetchConnectedIntegrations}
      />

      {/* Paywall Upgrade Modal */}
      {isUpgradeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md"
          onClick={() => setIsUpgradeModalOpen(false)}
        >
          <div
            className="bg-card border border-custom rounded-2xl p-7 max-w-sm w-full shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Icon row */}
            <div className="flex items-center gap-3 mb-5">
              <div className="h-9 w-9 rounded-xl border border-custom bg-card flex items-center justify-center text-primary flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Premium Access Required</h3>
                <p className="text-[11px] text-muted-foreground font-mono">11 o'clock · Workspace</p>
              </div>
            </div>

            <div className="h-px w-full bg-border mb-5" />

            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              A subscription is needed to generate content and connect platform channels. Choose a plan to unlock your workspace.
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate('/pricing')}
                className="w-full py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
              >
                View Plans
              </button>
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="w-full py-2.5 text-xs font-medium rounded-xl border border-custom hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}