import { motion } from 'framer-motion';
import { ArrowLeft, Play, Settings } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Grid, Button } from '../components/ui';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAgent, useAgentMetrics, useAgentBacktest, useStartAgent } from '../hooks';
import { useMemo } from 'react';

export default function AgentDetail() {
  const { id } = useParams();
  const { data: agentData } = useAgent(id || '');
  const { data: metricsData } = useAgentMetrics(id || '');
  const { data: backtestData } = useAgentBacktest(id || '');
  const startAgent = useStartAgent(id || '');

  const agent = useMemo(() => (agentData as any)?.data || agentData, [agentData]);
  const metrics = useMemo(() => (metricsData as any)?.data || metricsData, [metricsData]);
  const backtest = useMemo(() => (backtestData as any)?.data || backtestData, [backtestData]);

  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <motion.div className="space-y-8 p-6 md:p-8" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/agents" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">{agent?.name || 'Agent'}</h1>
            <p className="text-neutral-600 dark:text-neutral-400">{agent?.strategy || 'Strategy'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" size="lg" className="flex items-center gap-2" onClick={() => startAgent.mutate()} isLoading={startAgent.isLoading}>
            <Play className="w-5 h-5" /> Start
          </Button>
          <Button variant="secondary" size="lg"><Settings className="w-5 h-5" /></Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Grid cols={4} gap="lg">
          <Card>
            <CardContent className="pt-6 pb-6">
              <p className="text-sm text-neutral-600">Current Equity</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">${agent?.equity?.toLocaleString() || '—'}</p>
              <p className="text-xs text-success-600 mt-1">{agent ? `${agent.equity_change >= 0 ? '+' : ''}${agent.equity_change} (${agent.equity_change_pct}%)` : '—'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 pb-6">
              <p className="text-sm text-neutral-600">Total Trades</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{metrics?.total_trades ?? '—'}</p>
              <p className="text-xs text-neutral-500 mt-1">Profitable: {metrics ? `${Math.round(metrics.win_rate * 100)}%` : '—'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 pb-6">
              <p className="text-sm text-neutral-600">Avg P&L</p>
              <p className="text-3xl font-bold text-success-600">${metrics ? metrics.profit_factor : '—'}</p>
              <p className="text-xs text-neutral-500 mt-1">Per trade</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 pb-6">
              <p className="text-sm text-neutral-600">Sharpe Ratio</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{metrics?.sharpe_ratio ?? '—'}</p>
              <p className="text-xs text-success-600 mt-1">Risk-adjusted</p>
            </CardContent>
          </Card>
        </Grid>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card elevated>
          <CardHeader>
            <CardTitle>Equity Curve</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={backtest?.equity_curve || []}>
                <CartesianGrid stroke="#e5e7eb" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="equity" stroke="#0066ff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card elevated>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Max Positions</p>
                <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">10</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Risk Per Trade</p>
                <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
