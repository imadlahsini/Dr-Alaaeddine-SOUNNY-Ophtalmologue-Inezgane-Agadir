
import React from 'react';
import { Search, Calendar as CalendarIcon, Filter, X } from 'lucide-react';
import { ReservationStatus } from '../../hooks/useDashboard';

interface DashboardFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: ReservationStatus | 'All';
  setStatusFilter: (status: ReservationStatus | 'All') => void;
  dateFilter: string | null;
  setDateFilter: (date: string | null) => void;
}

const DashboardFiltersNew: React.FC<DashboardFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter
}) => {
  return (
    <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
      {/* Search */}
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or phone..."
          className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm sm:text-base"
        />
      </div>
      
      {/* Status Filter */}
      <div className="flex gap-2 sm:w-auto">
        <div className="flex items-center gap-1 text-gray-500">
          <Filter className="h-4 w-4" />
          <span className="text-xs sm:text-sm">Status:</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReservationStatus | 'All')}
          className="border border-gray-200 rounded-lg py-2 px-2 sm:px-3 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm sm:text-base flex-grow sm:flex-grow-0"
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Not Responding">Not Responding</option>
          <option value="Canceled">Canceled</option>
        </select>
      </div>
      
      {/* Date Filter */}
      <div className="flex gap-2 sm:w-auto">
        <div className="flex items-center gap-1 text-gray-500">
          <CalendarIcon className="h-4 w-4" />
          <span className="text-xs sm:text-sm">Date:</span>
        </div>
        <div className="relative flex-grow sm:flex-grow-0">
          <input
            type="text"
            value={dateFilter || ''}
            onChange={(e) => setDateFilter(e.target.value || null)}
            placeholder="DD/MM/YYYY"
            className="border border-gray-200 rounded-lg py-2 px-2 sm:px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm sm:text-base w-full"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter(null)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label="Clear date filter"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardFiltersNew;
