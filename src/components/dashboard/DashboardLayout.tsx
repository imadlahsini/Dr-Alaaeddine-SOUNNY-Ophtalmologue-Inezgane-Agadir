
import React from 'react';
import { Menu, X, Bell, UserCircle, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  onLogout: () => Promise<void>;
  username?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  sidebarOpen,
  toggleSidebar,
  onLogout,
  username = 'Admin'
}) => {
  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar for desktop */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 250, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 overflow-hidden bg-white shadow-lg md:relative"
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between h-16 px-4 border-b">
                <div className="flex items-center">
                  <span className="text-xl font-bold text-primary">Reserve-It</span>
                </div>
                <button onClick={toggleSidebar} className="p-2 rounded-md md:hidden hover:bg-gray-100">
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>
              
              <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
                <div className="space-y-1">
                  <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md bg-gray-100">
                    <span className="truncate">Dashboard</span>
                  </button>
                </div>
              </div>
              
              <div className="flex-shrink-0 p-4 border-t">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserCircle className="h-10 w-10 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">{username}</p>
                    <button
                      onClick={onLogout}
                      className="text-xs font-medium text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <LogOut className="h-3 w-3" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <h1 className="ml-4 text-lg font-semibold text-gray-800">Reservations Dashboard</h1>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => toast.info('Notifications panel would open here')}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
                >
                  <Bell className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
