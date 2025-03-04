
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { sendTelegramNotification } from '../utils/telegramService';

const ThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationSent, setNotificationSent] = useState(false);
  const reservationData = location.state?.reservationData;

  useEffect(() => {
    // Send Telegram notification when component mounts
    if (reservationData && !notificationSent) {
      console.log('ThankYou page - Sending Telegram notification with data:', reservationData);
      
      sendTelegramNotification(reservationData)
        .then(result => {
          console.log('Telegram notification result:', result);
          if (result.needsConfiguration) {
            // If admin is logged in, show a toast with action
            if (localStorage.getItem('isAuthenticated') === 'true') {
              toast.error('Telegram not configured. Configure it now to receive notifications.', {
                action: {
                  label: 'Configure',
                  onClick: () => navigate('/telegram-config')
                },
                duration: 10000
              });
            }
          } else if (result.success) {
            console.log('Telegram notification sent successfully!');
          } else {
            console.error('Failed to send Telegram notification:', result.message);
          }
        })
        .catch(error => {
          console.error('Error sending Telegram notification:', error);
        })
        .finally(() => {
          setNotificationSent(true);
        });
    } else if (!reservationData) {
      console.warn('No reservation data available on ThankYou page');
    }
  }, [reservationData, navigate, notificationSent]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Logo */}
      <motion.img 
        src="https://sounny.ma/logo.webp" 
        alt="Logo" 
        className="w-[120px] sm:w-[156px] mb-4 sm:mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      />

      {/* Thank you message */}
      <motion.div
        className="max-w-md text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-3">Thank You!</h1>
        <p className="text-lg text-gray-700 mb-6">
          Your reservation has been submitted. We will contact you shortly to confirm your appointment.
        </p>
        
        {reservationData && (
          <div className="bg-white rounded-lg shadow-md p-5 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Reservation Details</h2>
            <div className="text-left">
              <p className="mb-1"><span className="font-medium">Name:</span> {reservationData.name}</p>
              <p className="mb-1"><span className="font-medium">Phone:</span> {reservationData.phone}</p>
              <p className="mb-1"><span className="font-medium">Date:</span> {reservationData.date}</p>
              <p className="mb-1"><span className="font-medium">Time:</span> {reservationData.timeSlot}</p>
            </div>
          </div>
        )}
        
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Return Home
        </button>
      </motion.div>
    </div>
  );
};

export default ThankYou;
