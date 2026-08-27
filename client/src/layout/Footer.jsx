import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-background/50 py-6 backdrop-blur-xl mt-auto">
      <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between px-4 sm:px-6 text-xs text-muted-foreground gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground">11:59 AI</span>
          <span>© 2026 Core Stack Platform.</span>
        </div>
        <div className="flex gap-6 items-center">
          <Link to="/guide" className="hover:text-foreground transition-colors">Guide</Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <span className="font-mono text-[10px] text-muted-foreground/50">|</span>
          <span className="font-mono text-[10px]">Node Gateway Operational Track</span>
        </div>
      </div>
    </footer>
  );
}