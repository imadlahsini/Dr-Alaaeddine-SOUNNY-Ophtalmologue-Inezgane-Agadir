
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface LanguageSwitcherProps {
  currentLanguage: 'fr' | 'ar' | 'tm';
  onLanguageChange: (lang: 'fr' | 'ar' | 'tm') => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLanguage, onLanguageChange }) => {
  const [popupVisible, setPopupVisible] = useState(false);
  const [closing, setClosing] = useState(false);

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
        className="language-button"
        onClick={() => setPopupVisible(true)}
        aria-label="Change language"
      >
        <img 
          src={`https://sounny.ma/icons/${currentLanguage}.webp`} 
          alt={languageLabels[currentLanguage]} 
          className="w-6 h-6"
        />
        <span>{languageLabels[currentLanguage]}</span>
      </button>

      <AnimatePresence>
        {popupVisible && (
          <motion.div
            className={`language-popup ${closing ? 'closing' : ''}`}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <button 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
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
                  <img src="https://sounny.ma/icons/ar.webp" alt="Arabic" />
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
                  <img src="https://sounny.ma/icons/fr.webp" alt="Francais" />
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
                  <img src="https://sounny.ma/icons/tm.webp" alt="Tamazight" />
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
