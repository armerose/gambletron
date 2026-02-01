import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
  const [formData, setFormData] = useState({
    apiUrl: 'http://localhost:8000',
    refreshInterval: '5',
    theme: 'auto',
    notifications: true,
    soundAlerts: false,
  });

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-surface-900 dark:text-white">Settings</h1>
        <p className="text-surface-600 dark:text-surface-400 mt-2">Configure your trading platform</p>
      </div>

      {/* API Configuration */}
      <motion.div className="card-elevated p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-6">
          <SettingsIcon className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">API Configuration</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              API URL
            </label>
            <input
              type="text"
              value={formData.apiUrl}
              onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
              className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-600 rounded-lg text-surface-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Refresh Interval (seconds)
            </label>
            <input
              type="number"
              value={formData.refreshInterval}
              onChange={(e) => setFormData({ ...formData, refreshInterval: e.target.value })}
              className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-600 rounded-lg text-surface-900 dark:text-white"
            />
          </div>
        </div>
      </motion.div>

      {/* Display Settings */}
      <motion.div
        className="card-elevated p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">Display</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Theme
            </label>
            <select
              value={formData.theme}
              onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
              className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-600 rounded-lg text-surface-900 dark:text-white"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        className="card-elevated p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">Notifications</h3>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.notifications}
              onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-surface-700 dark:text-surface-300">Enable Desktop Notifications</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.soundAlerts}
              onChange={(e) => setFormData({ ...formData, soundAlerts: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-surface-700 dark:text-surface-300">Enable Sound Alerts</span>
          </label>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="btn-primary flex items-center gap-2 w-full justify-center py-3"
      >
        <Save className="w-5 h-5" />
        Save Changes
      </motion.button>
    </div>
  );
}
