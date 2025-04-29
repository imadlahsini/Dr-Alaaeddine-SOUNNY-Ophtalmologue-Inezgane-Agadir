


interface Reservation {
    name: string;
    phone: string;
    date: string;
    timeSlot: string;
    language?: string;
  }
  
  interface TelegramResponse {
    ok: boolean;
    result?: any;
    description?: string;
  }
  
  interface NotificationResult {
    success: boolean;
    results?: TelegramResponse[];
    result?: TelegramResponse;
    message?: string;
    error?: any;
  }
  
  
  const TELEGRAM_BOT_TOKEN: string = "7568197664:AAH42WusrtFjIZv3DjUfAAzz4jBLdqseD2k"; // your token  via BotFather
  const ADMIN_CHAT_IDS: string[] = ["6603733345"]; // Admin Id
  
  /**
   * Envoie une notification de réservation via Telegram
   * @param {Reservation} reservation 
   * @returns {Promise<NotificationResult>} 
   */
  export const sendTelegramNotification = async (reservation: Reservation): Promise<NotificationResult> => {
    const { name, phone, date, timeSlot,language } = reservation;
    
    // Message pour la notification Telegram
    const message = `
   *Nouvelle réservation!*
  
   *Nom:* ${name}
   *Téléphone:* ${phone}
   *Date:* ${date}
   *Créneau:* ${timeSlot}
   *langue:*${language}
  
  Réservation enregistrée le ${new Date().toLocaleString('fr-FR')}
  `;
  
    // Envoi de la notification a l adimin
    const sendPromises: Promise<TelegramResponse>[] = ADMIN_CHAT_IDS.map((chatId: string) => {
      return sendTelegramMessage(chatId, message);
    });
  
    try {
      const results = await Promise.all(sendPromises);
      console.log('Notifications Telegram envoyées avec succès:', results);
      return { success: true, results };
    } catch (error) {
      console.error('Erreur lors de l\'envoi des notifications Telegram:', error);
      return { success: false, error };
    }
  };
  
  /**
 
   * @param {string} chatId 
   * @param {string} text 
   * @returns {Promise<TelegramResponse>} - response
   */
  const sendTelegramMessage = async (chatId: string, text: string): Promise<TelegramResponse> => {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
      }),
    });
  
    return response.json();
  };
  
  