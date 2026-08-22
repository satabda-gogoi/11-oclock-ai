import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx' // 1. Import ThemeProvider here

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

function ClerkProviderWithRouter() {
  const navigate = useNavigate();

  return (
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      {/* 2. Wrap App inside the Theme Provider here */}
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ClerkProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ClerkProviderWithRouter />
    </BrowserRouter>
  </React.StrictMode>,
)