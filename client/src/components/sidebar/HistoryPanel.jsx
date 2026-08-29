import { History, MessageSquare, Trash2 } from 'lucide-react';

export default function HistoryPanel({ isOpen, history = [], onSelectHistory, onDeleteHistory }) {
  return (
    <div className="flex-1 p-3 overflow-y-auto space-y-2 max-w-full scrollbar-none border-b border-custom/60">
      <div className={`flex items-center gap-3 px-2 py-1 text-muted-foreground mb-2 ${!isOpen ? 'justify-center' : ''}`}>
        <History className="w-4 h-4 flex-shrink-0" />
        {isOpen && <span className="text-xs font-bold uppercase tracking-wider animate-fadeIn">History</span>}
      </div>
      
      {history.length === 0 ? (
        isOpen && <p className="text-xs text-muted-foreground text-center py-4 animate-fadeIn">No previous posts yet.</p>
      ) : (
        history.map((item) => (
          <button
            key={item._id}
            type="button"
            onClick={() => onSelectHistory?.(item)}
            className={`w-full text-left p-2.5 rounded-xl border border-transparent bg-muted/40 hover:bg-muted hover:border-custom transition-all group flex items-center gap-3 cursor-pointer overflow-hidden ${!isOpen ? 'justify-center' : ''}`}
          >
            
            <div className={`flex flex-col min-w-0 flex-1 transition-opacity duration-200 ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden'}`}>
              <span className="font-bold text-xs truncate text-foreground/90">{item.title}</span>
              <span className="text-[9px] text-muted-foreground/80 font-mono mt-0.5">
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
              </span>
            </div>

            {isOpen && (
              <button
                type="button"
                title="Delete Chat"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm("Are you sure you want to delete this chat history?")) {
                    onDeleteHistory?.(item._id);
                  }
                }}
                className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </button>
        ))
      )}
    </div>
  );
}
