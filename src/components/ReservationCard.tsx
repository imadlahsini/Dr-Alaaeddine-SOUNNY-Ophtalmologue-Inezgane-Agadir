
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, Phone, CheckCircle, XCircle, AlertCircle, Edit, Save, X } from 'lucide-react';

interface Reservation {
  id: number;
  name: string;
  phone: string;
  date: string;
  timeSlot: string;
  status: 'Pending' | 'Confirmed' | 'Canceled' | 'Not Responding';
}

interface ReservationCardProps {
  reservation: Reservation;
  onStatusChange: (id: number, status: Reservation['status']) => void;
  onUpdate: (id: number, updatedData: Partial<Reservation>) => void;
}

const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  onStatusChange,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: reservation.name,
    phone: reservation.phone,
    date: reservation.date,
    timeSlot: reservation.timeSlot
  });

  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Confirmed: 'bg-green-100 text-green-800 border-green-300',
    Canceled: 'bg-red-100 text-red-800 border-red-300',
    'Not Responding': 'bg-gray-100 text-gray-800 border-gray-300'
  };

  const statusIcons = {
    Pending: <AlertCircle className="w-4 h-4 mr-1" />,
    Confirmed: <CheckCircle className="w-4 h-4 mr-1" />,
    Canceled: <XCircle className="w-4 h-4 mr-1" />,
    'Not Responding': <AlertCircle className="w-4 h-4 mr-1" />
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onUpdate(reservation.id, editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData({
      name: reservation.name,
      phone: reservation.phone,
      date: reservation.date,
      timeSlot: reservation.timeSlot
    });
    setIsEditing(false);
  };

  return (
    <motion.div
      className="bg-white rounded-[20px] shadow-md overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      layout
    >
      {/* Status Badge */}
      <div className="flex justify-between items-center px-5 py-3 bg-primary/5">
        <div className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center ${statusColors[reservation.status]}`}>
          {statusIcons[reservation.status]}
          {reservation.status}
        </div>
        
        {!isEditing ? (
          <motion.button
            className="text-primary hover:text-primary/80 p-1 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsEditing(true)}
          >
            <Edit className="w-5 h-5" />
          </motion.button>
        ) : (
          <div className="flex space-x-2">
            <motion.button
              className="text-green-600 hover:text-green-700 p-1 rounded-full"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSave}
            >
              <Save className="w-5 h-5" />
            </motion.button>
            <motion.button
              className="text-red-600 hover:text-red-700 p-1 rounded-full"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCancel}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        )}
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="edit-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="form-group">
                <label htmlFor={`name-${reservation.id}`}>
                  <User className="w-4 h-4 mr-1" /> Name
                </label>
                <input
                  type="text"
                  id={`name-${reservation.id}`}
                  name="name"
                  value={editedData.name}
                  onChange={handleChange}
                  className="w-full p-3 text-base bg-transparent border-none rounded-[15px] outline-none"
                />
              </div>

              <div className="form-group">
                <label htmlFor={`phone-${reservation.id}`}>
                  <Phone className="w-4 h-4 mr-1" /> Phone
                </label>
                <input
                  type="tel"
                  id={`phone-${reservation.id}`}
                  name="phone"
                  value={editedData.phone}
                  onChange={handleChange}
                  className="w-full p-3 text-base bg-transparent border-none rounded-[15px] outline-none"
                  pattern="[0-9]{9,10}"
                />
              </div>

              <div className="form-group">
                <label htmlFor={`date-${reservation.id}`}>
                  <Calendar className="w-4 h-4 mr-1" /> Date
                </label>
                <input
                  type="text"
                  id={`date-${reservation.id}`}
                  name="date"
                  value={editedData.date}
                  onChange={handleChange}
                  className="w-full p-3 text-base bg-transparent border-none rounded-[15px] outline-none"
                  placeholder="DD/MM/YYYY"
                />
              </div>

              <div className="form-group">
                <label htmlFor={`timeSlot-${reservation.id}`}>
                  <Clock className="w-4 h-4 mr-1" /> Time Slot
                </label>
                <select
                  id={`timeSlot-${reservation.id}`}
                  name="timeSlot"
                  value={editedData.timeSlot}
                  onChange={handleChange}
                  className="w-full p-3 text-base bg-transparent border-none rounded-[15px] outline-none"
                >
                  <option value="8h00-11h00">8h00 - 11h00</option>
                  <option value="11h00-14h00">11h00 - 14h00</option>
                  <option value="14h00-16h00">14h00 - 16h00</option>
                </select>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="view-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center">
                <User className="w-5 h-5 text-primary mr-2" />
                <span className="font-medium">{reservation.name}</span>
              </div>
              
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-primary mr-2" />
                <span>{reservation.phone}</span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-primary mr-2" />
                <span>{reservation.date}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-primary mr-2" />
                <span>{reservation.timeSlot}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isEditing && (
        <div className="px-5 py-3 bg-gray-50 flex justify-center space-x-3">
          <button
            className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center ${
              reservation.status === 'Confirmed' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-green-100'
            }`}
            onClick={() => onStatusChange(reservation.id, 'Confirmed')}
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Confirm
          </button>
          
          <button
            className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center ${
              reservation.status === 'Canceled' 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-red-100'
            }`}
            onClick={() => onStatusChange(reservation.id, 'Canceled')}
          >
            <XCircle className="w-4 h-4 mr-1" />
            Cancel
          </button>
          
          <button
            className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center ${
              reservation.status === 'Not Responding' 
                ? 'bg-gray-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => onStatusChange(reservation.id, 'Not Responding')}
          >
            <AlertCircle className="w-4 h-4 mr-1" />
            No Response
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default ReservationCard;
