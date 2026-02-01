import { motion } from 'framer-motion';
import ChartWrapper from '../components/charts/ChartWrapper';

const analyticsChartData = [
  { name: 'Week 1', return: 2.5 },
  { name: 'Week 2', return: 4.1 },
  { name: 'Week 3', return: 3.2 },
  { name: 'Week 4', return: 5.8 },
  { name: 'Week 5', return: 4.9 },
  { name: 'Week 6', return: 6.3 },
];

const riskData = [
  { name: 'Agent 1', sharpe: 1.8, maxDD: 8.5 },
  { name: 'Agent 2', sharpe: 1.2, maxDD: 12.3 },
  { name: 'Agent 3', sharpe: 2.1, maxDD: 6.2 },
  { name: 'Agent 4', sharpe: 0.9, maxDD: 15.1 },
];

export default function Analytics() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-surface-900 dark:text-white">Analytics</h1>
        <p className="text-surface-600 dark:text-surface-400 mt-2">Advanced performance and risk analytics</p>
      </div>

      {/* Charts */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ChartWrapper
          title="Weekly Returns"
          type="bar"
          data={analyticsChartData}
          dataKey="return"
          color="#10b981"
          height={300}
        />
        <ChartWrapper
          title="Sharpe Ratio vs Max Drawdown"
          type="bar"
          data={riskData}
          dataKey="sharpe"
          color="#3b82f6"
          height={300}
        />
      </motion.div>

      {/* Risk Metrics Table */}
      <motion.div className="card-elevated p-6" whileHover={{ y: -2 }}>
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Risk Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left py-3 px-4 font-semibold text-surface-600 dark:text-surface-400 text-sm">Agent</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-600 dark:text-surface-400 text-sm">Sharpe Ratio</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-600 dark:text-surface-400 text-sm">Max Drawdown</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-600 dark:text-surface-400 text-sm">Volatility</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-600 dark:text-surface-400 text-sm">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {riskData.map((row, idx) => (
                <tr key={idx} className="border-b border-surface-100 dark:border-surface-700/50 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <td className="py-3 px-4 text-sm font-semibold text-surface-900 dark:text-white">{row.name}</td>
                  <td className="py-3 px-4 text-sm text-success-500 font-semibold">{row.sharpe.toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm text-danger-500 font-semibold">{row.maxDD.toFixed(1)}%</td>
                  <td className="py-3 px-4 text-sm text-surface-900 dark:text-white">{(12 + Math.random() * 5).toFixed(1)}%</td>
                  <td className="py-3 px-4 text-sm text-surface-900 dark:text-white">{(55 + Math.random() * 15).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
