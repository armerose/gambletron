import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

const mockLogs = [
  { id: '001', timestamp: '2024-01-15 14:32:45', level: 'info', agent: 'Agent 1', message: 'Trade executed: BUY 100 AAPL @ $180.50' },
  { id: '002', timestamp: '2024-01-15 13:45:22', level: 'warning', agent: 'Agent 2', message: 'High volatility detected, reducing position size' },
  { id: '003', timestamp: '2024-01-15 12:15:10', level: 'error', agent: 'Agent 3', message: 'Connection lost to broker API' },
  { id: '004', timestamp: '2024-01-15 11:30:05', level: 'info', agent: 'Agent 1', message: 'Signal generated: momentum above threshold' },
  { id: '005', timestamp: '2024-01-15 10:45:18', level: 'info', agent: 'System', message: 'Backtest completed: Agent 4 (Sharpe: 1.8)' },
];

const getLevelColor = (level: string) => {
  switch (level) {
    case 'error':
      return 'bg-danger-100 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300';
    case 'warning':
      return 'bg-warning-100 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300';
    case 'info':
      return 'bg-info-100 dark:bg-info-900/20 text-info-700 dark:text-info-300';
    default:
      return 'bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300';
  }
};

export default function Logs() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-surface-900 dark:text-white">System Logs</h1>
        <p className="text-surface-600 dark:text-surface-400 mt-2">View system events, trades, and agent activity</p>
      </div>

      {/* Filters */}
      <motion.div className="card p-4 flex gap-4 items-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <select className="px-3 py-2 bg-surface-100 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-lg text-sm">
          <option>All Levels</option>
          <option>Info</option>
          <option>Warning</option>
          <option>Error</option>
        </select>
        <select className="px-3 py-2 bg-surface-100 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-lg text-sm">
          <option>All Agents</option>
          <option>Agent 1</option>
          <option>Agent 2</option>
          <option>Agent 3</option>
        </select>
        <input
          type="text"
          placeholder="Search logs..."
          className="flex-1 px-3 py-2 bg-surface-100 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-lg text-sm"
        />
      </motion.div>

      {/* Logs Table */}
      <motion.div
        className="card-elevated p-6"
        whileHover={{ y: -2 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-info-500" />
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Event Log</h3>
        </div>
        <div className="space-y-3">
          {mockLogs.map((log, idx) => (
            <motion.div
              key={log.id}
              className="p-4 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="flex items-start gap-4">
                <span className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${getLevelColor(log.level)}`}>
                  {log.level.toUpperCase()}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <span className="font-mono text-surface-500 dark:text-surface-400">{log.timestamp}</span>
                    <span className="text-surface-600 dark:text-surface-300 font-medium">{log.agent}</span>
                  </div>
                  <p className="text-surface-900 dark:text-surface-100">{log.message}</p>
                </div>
                <span className="text-xs text-surface-400 dark:text-surface-600 font-mono">{log.id}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
