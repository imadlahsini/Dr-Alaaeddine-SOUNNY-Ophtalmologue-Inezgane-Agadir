import axios from 'axios';

export interface ReservationData {
  name: string;
  phone: string;
  date: string;
  timeSlot: string;
}

//URL of your Google Apps Script deployment
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwBQktxTJZyyqTyWdarrjDxG7nYISSo47oXn65vvHH4ikymzPHRlXqzRRMl6hPzpfnZFQ/exec';


export const saveReservationToSheet = async (data: ReservationData): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await axios.post(SCRIPT_URL, data);
    
    if (response.data.success) {
      return { success: true };
    } else {
      console.error('Erreur lors de l\'enregistrement dans Google Sheets:', response.data);
      return { 
        success: false, 
        message: response.data.message || 'Échec de l\'enregistrement des données' 
      };
    }
  } catch (error) {
    console.error('Erreur lors de la connexion au script Google:', error);
    return { 
      success: false,
      message: 'Impossible de se connecter au serveur. Veuillez réessayer plus tard.' 
    };
  }
};
