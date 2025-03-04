
import React from 'react';

interface DashboardHeaderProps {
  onLogout: () => Promise<void>;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onLogout }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-0">
        Reservations Dashboard
      </h1>
      <button
        onClick={onLogout}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors w-full sm:w-auto"
      >
        Logout
      </button>
    </div>
  );
};

export default DashboardHeader;
