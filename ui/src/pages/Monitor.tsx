import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

const mockPositions = [
  { symbol: 'AAPL', quantity: 100, entryPrice: 180.5, currentPrice: 185.2, pnl: '+$470', status: 'open' },
  { symbol: 'MSFT', quantity: 50, entryPrice: 320.0, currentPrice: 325.8, pnl: '+$290', status: 'open' },
  { symbol: 'GOOGL', quantity: 75, entryPrice: 140.3, currentPrice: 138.9, pnl: '-$105', status: 'open' },
];

const mockTrades = [
  { id: '001', time: '2024-01-15 14:32:45', symbol: 'AAPL', side: 'BUY', quantity: 100, price: 180.5, commission: '$5.00', status: 'completed' },
  { id: '002', time: '2024-01-15 13:45:22', symbol: 'MSFT', side: 'SELL', quantity: 50, price: 325.8, commission: '$3.50', status: 'completed' },
  { id: '003', time: '2024-01-15 12:15:10', symbol: 'GOOGL', side: 'BUY', quantity: 75, price: 138.9, commission: '$4.20', status: 'completed' },
];

export default function Monitor() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-surface-900 dark:text-white">Live Monitor</h1>
        <p className="text-surface-600 dark:text-surface-400 mt-2">Real-time positions and trading activity</p>
      </div>

      {/* Open Positions */}
      <motion.div className="card-elevated p-6" whileHover={{ y: -2 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-info-500" />
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Open Positions ({mockPositions.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left py-3 px-4 font-semibold text-surface-600 dark:text-surface-400 text-sm">Symbol</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-600 dark:text-surface-400 text-sm">Quantity</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-600 dark:text-surface-400 text-sm">Entry Price</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-600 dark:text-surface-400 text-sm">Current Price</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-600 dark:text-surface-400 text-sm">P&L</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-600 dark:text-surface-400 text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockPositions.map((pos, idx) => (
                <motion.tr
                  key={idx}
                  className="border-b border-surface-100 dark:border-surface-700/50 hover:bg-surface-50 dark:hover:bg-surface-800/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <td className="py-3 px-4 text-sm font-bold text-surface-900 dark:text-white">{pos.symbol}</td>
                  <td className="py-3 px-4 text-sm text-surface-900 dark:text-surface-100">{pos.quantity}</td>
                  <td className="py-3 px-4 text-sm text-surface-900 dark:text-surface-100">${pos.entryPrice.toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-surface-900 dark:text-white">${pos.currentPrice.toFixed(2)}</td>
                  <td className={`py-3 px-4 text-sm font-bold ${pos.pnl.startsWith('+') ? 'text-success-500' : 'text-danger-500'}`}>
                    {pos.pnl}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span className="px-2 py-1 rounded-md text-xs font-semibold bg-info-100 dark:bg-info-900/20 text-info-700 dark:text-info-300">
                      {pos.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Trade History */}
      <motion.div
        className="card-elevated p-6"
        whileHover={{ y: -2 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Recent Trades</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left py-3 px-4 font-semibold text-surface-600 dark:text-surface-400 text-sm">ID</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-600 dark:text-surface-400 text-sm">Time</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-600 dark:text-surface-400 text-sm">Symbol</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-600 dark:text-surface-400 text-sm">Side</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-600 dark:text-surface-400 text-sm">Quantity</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-600 dark:text-surface-400 text-sm">Price</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-600 dark:text-surface-400 text-sm">Commission</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-600 dark:text-surface-400 text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockTrades.map((trade) => (
                <tr key={trade.id} className="border-b border-surface-100 dark:border-surface-700/50 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <td className="py-3 px-4 text-sm font-mono text-surface-600 dark:text-surface-400">{trade.id}</td>
                  <td className="py-3 px-4 text-sm text-surface-900 dark:text-surface-100">{trade.time}</td>
                  <td className="py-3 px-4 text-sm font-bold text-surface-900 dark:text-white">{trade.symbol}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                      trade.side === 'BUY'
                        ? 'bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-300'
                        : 'bg-danger-100 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300'
                    }`}>
                      {trade.side}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-surface-900 dark:text-surface-100">{trade.quantity}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-surface-900 dark:text-white">${trade.price.toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm text-surface-600 dark:text-surface-400">{trade.commission}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className="px-2 py-1 rounded-md text-xs font-semibold bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-300">
                      {trade.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
