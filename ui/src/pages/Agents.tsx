import { motion } from 'framer-motion';
import { Plus, Play, Pause, Trash2, Copy, MoreVertical } from 'lucide-react';
import { useState } from 'react';

const mockAgents = [
  {
    id: '1',
    name: 'Momentum Trader',
    strategy: 'Momentum',
    status: 'running',
    equity: '$45,230',
    return: '12.5%',
    trades: 156,
    winRate: '62.4%',
  },
  {
    id: '2',
    name: 'Mean Reversion',
    strategy: 'Mean Reversion',
    status: 'stopped',
    equity: '$32,150',
    return: '8.3%',
    trades: 89,
    winRate: '58.1%',
  },
  {
    id: '3',
    name: 'Trend Follower',
    strategy: 'Trend Following',
    status: 'running',
    equity: '$67,890',
    return: '15.2%',
    trades: 234,
    winRate: '65.7%',
  },
];

export default function Agents() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-surface-900 dark:text-white">Trading Agents</h1>
          <p className="text-surface-600 dark:text-surface-400 mt-2">Manage and monitor your autonomous trading agents</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Agent
        </motion.button>
      </div>

      {/* Agents Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {mockAgents.map((agent, idx) => (
          <motion.div
            key={agent.id}
            className={`card-elevated p-6 cursor-pointer transition-all ${
              selectedAgent === agent.id ? 'ring-2 ring-primary-500' : ''
            }`}
            onClick={() => setSelectedAgent(agent.id)}
            whileHover={{ y: -4 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-white">{agent.name}</h3>
                <p className="text-sm text-surface-500 dark:text-surface-400">{agent.strategy}</p>
              </div>
              <motion.button whileHover={{ rotate: 90 }} className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg">
                <MoreVertical className="w-5 h-5 text-surface-400" />
              </motion.button>
            </div>

            {/* Status */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${agent.status === 'running' ? 'bg-success-500 animate-pulse' : 'bg-surface-400'}`}
                />
                <span className="text-sm font-medium text-surface-600 dark:text-surface-400 capitalize">
                  {agent.status}
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
              <div>
                <p className="text-xs text-surface-500 dark:text-surface-400">Equity</p>
                <p className="text-sm font-bold text-surface-900 dark:text-white">{agent.equity}</p>
              </div>
              <div>
                <p className="text-xs text-surface-500 dark:text-surface-400">Return</p>
                <p className="text-sm font-bold text-success-500">{agent.return}</p>
              </div>
              <div>
                <p className="text-xs text-surface-500 dark:text-surface-400">Trades</p>
                <p className="text-sm font-bold text-surface-900 dark:text-white">{agent.trades}</p>
              </div>
              <div>
                <p className="text-xs text-surface-500 dark:text-surface-400">Win Rate</p>
                <p className="text-sm font-bold text-surface-900 dark:text-white">{agent.winRate}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex-1 btn-secondary flex items-center justify-center gap-2"
              >
                {agent.status === 'running' ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start
                  </>
                )}
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} className="btn-ghost p-2">
                <Copy className="w-4 h-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} className="btn-ghost p-2">
                <Trash2 className="w-4 h-4 text-danger-500" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
