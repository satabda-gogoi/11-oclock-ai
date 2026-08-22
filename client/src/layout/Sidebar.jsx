import { PanelLeftClose, PanelLeft, Plus, History } from "lucide-react";
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
  onDeleteHistory
}) {
  const navigate = useNavigate();

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
        <HistoryPanel 
          isOpen={isOpen}
          history={history}
          onSelectHistory={onSelectHistory}
          onDeleteHistory={onDeleteHistory}
        /> 
      ) : (
        <div className="flex-1 flex flex-col items-center py-4 border-b border-white/5">
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