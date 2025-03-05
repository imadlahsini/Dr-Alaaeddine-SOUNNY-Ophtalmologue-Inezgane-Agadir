
import React, { useState } from 'react';
import { Phone, Calendar, Clock, Trash2 } from 'lucide-react';
import { Reservation } from '../../types/reservation';
import { toast } from 'sonner';
import { supabase } from '../../integrations/supabase/client';

interface ReservationCardProps {
  reservation: Reservation;
  compact?: boolean;
  onDelete?: (id: string) => void;
}

const ReservationCardNew: React.FC<ReservationCardProps> = ({
  reservation,
  compact = false,
  onDelete
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      setIsDeleting(true);
      console.log(`Calling delete handler for reservation ID: ${reservation.id}`);
      const success = await onDelete(reservation.id);
      
      if (!success) {
        throw new Error('Delete operation failed');
      }
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast.error('Failed to delete reservation');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-gray-800">{reservation.name}</h3>
        
        {onDelete && (
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-50"
            aria-label="Delete reservation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="w-3.5 h-3.5 mr-2 text-gray-400" />
          <span>{reservation.phone}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-3.5 h-3.5 mr-2 text-gray-400" />
          <span>{reservation.date}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-3.5 h-3.5 mr-2 text-gray-400" />
          <span>{reservation.timeSlot}</span>
        </div>
      </div>
    </div>
  );
};

export default ReservationCardNew;
