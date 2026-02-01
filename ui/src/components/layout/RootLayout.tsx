import { Outlet } from 'react-router-dom';
import { useAppStore } from '../../store';
import Sidebar from './Sidebar';
import Header from './Header';
import Toast from '../common/Toast';
import { motion } from 'framer-motion';

export default function RootLayout() {
  const { sidebarOpen } = useAppStore();

  return (
    <div className="flex h-screen bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-950">
      {/* Sidebar */}
      <motion.div
        className="hidden md:flex flex-col w-64 bg-white dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700"
        animate={{ marginLeft: sidebarOpen ? 0 : -256 }}
        transition={{ duration: 0.3 }}
      >
        <Sidebar />
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <motion.main
          className="flex-1 overflow-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-6 sm:p-8">
            <Outlet />
          </div>
        </motion.main>
      </div>

      {/* Notifications */}
      <Toast />
    </div>
  );
}
