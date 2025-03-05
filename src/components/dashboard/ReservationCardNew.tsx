
import React from 'react';
import { Phone, Calendar, Clock } from 'lucide-react';
import { Reservation, ReservationStatus } from '../../hooks/useDashboard';
import { toast } from 'sonner';

interface ReservationCardProps {
  reservation: Reservation;
  onStatusChange: (id: string, status: ReservationStatus) => void;
  compact?: boolean;
}

const ReservationCardNew: React.FC<ReservationCardProps> = ({
  reservation,
  onStatusChange,
  compact = false
}) => {
  const handleStatusChange = async (newStatus: ReservationStatus) => {
    if (reservation.status === newStatus) return;

    try {
      toast.info(`Updating to ${newStatus}...`);
      onStatusChange(reservation.id, newStatus);
    } catch (error) {
      console.error('Error in handleStatusChange:', error);
      toast.error(`Failed to update status`);
    }
  };

  const getStatusColor = (status: ReservationStatus) => {
    switch(status) {
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Canceled': return 'bg-red-100 text-red-800';
      case 'Not Responding': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="border rounded-lg p-3 shadow-sm">
      <div className="flex justify-between items-start">
        <h3 className="font-medium">{reservation.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(reservation.status)}`}>
          {reservation.status}
        </span>
      </div>
      
      <div className="mt-2 space-y-1 text-sm text-gray-600">
        <div className="flex items-center">
          <Phone className="w-3 h-3 mr-1" />
          <span>{reservation.phone}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          <span>{reservation.date}</span>
        </div>
        <div className="flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          <span>{reservation.timeSlot}</span>
        </div>
      </div>
      
      <div className="mt-3 flex gap-2">
        {reservation.status !== 'Confirmed' && (
          <button
            onClick={() => handleStatusChange('Confirmed')}
            className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
          >
            Confirm
          </button>
        )}
        
        {reservation.status !== 'Canceled' && (
          <button
            onClick={() => handleStatusChange('Canceled')}
            className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs"
          >
            Cancel
          </button>
        )}
        
        {reservation.status !== 'Pending' && (
          <button
            onClick={() => handleStatusChange('Pending')}
            className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs"
          >
            Pending
          </button>
        )}
      </div>
    </div>
  );
};

export default ReservationCardNew;
