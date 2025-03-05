
import { Reservation, ReservationStatus, Stats } from '../types/reservation';

/**
 * Calculates statistics from a list of reservations
 */
export const calculateStats = (reservations: Reservation[]): Stats => {
  return {
    total: reservations.length,
    confirmed: reservations.filter(r => r.status === 'Confirmed').length,
    pending: reservations.filter(r => r.status === 'Pending').length,
    canceled: reservations.filter(r => r.status === 'Canceled').length,
    notResponding: reservations.filter(r => r.status === 'Not Responding').length
  };
};

/**
 * Applies filtering to a list of reservations based on search query, status, and date
 */
export const applyFilters = (
  reservations: Reservation[],
  searchQuery: string,
  statusFilter: ReservationStatus | 'All',
  dateFilter: string | null
): Reservation[] => {
  return reservations.filter(reservation => {
    const matchesSearch = 
      !searchQuery || 
      reservation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.phone.includes(searchQuery);
    
    const matchesStatus = 
      statusFilter === 'All' || 
      reservation.status === statusFilter;
    
    const matchesDate = 
      !dateFilter || 
      reservation.date === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });
};
