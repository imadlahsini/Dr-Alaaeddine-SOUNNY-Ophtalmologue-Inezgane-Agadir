
/**
 * Interface for the Telegram request body
 */
export interface TelegramRequest {
  name: string;
  phone: string;
  date: string;
  timeSlot: string;
  checkConfig?: boolean;
}

/**
 * Format the message for Telegram
 */
export const formatTelegramMessage = (data: TelegramRequest): string => {
  return `
🎉 New Reservation!

👤 Name: ${data.name}
📱 Phone: ${data.phone}
📅 Date: ${data.date}
⏰ Time: ${data.timeSlot}

This reservation is currently pending confirmation.
`;
};

/**
 * Sends a message to Telegram
 */
export const sendTelegramMessage = async (
  botToken: string,
  chatId: string,
  message: string
): Promise<Response> => {
  try {
    console.log("Sending request to Telegram API...");
    const encodedMessage = encodeURIComponent(message);
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodedMessage}&parse_mode=HTML`;
    
    const response = await fetch(telegramApiUrl);
    const responseData = await response.json();
    
    console.log("Telegram API response:", JSON.stringify(responseData));
    
    if (response.ok && responseData.ok) {
      console.log("Message sent successfully!");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Telegram notification sent successfully"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      console.error("Failed to send message:", responseData);
      return new Response(
        JSON.stringify({
          success: false,
          message: `Failed to send message: ${responseData.description || "Unknown error"}`,
          telegramResponse: responseData
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: `Error sending Telegram message: ${error instanceof Error ? error.message : String(error)}`
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * Validate the Telegram request
 */
export const validateTelegramRequest = (data: any): { isValid: boolean; missingFields: string[] } => {
  if (!data) {
    return { isValid: false, missingFields: ["data"] };
  }
  
  const missingFields = [];
  
  if (!data.name) missingFields.push("name");
  if (!data.phone) missingFields.push("phone");
  if (!data.date) missingFields.push("date");
  if (!data.timeSlot) missingFields.push("timeSlot");
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

/**
 * Process configuration check request
 */
export const handleConfigCheck = (): Response => {
  console.log("Config check request received");
  return new Response(
    JSON.stringify({
      success: true,
      message: "Configuration check completed",
      configured: true
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};
