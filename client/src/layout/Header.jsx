import { UserButton } from "@clerk/clerk-react";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, Menu } from "lucide-react"; // Import Menu icon

export default function Header({ onMenuClick }) {
  const { darkMode, setDarkMode } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-custom bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Brand System Identifiers */}
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="md:hidden p-1.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground border border-custom transition-colors cursor-pointer mr-1"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 select-none pointer-events-none ${darkMode ? "bg-white" : "bg-black"}`}>
            <img 
              src={darkMode ? "/logo_black.png" : "/logo_white.png"} 
              alt="Eleven" 
              className="h-5 w-5 object-contain select-none pointer-events-none"
              draggable="false"
            />
          </div>
          <span className="text-sm font-bold tracking-tight">Console Engine</span>
          <span className="hidden sm:inline-block font-mono text-[10px] bg-muted text-muted-foreground border border-custom px-1.5 py-0.5 rounded">
            v1 eleven
          </span>
        </div>

        {/* Action Controls Frame */}
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 cursor-pointer flex items-center justify-center border border-transparent hover:border-custom bg-card/20 shadow-sm"
            aria-label="Toggle structural layout themes"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-500 transition-transform duration-300 rotate-0 scale-100" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300 rotate-0 scale-100" />
            )}
          </button>
          <UserButton afterSignOutUrl="/" />
        </div>

      </div>
    </header>
  );
}