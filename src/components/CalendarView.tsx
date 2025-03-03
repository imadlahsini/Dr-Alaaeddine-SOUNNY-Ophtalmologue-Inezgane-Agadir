
import React from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface Reservation {
  id: number;
  name: string;
  phone: string;
  date: string;
  timeSlot: string;
  status: 'Pending' | 'Confirmed' | 'Canceled' | 'Not Responding';
}

interface CalendarViewProps {
  reservations: Reservation[];
  onReservationSelect: (reservation: Reservation) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ reservations, onReservationSelect }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [animation, setAnimation] = React.useState<'slideRight' | 'slideLeft'>('slideRight');

  // Filter only confirmed reservations
  const confirmedReservations = reservations.filter(res => res.status === 'Confirmed');

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-4 py-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setAnimation('slideRight');
            setTimeout(() => setCurrentMonth(subMonths(currentMonth, 1)), 10);
          }}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </motion.button>
        
        <h2 className="text-lg font-semibold text-gray-800">
          <CalendarIcon className="inline-block w-5 h-5 mr-2" />
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setAnimation('slideLeft');
            setTimeout(() => setCurrentMonth(addMonths(currentMonth, 1)), 10);
          }}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </motion.button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    let startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-sm font-medium text-gray-400 text-center">
          {format(addDays(startDate, i), 'EEEEEE')}
        </div>
      );
    }

    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = startOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';
    
    const variants = {
      slideLeft: {
        initial: { x: 20, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -20, opacity: 0 }
      },
      slideRight: {
        initial: { x: -20, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: 20, opacity: 0 }
      }
    };

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'yyyy-MM-dd');
        const cloneDay = day;
        const reservationsOnDay = confirmedReservations.filter(
          res => {
            const [dayPart, monthPart, yearPart] = res.date.split('/');
            const reservationDate = `${yearPart}-${monthPart.padStart(2, '0')}-${dayPart.padStart(2, '0')}`;
            return reservationDate === formattedDate;
          }
        );

        days.push(
          <div
            key={formattedDate}
            className={`min-h-[80px] border border-gray-200 p-1 overflow-hidden ${
              format(day, 'MM') !== format(currentMonth, 'MM')
                ? 'bg-gray-50 text-gray-400'
                : 'bg-white'
            } ${
              format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                ? 'bg-primary/5 border-primary'
                : ''
            }`}
          >
            <div className="text-right mb-1">
              <span className={`text-sm ${
                format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                  ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center ml-auto'
                  : ''
              }`}>
                {format(day, 'd')}
              </span>
            </div>
            
            <div className="space-y-1 overflow-hidden max-h-[60px]">
              {reservationsOnDay.map((res, idx) => (
                <div 
                  key={res.id} 
                  className="text-xs p-1 bg-primary/10 text-primary truncate rounded cursor-pointer hover:bg-primary/20"
                  onClick={() => onReservationSelect(res)}
                >
                  {res.name.split(' ')[0]} - {res.timeSlot}
                </div>
              ))}
              
              {reservationsOnDay.length > 2 && (
                <div className="text-xs text-gray-500 text-center">
                  {reservationsOnDay.length - 2}+ more
                </div>
              )}
            </div>
          </div>
        );
        
        day = addDays(day, 1);
      }
      
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      
      days = [];
    }
    
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMonth.toString()}
          variants={variants[animation]}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
          className="space-y-1"
        >
          {rows}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="bg-white rounded-[20px] shadow overflow-hidden">
      <div className="p-2">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>
    </div>
  );
};

export default CalendarView;
