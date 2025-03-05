
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, MapPin, Phone, Calendar, Clock, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface LocationState {
  reservation?: {
    name: string;
    phone: string;
    date: string;
    timeSlot: string;
  };
  language?: 'fr' | 'ar' | 'tm';
}

// Translations for the thank you page
const translations = {
  fr: {
    title: "Merci pour votre réservation!",
    subtitle: "Votre demande de rendez-vous a été reçue avec succès. Nous vous contacterons bientôt pour confirmer.",
    steps: {
      fillForm: "Remplir le formulaire",
      formSent: "Formulaire envoyé",
      confirmationCall: "Appel de confirmation"
    },
    reservationInfo: "Informations de réservation",
    map: {
      title: "Notre emplacement"
    }
  },
  ar: {
    title: "شكرًا على حجزك!",
    subtitle: "تم استلام طلب موعدك بنجاح. سنتصل بك قريبًا للتأكيد.",
    steps: {
      fillForm: "ملء النموذج",
      formSent: "تم إرسال النموذج",
      confirmationCall: "مكالمة التأكيد"
    },
    reservationInfo: "معلومات الحجز",
    map: {
      title: "موقعنا"
    }
  },
  tm: {
    title: "ⵜⴰⵏⵎⵎⵉⵔⵜ ⵉ ⵓⵙⵖⵏ ⵏⵏⴽ!",
    subtitle: "ⵜⴰⵡⴰⵍⵜ ⵏⵏⴽ ⵜⵜⵓⵔⵎⵙ ⵙ ⵜⵖⴰⵔⴰ. ⵔⴰⴷ ⴽⵉⴷⴽ ⵏⵎⵢⴰⵡⴰⴹ ⴷⵖⵢⴰ ⴰⴼⴰⴷ ⴰⴷ ⵏⵙⵏⵖⵎ.",
    steps: {
      fillForm: "ⵜⵓⵜⵍⴰⵢⵜ ⵏ ⵜⴼⵓⵍⵜ",
      formSent: "ⵜⴼⵓⵍⵜ ⵜⵜⵓⵣⵏ",
      confirmationCall: "ⵜⵉⵖⵔⵉ ⵏ ⵓⵙⵏⵖⵎ"
    },
    reservationInfo: "ⵉⵙⴰⵍⵏ ⵏ ⵜⵡⴰⵍⵜ",
    map: {
      title: "ⴰⴷⵖⴰⵔ ⵏⵏⵖ"
    }
  }
};

