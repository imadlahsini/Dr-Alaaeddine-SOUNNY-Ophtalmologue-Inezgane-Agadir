
import { useEffect } from 'react';
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
  useEffect(() => {
    // Initialize push notifications for admin users on app load
    initializeNotifications();
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
