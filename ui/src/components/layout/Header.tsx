import { Menu, Moon, Sun, Bell } from 'lucide-react';
import { useAppStore } from '../../store';
import { motion } from 'framer-motion';

export default function Header() {
  const { toggleDarkMode, isDarkMode, toggleSidebar } = useAppStore();

  return (
    <header className="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <motion.button
          onClick={toggleSidebar}
          whileHover={{ scale: 1.05 }}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
        >
          <Menu className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
        </motion.button>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg relative"
        >
          <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          <div className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full animate-pulse" />
        </motion.button>

        {/* Theme Toggle */}
        <motion.button
          onClick={toggleDarkMode}
          whileHover={{ scale: 1.05 }}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-neutral-400" />
          ) : (
            <Moon className="w-5 h-5 text-neutral-600" />
          )}
        </motion.button>

        {/* User Avatar */}
        <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-white">T</span>
        </div>
      </div>
    </header>
  );
}
