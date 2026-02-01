import { DollarSign, TrendingUp, Users, Zap } from 'lucide-react';
import MetricCard from '../components/common/MetricCard';
import ChartWrapper from '../components/charts/ChartWrapper';
import { motion } from 'framer-motion';

const mockMetrics = [
  { title: 'Total Equity', value: '$234,567', change: 12.5, trend: 'up' as const },
  { title: 'Monthly Return', value: '8.3%', change: 2.1, trend: 'up' as const },
  { title: 'Active Agents', value: '5', change: 0, trend: 'neutral' as const },
  { title: 'Win Rate', value: '62.4%', change: -1.3, trend: 'down' as const },
];

const equityChartData = [
  { name: 'Jan', equity: 100000 },
  { name: 'Feb', equity: 112000 },
  { name: 'Mar', equity: 108000 },
  { name: 'Apr', equity: 125000 },
  { name: 'May', equity: 134567 },
  { name: 'Jun', equity: 142000 },
];

const performanceData = [
  { name: 'Agent 1', return: 15.2 },
  { name: 'Agent 2', return: 8.5 },
  { name: 'Agent 3', return: 12.1 },
  { name: 'Agent 4', return: 6.3 },
  { name: 'Agent 5', return: 9.7 },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-surface-900 dark:text-white">Dashboard</h1>
        <p className="text-surface-600 dark:text-surface-400 mt-2">Real-time trading performance overview</p>
      </div>

      {/* Metrics Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {mockMetrics.map((metric, idx) => (
          <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.1 }}>
            <MetricCard
              title={metric.title}
              value={metric.value}
              change={metric.change}
              trend={metric.trend}
              icon={
                idx === 0 ? <DollarSign className="w-6 h-6 text-primary-500" /> :
                idx === 1 ? <TrendingUp className="w-6 h-6 text-success-500" /> :
                idx === 2 ? <Users className="w-6 h-6 text-info-500" /> :
                <Zap className="w-6 h-6 text-warning-500" />
              }
              sparkData={[
                { value: 30 + Math.random() * 20 },
                { value: 40 + Math.random() * 20 },
                { value: 35 + Math.random() * 20 },
                { value: 50 + Math.random() * 20 },
                { value: 45 + Math.random() * 20 },
              ]}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWrapper
          title="Equity Curve"
          type="area"
          data={equityChartData}
          dataKey="equity"
          color="#3b82f6"
          height={300}
        />
        <ChartWrapper
          title="Agent Performance"
          type="bar"
          data={performanceData}
          dataKey="return"
          color="#10b981"
          height={300}
        />
      </div>

      {/* Recent Activity */}
      <motion.div className="card-elevated p-6" whileHover={{ y: -2 }}>
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Recent Trades</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left py-3 px-4 font-semibold text-surface-600 dark:text-surface-400 text-sm">Time</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-600 dark:text-surface-400 text-sm">Agent</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-600 dark:text-surface-400 text-sm">Symbol</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-600 dark:text-surface-400 text-sm">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-600 dark:text-surface-400 text-sm">P&L</th>
              </tr>
            </thead>
            <tbody>
              {[
                { time: '2024-01-15 14:32', agent: 'Agent 1', symbol: 'AAPL', type: 'BUY', pnl: '+$245.50' },
                { time: '2024-01-15 13:45', agent: 'Agent 3', symbol: 'MSFT', type: 'SELL', pnl: '-$128.30' },
                { time: '2024-01-15 12:15', agent: 'Agent 2', symbol: 'GOOGL', type: 'BUY', pnl: '+$567.80' },
              ].map((trade, idx) => (
                <tr key={idx} className="border-b border-surface-100 dark:border-surface-700/50 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <td className="py-3 px-4 text-sm text-surface-900 dark:text-surface-100">{trade.time}</td>
                  <td className="py-3 px-4 text-sm text-surface-900 dark:text-surface-100">{trade.agent}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-surface-900 dark:text-white">{trade.symbol}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                      trade.type === 'BUY' ? 'bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-300' : 
                      'bg-danger-100 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300'
                    }`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className={`py-3 px-4 text-sm font-semibold ${
                    trade.pnl.startsWith('+') ? 'text-success-500' : 'text-danger-500'
                  }`}>
                    {trade.pnl}
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
