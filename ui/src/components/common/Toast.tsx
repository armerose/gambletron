import { useAppStore } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';

export default function Toast() {
  const { notifications, removeNotification } = useAppStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-danger-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-warning-500" />;
      default:
        return <Info className="w-5 h-5 text-info-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800';
      case 'error':
        return 'bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800';
      case 'warning':
        return 'bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800';
      default:
        return 'bg-info-50 dark:bg-info-900/20 border-info-200 dark:border-info-800';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20, x: 400 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 400 }}
            className={`card border px-4 py-3 flex items-center gap-3 ${getBgColor(notification.type)}`}
          >
            {getIcon(notification.type)}
            <p className="text-sm font-medium text-surface-900 dark:text-white flex-1">
              {notification.message}
            </p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="p-1 hover:bg-surface-200 dark:hover:bg-surface-700 rounded"
            >
              <X className="w-4 h-4 text-surface-500" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
