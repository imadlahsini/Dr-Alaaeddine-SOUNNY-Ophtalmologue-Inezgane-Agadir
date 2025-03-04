
import React, { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';
import { requestNotificationPermission, getNotificationPermissionStatus } from '../utils/pushNotificationService';

const NotificationSettings: React.FC = () => {
  const [permissionStatus, setPermissionStatus] = useState<string>('default');

  useEffect(() => {
    // Get current notification permission status
    const status = getNotificationPermissionStatus();
    setPermissionStatus(status);
  }, []);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setPermissionStatus('granted');
      toast.success('Notification permission granted!');
    } else {
      toast.error('Notification permission denied. Please update your browser settings.');
      setPermissionStatus(getNotificationPermissionStatus());
    }
  };

  // If browser doesn't support notifications
  if (permissionStatus === 'not-supported') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <BellOff className="h-5 w-5 text-amber-500 mr-2" />
          <span className="text-amber-700">Your browser doesn't support push notifications</span>
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
          className="flex items-center bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md"
        >
          <Bell className="h-4 w-4 mr-2" />
          Enable Notifications
        </button>
      )}
      
      {permissionStatus === 'granted' && (
        <div className="flex items-center text-green-600">
          <Bell className="h-5 w-5 mr-2" />
          <span>Notifications are enabled</span>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
