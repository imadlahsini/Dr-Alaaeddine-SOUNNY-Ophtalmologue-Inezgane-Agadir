
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

interface TelegramResult {
  success: boolean;
  message: string;
  needsConfiguration: boolean;
}

/**
 * Sends a notification to Telegram about a new reservation
 */
export const sendTelegramNotification = async (
  reservationData: ReservationData,
  config?: TelegramConfig
): Promise<TelegramResult> => {
  try {
    console.log('Starting Telegram notification process...');
    console.log('Reservation data:', JSON.stringify(reservationData));
    
    // Try to get the bot token from localStorage first, then fallback to environment variable
    const savedBotToken = localStorage.getItem('telegramBotToken');
    
    // Default to environment variables if not provided
    const chatId = config?.chatId || import.meta.env.VITE_TELEGRAM_CHAT_ID || "1741098686";
    const botToken = config?.botToken || savedBotToken || import.meta.env.VITE_TELEGRAM_BOT_TOKEN;

    console.log('Using chatId:', chatId);
    console.log('Bot token available:', !!botToken);

    // If no bot token is available, return a configuration-needed result
    if (!botToken) {
      console.error("Telegram bot token is missing. Please configure it in the admin settings.");
      return {
        success: false,
        message: "Telegram bot token is missing. Please configure it in the admin settings.",
        needsConfiguration: true
      };
    }

    const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    // Format the message
    const message = formatNotificationMessage(reservationData);
    
    console.log("Sending Telegram notification to chat ID:", chatId);
    console.log("Using bot token:", botToken.substring(0, 6) + "...");
    console.log("Message content:", message);
    
    // Send the message to Telegram
    console.log("Making request to Telegram API...");
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

    console.log("Telegram API response status:", response.status);
    const data = await response.json();
    console.log("Telegram API response data:", data);
    
    if (!data.ok) {
      console.error("Failed to send Telegram notification:", data.description);
      return {
        success: false,
        message: data.description || "Failed to send Telegram notification",
        needsConfiguration: false
      };
    }
    
    console.log("Telegram notification sent successfully!");
    return {
      success: true,
      message: "Telegram notification sent successfully",
      needsConfiguration: false
    };
  } catch (error) {
    console.error("Error sending Telegram notification:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      needsConfiguration: false
    };
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
