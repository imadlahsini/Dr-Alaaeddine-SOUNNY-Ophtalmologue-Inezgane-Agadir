import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  requestNotificationPermission, 
  getNotificationPermissionStatus,
  sendTestNotification
} from '../utils/pushNotificationService';

const NotificationSettings: React.FC = () => {
  const [permissionStatus, setPermissionStatus] = useState(Notification.permission);

  useEffect(() => {
    // Update permission status when it changes
    const updateStatus = () => {
      setPermissionStatus(Notification.permission);
    };

    // Subscribe to permission change events
    navigator.permissions.query({ name: 'notifications' }).then(permissionStatus => {
      permissionStatus.onchange = updateStatus;
      setPermissionStatus(permissionStatus.state);
    });

    // Initial check
    updateStatus();

    // Clean up the subscription
    return () => {
      navigator.permissions.query({ name: 'notifications' }).then(permissionStatus => {
        permissionStatus.onchange = null;
      });
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

  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">Notification Settings</h2>
      <div className="flex items-center">
        <p className="text-gray-600">
          Notification Permission: {permissionStatus}
        </p>
        {permissionStatus === 'default' && (
          <button
            onClick={handleRequestPermission}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-2"
          >
            Request Permission
          </button>
        )}
        {permissionStatus === 'denied' && (
          <p className="text-red-500 ml-2">Please enable notifications in your browser settings.</p>
        )}
          <button
            onClick={handleTestNotification}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
          >
            Test Notification
          </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
