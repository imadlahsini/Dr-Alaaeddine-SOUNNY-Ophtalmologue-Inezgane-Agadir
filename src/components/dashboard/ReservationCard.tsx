
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, User, Phone, CheckCircle, XCircle, 
  AlertTriangle, Edit, Save, X, MoreVertical, Check
} from 'lucide-react';

interface Reservation {
  id: string;
  name: string;
  phone: string;
  date: string;
  timeSlot: string;
  status: 'Pending' | 'Confirmed' | 'Canceled' | 'Not Responding';
}

interface ReservationCardProps {
  reservation: Reservation;
  onStatusChange: (id: string, status: Reservation['status']) => void;
  onUpdate: (id: string, updatedData: Partial<Reservation>) => void;
}

const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  onStatusChange,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [editedData, setEditedData] = useState({
    name: reservation.name,
    phone: reservation.phone,
    date: reservation.date,
    timeSlot: reservation.timeSlot
  });

  const statusColors = {
    Pending: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />
    },
    Confirmed: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      icon: <CheckCircle className="w-4 h-4 text-green-500" />
    },
    Canceled: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: <XCircle className="w-4 h-4 text-red-500" />
    },
    'Not Responding': {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
      icon: <AlertTriangle className="w-4 h-4 text-gray-500" />
    }
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

  const statusStyle = statusColors[reservation.status];

  return (
    <motion.div
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <div className="flex justify-between items-center px-5 py-4 bg-gray-50">
        <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
          {statusStyle.icon}
          <span className="ml-1.5">{reservation.status}</span>
        </div>
        
        <div className="relative">
          {!isEditing ? (
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex gap-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="p-1.5 rounded-md text-green-600 hover:bg-green-50"
              >
                <Save className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                className="p-1.5 rounded-md text-red-600 hover:bg-red-50"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          )}
          
          <AnimatePresence>
            {showStatusMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                transition={{ duration: 0.1 }}
                className="absolute right-0 top-8 z-10 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 text-sm"
              >
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b">
                  ACTIONS
                </div>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowStatusMenu(false);
                  }}
                  className="flex w-full items-center px-3 py-2 hover:bg-gray-50 text-gray-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Details
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b">
                  CHANGE STATUS
                </div>
                <button
                  onClick={() => {
                    onStatusChange(reservation.id, 'Confirmed');
                    setShowStatusMenu(false);
                  }}
                  className="flex w-full items-center px-3 py-2 hover:bg-green-50 text-gray-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Confirm
                </button>
                <button
                  onClick={() => {
                    onStatusChange(reservation.id, 'Canceled');
                    setShowStatusMenu(false);
                  }}
                  className="flex w-full items-center px-3 py-2 hover:bg-red-50 text-gray-700"
                >
                  <XCircle className="w-4 h-4 mr-2 text-red-500" />
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onStatusChange(reservation.id, 'Not Responding');
                    setShowStatusMenu(false);
                  }}
                  className="flex w-full items-center px-3 py-2 hover:bg-gray-50 text-gray-700"
                >
                  <AlertTriangle className="w-4 h-4 mr-2 text-gray-500" />
                  Not Responding
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="edit-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label htmlFor={`name-${reservation.id}`} className="block text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 inline mr-1" /> Name
                </label>
                <input
                  type="text"
                  id={`name-${reservation.id}`}
                  name="name"
                  value={editedData.name}
                  onChange={handleChange}
                  className="w-full p-2.5 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/30 focus:outline-none"
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor={`phone-${reservation.id}`} className="block text-sm font-medium text-gray-700">
                  <Phone className="w-4 h-4 inline mr-1" /> Phone
                </label>
                <input
                  type="tel"
                  id={`phone-${reservation.id}`}
                  name="phone"
                  value={editedData.phone}
                  onChange={handleChange}
                  className="w-full p-2.5 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/30 focus:outline-none"
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor={`date-${reservation.id}`} className="block text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4 inline mr-1" /> Date
                </label>
                <input
                  type="text"
                  id={`date-${reservation.id}`}
                  name="date"
                  value={editedData.date}
                  onChange={handleChange}
                  placeholder="DD/MM/YYYY"
                  className="w-full p-2.5 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/30 focus:outline-none"
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor={`timeSlot-${reservation.id}`} className="block text-sm font-medium text-gray-700">
                  <Clock className="w-4 h-4 inline mr-1" /> Time Slot
                </label>
                <select
                  id={`timeSlot-${reservation.id}`}
                  name="timeSlot"
                  value={editedData.timeSlot}
                  onChange={handleChange}
                  className="w-full p-2.5 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/30 focus:outline-none"
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
            >
              <h3 className="font-medium text-lg text-gray-900 mb-3">{reservation.name}</h3>
              
              <div className="space-y-3 text-gray-600">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 mr-2" />
                  <span>{reservation.phone}</span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span>{reservation.date}</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 mr-2" />
                  <span>{reservation.timeSlot}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isEditing && (
        <div className="border-t border-gray-100 px-5 py-3">
          <div className="flex flex-wrap gap-2 justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onStatusChange(reservation.id, 'Confirmed')}
              disabled={reservation.status === 'Confirmed'}
              className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center ${
                reservation.status === 'Confirmed'
                  ? 'bg-green-100 text-green-700 cursor-default'
                  : 'bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700'
              }`}
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Confirm
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onStatusChange(reservation.id, 'Canceled')}
              disabled={reservation.status === 'Canceled'}
              className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center ${
                reservation.status === 'Canceled'
                  ? 'bg-red-100 text-red-700 cursor-default'
                  : 'bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-700'
              }`}
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Cancel
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ReservationCard;
