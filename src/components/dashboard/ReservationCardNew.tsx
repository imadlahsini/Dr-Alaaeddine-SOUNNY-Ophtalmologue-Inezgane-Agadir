
import React, { useState } from 'react';
import { Phone, Calendar, Clock } from 'lucide-react';
import { Reservation, ReservationStatus } from '../../types/reservation';
import { Button } from '../ui/button';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';

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

  const updateStatus = async (newStatus: ReservationStatus) => {
    if (newStatus === localReservation.status || isUpdating) {
      return;
    }

    setIsUpdating(true);
    
    // Create updated reservation object for immediate UI feedback
    const updatedReservation: Reservation = {
      ...localReservation,
      status: newStatus
    };
    
    // Update local state for immediate UI update
    setLocalReservation(updatedReservation);
    
    try {
      // Update in Supabase - this will trigger the realtime subscription
      const { error } = await supabase
        .from('reservations')
        .update({ 
          status: newStatus,
          // Set manual_update to true to indicate this was done by an admin
          manual_update: true 
        })
        .eq('id', localReservation.id);
      
      if (error) {
        throw error;
      }
      
      // Call the callback to update parent state
      if (onStatusUpdate) {
        onStatusUpdate(updatedReservation);
      }
      
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
      
      // Revert UI to original status if there was an error
      setLocalReservation(reservation);
    } finally {
      setTimeout(() => setIsUpdating(false), 300);
    }
  };

  // Get status color for the status indicator
  const getStatusColor = (status: ReservationStatus): string => {
    switch (status) {
      case 'Confirmed':
        return 'text-green-600 font-medium';
      case 'Not Responding':
        return 'text-orange-600 font-medium';
      case 'Canceled':
        return 'text-red-600 font-medium';
      case 'Pending':
      default:
        return 'text-blue-600 font-medium';
    }
  };

  // Use the local state for rendering
  const displayReservation = localReservation;

  return (
    <div className={`border rounded-lg p-3 shadow-sm ${isUpdating ? 'opacity-80' : ''} transition-opacity`}>
      <div className="flex justify-between items-start">
        <h3 className="font-medium">{displayReservation.name}</h3>
        <span className={getStatusColor(displayReservation.status)}>
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

      <div className="flex gap-2 mt-3">
        <Button 
          size="sm"
          className={`flex-1 ${displayReservation.status === 'Confirmed' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
          onClick={() => updateStatus('Confirmed')}
          disabled={isUpdating}
        >
          Confirm
        </Button>
        <Button 
          size="sm"
          className={`flex-1 ${displayReservation.status === 'Not Responding' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
          onClick={() => updateStatus('Not Responding')}
          disabled={isUpdating}
        >
          No Response
        </Button>
        <Button 
          size="sm"
          className={`flex-1 ${displayReservation.status === 'Canceled' ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
          onClick={() => updateStatus('Canceled')}
          disabled={isUpdating}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ReservationCardNew;
