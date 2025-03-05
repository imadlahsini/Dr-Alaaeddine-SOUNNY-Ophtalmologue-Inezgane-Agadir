
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface TimeSlotSelectorProps {
  selectedDate: string;
  onChange: (timeSlot: string) => void;
  value: string;
  labels: {
    title: string;
    slots: {
      morning: string;
      afternoon: string;
      evening: string;
    };
  };
  isRtl?: boolean;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({ 
  selectedDate, 
  onChange, 
  value,
  labels,
  isRtl = false
}) => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([
    '8h00-11h00',
    '11h00-14h00',
    '14h00-16h00'
  ]);

  useEffect(() => {
    if (!selectedDate) return;

    // Convert the date string to a Date object
    const [day, month, year] = selectedDate.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Set available slots based on day of week
    if (dayOfWeek === 6) { // Saturday
      setAvailableSlots(['8h00-11h00']);
    } else if (dayOfWeek === 0) { // Sunday
      setAvailableSlots([]);
    } else { // Monday to Friday
      setAvailableSlots(['8h00-11h00', '11h00-14h00', '14h00-16h00']);
    }
  }, [selectedDate]);

  const handleSelectTimeSlot = (timeSlot: string) => {
    onChange(timeSlot);
  };

  // Map the time slots to display labels
  const getDisplayLabel = (slot: string) => {
    switch(slot) {
      case '8h00-11h00': return labels.slots.morning;
      case '11h00-14h00': return labels.slots.afternoon;
      case '14h00-16h00': return labels.slots.evening;
      default: return slot;
    }
  };

  return (
    <div className="form-group">
      <label htmlFor="visit-time" className="flex items-center">
        <span className={`inline-flex ${isRtl ? 'ml-1' : 'mr-1'}`}>
          <Clock className="w-4 h-4" />
        </span>
        {labels.title}
      </label>
      <div className="flex gap-2 pt-1">
        {availableSlots.length > 0 ? (
          <div className="time-buttons w-full flex gap-2">
            {availableSlots.map((timeSlot) => (
              <motion.button
                key={timeSlot}
                type="button"
                className={`time-button ${value === timeSlot ? 'selected' : ''}`}
                onClick={() => handleSelectTimeSlot(timeSlot)}
                whileHover={{ y: -2, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
                whileTap={{ scale: 0.98 }}
                data-value={timeSlot}
                aria-pressed={value === timeSlot}
              >
                {getDisplayLabel(timeSlot)}
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="w-full text-center py-4 text-gray-500 italic">
            No time slots available on this day
          </div>
        )}
      </div>
      <input type="hidden" id="visit-time" name="visit-time" value={value} readOnly />
    </div>
  );
};

export default TimeSlotSelector;
