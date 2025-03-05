
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Reservation, ReservationStatus } from '../../types/reservation';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';

interface StatusUpdateModalProps {
  reservation: Reservation;
  onStatusUpdate?: (updatedReservation: Reservation) => void;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({ 
  reservation,
  onStatusUpdate
}) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ReservationStatus>(reservation.status);
  const [isUpdating, setIsUpdating] = useState(false);

  // Reset status to current reservation status when modal opens/closes
  React.useEffect(() => {
    setStatus(reservation.status);
  }, [reservation.status, open]);

  // Array of possible statuses
  const statuses: ReservationStatus[] = ['Confirmed', 'Not Responding', 'Canceled', 'Pending'];

  const handleUpdateStatus = async () => {
    if (status === reservation.status) {
      setOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      console.log(`Updating reservation ${reservation.id} status from ${reservation.status} to ${status}`);
      
      // Create updated reservation object for immediate UI update
      const updatedReservation: Reservation = {
        ...reservation,
        status: status
      };
      
      // Call the callback immediately to update UI
      if (onStatusUpdate) {
        onStatusUpdate(updatedReservation);
      }
      
      // Update in Supabase - this will trigger the realtime subscription
      const { error } = await supabase
        .from('reservations')
        .update({ 
          status: status,
          // Set manual_update to true to indicate this was done by an admin
          manual_update: true 
        })
        .eq('id', reservation.id);
      
      if (error) {
        throw error;
      }
      
      toast.success(`Status updated to ${status}`);
      setOpen(false);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
      
      // Revert UI to original status if there was an error
      if (onStatusUpdate) {
        onStatusUpdate(reservation);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={`w-full mt-2 ${
            reservation.status === 'Confirmed' ? 'border-green-500 text-green-700' : 
            reservation.status === 'Canceled' ? 'border-red-500 text-red-700' :
            reservation.status === 'Not Responding' ? 'border-gray-500 text-gray-700' :
            'border-yellow-500 text-yellow-700'
          }`}
        >
          Update Status
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Reservation Status</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <RadioGroup 
            value={status} 
            onValueChange={(value) => setStatus(value as ReservationStatus)}
            className="flex flex-col space-y-3"
          >
            {statuses.map((statusOption) => (
              <div key={statusOption} className="flex items-center space-x-2">
                <RadioGroupItem value={statusOption} id={statusOption} />
                <Label htmlFor={statusOption}>{statusOption}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateStatus} 
            disabled={isUpdating || status === reservation.status}
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatusUpdateModal;
