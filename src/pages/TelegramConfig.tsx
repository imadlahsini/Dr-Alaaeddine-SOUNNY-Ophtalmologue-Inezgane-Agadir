
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Key, MessageCircle, Save, ArrowLeft, AlertCircle, Loader2, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../utils/api';
import { sendTelegramNotification } from '../utils/telegramService';

const TelegramConfig = () => {
  const navigate = useNavigate();
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('1741098686'); // Default chat ID
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/admin');
        return;
      }
      
      // Check if the Telegram bot token is configured
      // We can only check if the function exists, not its actual configuration status
      try {
        const { data, error } = await supabase.functions.invoke('send-telegram', {
          body: { checkConfig: true }
        });
        
        if (!error && data?.configured) {
          setIsConfigured(true);
          toast.info('Telegram notifications are configured');
        }
      } catch (error) {
        console.error('Error checking Telegram configuration:', error);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleSave = async () => {
    if (!botToken.trim()) {
      toast.error('Please enter a valid bot token');
      return;
    }

    setIsSaving(true);
    
    try {
      // In a production environment, you would set the TELEGRAM_BOT_TOKEN as a Supabase secret
      // For this demo, we'll show instructions instead
      
      // Simulate saving (in a real app, you'd call an endpoint to update the secret)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsConfigured(true);
      toast.success('Telegram bot settings saved successfully');
      toast.info('In a production environment, this would update the Supabase Edge Function secret');
    } catch (error) {
      console.error('Error saving Telegram configuration:', error);
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!botToken.trim() && !isConfigured) {
      toast.error('Please enter a valid bot token and save it first');
      return;
    }

    setIsTesting(true);
    
    try {
      // Send a test notification
      const result = await sendTelegramNotification({
        name: 'Test User',
        phone: '0612345678',
        date: '01/01/2024',
        timeSlot: '8h00-11h00'
      });
      
      if (result.success) {
        toast.success('Test notification sent successfully! Check your Telegram.');
      } else {
        toast.error(`Failed to send test notification: ${result.message}`);
        
        if (result.needsConfiguration) {
          toast.info('The Telegram bot token needs to be configured properly');
        }
      }
    } catch (error) {
      console.error('Error testing Telegram notification:', error);
      toast.error('An error occurred during testing');
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
        {!isConfigured && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Telegram Notifications Not Configured</h3>
                <p className="text-sm text-red-700 mt-1">
                  You need to configure a Telegram bot token to receive notifications for new reservations.
                </p>
              </div>
            </div>
          </div>
        )}
        
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
              readOnly
            />
            <p className="text-xs text-gray-500">This is already configured with your chat ID.</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Important: Supabase Edge Function Setup</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  For a production environment, you would need to:
                </p>
                <ol className="list-decimal list-inside text-sm text-yellow-700 mt-2 ml-2">
                  <li>Create a Telegram bot via <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center inline-flex">@BotFather <LinkIcon className="w-3 h-3 ml-1" /></a></li>
                  <li>Get the API token from BotFather</li>
                  <li>Set the TELEGRAM_BOT_TOKEN secret in your Supabase project</li>
                  <li>Start a chat with your bot so it can send you messages</li>
                </ol>
                <p className="text-sm text-yellow-700 mt-2">
                  For this demo, we'll simulate the configuration process.
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
                <>Saving... <Loader2 className="ml-2 h-4 w-4 animate-spin" /></>
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
                <>Testing... <Loader2 className="ml-2 h-4 w-4 animate-spin" /></>
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
