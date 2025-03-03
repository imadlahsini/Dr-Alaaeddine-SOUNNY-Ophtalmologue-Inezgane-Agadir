import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, List, Calendar as CalendarIcon, Plus, RefreshCw, Settings } from 'lucide-react';
import { toast } from 'sonner';
import ReservationTable from '../components/ReservationTable';
import CalendarView from '../components/CalendarView';

const MOCK_RESERVATIONS = [
  {
    id: 1,
    name: 'John Doe',
    phone: '0612345678',
    date: '12/05/2023',
    timeSlot: '8h00-11h00',
    status: 'Confirmed' as const
  },
  {
    id: 2,
    name: 'Jane Smith',
    phone: '0698765432',
    date: '13/05/2023',
    timeSlot: '11h00-14h00',
    status: 'Pending' as const
  },
  {
    id: 3,
    name: 'Ahmed Hassan',
    phone: '0623456789',
    date: '14/05/2023',
    timeSlot: '14h00-16h00',
    status: 'Canceled' as const
  },
  {
    id: 4,
    name: 'Maria Garcia',
    phone: '0634567890',
    date: '15/05/2023',
    timeSlot: '8h00-11h00',
    status: 'Not Responding' as const
  }
];

interface Reservation {
  id: number;
  name: string;
  phone: string;
  date: string;
  timeSlot: string;
  status: 'Pending' | 'Confirmed' | 'Canceled' | 'Not Responding';
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated !== 'true') {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    toast.success('Logged out successfully');
    navigate('/admin');
  };

  const handleStatusChange = (id: number, status: Reservation['status']) => {
    setReservations(prev => 
      prev.map(res => 
        res.id === id ? { ...res, status } : res
      )
    );
    toast.success(`Reservation status updated to ${status}`);
  };

  const handleUpdateReservation = (id: number, updatedData: Partial<Reservation>) => {
    setReservations(prev => 
      prev.map(res => 
        res.id === id ? { ...res, ...updatedData } : res
      )
    );
    toast.success('Reservation updated successfully');
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      toast.success('Reservations refreshed');
      setIsLoading(false);
    }, 1000);
  };

  const handleReservationSelect = (reservation: Reservation) => {
    setSelectedReservation(reservation);
  };

  const stats = {
    total: reservations.length,
    confirmed: reservations.filter(r => r.status === 'Confirmed').length,
    pending: reservations.filter(r => r.status === 'Pending').length,
    canceled: reservations.filter(r => r.status === 'Canceled').length,
    notResponding: reservations.filter(r => r.status === 'Not Responding').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-800">Reservation Dashboard</h1>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
              onClick={() => navigate('/telegram-config')}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Telegram Setup</span>
              <span className="sm:hidden">Setup</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <motion.div
            whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' }}
            className="bg-white p-4 rounded-[20px] shadow text-center"
          >
            <p className="text-gray-500 text-sm mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </motion.div>
          
          <motion.div
            whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' }}
            className="bg-white p-4 rounded-[20px] shadow text-center"
          >
            <p className="text-green-500 text-sm mb-1">Confirmed</p>
            <p className="text-2xl font-bold text-gray-800">{stats.confirmed}</p>
          </motion.div>
          
          <motion.div
            whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' }}
            className="bg-white p-4 rounded-[20px] shadow text-center"
          >
            <p className="text-yellow-500 text-sm mb-1">Pending</p>
            <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
          </motion.div>
          
          <motion.div
            whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' }}
            className="bg-white p-4 rounded-[20px] shadow text-center"
          >
            <p className="text-red-500 text-sm mb-1">Canceled</p>
            <p className="text-2xl font-bold text-gray-800">{stats.canceled}</p>
          </motion.div>
          
          <motion.div
            whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' }}
            className="bg-white p-4 rounded-[20px] shadow text-center"
          >
            <p className="text-gray-500 text-sm mb-1">No Response</p>
            <p className="text-2xl font-bold text-gray-800">{stats.notResponding}</p>
          </motion.div>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <div className="inline-flex rounded-lg shadow-sm">
            <button
              className={`inline-flex items-center px-4 py-2 ${
                view === 'list'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } text-sm font-medium rounded-l-lg border border-gray-200`}
              onClick={() => setView('list')}
            >
              <List className="w-4 h-4 mr-2" />
              List View
            </button>
            <button
              className={`inline-flex items-center px-4 py-2 ${
                view === 'calendar'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } text-sm font-medium rounded-r-lg border border-l-0 border-gray-200`}
              onClick={() => setView('calendar')}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendar View
            </button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-primary text-white rounded-full shadow-sm hover:bg-primary/90 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Reservation</span>
          </motion.button>
        </div>
        
        <AnimatePresence mode="wait">
          {view === 'list' ? (
            <motion.div
              key="list-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ReservationTable
                reservations={reservations}
                onStatusChange={handleStatusChange}
                onUpdate={handleUpdateReservation}
              />
            </motion.div>
          ) : (
            <motion.div
              key="calendar-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <CalendarView 
                reservations={reservations}
                onReservationSelect={handleReservationSelect}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <AnimatePresence>
        {selectedReservation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedReservation(null)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-[20px] shadow-lg w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Reservation Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{selectedReservation.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedReservation.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{selectedReservation.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time Slot</p>
                      <p className="font-medium">{selectedReservation.timeSlot}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium">{selectedReservation.status}</p>
                    </div>
                  </div>

                  <div className="pt-4 flex space-x-3">
                    <button
                      className="flex-1 py-2 bg-primary text-white rounded-lg"
                      onClick={() => {
                        handleStatusChange(selectedReservation.id, 'Confirmed');
                        setSelectedReservation(null);
                      }}
                    >
                      Confirm
                    </button>
                    <button
                      className="flex-1 py-2 bg-red-500 text-white rounded-lg"
                      onClick={() => {
                        handleStatusChange(selectedReservation.id, 'Canceled');
                        setSelectedReservation(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
