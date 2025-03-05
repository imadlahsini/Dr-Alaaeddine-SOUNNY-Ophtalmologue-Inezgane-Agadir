
import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import ThankYou from './pages/ThankYou';
import Admin from './pages/Admin';
import NewDashboard from './pages/NewDashboard';
import NotFound from './pages/NotFound';
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
      
      // Add a new viewport meta tag with proper settings for mobile
      const viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(viewportMeta);
      
      console.log('Mobile viewport meta tag updated for mobile dashboard view');
    };
    
    // Run viewport update once
    updateViewport();
    
    // Fix for mobile viewport height (100vh issue)
    const setVhProperty = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      console.log('Mobile viewport height set:', vh);
    };
    
    // Set it initially
    setVhProperty();
    
    // Update on resize and orientation change
    window.addEventListener('resize', setVhProperty);
    window.addEventListener('orientationchange', setVhProperty);
    
    return () => {
      window.removeEventListener('resize', setVhProperty);
      window.removeEventListener('orientationchange', setVhProperty);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/dashboard" element={<NewDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </Router>
  );
}

export default App;
