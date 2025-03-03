
/**
 * Telegram Notification Service
 * Sends notifications to Telegram when new reservations are made
 */

interface TelegramConfig {
  chatId: string;
  botToken: string;
}

interface ReservationData {
  name: string;
  phone: string;
  date: string;
  timeSlot: string;
}

/**
 * Sends a notification to Telegram about a new reservation
 */
export const sendTelegramNotification = async (
  reservationData: ReservationData,
  config?: TelegramConfig
): Promise<boolean> => {
  try {
    // Default to environment variables if not provided
    const chatId = config?.chatId || import.meta.env.VITE_TELEGRAM_CHAT_ID || "6024686458";
    const botToken = config?.botToken || import.meta.env.VITE_TELEGRAM_BOT_TOKEN;

    // If no bot token is available, return false
    if (!botToken) {
      console.error("Telegram bot token is missing");
      return false;
    }

    const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    // Format the message
    const message = formatNotificationMessage(reservationData);
    
    // Send the message to Telegram
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    
    if (!data.ok) {
      console.error("Failed to send Telegram notification:", data.description);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error sending Telegram notification:", error);
    return false;
  }
};

/**
 * Formats the notification message with reservation details
 */
const formatNotificationMessage = (reservation: ReservationData): string => {
  return `
<b>🎉 New Reservation!</b>

<b>👤 Name:</b> ${reservation.name}
<b>📱 Phone:</b> ${reservation.phone}
<b>📅 Date:</b> ${reservation.date}
<b>⏰ Time:</b> ${reservation.timeSlot}

<i>This reservation is currently pending confirmation.</i>
`;
};
