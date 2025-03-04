
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft, MapPin, Phone, Calendar, Clock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6">
      <motion.div 
        className="max-w-md w-full bg-white rounded-[20px] shadow-md p-6 sm:p-8 text-center"
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
        
        {/* Google Maps embed */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-gray-800 text-left">Localisation</h3>
          </div>
          
          <div className="rounded-xl overflow-hidden h-48 w-full">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9916256937845!2d2.373522315674894!3d48.86363707928882!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e1ee61f31cf%3A0xc86ec9eaddfd84bc!2s75011%20Paris%2C%20France!5e0!3m2!1sen!2sus!4v1644330078503!5m2!1sen!2sus" 
              className="w-full h-full border-0" 
              loading="lazy"
              title="Location"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          
          <div className="mt-2">
            <a 
              href="https://maps.app.goo.gl/XirUbciG7u1597hZ6" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm flex items-center justify-center gap-1"
            >
              <MapPin className="w-4 h-4" />
              Ouvrir dans Google Maps
            </a>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-primary hover:underline text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l'accueil</span>
          </Link>
        </motion.div>
      </motion.div>
      
      {/* Floating action buttons */}
      <div className="fixed bottom-5 right-5 flex flex-col gap-3">
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
