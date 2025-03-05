
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReservationForm from '../components/ReservationForm';
import LanguageSwitcher from '../components/LanguageSwitcher';

// Use external image URL
const logoImage = 'https://winumaroc.com/imad/logo.webp';

const Index = () => {
  const [language, setLanguage] = useState<'fr' | 'ar' | 'tm'>('fr');

  // Translations for the page title
  const titles = {
    fr: "Réservez Votre Rendez-vous",
    ar: "احجز موعدك",
    tm: "ⵉⵙⵖⵏ ⵜⴰⵡⴰⵍⵜ ⵏⵏⴽ"
  };

  return (
    <div className={`min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Language selection button */}
      <LanguageSwitcher 
        currentLanguage={language} 
        onLanguageChange={setLanguage}
        initialPopupOpen={true} // Open popup on page load
      />

      {/* Logo */}
      <motion.img 
        src={logoImage} 
        alt="Logo" 
        className="w-[120px] sm:w-[156px] mb-4 sm:mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      />

      {/* Title */}
      <motion.h1 
        className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6 text-center px-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {titles[language]}
      </motion.h1>

      {/* Reservation Form */}
      <ReservationForm language={language} />
    </div>
  );
};

export default Index;
