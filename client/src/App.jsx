import { Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import PricingPage from "./pages/PricingPage";
import GuidePage from "./pages/GuidePage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import RefundPage from "./pages/RefundPage";
import ContactPage from "./pages/ContactPage";
import BlogPage from "./pages/BlogPage";
import BlogPost1 from "./pages/BlogPost1";
import BlogPost2 from "./pages/BlogPost2";

export default function App() {
  return (
    <Routes>
      
      {/* PUBLIC ROUTE */}
      <Route 
        path="/" 
        element={<LandingPage />} 
      />

      <Route 
        path="/blog" 
        element={<BlogPage />} 
      />

      <Route 
        path="/blog/top-ai-social-media-agents" 
        element={<BlogPost1 />} 
      />

      <Route 
        path="/blog/best-ai-social-media-tools-comparison" 
        element={<BlogPost2 />} 
      />

      <Route 
        path="/guide" 
        element={<GuidePage />} 
      />

      <Route 
        path="/privacy" 
        element={<PrivacyPage />} 
      />

      <Route 
        path="/terms" 
        element={<TermsPage />} 
      />

      <Route 
        path="/refund" 
        element={<RefundPage />} 
      />

      <Route 
        path="/contact" 
        element={<ContactPage />} 
      />

      {/* PROTECTED ROUTE */}
      <Route 
        path="/workspace" 
        element={
          <>
            <SignedIn>
              <DashboardPage />
            </SignedIn>
            <SignedOut>
              {/* If logged out, gracefully send them back home */}
              <Navigate to="/" replace />
            </SignedOut>
          </>
        } 
      />

      <Route 
        path="/workspace/chat/:chatId" 
        element={
          <>
            <SignedIn>
              <DashboardPage />
            </SignedIn>
            <SignedOut>
              <Navigate to="/" replace />
            </SignedOut>
          </>
        } 
      />

      <Route 
        path="/pricing" 
        element={
          <>
            <SignedIn>
              <PricingPage />
            </SignedIn>
            <SignedOut>
              <Navigate to="/" replace />
            </SignedOut>
          </>
        } 
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}