import { Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import PricingPage from "./pages/PricingPage";
import GuidePage from "./pages/GuidePage";
import PrivacyPage from "./pages/PrivacyPage";

export default function App() {
  return (
    <Routes>
      
      {/* PUBLIC ROUTE */}
      <Route 
        path="/" 
        element={<LandingPage />} 
      />

      <Route 
        path="/guide" 
        element={<GuidePage />} 
      />

      <Route 
        path="/privacy" 
        element={<PrivacyPage />} 
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