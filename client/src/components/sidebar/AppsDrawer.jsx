import { Globe, Plus, Trash2 } from "lucide-react";

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

export default function AppsDrawer({ isOpen, masterApps, integrations, onChannelClick, activeApp, onDisconnectChannel }) {
  const iconMap = {
    linkedin: LinkedinIcon,
    twitter: TwitterIcon,
    instagram: Globe
  };

  return (
    <div className="p-3 bg-card/20 space-y-2">
      {isOpen && (
        <span className="text-[9px] uppercase font-mono tracking-wider text-muted-foreground/60 px-2 block animate-fadeIn">
          Apps Channels
        </span>
      )}
      
      <div className="space-y-1">
        {masterApps.map((app) => {
          const connectedAccount = integrations.find(
            (link) => link.appId?._id === app._id || link.appId === app._id
          );
          const ChannelIcon = iconMap[app.iconKey] || Globe;
          
          // 💡 CHECK IF THIS ROW COMPONENT IS THE ACTIVE WORKSPACE TARGET
          const isChannelFocused = activeApp?._id === app._id;

          return (
            <button
              key={app._id}
              type="button"
              onClick={() => onChannelClick?.(app, connectedAccount)}
              className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all group text-left ${
                connectedAccount 
                  ? isChannelFocused
                    ? "bg-blue-600/10 border-blue-500/40 shadow-md shadow-blue-500/5 cursor-pointer" // Glowing Active State
                    : "bg-background/40 border-white/5 hover:bg-background/60 cursor-pointer" // Inactive Connected Channel
                  : "bg-transparent border-dashed border-white/10 hover:border-blue-500/40 hover:bg-background/60 cursor-pointer" // Unconnected Channel
              } ${!isOpen && "justify-center"}`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <ChannelIcon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  connectedAccount 
                    ? isChannelFocused ? "text-blue-400" : "text-blue-500/70 group-hover:text-blue-400" 
                    : "text-muted-foreground group-hover:text-foreground"
                }`} />
                <div className={`flex flex-col min-w-0 flex-1 transition-opacity duration-200 ${isOpen ? "opacity-100 block" : "opacity-0 hidden"}`}>
                  <span className={`text-xs font-semibold truncate transition-colors ${
                    isChannelFocused ? "text-blue-400 font-bold" : "text-foreground/80"
                  }`}>{app.name}</span>
                  {connectedAccount && (
                    <span className="text-[10px] text-muted-foreground truncate font-mono">@{connectedAccount.profileName}</span>
                  )}
                </div>
              </div>

              {isOpen && !connectedAccount && (
                <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-medium group-hover:bg-blue-600 group-hover:text-white transition-all animate-fadeIn">
                  <Plus className="w-2.5 h-2.5" /> Connect
                </span>
              )}

              {/* 💡 Subtle active bulb or hover delete button */}
              {isOpen && connectedAccount && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isChannelFocused && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-400 animate-pulse group-hover:hidden" />
                  )}
                  <button
                    type="button"
                    title={`Disconnect ${app.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to disconnect @${connectedAccount.profileName}?`)) {
                        onDisconnectChannel?.(connectedAccount._id);
                      }
                    }}
                    className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}