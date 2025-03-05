
import React from 'react';
import { Calendar, Clock, User, Phone, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Reservation, ReservationStatus } from '../../hooks/useDashboard';

interface ReservationCardProps {
  reservation: Reservation;
  onStatusChange: (id: string, status: ReservationStatus) => void;
}

const ReservationCardNew: React.FC<ReservationCardProps> = ({
  reservation,
  onStatusChange
}) => {
  const statusColors = {
    Pending: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
      cardBg: 'bg-yellow-50',
      headerBg: 'bg-yellow-100'
    },
    Confirmed: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      icon: <CheckCircle className="w-4 h-4 text-green-500" />,
      cardBg: 'bg-green-50',
      headerBg: 'bg-green-100'
    },
    Canceled: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: <XCircle className="w-4 h-4 text-red-500" />,
      cardBg: 'bg-red-50',
      headerBg: 'bg-red-100'
    },
    'Not Responding': {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
      icon: <AlertTriangle className="w-4 h-4 text-gray-500" />,
      cardBg: 'bg-gray-50',
      headerBg: 'bg-gray-100'
    }
  };

  const statusStyle = statusColors[reservation.status] || statusColors.Pending;
  
  const handleStatusChange = (status: ReservationStatus) => {
    if (reservation.status !== status) {
      console.log(`Card requesting status change for ${reservation.id} from ${reservation.status} to ${status}`);
      onStatusChange(reservation.id, status);
    }
  };

  return (
    <div className={`rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 ${statusStyle.cardBg}`}>
      {/* Header */}
      <div className={`flex justify-between items-center px-5 py-4 ${statusStyle.headerBg}`}>
        <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
          {statusStyle.icon}
          <span className="ml-1.5">{reservation.status}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
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
      </div>

      {/* Actions */}
      <div className={`border-t ${statusStyle.border} px-5 py-3`}>
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => handleStatusChange('Confirmed')}
            disabled={reservation.status === 'Confirmed'}
            className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center ${
              reservation.status === 'Confirmed'
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'bg-white hover:bg-green-100 text-gray-700 hover:text-green-700 border border-gray-200'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            Confirm
          </button>
          
          <button
            onClick={() => handleStatusChange('Not Responding')}
            disabled={reservation.status === 'Not Responding'}
            className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center ${
              reservation.status === 'Not Responding'
                ? 'bg-gray-200 text-gray-700 cursor-default'
                : 'bg-white hover:bg-gray-200 text-gray-700 border border-gray-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            Not Responding
          </button>
          
          <button
            onClick={() => handleStatusChange('Canceled')}
            disabled={reservation.status === 'Canceled'}
            className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center ${
              reservation.status === 'Canceled'
                ? 'bg-red-100 text-red-700 cursor-default'
                : 'bg-white hover:bg-red-100 text-gray-700 hover:text-red-700 border border-gray-200'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 mr-1" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationCardNew;
