
import React, { useState } from 'react';
import { Phone, Calendar, Clock } from 'lucide-react';
import { Reservation, ReservationStatus } from '../../types/reservation';
import StatusUpdateModal from './StatusUpdateModal';

interface ReservationCardProps {
  reservation: Reservation;
  compact?: boolean;
  onStatusUpdate?: (updatedReservation: Reservation) => void;
}

const ReservationCardNew: React.FC<ReservationCardProps> = ({
  reservation,
  compact = false,
  onStatusUpdate
}) => {
  const [localReservation, setLocalReservation] = useState<Reservation>(reservation);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Update local state when reservation prop changes
  React.useEffect(() => {
    setLocalReservation(reservation);
  }, [reservation]);

  const getStatusColor = (status: ReservationStatus) => {
    switch(status) {
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Canceled': return 'bg-red-100 text-red-800';
      case 'Not Responding': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleStatusUpdate = (updatedReservation: Reservation) => {
    // Update local state immediately for instant UI feedback
    setLocalReservation(updatedReservation);
    setIsUpdating(true);
    
    // Propagate update to parent component
    if (onStatusUpdate) {
      onStatusUpdate(updatedReservation);
    }
    
    // Reset updating state after a short delay to show loading state
    setTimeout(() => setIsUpdating(false), 300);
  };

  // Use the local state for rendering
  const displayReservation = localReservation;

  return (
    <div className={`border rounded-lg p-3 shadow-sm ${isUpdating ? 'opacity-80' : ''} transition-opacity`}>
      <div className="flex justify-between items-start">
        <h3 className="font-medium">{displayReservation.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(displayReservation.status)}`}>
          {displayReservation.status}
        </span>
      </div>
      
      <div className="mt-2 space-y-1 text-sm text-gray-600">
        <div className="flex items-center">
          <Phone className="w-3 h-3 mr-1" />
          <span>{displayReservation.phone}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          <span>{displayReservation.date}</span>
        </div>
        <div className="flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          <span>{displayReservation.timeSlot}</span>
        </div>
      </div>

      <StatusUpdateModal 
        reservation={displayReservation}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default ReservationCardNew;