const ThankYou = () => {
  const location = useLocation();
  const [state, setState] = useState<LocationState>({});
  const [language, setLanguage] = useState<'fr' | 'ar' | 'tm'>('fr');

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    
    // Get reservation details and language from location state if available
    if (location.state) {
      setState(location.state);
      
      if (location.state.language) {
        setLanguage(location.state.language);
        console.log("Language received:", location.state.language);
      }
      
      if (location.state.reservation) {
        console.log("Reservation data received:", location.state.reservation);
      } else {
        console.warn("No reservation data in location state");
      }
    }
  }, [location]);

  // Get translations based on current language
  const t = translations[language];
  const isRtl = language === 'ar';

  // Format the date if available (from DD/MM/YYYY to a more readable format)
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const [day, month, year] = dateString.split('/');
    const date = new Date(`${year}-${month}-${day}`);
    
    // Use appropriate locale based on language
    const locale = language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-MA' : 'fr-FR';
    
    return date.toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className={`h-screen bg-background flex flex-col items-center justify-between p-0 relative overflow-hidden ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Top Section - Reservation Details */}
      <motion.div 
        className="w-full max-w-md bg-white pt-6 pb-4 px-6 sm:px-8 text-center z-10 relative h-[55vh] flex flex-col"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1]
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2 
          }}
          className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-xl sm:text-2xl font-bold text-primary mb-2"
        >
          {t.title}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-gray-600 mb-6 text-sm sm:text-base"
        >
          {t.subtitle}
        </motion.p>
        
        {/* Status cards with increased spacing */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-4 space-y-4"
        >
          <div className="bg-gray-50 border border-primary rounded-xl p-3 flex items-center gap-3">
            <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white">
              ✓
            </div>
            <div className="text-left font-semibold text-gray-800">{t.steps.fillForm}</div>
          </div>
          
          <div className="bg-gray-50 border border-primary rounded-xl p-3 flex items-center gap-3">
            <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white">
              ✓
            </div>
            <div className="text-left font-semibold text-gray-800">{t.steps.formSent}</div>
          </div>
          
          <div className="bg-amber-50 border border-amber-400 rounded-xl p-3 flex items-center gap-3 animate-pulse">
            <div className="w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center text-white">
              !
            </div>
            <div className="text-left font-semibold text-gray-800">{t.steps.confirmationCall}</div>
          </div>
        </motion.div>
        
        {/* Reservation info card */}
        {state.reservation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 mb-4 shadow-sm border border-gray-100 mt-auto"
          >
            <h2 className={`font-bold text-gray-800 mb-3 ${isRtl ? 'text-right' : 'text-left'}`}>{t.reservationInfo}</h2>
            
            <div className="flex items-center gap-3 mb-2">
              <User className={`w-5 h-5 text-primary ${isRtl ? 'ml-1' : 'mr-1'}`} />
              <span className={`text-gray-700 ${isRtl ? 'text-right' : 'text-left'} text-sm flex-1`}>
                {state.reservation.name}
              </span>
            </div>
            
            <div className="flex items-center gap-3 mb-2">
              <Phone className={`w-5 h-5 text-primary ${isRtl ? 'ml-1' : 'mr-1'}`} />
              <span className={`text-gray-700 ${isRtl ? 'text-right' : 'text-left'} text-sm flex-1`}>
                {state.reservation.phone}
              </span>
            </div>
            
            <div className="flex items-center gap-3 mb-2">
              <Calendar className={`w-5 h-5 text-primary ${isRtl ? 'ml-1' : 'mr-1'}`} />
              <span className={`text-gray-700 ${isRtl ? 'text-right' : 'text-left'} text-sm flex-1`}>
                {formatDate(state.reservation.date)}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className={`w-5 h-5 text-primary ${isRtl ? 'ml-1' : 'mr-1'}`} />
              <span className={`text-gray-700 ${isRtl ? 'text-right' : 'text-left'} text-sm flex-1`}>
                {state.reservation.timeSlot}
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>
      
      {/* Bottom Section - Map with no space above it */}
      <div className="w-full h-[45vh] relative z-0">
        {/* Gradient fade overlay */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-background to-transparent z-10"></div>
        
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3442.605201761381!2d-9.526219!3d30.3621682!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xdb3c95c0fb6ec59%3A0xddd29694e1d79aee!2z2LAuINiz2YjZhtmKIERyLiBTb3Vubnkg2LfYqNmK2Kgg2KfZhNi52YrZiNmGIE9waHRhbG1vbG9ndWUgSW5lemdhbmUgLSBEY2hlaXJhIEFnYWRpciAtINiv2LTZitix2Kkg2KXZhtiy2YPYp9mGINij2YPYp9iv2YrYsQ!5e0!3m2!1sen!2sma!4v1741123148252!5m2!1sen!2sma" 
          className="w-full h-full border-0" 
          loading="lazy"
          title="Location"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        ></iframe>
      </div>
      
      {/* Floating action buttons */}
      <div className="fixed bottom-5 right-5 flex flex-col gap-3 z-20">
        <a 
          href="https://wa.me/" 
          className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-green-600 transition-transform hover:scale-110"
          aria-label="WhatsApp"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/>
            <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z"/>
            <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z"/>
            <path d="M9.5 13.5c.5 1 1.5 1 2.5 1s2-.5 2.5-1"/>
          </svg>
        </a>
        
        <a 
          href="tel:+123456789" 
          className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary/90 transition-transform hover:scale-110"
          aria-label="Phone"
        >
          <Phone className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
};

export default ThankYou;
