
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  requestNotificationPermission, 
  getNotificationPermissionStatus,
  sendTestNotification,
  initializeNotifications
} from '../utils/pushNotificationService';

const NotificationSettings: React.FC = () => {
  const [permissionStatus, setPermissionStatus] = useState(Notification.permission);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if we're on a mobile device
    const checkMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };
    
    setIsMobile(checkMobile());

    // Update permission status when it changes
    const updateStatus = () => {
      setPermissionStatus(Notification.permission);
    };

    // Subscribe to permission change events
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'notifications' }).then(permissionStatus => {
        permissionStatus.onchange = updateStatus;
        // Map PermissionState to Notification.permission values
        // PermissionState can be 'granted', 'denied', 'prompt', but we need to map 'prompt' to 'default'
        const mappedState = permissionStatus.state === 'prompt' ? 'default' : permissionStatus.state;
        setPermissionStatus(mappedState as NotificationPermission);
      }).catch(error => {
        console.error('Error checking notification permission:', error);
      });
    } else {
      // Fallback for browsers without navigator.permissions API
      setPermissionStatus(Notification.permission);
    }

    // Initial check
    updateStatus();

    // Clean up the subscription
    return () => {
      if ('permissions' in navigator) {
        navigator.permissions.query({ name: 'notifications' }).then(permissionStatus => {
          permissionStatus.onchange = null;
        }).catch(error => {
          console.error('Error cleaning up notification permission subscription:', error);
        });
      }
    };
  }, []);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      toast.success('Notification permission granted!');
    } else {
      toast.error('Notification permission not granted.');
    }
    setPermissionStatus(Notification.permission);
  };

  const handleTestNotification = () => {
    const success = sendTestNotification();
    if (success) {
      toast.success('Test notification sent successfully!');
    } else if (Notification.permission === 'denied') {
      toast.error('Notification permission denied. Please enable notifications in your browser settings.');
    } else if (Notification.permission === 'default') {
      requestNotificationPermission().then(granted => {
        if (granted) {
          sendTestNotification();
          toast.success('Notification permission granted! Test sent.');
        } else {
          toast.error('Notification permission not granted.');
        }
      });
    } else {
      toast.error('Failed to send test notification.');
    }
  };

  const openBrowserSettings = () => {
    if (isMobile) {
      // Instructions toast for mobile users
      toast.info('Please go to your browser settings and enable notifications for this site.');
    } else {
      // Desktop users can be guided to the specific browsers' settings pages
      if (navigator.userAgent.includes('Chrome')) {
        window.open('chrome://settings/content/notifications', '_blank');
      } else if (navigator.userAgent.includes('Firefox')) {
        window.open('about:preferences#privacy', '_blank');
      } else if (navigator.userAgent.includes('Safari')) {
        toast.info('Please go to Safari Preferences > Websites > Notifications and allow notifications for this site.');
      } else {
        toast.info('Please check your browser settings to enable notifications for this website.');
      }
    }
  };

  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">Notification Settings</h2>
      <div className="flex flex-wrap items-center">
        <p className="text-gray-600 mr-2">
          Notification Permission: {permissionStatus}
        </p>
        {permissionStatus === 'default' && (
          <button
            onClick={handleRequestPermission}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 my-1"
          >
            Request Permission
          </button>
        )}
        {permissionStatus === 'denied' && (
          <button
            onClick={openBrowserSettings}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-2 my-1"
          >
            Enable in Browser Settings
          </button>
        )}
        <button
          onClick={handleTestNotification}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-1"
        >
          Test Notification
        </button>
      </div>
      {isMobile && permissionStatus !== 'granted' && (
        <p className="text-amber-600 mt-2">
          Note: Mobile browsers handle notifications differently. You may need to enable them manually in your browser settings.
        </p>
      )}
    </div>
  );
};

export default NotificationSettings;
