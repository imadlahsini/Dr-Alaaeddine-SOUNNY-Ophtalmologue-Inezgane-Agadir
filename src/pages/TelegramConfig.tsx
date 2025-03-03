
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Key, MessageCircle, Save, ArrowLeft, AlertCircle, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { sendTelegramNotification } from '../utils/telegramService';

const TelegramConfig = () => {
  const navigate = useNavigate();
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('6024686458'); // Default to provided chat ID
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated !== 'true') {
      navigate('/admin');
      return;
    }

    // Load saved token if available
    const savedToken = localStorage.getItem('telegramBotToken');
    if (savedToken) {
      setBotToken(savedToken);
    }
  }, [navigate]);

  const handleSave = () => {
    if (!botToken.trim()) {
      toast.error('Please enter a valid bot token');
      return;
    }

    setIsSaving(true);
    
    // Save to localStorage (in a real app, this would be stored securely in a database)
    localStorage.setItem('telegramBotToken', botToken);
    
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Telegram bot settings saved successfully');
    }, 1000);
  };

  const handleTest = async () => {
    if (!botToken.trim()) {
      toast.error('Please enter a valid bot token');
      return;
    }

    setIsTesting(true);
    
    try {
      // Send a test notification
      const success = await sendTelegramNotification(
        {
          name: 'Test User',
          phone: '0612345678',
          date: '01/01/2024',
          timeSlot: '8h00-11h00'
        },
        { botToken, chatId }
      );
      
      if (success) {
        toast.success('Test notification sent successfully! Check your Telegram.');
      } else {
        toast.error('Failed to send test notification. Please check your bot token.');
      }
    } catch (error) {
      console.error('Error testing Telegram notification:', error);
      toast.error('An error occurred during testing.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <header className="max-w-lg mx-auto mb-8 flex items-center justify-between">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </button>
        <h1 className="text-xl font-bold text-gray-800">Telegram Configuration</h1>
      </header>
      
      {/* Main Content */}
      <motion.div
        className="max-w-lg mx-auto bg-white rounded-[20px] shadow p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center mb-6">
          <Bot className="w-6 h-6 text-primary mr-2" />
          <h2 className="text-lg font-semibold">Telegram Bot Settings</h2>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="botToken" className="block text-sm text-gray-600 flex items-center">
              <Key className="w-4 h-4 mr-1" /> 
              Bot Token
            </label>
            <input
              id="botToken"
              type="text"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="Enter your Telegram bot token"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-500">Get this from BotFather when you create a new bot.</p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="chatId" className="block text-sm text-gray-600 flex items-center">
              <MessageCircle className="w-4 h-4 mr-1" /> 
              Chat ID
            </label>
            <input
              id="chatId"
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="Enter the chat ID for notifications"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-500">This is already configured with your provided chat ID.</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Important Note</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  For security reasons, the bot token is stored locally in your browser. 
                  In a production environment, this should be stored securely on the server.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md w-1/2"
            >
              {isSaving ? (
                <>Saving... <Loader className="ml-2 h-4 w-4 animate-spin" /></>
              ) : (
                <>Save <Save className="ml-2 h-4 w-4" /></>
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTest}
              disabled={isTesting}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md w-1/2"
            >
              {isTesting ? (
                <>Testing... <Loader className="ml-2 h-4 w-4 animate-spin" /></>
              ) : (
                <>Send Test Message <MessageCircle className="ml-2 h-4 w-4" /></>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TelegramConfig;
