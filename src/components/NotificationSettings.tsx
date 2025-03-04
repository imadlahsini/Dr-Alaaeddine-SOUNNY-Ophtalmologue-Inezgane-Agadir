
import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Send } from 'lucide-react';
import { toast } from 'sonner';
import { 
  requestNotificationPermission, 
  getNotificationPermissionStatus,
  sendTestNotification
} from '../utils/pushNotificationService';

const NotificationSettings: React.FC = () => {
  const [permissionStatus, setPermissionStatus] = useState<string>('default');
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    };
    
    setIsMobile(checkMobile());
    
    // Get current notification permission status
    const status = getNotificationPermissionStatus();
    setPermissionStatus(status);
    
    console.log('Device type:', checkMobile() ? 'mobile' : 'desktop');
    console.log('Current notification permission status:', status);
  }, []);

  const handleRequestPermission = async () => {
    try {
      const granted = await requestNotificationPermission();
      console.log('Permission request result:', granted);
      
      if (granted) {
        setPermissionStatus('granted');
        toast.success('Notification permission granted!');
      } else {
        toast.error('Notification permission denied. Please update your browser settings.');
        // Update status after permission request
        const newStatus = getNotificationPermissionStatus();
        setPermissionStatus(newStatus);
        console.log('Updated permission status:', newStatus);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Error requesting notification permissions');
    }
  };

  const handleTestNotification = () => {
    if (sendTestNotification()) {
      toast.success('Test notification sent!');
    } else {
      toast.error('Failed to send test notification');
    }
  };

  // If browser doesn't support notifications
  if (permissionStatus === 'not-supported') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <BellOff className="h-5 w-5 text-amber-500 mr-2" />
          <span className="text-amber-700">
            {isMobile 
              ? "Push notifications aren't fully supported on mobile browsers. For best experience, use Chrome on desktop."
              : "Your browser doesn't support push notifications"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm mb-4">
      <h3 className="text-lg font-medium mb-2">Reservation Notifications</h3>
      <p className="text-gray-600 mb-3">
        {permissionStatus === 'granted' 
          ? 'You will receive notifications when new reservations are made.'
          : 'Enable notifications to get alerts when new reservations are made.'}
      </p>
      
      {permissionStatus !== 'granted' && (
        <button
          onClick={handleRequestPermission}
          className="flex items-center bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md mr-2 mb-2"
        >
          <Bell className="h-4 w-4 mr-2" />
          Enable Notifications
        </button>
      )}
      
      {permissionStatus === 'granted' && (
        <>
          <div className="flex items-center text-green-600 mb-3">
            <Bell className="h-5 w-5 mr-2" />
            <span>Notifications are enabled</span>
          </div>
          
          <button
            onClick={handleTestNotification}
            className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Test Notification
          </button>
        </>
      )}
      
      {isMobile && (
        <p className="text-amber-600 text-sm mt-3">
          Note: Notification support on mobile browsers is limited. For the best experience, use Chrome on desktop.
        </p>
      )}
    </div>
  );
};

export default NotificationSettings;
