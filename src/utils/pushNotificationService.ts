
/**
 * Push Notification Service
 * Handles browser push notifications for admins when new reservations are made
 */

// Check if browser supports notifications
const isNotificationSupported = (): boolean => {
  return 'Notification' in window;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) {
    console.log('This browser does not support push notifications');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Check if the current user is an admin
const isAdmin = (): boolean => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

// Send a notification for new reservation
export const sendReservationNotification = (reservationData: {
  name: string;
  phone: string;
  date: string;
  timeSlot: string;
}): boolean => {
  // Only show notifications to admins
  if (!isAdmin()) {
    console.log('Push notifications are only available for admins');
    return false;
  }

  // Check if notifications are supported and permission is granted
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    console.log('Notifications not supported or permission not granted');
    return false;
  }

  try {
    // Create the notification
    const notification = new Notification('New Reservation!', {
      body: `${reservationData.name} has booked for ${reservationData.date} at ${reservationData.timeSlot}`,
      icon: '/favicon.ico', // Use site favicon as notification icon
      tag: 'new-reservation', // Tag for grouping similar notifications
      renotify: true // Force notification for each new reservation
    });

    // Add click handler to open dashboard when notification is clicked
    notification.onclick = () => {
      window.focus(); // Focus the window
      window.location.href = '/dashboard'; // Redirect to dashboard
    };

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

// Initialize notifications on page load
export const initializeNotifications = async (): Promise<void> => {
  // Only initialize for admin users
  if (!isAdmin()) {
    return;
  }

  // Request permission if not already granted
  if (isNotificationSupported() && Notification.permission !== 'granted') {
    await requestNotificationPermission();
  }
};
