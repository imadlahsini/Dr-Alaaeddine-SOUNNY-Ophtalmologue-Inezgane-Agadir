
import React, { useState, useEffect } from 'react';
import { format, addDays, isValid } from 'date-fns';
import { fr, ar } from 'date-fns/locale';
import { Calendar, User, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import TimeSlotSelector from './TimeSlotSelector';

// Define translations
const translations = {
  fr: {
    title: "Réservez Votre Rendez-vous",
    form: {
      date: {
        label: "Sélectionner le jour",
        placeholder: "Choisir une date"
      },
      time: {
        title: "Sélectionner l'heure",
        slots: {
          morning: "8h00 - 11h00",
          afternoon: "11h00 - 14h00",
          evening: "14h00 - 16h00"
        }
      },
      name: {
        label: "Nom complet",
        placeholder: "Entrez Votre Nom"
      },
      phone: {
        label: "Numéro de téléphone",
        placeholder: "Entrez votre numéro de téléphone"
      },
      submit: "Envoyez",
      submitting: "En cours..."
    },
    validation: {
      required: "Ce champ est obligatoire",
      phone: "Numéro de téléphone invalide"
    },
    success: "Votre rendez-vous a été réservé avec succès !"
  },
  ar: {
    title: "احجز موعدك",
    form: {
      date: {
        label: "اختر اليوم",
        placeholder: "اختر تاريخًا"
      },
      time: {
        title: "اختر الوقت",
        slots: {
          morning: "8:00 - 11:00",
          afternoon: "11:00 - 14:00",
          evening: "14:00 - 16:00"
        }
      },
      name: {
        label: "الاسم الكامل",
        placeholder: "أدخل اسمك"
      },
      phone: {
        label: "رقم الهاتف",
        placeholder: "أدخل رقم هاتفك"
      },
      submit: "إرسال",
      submitting: "جاري المعالجة..."
    },
    validation: {
      required: "هذا الحقل مطلوب",
      phone: "رقم هاتف غير صحيح"
    },
    success: "تم حجز موعدك بنجاح!"
  },
  tm: {
    title: "ⵉⵙⵖⵏ ⵜⴰⵡⴰⵍⵜ ⵏⵏⴽ",
    form: {
      date: {
        label: "ⵙⵜⵉ ⴰⵙⵙ",
        placeholder: "ⵙⵜⵉ ⴰⵣⵓⵎ"
      },
      time: {
        title: "ⵙⵜⵉ ⴰⴽⵓⴷ",
        slots: {
          morning: "8:00 - 11:00",
          afternoon: "11:00 - 14:00",
          evening: "14:00 - 16:00"
        }
      },
      name: {
        label: "ⵉⵙⵎ ⵏⵏⴽ",
        placeholder: "ⵙⴽⵛⵎ ⵉⵙⵎ ⵏⵏⴽ"
      },
      phone: {
        label: "ⵓⵟⵟⵓⵏ ⵏ ⵜⵜⵉⵍⵉⴼⵓⵏ",
        placeholder: "ⵙⴽⵛⵎ ⵓⵟⵟⵓⵏ ⵏ ⵜⵜⵉⵍⵉⴼⵓⵏ ⵏⵏⴽ"
      },
      submit: "ⴰⵣⵏ",
      submitting: "ⵉⵜⵜⵓⵙⴽⴰⵔ..."
    },
    validation: {
      required: "ⵉⵍⴰ ⴰⴷ ⵜⵙⴽⵛⵎⴷ ⴰⵢⴰ",
      phone: "ⵓⵟⵟⵓⵏ ⵏ ⵜⵜⵉⵍⵉⴼⵓⵏ ⵡⴰⵔ ⵉⵣⴷⵉ"
    },
    success: "ⵜⴰⵡⴰⵍⵜ ⵏⵏⴽ ⵜⵎⵙⴽⵍ ⵙ ⵜⵖⴰⵔⴰ!"
  }
};

interface ReservationFormProps {
  language: 'fr' | 'ar' | 'tm';
}

const ReservationForm: React.FC<ReservationFormProps> = ({ language }) => {
  const navigate = useNavigate();
  const t = translations[language];
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    timeSlot: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValid, setFormValid] = useState(false);
  const [dateOptions, setDateOptions] = useState<{ value: string; label: string; disabled: boolean }[]>([]);

  // Initialize date options for the next 5 days
  useEffect(() => {
    const options = [];
    const today = new Date();
    
    for (let i = 0; i < 5; i++) {
      const date = addDays(today, i);
      const dayOfWeek = date.getDay();
      const formattedDate = format(date, 'dd/MM/yyyy');
      const localizedDate = format(date, 'EEEE, d MMMM', { 
        locale: language === 'fr' ? fr : language === 'ar' ? ar : undefined 
      });
      
      options.push({
        value: formattedDate,
        label: localizedDate,
        disabled: dayOfWeek === 0  // Disable Sundays
      });
    }
    
    setDateOptions(options);
  }, [language]);

  const validateForm = () => {
    const { name, phone, date, timeSlot } = formData;
    const phoneRegex = /^[0-9]{9,10}$/;
    const isValid = 
      name.trim() !== '' && 
      phoneRegex.test(phone) && 
      date !== '' && 
      timeSlot !== '';
    
    setFormValid(isValid);
    return isValid;
  };

  useEffect(() => {
    validateForm();
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeSlotChange = (timeSlot: string) => {
    setFormData(prev => ({ ...prev, timeSlot }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    try {
      // In a real app, this would be an API call to save the reservation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(t.success);
      setTimeout(() => {
        navigate('/thank-you');
      }, 1000);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine text direction based on language
  const isRtl = language === 'ar';

  return (
    <motion.form 
      className={`form-appear w-full max-w-md p-5 bg-white rounded-[20px] shadow-md flex flex-col gap-8 ${isRtl ? 'text-right' : 'text-left'}`}
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Date Selection */}
      <div className="form-group">
        <label htmlFor="date">
          <Calendar className="w-4 h-4 mr-1" /> {t.form.date.label}
        </label>
        <select 
          id="date" 
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full p-4 text-base bg-transparent border-none rounded-[15px] outline-none"
          required
        >
          <option value="" disabled>{t.form.date.placeholder}</option>
          {dateOptions.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Time Slot Selection */}
      <TimeSlotSelector 
        selectedDate={formData.date}
        onChange={handleTimeSlotChange}
        value={formData.timeSlot}
        labels={t.form.time}
      />

      {/* Name Field */}
      <div className="form-group">
        <label htmlFor="name">
          <User className="w-4 h-4 mr-1" /> {t.form.name.label}
        </label>
        <input 
          type="text" 
          id="name" 
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-4 text-base bg-transparent border-none rounded-[15px] outline-none"
          placeholder={t.form.name.placeholder}
          required
        />
      </div>

      {/* Phone Field */}
      <div className="form-group">
        <label htmlFor="phone">
          <Phone className="w-4 h-4 mr-1" /> {t.form.phone.label}
        </label>
        <input 
          type="tel" 
          id="phone" 
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full p-4 text-base bg-transparent border-none rounded-[15px] outline-none"
          placeholder={t.form.phone.placeholder}
          pattern="[0-9]{9,10}"
          required
        />
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        className="primary-button group"
        disabled={!formValid || isSubmitting}
        whileHover={{ y: -2, boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)' }}
        whileTap={{ scale: 0.98 }}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            {t.form.submitting} 
            <Loader2 className="ml-2 animate-spin w-5 h-5" />
          </span>
        ) : (
          <span className="flex items-center justify-center">
            {t.form.submit}
            <motion.span
              className="ml-2"
              initial={{ x: 0 }}
              animate={{ x: 5 }}
              transition={{ 
                repeat: Infinity, 
                repeatType: "reverse", 
                duration: 0.6 
              }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.span>
          </span>
        )}
      </motion.button>
    </motion.form>
  );
};

export default ReservationForm;
