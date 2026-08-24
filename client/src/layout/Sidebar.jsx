import { useState } from "react";
import { PanelLeftClose, PanelLeft, Plus, History, Clock, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import HistoryPanel from "../components/sidebar/HistoryPanel";
import AppsDrawer from "../components/sidebar/AppsDrawer";

export default function Sidebar({ 
  isOpen, 
  setIsOpen, 
  history, 
  onSelectHistory, 
  masterApps = [], 
  integrations = [], 
  onChannelClick,
  activeApp, // 👈 Accept prop from DashboardPage
  onDisconnectChannel,
  onDeleteHistory,
  scheduledPosts = [],
  onCancelSchedule
}) {
  const navigate = useNavigate();
  const [scheduledCollapsed, setScheduledCollapsed] = useState(false);

  return (
    <aside 
      className={`h-[calc(100vh-4rem)] border-r border-custom bg-card/30 backdrop-blur-xl flex flex-col transition-all duration-300 ease-in-out relative select-none z-30 ${
        isOpen ? "w-72" : "w-16"
      }`}
    >
      <div className={`p-4 border-b border-white/5 flex items-center ${isOpen ? "justify-between" : "justify-center"}`}>
        {isOpen && (
          <span className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground/70 animate-fadeIn">
            Recent Activity
          </span>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 cursor-pointer border border-transparent hover:border-custom"
        >
          {isOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* New Chat Button Row */}
      <div className="p-3 border-b border-white/5 flex flex-col items-center">
        <button
          type="button"
          onClick={() => navigate("/workspace")}
          className={`flex items-center gap-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-custom transition-all duration-200 cursor-pointer ${
            isOpen ? "w-full py-2 px-3 justify-start font-semibold text-xs" : "p-2 justify-center"
          }`}
          title="New Chat"
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          {isOpen && <span>New Chat</span>}
        </button>
      </div>

      {isOpen ? (
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <HistoryPanel 
            isOpen={isOpen}
            history={history}
            onSelectHistory={onSelectHistory}
            onDeleteHistory={onDeleteHistory}
          /> 
          
          {/* ⏰ SCHEDULED POSTS SECTION */}
          <div className={`p-3 border-b border-white/5 flex flex-col min-h-0 transition-all ${
            scheduledCollapsed ? "h-auto flex-shrink-0" : "flex-1 overflow-hidden"
          }`}>
            <button
              type="button"
              onClick={() => setScheduledCollapsed(!scheduledCollapsed)}
              className="w-full flex items-center justify-between px-2 py-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-1 focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 flex-shrink-0 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Scheduled ({scheduledPosts.length})
                </span>
              </div>
              {scheduledCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
              )}
            </button>
            
            {!scheduledCollapsed && (
              <div className="space-y-2 overflow-y-auto flex-1 pr-1 mt-1">
                {scheduledPosts.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No scheduled posts.</p>
                ) : (
                  scheduledPosts.map((item) => (
                    <div
                      key={item._id}
                      className="w-full p-2.5 rounded-xl border border-white/5 bg-background/40 hover:bg-background transition-all group flex items-start gap-3 justify-between overflow-hidden"
                    >
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-bold text-xs truncate text-foreground/90">{item.prompt}</span>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 font-mono text-[9px] text-muted-foreground/80">
                          <span className="capitalize px-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded">
                            {item.platform}
                          </span>
                          <span>•</span>
                          {item.scheduleType === 'once' ? (
                            <span>
                              {item.scheduledTime ? new Date(item.scheduledTime).toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}) : ''}
                            </span>
                          ) : (
                            <span>
                              Daily at {item.dailyTime}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        title="Cancel Schedule"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm("Are you sure you want to cancel this scheduled post?")) {
                            onCancelSchedule?.(item._id);
                          }
                        }}
                        className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer flex-shrink-0 self-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center py-4 border-b border-white/5 gap-4">
          <button
            type="button"
            onClick={() => {
              if (history && history.length > 0) {
                onSelectHistory?.(history[0]);
              }
            }}
            title="Open Top Chat"
            className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 cursor-pointer border border-transparent hover:border-custom"
          >
            <History className="w-4 h-4" />
          </button>
          
          {/* Small indicator clock icon for when sidebar is collapsed */}
          {scheduledPosts.length > 0 && (
            <div className="relative group flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            </div>
          )}
        </div>
      )}

      <AppsDrawer 
        isOpen={isOpen}
        masterApps={masterApps}
        integrations={integrations}
        onChannelClick={onChannelClick}
        activeApp={activeApp} // 👈 Forward prop down
        onDisconnectChannel={onDisconnectChannel}
      />

    </aside>
  );
}