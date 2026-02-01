import { Outlet } from 'react-router-dom';
import { useAppStore } from '../../store';
import Sidebar from './Sidebar';
import Header from './Header';
import Toast from '../common/Toast';
import { motion } from 'framer-motion';

export default function RootLayout() {
  const { sidebarOpen } = useAppStore();

  return (
    <div className="flex h-screen bg-white dark:bg-neutral-950">
      {/* Sidebar */}
      <motion.div
        className="hidden md:flex flex-col w-64 bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800"
        animate={{ marginLeft: sidebarOpen ? 0 : -256 }}
        transition={{ duration: 0.3 }}
      >
        <Sidebar />
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <motion.main
          className="flex-1 overflow-auto bg-white dark:bg-neutral-950"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Outlet />
        </motion.main>
      </div>

      {/* Notifications */}
      <Toast />
    </div>
  );
}
