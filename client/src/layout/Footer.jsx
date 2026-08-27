import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-custom py-8 w-full bg-card/20 backdrop-blur-md mt-20">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground">11 o'clock</span>
          <span>© 2026. Secure publishing workspace.</span>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
          <Link to="/guide" className="hover:text-foreground transition-colors">Guide</Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">Terms & Conditions</Link>
          <Link to="/refund" className="hover:text-foreground transition-colors">Refund Policy</Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">Contact Us</Link>
        </div>
      </div>
    </footer>
  );
}