import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// Use direct paths to public directory
const frFlag = './images/fr.webp';
const arFlag = './images/ar.webp';
const tmFlag = './images/tm.webp';

interface LanguageSwitcherProps {
  currentLanguage: 'fr' | 'ar' | 'tm';
  onLanguageChange: (lang: 'fr' | 'ar' | 'tm') => void;
  initialPopupOpen?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  currentLanguage, 
  onLanguageChange, 
  initialPopupOpen = false 
}) => {
  const [popupVisible, setPopupVisible] = useState(initialPopupOpen);
  const [closing, setClosing] = useState(false);
  const isRtl = currentLanguage === 'ar';

  useEffect(() => {
    // If initialPopupOpen is true, open the popup on component mount
    if (initialPopupOpen) {
      setPopupVisible(true);
    }
  }, [initialPopupOpen]);

  const languageLabels = {
    fr: 'Français',
    ar: 'العربية',
    tm: 'ⵜⴰⵎⴰⵣⵉⵖⵜ'
  };

  const languageTitles = {
    fr: 'Sélectionnez la langue française',
    ar: 'اختر اللغة العربية',
    tm: 'ⵜⵉⵍⵍⵉ ⵡⵓⴰⵍ ⵏ ⵜⴰⵎⴰⵣⵉⵖⵜ'
  };

  // Create a map for flag images
  const flagImages = {
    fr: frFlag,
    ar: arFlag,
    tm: tmFlag
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setPopupVisible(false);
      setClosing(false);
    }, 400);
  };

  return (
    <>
      <button 
        className={`language-button ${isRtl ? 'left-4 right-auto' : 'right-4 left-auto'}`}
        onClick={() => setPopupVisible(true)}
        aria-label="Change language"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <img 
          src={flagImages[currentLanguage]} 
          alt={languageLabels[currentLanguage]} 
          className="w-6 h-6"
        />
        <span>{languageLabels[currentLanguage]}</span>
      </button>

      {/* Backdrop with blur effect */}
      <AnimatePresence>
        {popupVisible && (
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {popupVisible && (
          <motion.div
            className={`language-popup ${closing ? 'closing' : ''} z-50`}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <button 
              className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} text-gray-500 hover:text-gray-700`}
              onClick={handleClose}
              aria-label="Close language selection"
            >
              <X size={24} />
            </button>

            <div className="w-full flex flex-col items-center justify-between h-full py-4">
              <div className="flex flex-col items-center w-full gap-2">
                <div className="text-lg font-semibold mb-1">{languageTitles.ar}</div>
                <motion.button 
                  className="language-option"
                  whileHover={{ y: -5, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { 
                    onLanguageChange('ar');
                    handleClose();
                  }}
                  aria-label="Select Arabic language"
                >
                  <img src={flagImages.ar} alt="Arabic" />
                  <span>العربية</span>
                </motion.button>
                
                <div className="text-lg font-semibold mb-1 mt-2">{languageTitles.fr}</div>
                <motion.button 
                  className="language-option"
                  whileHover={{ y: -5, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { 
                    onLanguageChange('fr');
                    handleClose();
                  }}
                  aria-label="Select French language"
                >
                  <img src={flagImages.fr} alt="Francais" />
                  <span>Français</span>
                </motion.button>
                
                <div className="text-lg font-semibold mb-1 mt-2">{languageTitles.tm}</div>
                <motion.button 
                  className="language-option"
                  whileHover={{ y: -5, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { 
                    onLanguageChange('tm');
                    handleClose();
                  }}
                  aria-label="Select Tamazight language"
                >
                  <img src={flagImages.tm} alt="Tamazight" />
                  <span>ⵜⴰⵎⴰⵣⵉⵖⵜ</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LanguageSwitcher;
