import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Zap,
  Activity,
  BarChart3,
  FileText,
  Settings,
  TrendingUp,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Agents', path: '/agents', icon: Zap },
  { label: 'Monitor', path: '/monitor', icon: Activity },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Logs', path: '/logs', icon: FileText },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-surface-200 dark:border-surface-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-surface-900 dark:text-white">Gambletron</h1>
            <p className="text-xs text-surface-500 dark:text-surface-400">Trading AI</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link key={item.path} to={item.path}>
              <motion.button
                className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-700/50'
                }`}
                whileHover={{ x: 4 }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    className="ml-auto w-1.5 h-1.5 bg-primary-500 rounded-full"
                    layoutId="activeIndicator"
                  />
                )}
              </motion.button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
