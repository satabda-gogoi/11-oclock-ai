import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { ArrowLeft, Mail, Clock, MapPin, MessageCircle } from "lucide-react";
import Footer from "../layout/Footer";

export default function ContactPage() {
  const { darkMode } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased relative">
      
      {/* Ambient decorative blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-custom">
        <div className="w-full max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground uppercase">Back to Home</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 select-none pointer-events-none ${darkMode ? "bg-white" : "bg-black"}`}>
              <img 
                src={darkMode ? "/logo_black.png" : "/logo_white.png"} 
                alt="11 o'clock" 
                className="h-5 w-5 object-contain select-none pointer-events-none"
                draggable="false"
              />
            </div>
            <span className="font-bold tracking-tight text-sm text-foreground">11 o'clock Contact</span>
          </div>
          
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 space-y-12">
        
        {/* Intro */}
        <section className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Contact Us</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Have questions about subscriptions, active integrations, or custom n8n setup? Reach out to our support channels below. We are here to help.
          </p>
        </section>

        {/* Contact Channels */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-custom bg-card/10 space-y-2">
            <Mail className="w-5 h-5 text-primary" />
            <h4 className="font-bold text-xs">Email Support</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              11oclockai@gmail.com
            </p>
          </div>
          <div className="p-4 rounded-xl border border-custom bg-card/10 space-y-2">
            <Clock className="w-5 h-5 text-primary" />
            <h4 className="font-bold text-xs">Business Hours</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Monday – Friday<br />9:00 AM – 6:00 PM IST
            </p>
          </div>
          <div className="p-4 rounded-xl border border-custom bg-card/10 space-y-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h4 className="font-bold text-xs">HQ Location</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Dibrugarh, Assam,<br />India
            </p>
          </div>
        </section>

        {/* FAQ or Detailed Contact Form Section */}
        <section className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-foreground">Frequently Contacted Queries</h3>
            
            <div className="space-y-4 mt-4">
              <div className="border border-custom bg-card/5 p-4 rounded-xl space-y-1">
                <h4 className="font-semibold text-xs text-foreground flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
                  Integration Connection Issues
                </h4>
                <p className="text-xs">
                  If you encounter errors connecting your LinkedIn manual authorization or Twitter OAuth, try disconnecting the channel in your sidebar, clear your browser cookies, and authorize again.
                </p>
              </div>

              <div className="border border-custom bg-card/5 p-4 rounded-xl space-y-1">
                <h4 className="font-semibold text-xs text-foreground flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
                  Refund Status Updates
                </h4>
                <p className="text-xs">
                  Approved refund operations are automatically dispatched back to Razorpay. If your refund is approved but has not cleared within 7 business days, please message support with your purchase receipt.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
