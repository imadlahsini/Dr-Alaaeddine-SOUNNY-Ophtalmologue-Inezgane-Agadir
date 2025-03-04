
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ReservationCard from './dashboard/ReservationCard';

interface Reservation {
  id: string;
  name: string;
  phone: string;
  date: string;
  timeSlot: string;
  status: 'Pending' | 'Confirmed' | 'Canceled' | 'Not Responding';
}

interface ReservationTableProps {
  reservations: Reservation[];
  onStatusChange: (id: string, status: Reservation['status']) => void;
  onUpdate: (id: string, updatedData: Partial<Reservation>) => void;
}

const ReservationTable: React.FC<ReservationTableProps> = ({
  reservations,
  onStatusChange,
  onUpdate
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <AnimatePresence>
        {reservations.map((reservation) => (
          <ReservationCard
            key={reservation.id}
            reservation={reservation}
            onStatusChange={onStatusChange}
            onUpdate={onUpdate}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ReservationTable;
