import React from 'react';
import { Calendar, Clock, Phone, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Reservation, ReservationStatus } from '../../hooks/useDashboard';
import { toast } from 'sonner';
import { supabase } from '../../integrations/supabase/client';

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
  const statusConfig = {
    Pending: {
      icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-100',
      textColor: 'text-yellow-700'
    },
    Confirmed: {
      icon: <CheckCircle className="w-4 h-4 text-green-500" />,
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100',
      textColor: 'text-green-700'
    },
    Canceled: {
      icon: <XCircle className="w-4 h-4 text-red-500" />,
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-100',
      textColor: 'text-red-700'
    },
    'Not Responding': {
      icon: <AlertTriangle className="w-4 h-4 text-gray-500" />,
      color: 'gray',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-100',
      textColor: 'text-gray-700'
    }
  };

  const status = statusConfig[reservation.status] || statusConfig.Pending;
  
  const handleStatusChange = async (newStatus: ReservationStatus) => {
    if (reservation.status === newStatus) {
      return; // No change needed
    }

    try {
      // Show toast for immediate feedback
      toast.info(`Updating to ${newStatus}...`);
      
      // IMPORTANT: Set manual_update to TRUE to explicitly mark this as a UI-triggered update
      const { error } = await supabase
        .from('reservations')
        .update({ 
          status: newStatus,
          manual_update: true // This flag tells the webhook this is a manual update
        })
        .eq('id', reservation.id);
      
      if (error) {
        console.error('Error updating status in database:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      console.log(`Successfully updated reservation ${reservation.id} status to ${newStatus} in the database`);
      
      // Update UI state after successful database update
      onStatusChange(reservation.id, newStatus);
      
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(`Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Compact card design for 3-column layout
  if (compact) {
    return (
      <div className={`rounded-lg border ${status.borderColor} overflow-hidden shadow-sm hover:shadow transition-all duration-200 ${status.bgColor}`}>
        <div className="p-3">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-gray-900 truncate">{reservation.name}</h3>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}>
              {status.icon}
              <span className="ml-1">{reservation.status}</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex items-center">
              <Phone className="w-3 h-3 text-gray-400 mr-1.5" />
              <span className="truncate">{reservation.phone}</span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="w-3 h-3 text-gray-400 mr-1.5" />
              <span>{reservation.date}</span>
            </div>
            
            <div className="flex items-center">
              <Clock className="w-3 h-3 text-gray-400 mr-1.5" />
              <span>{reservation.timeSlot}</span>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        {reservation.status !== 'Confirmed' && reservation.status !== 'Canceled' && (
          <div className="flex border-t border-gray-100 divide-x divide-gray-100">
            <button
              onClick={() => handleStatusChange('Confirmed')}
              className="flex-1 py-2 text-xs font-medium text-green-600 hover:bg-green-50 flex items-center justify-center"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Confirm
            </button>
            
            <button
              onClick={() => handleStatusChange('Canceled')}
              className="flex-1 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center justify-center"
            >
              <XCircle className="w-3 h-3 mr-1" />
              Cancel
            </button>
          </div>
        )}
        
        {/* Return to pending button for confirmed/canceled cards */}
        {(reservation.status === 'Confirmed' || reservation.status === 'Canceled') && (
          <div className="border-t border-gray-100">
            <button
              onClick={() => handleStatusChange('Pending')}
              className="w-full py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center"
            >
              <AlertTriangle className="w-3 h-3 mr-1" />
              Mark as Pending
            </button>
          </div>
        )}
      </div>
    );
  }

  // Original card design (for backward compatibility)
  return (
    <div className={`rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 ${status.bgColor}`}>
      {/* Header */}
      <div className={`flex justify-between items-center px-5 py-4 ${status.bgColor}`}>
        <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.textColor} ${status.borderColor}`}>
          {status.icon}
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
      <div className={`border-t ${status.borderColor} px-5 py-3`}>
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
