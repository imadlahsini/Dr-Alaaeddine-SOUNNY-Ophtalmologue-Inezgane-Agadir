import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import ReservationCard from './ReservationCard';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Reservation['status'] | 'All'>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const filteredReservations = reservations.filter(res => {
    const matchesSearch = 
      res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'All' || res.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedReservations = [...filteredReservations].sort((a, b) => {
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);
    
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  function parseDate(dateStr: string): number {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day).getTime();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <motion.button
          className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50"
          onClick={() => setShowFilters(!showFilters)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {showFilters ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </motion.button>
      </div>
      
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white rounded-[20px] shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as Reservation['status'] | 'All')}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Canceled">Canceled</option>
                  <option value="Not Responding">Not Responding</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <div className="flex gap-3">
                  <button
                    className={`flex-1 px-4 py-2 text-sm border rounded-lg ${
                      sortBy === 'newest'
                        ? 'bg-primary text-white border-primary'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSortBy('newest')}
                  >
                    Newest First
                  </button>
                  <button
                    className={`flex-1 px-4 py-2 text-sm border rounded-lg ${
                      sortBy === 'oldest'
                        ? 'bg-primary text-white border-primary'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSortBy('oldest')}
                  >
                    Oldest First
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence>
          {sortedReservations.length > 0 ? (
            sortedReservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onStatusChange={onStatusChange}
                onUpdate={onUpdate}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full p-8 text-center bg-white rounded-[20px] shadow-sm"
            >
              <p className="text-gray-500">No reservations found matching your criteria.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReservationTable;
