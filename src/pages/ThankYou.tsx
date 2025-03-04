
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, MapPin, Phone, Calendar, Clock } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface LocationState {
  reservation?: {
    name: string;
    phone: string;
    date: string;
    timeSlot: string;
  };
}

const ThankYou = () => {
  const location = useLocation();
  const [state, setState] = useState<LocationState>({});

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    
    // Get reservation details from location state if available
    if (location.state && location.state.reservation) {
      setState({ reservation: location.state.reservation });
    }
  }, [location]);

  // Format the date if available (from DD/MM/YYYY to a more readable format)
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const [day, month, year] = dateString.split('/');
    const date = new Date(`${year}-${month}-${day}`);
    
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start p-0 relative overflow-hidden">
      {/* Top Section - Reservation Details (65% of screen height) */}
      <motion.div 
        className="w-full max-w-md bg-white pt-8 pb-6 px-6 sm:px-8 text-center z-10 relative h-[65vh] overflow-y-auto"
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
          className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6"
        >
          <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-xl sm:text-2xl font-bold text-primary mb-2"
        >
          Merci pour votre réservation!
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base"
        >
          Votre demande de rendez-vous a été reçue avec succès. <b>Nous vous contacterons bientôt pour confirmer.</b>
        </motion.p>
        
        {/* Status cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-6"
        >
          <div className="bg-gray-50 border border-primary rounded-xl p-3 flex items-center gap-3 mb-3">
            <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white">
              ✓
            </div>
            <div className="text-left font-semibold text-gray-800">Remplir le formulaire</div>
          </div>
          
          <div className="bg-gray-50 border border-primary rounded-xl p-3 flex items-center gap-3 mb-3">
            <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white">
              ✓
            </div>
            <div className="text-left font-semibold text-gray-800">Formulaire envoyé</div>
          </div>
          
          <div className="bg-amber-50 border border-amber-400 rounded-xl p-3 flex items-center gap-3 animate-pulse">
            <div className="w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center text-white">
              !
            </div>
            <div className="text-left font-semibold text-gray-800">Appel de confirmation</div>
          </div>
        </motion.div>
        
        {/* Reservation details */}
        {state.reservation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gray-50 rounded-xl p-4 mb-6"
          >
            <h2 className="font-bold text-gray-800 mb-3 text-left">Détails de la réservation</h2>
            
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-gray-700 text-left text-sm">
                {formatDate(state.reservation.date)}
              </span>
            </div>
            
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-gray-700 text-left text-sm">
                {state.reservation.timeSlot}
              </span>
            </div>
            
            <div className="flex items-center gap-3 mb-2">
              <Phone className="w-5 h-5 text-primary" />
              <span className="text-gray-700 text-left text-sm">
                {state.reservation.phone}
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>
      
      {/* Bottom Section - Map (35% of screen height) */}
      <div className="w-full h-[35vh] absolute bottom-0 left-0 right-0 z-0">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.8132457082284!2d2.330007!3d48.868197!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66fcbe6997f3d%3A0x5c45774a9fa2ace7!2sPlace%20Saint-Augustin%2C%2075008%20Paris!5e0!3m2!1sen!2sfr!4v1715285947289!5m2!1sen!2sfr" 
          className="w-full h-full border-0" 
          loading="lazy"
          title="Location"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        ></iframe>
      </div>
      
      {/* Map Link Overlay */}
      <div className="absolute bottom-20 left-0 right-0 flex justify-center z-10">
        <a 
          href="https://maps.app.goo.gl/XirUbciG7u1597hZ6" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-white/90 backdrop-blur-sm text-primary hover:bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all hover:shadow-xl"
        >
          <MapPin className="w-4 h-4" />
          Ouvrir dans Google Maps
        </a>
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
