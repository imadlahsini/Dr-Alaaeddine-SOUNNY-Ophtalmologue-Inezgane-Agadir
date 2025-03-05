
import React, { useState, useEffect } from 'react';
import { Phone, Calendar, Clock } from 'lucide-react';
import { Reservation } from '../../types/reservation';

interface ReservationCardProps {
  reservation: Reservation;
  compact?: boolean;
}

const ReservationCardNew: React.FC<ReservationCardProps> = ({
  reservation,
  compact = false
}) => {
  const [localReservation, setLocalReservation] = useState<Reservation>(reservation);
  
  // Update local state when reservation prop changes
  useEffect(() => {
    setLocalReservation(reservation);
  }, [reservation]);

  // Use the local state for rendering
  const displayReservation = localReservation;

  return (
    <div className="border rounded-lg p-3 shadow-sm transition-opacity">
      <div className="flex justify-between items-start">
        <h3 className="font-medium">{displayReservation.name}</h3>
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
    </div>
  );
};

export default ReservationCardNew;
