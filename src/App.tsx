
import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import ThankYou from './pages/ThankYou';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import TelegramConfig from './pages/TelegramConfig';
import { Toaster } from "sonner";
import { initializeNotifications } from './utils/pushNotificationService';
import './App.css';

function App() {
  const initCompletedRef = useRef(false);
  
  useEffect(() => {
    // Prevent duplicate initialization
    if (initCompletedRef.current) {
      return;
    }
    
    initCompletedRef.current = true;
    
    // Initialize push notifications for admin users on app load
    initializeNotifications();
    
    // Force a viewport meta tag update to ensure proper mobile scaling
    const updateViewport = () => {
      // Remove any existing viewport meta tags
      const existingViewports = document.querySelectorAll('meta[name="viewport"]');
      existingViewports.forEach(tag => tag.remove());
      
      // Add a new viewport meta tag with proper settings
      const viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
      document.head.appendChild(viewportMeta);
      
      // Force layout recalculation
      document.documentElement.style.height = '100%';
      document.body.style.height = '100%';
      document.body.style.minHeight = '100vh';
      
      console.log('Mobile viewport meta tag updated for better responsiveness');
    };
    
    // Run viewport update once
    updateViewport();
    
    // Apply some base styles to ensure proper mobile rendering
    const applyMobileStyles = () => {
      // Check if styles already applied to avoid duplicates
      if (document.getElementById('mobile-base-styles')) {
        return;
      }
      
      const style = document.createElement('style');
      style.id = 'mobile-base-styles';
      style.textContent = `
        @media (max-width: 768px) {
          body {
            overflow-x: hidden;
            width: 100%;
            min-height: 100vh;
            position: relative;
          }
          
          #root {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
        }
      `;
      document.head.appendChild(style);
    };
    
    applyMobileStyles();
    
    // Only clear session storage on first app load in a new session
    const isFirstLoad = !sessionStorage.getItem('app_initialized');
    if (isFirstLoad) {
      console.log('First load: clearing session storage to prevent stale flags');
      // Don't completely clear session storage as it could remove authentication data
      // Just remove potential stale flags
      sessionStorage.removeItem('realtime_toast_shown');
      sessionStorage.setItem('app_initialized', 'true');
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/telegram-config" element={<TelegramConfig />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </Router>
  );
}

export default App;
