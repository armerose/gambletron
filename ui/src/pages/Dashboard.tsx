import { DollarSign, TrendingUp, Users, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Grid } from '../components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';
import { useDashboard } from '../hooks';
import { useMemo } from 'react';

export default function Dashboard() {
  const { data, isLoading, isError } = useDashboard();

  const dashboard = useMemo(() => {
    if (!data) return null;
    return (data as any).data || data;
  }, [data]);

  const equityChartData = dashboard?.equity_curve || [];
  const agentPerformanceData = dashboard?.agent_performance || [];
  const recentTradesData = dashboard?.recent_trades || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      className="space-y-8 p-6 md:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="space-y-2">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">Dashboard</h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400">
          Real-time portfolio performance and trading activity
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Grid cols={4} gap="lg">
          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Equity</p>
                  <DollarSign className="w-5 h-5 text-brand-500" />
                </div>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  ${dashboard?.total_equity?.toLocaleString() || '—'}
                </p>
                <p className="text-xs font-semibold text-success-600 dark:text-success-400">
                  {dashboard ? `Monthly return: ${dashboard.monthly_return_pct}%` : '—'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Monthly Return</p>
                  <TrendingUp className="w-5 h-5 text-success-500" />
                </div>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {dashboard ? `${dashboard.monthly_return_pct}%` : '—'}
                </p>
                <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                  Updated from latest data
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Active Agents</p>
                  <Users className="w-5 h-5 text-brand-500" />
                </div>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {dashboard ? dashboard.active_agents : '—'}
                </p>
                <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                  {dashboard ? `of ${dashboard.total_agents} total agents` : '—'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Win Rate</p>
                  <Activity className="w-5 h-5 text-warning-500" />
                </div>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {dashboard ? `${dashboard.win_rate}%` : '—'}
                </p>
                <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                  Portfolio success rate
                </p>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </motion.div>

      <motion.div variants={itemVariants}>
        {isLoading && (
          <Card elevated>
            <CardContent className="p-6 text-sm text-neutral-600 dark:text-neutral-400">Loading dashboard…</CardContent>
          </Card>
        )}
        {isError && (
          <Card elevated>
            <CardContent className="p-6 text-sm text-danger-600">Failed to load dashboard data.</CardContent>
          </Card>
        )}
        {!isLoading && !isError && (
          <Grid cols={2} gap="lg">
            <Card elevated={true}>
              <CardHeader>
                <CardTitle>Equity Curve</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-6">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={equityChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                      formatter={(value: any) => `$${value.toLocaleString()}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="equity"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorEquity)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card elevated={true}>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={agentPerformanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                      formatter={(value: any) => `${value.toFixed(1)}%`}
                    />
                    <Bar dataKey="return" fill="#10b981" radius={[8, 8, 0, 0]} />
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
            <CardTitle>Recent Trades</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700 dark:text-neutral-300">Agent</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700 dark:text-neutral-300">Symbol</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700 dark:text-neutral-300">Type</th>
                    <th className="text-right py-3 px-4 font-semibold text-neutral-700 dark:text-neutral-300">Price</th>
                    <th className="text-right py-3 px-4 font-semibold text-neutral-700 dark:text-neutral-300">Size</th>
                    <th className="text-right py-3 px-4 font-semibold text-neutral-700 dark:text-neutral-300">P&L</th>
                    <th className="text-right py-3 px-4 font-semibold text-neutral-700 dark:text-neutral-300">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTradesData.map((trade: any) => (
                    <tr key={trade.id} className="border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                      <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100">{trade.agent}</td>
                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">{trade.symbol}</td>
                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">{trade.type}</td>
                      <td className="py-3 px-4 text-right font-mono text-neutral-900 dark:text-neutral-100">${trade.price}</td>
                      <td className="py-3 px-4 text-right text-neutral-600 dark:text-neutral-400">{trade.size}</td>
                      <td className={`py-3 px-4 text-right font-mono font-semibold ${trade.pnl >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                        {trade.pnl >= 0 ? '+' : ''}${Math.abs(trade.pnl).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-neutral-500 dark:text-neutral-400">{trade.time}</td>
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
