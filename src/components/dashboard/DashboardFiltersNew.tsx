
import React from 'react';
import { Search } from 'lucide-react';

interface DashboardFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const DashboardFiltersNew: React.FC<DashboardFiltersProps> = ({
  searchQuery,
  setSearchQuery
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
    </div>
  );
};

export default DashboardFiltersNew;
