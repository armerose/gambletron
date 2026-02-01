import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Area, Line } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, Grid } from '../components/ui';
import { motion } from 'framer-motion';
import { useAnalyticsPerformance } from '../hooks';
import { useMemo } from 'react';

export default function Analytics() {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const { data, isLoading, isError } = useAnalyticsPerformance();
  const performance = useMemo(() => {
    if (!data) return null;
    return (data as any).data || data;
  }, [data]);

  const performanceData = performance?.monthly || [];
  const tradeDistribution = performance?.trade_distribution || [];
  const strategyPerformance = performance?.strategy_performance || [];

  return (
    <motion.div className="space-y-8 p-6 md:p-8">
      <motion.div variants={itemVariants} className="space-y-2">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">Analytics</h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400">Performance analysis and insights</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Grid cols={3} gap="lg">
          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-600">Total Trades</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{performance ? performance.total_trades : '—'}</p>
                <p className="text-xs text-neutral-500">Profitability: {performance ? `${performance.profitability}%` : '—'}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-600">Avg Win/Loss</p>
                <p className="text-3xl font-bold text-success-600">{performance ? performance.avg_win_loss : '—'}</p>
                <p className="text-xs text-neutral-500">Profit factor</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-600">Risk/Reward</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{performance ? `1:${performance.risk_reward}` : '—'}</p>
                <p className="text-xs text-neutral-500">Average ratio</p>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </motion.div>

      <motion.div variants={itemVariants}>
        {isLoading && (
          <Card elevated>
            <CardContent className="p-6 text-sm text-neutral-600 dark:text-neutral-400">Loading analytics…</CardContent>
          </Card>
        )}
        {isError && (
          <Card elevated>
            <CardContent className="p-6 text-sm text-danger-600">Failed to load analytics data.</CardContent>
          </Card>
        )}
        {!isLoading && !isError && (
          <Grid cols={2} gap="lg">
            <Card elevated>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-6">
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="return" fill="#3b82f6" stroke="#3b82f6" opacity={0.3} />
                    <Line type="monotone" dataKey="benchmark" stroke="#f59e0b" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card elevated>
              <CardHeader>
                <CardTitle>Trade P&L Distribution</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={tradeDistribution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="range" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card elevated>
          <CardHeader>
            <CardTitle>Strategy Performance</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">Strategy</th>
                    <th className="text-right py-3 px-4 font-semibold text-neutral-700">Trades</th>
                    <th className="text-right py-3 px-4 font-semibold text-neutral-700">Win %</th>
                    <th className="text-right py-3 px-4 font-semibold text-neutral-700">Return</th>
                    <th className="text-right py-3 px-4 font-semibold text-neutral-700">Sharpe</th>
                  </tr>
                </thead>
                <tbody>
                  {strategyPerformance.map((s: any) => (
                    <tr key={s.name} className="border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                      <td className="py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100">{s.name}</td>
                      <td className="py-3 px-4 text-right text-neutral-600 dark:text-neutral-400">{s.trades}</td>
                      <td className="py-3 px-4 text-right text-success-600 font-semibold">{s.win}%</td>
                      <td className="py-3 px-4 text-right text-success-600 font-semibold">+{s.ret}%</td>
                      <td className="py-3 px-4 text-right text-neutral-900 dark:text-neutral-100 font-semibold">{s.sharpe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
