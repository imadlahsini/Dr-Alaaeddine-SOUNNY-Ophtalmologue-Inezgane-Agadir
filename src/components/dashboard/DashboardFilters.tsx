
import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, X, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusType } from '../../pages/Dashboard';

interface DashboardFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: StatusType;
  setStatusFilter: (status: StatusType) => void;
  sortBy: 'newest' | 'oldest';
  setSortBy: (sort: 'newest' | 'oldest') => void;
  dateFilter: string | null;
  setDateFilter: (date: string | null) => void;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  dateFilter,
  setDateFilter
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dateInputValue, setDateInputValue] = useState(dateFilter || '');
  const [dateError, setDateError] = useState<string | null>(null);

  // Update the local input value when the dateFilter prop changes
  useEffect(() => {
    setDateInputValue(dateFilter || '');
  }, [dateFilter]);

  const statusOptions = [
    { value: 'All' as StatusType, label: 'All Statuses' },
    { value: 'Pending' as StatusType, label: 'Pending', icon: <div className="w-2 h-2 rounded-full bg-yellow-400 mr-2" /> },
    { value: 'Confirmed' as StatusType, label: 'Confirmed', icon: <div className="w-2 h-2 rounded-full bg-green-400 mr-2" /> },
    { value: 'Canceled' as StatusType, label: 'Canceled', icon: <div className="w-2 h-2 rounded-full bg-red-400 mr-2" /> },
    { value: 'Not Responding' as StatusType, label: 'Not Responding', icon: <div className="w-2 h-2 rounded-full bg-gray-400 mr-2" /> }
  ];

  const validateDate = (value: string): boolean => {
    if (!value) return true; // Empty is valid (no filter)
    
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!dateRegex.test(value)) {
      setDateError('Use format DD/MM/YYYY');
      return false;
    }
    
    const [, day, month, year] = value.match(dateRegex) || [];
    const numDay = parseInt(day, 10);
    const numMonth = parseInt(month, 10);
    const numYear = parseInt(year, 10);
    
    if (numMonth < 1 || numMonth > 12) {
      setDateError('Invalid month');
      return false;
    }
    
    // Check if day is valid for the given month and year
    const daysInMonth = new Date(numYear, numMonth, 0).getDate();
    if (numDay < 1 || numDay > daysInMonth) {
      setDateError(`Invalid day for ${month}/${year}`);
      return false;
    }
    
    setDateError(null);
    return true;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateInputValue(value);
    
    if (value === '') {
      setDateFilter(null);
      setDateError(null);
      return;
    }
    
    // Auto-format the date as user types
    if (value.length === 2 && !value.includes('/') && dateInputValue.length < 2) {
      setDateInputValue(value + '/');
    } else if (value.length === 5 && !value.substring(3).includes('/') && dateInputValue.length < 5) {
      setDateInputValue(value + '/');
    }
    
    if (validateDate(value)) {
      setDateFilter(value);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setSortBy('newest');
    setDateFilter(null);
    setDateInputValue('');
    setDateError(null);
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'All' || dateFilter;

  const handleApplyFilters = () => {
    if (dateInputValue && !validateDate(dateInputValue)) {
      // Don't close if there's an invalid date
      return;
    }
    setFiltersOpen(false);
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center justify-center gap-2 px-5 py-3 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 min-w-[120px]"
        >
          <Filter className="h-5 w-5" />
          <span className="font-medium">Filters</span>
          {filtersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </motion.button>
      </div>
      
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm"
          >
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reservation Status</label>
                <div className="space-y-2">
                  {statusOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setStatusFilter(option.value)}
                      className={`w-full flex items-center px-4 py-2.5 rounded-lg text-left transition-colors ${
                        statusFilter === option.value
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {option.icon}
                      {option.label}
                      {statusFilter === option.value && (
                        <CheckCircle className="ml-auto h-4 w-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setSortBy('newest')}
                    className={`flex items-center px-4 py-2.5 rounded-lg text-left transition-colors ${
                      sortBy === 'newest'
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    Newest First
                    {sortBy === 'newest' && (
                      <CheckCircle className="ml-auto h-4 w-4 text-primary" />
                    )}
                  </button>
                  <button
                    onClick={() => setSortBy('oldest')}
                    className={`flex items-center px-4 py-2.5 rounded-lg text-left transition-colors ${
                      sortBy === 'oldest'
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    Oldest First
                    {sortBy === 'oldest' && (
                      <CheckCircle className="ml-auto h-4 w-4 text-primary" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Filter</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    className={`w-full pl-10 pr-4 py-2.5 bg-white border ${dateError ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-primary/30'} rounded-lg focus:outline-none focus:ring-2`}
                    value={dateInputValue}
                    onChange={handleDateChange}
                    maxLength={10}
                  />
                  {dateInputValue && (
                    <button 
                      onClick={() => {
                        setDateInputValue('');
                        setDateFilter(null);
                        setDateError(null);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {dateError ? (
                  <p className="text-xs text-red-500 mt-1">{dateError}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Filter by reservation date</p>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className={`px-4 py-2 rounded-lg mr-3 text-gray-700 font-medium ${
                  hasActiveFilters ? 'hover:bg-gray-200' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                Clear Filters
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {hasActiveFilters && !filtersOpen && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Active filters:</span>
          {statusFilter !== 'All' && (
            <span className="bg-gray-100 px-2 py-1 rounded-full text-gray-700">
              Status: {statusFilter}
            </span>
          )}
          {dateFilter && (
            <span className="bg-gray-100 px-2 py-1 rounded-full text-gray-700">
              Date: {dateFilter}
            </span>
          )}
          {searchQuery && (
            <span className="bg-gray-100 px-2 py-1 rounded-full text-gray-700">
              Search: "{searchQuery.length > 15 ? searchQuery.substring(0, 15) + '...' : searchQuery}"
            </span>
          )}
          <button 
            onClick={clearFilters}
            className="text-primary hover:text-primary/80 font-medium ml-2"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardFilters;
