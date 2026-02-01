import { TrendingUp, TrendingDown, AlertCircle, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Grid } from '../components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { usePositions, useAnalyticsPerformance } from '../hooks';

export default function Monitor() {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  const { data: positionsData } = usePositions();
  const { data: performanceData } = useAnalyticsPerformance();

  const initialPositions = useMemo(() => {
    if (!positionsData) return [];
    return (positionsData as any).data || positionsData;
  }, [positionsData]);
  const [positions, setPositions] = useState<any[]>([]);

  useEffect(() => {
    setPositions(initialPositions);
  }, [initialPositions]);

  useEffect(() => {
    const apiUrl = localStorage.getItem('apiUrl') || import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const source = new EventSource(`${apiUrl}/stream/positions`);
    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setPositions((prev) => {
          const existing = prev.find((p) => p.symbol === payload.symbol);
          if (!existing) return [payload, ...prev];
          return prev.map((p) => (p.symbol === payload.symbol ? { ...p, ...payload } : p));
        });
      } catch (error) {
        // ignore malformed events
      }
    };
    return () => source.close();
  }, []);

  const performance = useMemo(() => {
    if (!performanceData) return null;
    return (performanceData as any).data || performanceData;
  }, [performanceData]);

  const drawdownData = performance?.monthly?.map((row: any) => ({ month: row.month, drawdown: Math.max(0, 5 - row.return) })) || [];
  const maxDrawdown = drawdownData.length > 0 ? Math.max(...drawdownData.map((d: any) => d.drawdown)) : null;

  return (
    <motion.div className="space-y-8 p-6 md:p-8">
      <motion.div variants={itemVariants} className="space-y-2">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">Portfolio Monitor</h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400">
          Real-time position tracking and risk metrics
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Grid cols={4} gap="lg">
          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Portfolio Beta</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">0.95</p>
                <p className="text-xs text-neutral-500">Neutral market exposure</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Volatility</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">12.3%</p>
                <p className="text-xs text-neutral-500">Annualized</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Max Drawdown</p>
                <p className="text-3xl font-bold text-danger-600">{maxDrawdown !== null ? `${maxDrawdown}%` : '—'}</p>
                <p className="text-xs text-neutral-500">YTD</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Sharpe Ratio</p>
                <p className="text-3xl font-bold text-success-600">{performance ? performance.avg_win_loss : '—'}</p>
                <p className="text-xs text-neutral-500">Risk-adjusted</p>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Grid cols={2} gap="lg">
          <Card elevated>
            <CardHeader>
              <CardTitle>Drawdown History</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={drawdownData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} formatter={(value) => `${value}%`} />
                  <Bar dataKey="drawdown" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card elevated>
            <CardHeader>
              <CardTitle>Position Allocation</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-6 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={positions.map((p: any) => ({ name: p.symbol, value: p.quantity }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      '#3b82f6',
                      '#10b981',
                      '#f59e0b',
                      '#ef4444',
                      '#8b5cf6',
                    ].map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card elevated>
          <CardHeader>
            <CardTitle>Open Positions</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700 dark:text-neutral-300">Symbol</th>
                    <th className="text-right py-3 px-4 font-semibold text-neutral-700 dark:text-neutral-300">Qty</th>
                    <th className="text-right py-3 px-4 font-semibold text-neutral-700 dark:text-neutral-300">Entry</th>
                    <th className="text-right py-3 px-4 font-semibold text-neutral-700 dark:text-neutral-300">Current</th>
                    <th className="text-right py-3 px-4 font-semibold text-neutral-700 dark:text-neutral-300">P&L</th>
                    <th className="text-right py-3 px-4 font-semibold text-neutral-700 dark:text-neutral-300">Return%</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos: any) => (
                    <tr key={pos.symbol} className="border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                      <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100">{pos.symbol}</td>
                      <td className="py-3 px-4 text-right text-neutral-600 dark:text-neutral-400">{pos.quantity}</td>
                      <td className="py-3 px-4 text-right font-mono text-neutral-900 dark:text-neutral-100">${pos.entry.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-mono text-neutral-900 dark:text-neutral-100">${pos.current.toFixed(2)}</td>
                      <td className={`py-3 px-4 text-right font-mono font-semibold flex items-center justify-end gap-1 ${
                        pos.pnl >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'
                      }`}>
                        {pos.pnl >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        ${Math.abs(pos.pnl).toLocaleString()}
                      </td>
                      <td className={`py-3 px-4 text-right font-mono font-semibold ${
                        pos.pnlPercent >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'
                      }`}>
                        {pos.pnlPercent > 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning-500" />
              Risk Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
              <Zap className="w-5 h-5 text-warning-600" />
              <div>
                <p className="font-medium text-warning-900 dark:text-warning-100">High Volatility</p>
                <p className="text-sm text-warning-700 dark:text-warning-200">Portfolio volatility increased 3.2% in last 24 hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
