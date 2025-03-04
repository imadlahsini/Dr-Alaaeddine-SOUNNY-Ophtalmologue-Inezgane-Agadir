
/**
 * Push Notification Service
 * Handles browser push notifications for admins when new reservations are made
 */

// Check if device is mobile
const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Improved check if browser supports notifications
const isNotificationSupported = (): boolean => {
  return 'Notification' in window && 'permission' in Notification;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) {
    console.log('This browser does not support push notifications');
    return false;
  }

  try {
    console.log('Requesting notification permission...');
    const permission = await Notification.requestPermission();
    console.log('Permission request result:', permission);
    
    // On mobile, even if permission is granted, we want to warn about possible limitations
    if (permission === 'granted' && isMobileDevice()) {
      console.log('Permission granted on mobile device - notifications may be limited');
    }
    
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Check if the current user is an admin - improved with multiple checks
const isAdmin = (): boolean => {
  // Check multiple sources to determine admin status
  
  // 1. Check localStorage (most reliable for persistence)
  const localStorageAuth = localStorage.getItem('isAuthenticated') === 'true';
  
  // 2. Check URL path (reliable for current session)
  const isDashboardPage = window.location.pathname.includes('/dashboard');
  
  // 3. Check sessionStorage as a fallback (useful for mobile browsers that might clear localStorage)
  const sessionStorageAuth = sessionStorage.getItem('isAuthenticated') === 'true';
  
  console.log('Admin check:', { localStorageAuth, isDashboardPage, sessionStorageAuth });
  
  return localStorageAuth || isDashboardPage || sessionStorageAuth;
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
  if (!isNotificationSupported()) {
    console.log('Notifications not supported by browser');
    return false;
  }
  
  if (Notification.permission !== 'granted') {
    console.log('Notification permission not granted. Current status:', Notification.permission);
    // Try to request permission if not denied
    if (Notification.permission !== 'denied') {
      requestNotificationPermission().then(granted => {
        if (granted) {
          // Try again after permission is granted
          sendReservationNotification(reservationData);
        }
      });
    }
    return false;
  }

  try {
    console.log('Creating notification for:', reservationData.name);
    
    // Mobile-specific considerations
    const requireInteraction = !isMobileDevice(); // On mobile, don't require interaction as it's not well supported
    
    // Create the notification with improved compatibility
    const notification = new Notification('New Reservation!', {
      body: `${reservationData.name} has booked for ${reservationData.date} at ${reservationData.timeSlot}`,
      icon: '/favicon.ico', // Use site favicon as notification icon
      tag: 'new-reservation', // Tag for grouping similar notifications
      requireInteraction: requireInteraction // Keep notification visible until user interacts with it, except on mobile
    });

    console.log('Notification created successfully');

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

// Test notification to verify permissions and functionality
export const sendTestNotification = (): boolean => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    console.log('Cannot send test notification - permissions not granted');
    return false;
  }

  try {
    // Mobile-specific considerations
    const requireInteraction = !isMobileDevice(); // On mobile, don't require interaction as it's not well supported
    
    const notification = new Notification('Test Notification', {
      body: 'This is a test notification. If you can see this, notifications are working correctly.',
      icon: '/favicon.ico',
      requireInteraction: requireInteraction
    });
    
    notification.onclick = () => {
      window.focus();
    };
    
    return true;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return false;
  }
};

// Initialize notifications on page load
export const initializeNotifications = async (): Promise<void> => {
  console.log('Initializing notifications, is admin:', isAdmin());
  
  // Only initialize for admin users or dashboard page
  if (!isAdmin()) {
    return;
  }

  // Log current notification support and status
  console.log('Notification supported:', isNotificationSupported());
  console.log('Current permission status:', Notification.permission);
  
  // Explicitly set authentication status in both storage mechanisms for better mobile support
  localStorage.setItem('isAuthenticated', 'true');
  sessionStorage.setItem('isAuthenticated', 'true');
  
  // Request permission if not already granted
  if (isNotificationSupported() && Notification.permission !== 'granted') {
    console.log('Requesting notification permission automatically for admin user...');
    await requestNotificationPermission();
  }
};

// Get current notification permission status
export const getNotificationPermissionStatus = (): string => {
  if (!isNotificationSupported()) {
    return 'not-supported';
  }
  return Notification.permission;
};
