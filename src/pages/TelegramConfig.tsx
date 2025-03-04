
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bot, Key, MessageCircle, Save, ArrowLeft, 
  AlertCircle, Loader2, Link as LinkIcon, CheckCircle2 
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { sendTelegramNotification, checkTelegramConfig } from '../utils/telegramService';

const TelegramConfig = () => {
  const navigate = useNavigate();
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('6024686458'); // Updated default chat ID
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/admin');
        return;
      }
      
      setIsChecking(true);
      try {
        const configStatus = await checkTelegramConfig();
        
        if (configStatus.configured) {
          setIsConfigured(true);
          toast.success('Telegram notifications are configured');
        } else {
          setIsConfigured(false);
          toast.info('Telegram notifications need to be configured');
        }
      } catch (error) {
        console.error('Error checking Telegram configuration:', error);
        toast.error('Could not check Telegram configuration status');
      } finally {
        setIsChecking(false);
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
      toast.info(
        'In production, this would set the TELEGRAM_BOT_TOKEN secret in Supabase',
        {
          duration: 5000,
          description: 'For this demo, we will simulate the process'
        }
      );
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsConfigured(true);
      toast.success('Telegram bot settings saved successfully');
      
      toast.info(
        'Important: In a real project, you would:',
        {
          duration: 8000,
          description: 'Set TELEGRAM_BOT_TOKEN in Supabase Edge Function Secrets'
        }
      );
    } catch (error) {
      console.error('Error saving Telegram configuration:', error);
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!isConfigured && !botToken.trim()) {
      toast.error('Please enter a valid bot token and save it first');
      return;
    }

    setIsTesting(true);
    
    try {
      toast.info('Sending test message to Telegram...');
      
      const testData = {
        name: 'Test User',
        phone: '0612345678',
        date: '01/01/2024',
        timeSlot: '8h00-11h00'
      };
      
      console.log('Sending test notification with data:', JSON.stringify(testData));
      
      const result = await sendTelegramNotification(testData);
      
      console.log('Test message result:', result);
      
      if (result.success) {
        toast.success('Test notification sent successfully! Check your Telegram.');
      } else {
        if (result.needsConfiguration) {
          toast.error('Telegram bot token needs to be configured', {
            description: 'Please ensure the TELEGRAM_BOT_TOKEN is set in Supabase'
          });
        } else {
          toast.error(`Failed to send test notification: ${result.message}`);
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
      
      <motion.div
        className="max-w-lg mx-auto bg-white rounded-[20px] shadow p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {isChecking ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="w-6 h-6 text-primary animate-spin mr-2" />
            <p>Checking configuration status...</p>
          </div>
        ) : (
          <>
            {!isConfigured ? (
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
            ) : (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-green-800">Telegram Notifications Configured</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Your Telegram bot is set up to receive reservation notifications.
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
              
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                  <Bot className="w-4 h-4 mr-1" />
                  How to Create a Telegram Bot
                </h3>
                <ol className="list-decimal list-inside text-sm text-blue-700 space-y-2">
                  <li>Open Telegram and search for <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center inline-flex">@BotFather <LinkIcon className="w-3 h-3 ml-1" /></a></li>
                  <li>Send the command <code className="bg-blue-100 px-1 rounded">/newbot</code> to BotFather</li>
                  <li>Follow instructions to name your bot</li>
                  <li>Copy the API token provided by BotFather</li>
                  <li>Paste it in the Bot Token field above</li>
                  <li>Click Save to store your bot token</li>
                  <li>Start a chat with your bot by clicking the link provided by BotFather</li>
                  <li>Send any message to your bot to activate the chat</li>
                </ol>
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
          </>
        )}
      </motion.div>
    </div>
  );
};

export default TelegramConfig;
