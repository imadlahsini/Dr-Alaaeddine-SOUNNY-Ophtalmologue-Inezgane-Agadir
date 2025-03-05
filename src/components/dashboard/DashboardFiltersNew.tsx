
import React from 'react';
import { Search } from 'lucide-react';
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
    <div className="bg-white p-3 rounded-lg shadow-sm grid gap-2 grid-cols-1">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or phone..."
          className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm h-10"
        />
      </div>
      
      {/* Status Filter */}
      <div className="flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReservationStatus | 'All')}
          className="border border-gray-200 rounded-lg py-1 px-2 text-sm flex-grow h-10"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Not Responding">Not Responding</option>
          <option value="Canceled">Canceled</option>
        </select>
      </div>
      
      {/* Date Filter */}
      <div className="flex gap-2">
        <input
          type="date"
          value={dateFilter || ''}
          onChange={(e) => setDateFilter(e.target.value || null)}
          placeholder="Select Date"
          className="border border-gray-200 rounded-lg py-1 px-2 text-sm w-full h-10"
        />
        {dateFilter && (
          <button
            onClick={() => setDateFilter(null)}
            className="border border-gray-200 rounded-lg px-2 text-sm"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardFiltersNew;
