import { Play, Pause, Trash2, Plus, Square } from 'lucide-react';
import { Card, CardContent, Grid, Button, Badge, Input } from '../components/ui';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useAgents, useStartAgent, useStopAgent, usePauseAgent, useDeleteAgent } from '../hooks';
import { useNavigate } from 'react-router-dom';

function getStatusColor(status: string) {
  switch (status) {
    case 'running':
      return 'success';
    case 'paused':
      return 'warning';
    case 'stopped':
      return 'danger';
    default:
      return 'neutral';
  }
}

function getStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function AgentCard({ agent }: { agent: any }) {
  const startAgent = useStartAgent(agent.id);
  const stopAgent = useStopAgent(agent.id);
  const pauseAgent = usePauseAgent(agent.id);
  const deleteAgent = useDeleteAgent(agent.id);

  return (
    <Card elevated>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{agent.name}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{agent.strategy}</p>
          </div>
          <Badge variant={getStatusColor(agent.status)} size="sm">
            {getStatusLabel(agent.status)}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-neutral-600 dark:text-neutral-400">Return</p>
            <p className={`text-lg font-bold ${agent.equity_change_pct >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
              {agent.equity_change_pct > 0 ? '+' : ''}{agent.equity_change_pct}%
            </p>
          </div>
          <div>
            <p className="text-neutral-600 dark:text-neutral-400">Trades Today</p>
            <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{agent.trades_today}</p>
          </div>
          <div>
            <p className="text-neutral-600 dark:text-neutral-400">Win Rate</p>
            <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{Math.round(agent.win_rate * 100)}%</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="success"
            size="sm"
            className="flex-1"
            onClick={() => startAgent.mutate()}
            isLoading={startAgent.isLoading}
          >
            <Play className="w-4 h-4" /> Start
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => pauseAgent.mutate()}
            isLoading={pauseAgent.isLoading}
          >
            <Pause className="w-4 h-4" /> Pause
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="flex-1"
            onClick={() => stopAgent.mutate()}
            isLoading={stopAgent.isLoading}
          >
            <Square className="w-4 h-4" /> Stop
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteAgent.mutate()}
            isLoading={deleteAgent.isLoading}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Agents() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { data, isLoading, isError } = useAgents();

  const agents = useMemo(() => {
    if (!data) return [];
    if (Array.isArray((data as any).data)) return (data as any).data;
    if (Array.isArray(data as any)) return data as any[];
    return [];
  }, [data]);

  const filteredAgents = agents.filter((agent: any) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || agent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.div
      className="space-y-8 p-6 md:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">Trading Agents</h1>
          <p className="text-base text-neutral-600 dark:text-neutral-400">
            Manage and monitor your automated trading agents
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          className="flex items-center gap-2"
          onClick={() => navigate('/agents/create')}
        >
          <Plus className="w-5 h-5" /> Create Agent
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Grid cols={3} gap="md">
          <Input
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
            value={statusFilter || 'all'}
            onChange={(e) => setStatusFilter(e.target.value === 'all' ? null : e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="running">Running</option>
            <option value="paused">Paused</option>
            <option value="stopped">Stopped</option>
          </select>
        </Grid>
      </motion.div>

      <motion.div variants={itemVariants}>
        {isLoading && (
          <Card elevated>
            <CardContent className="p-6 text-sm text-neutral-600 dark:text-neutral-400">Loading agents…</CardContent>
          </Card>
        )}
        {isError && (
          <Card elevated>
            <CardContent className="p-6 text-sm text-danger-600">Failed to load agents. Check the API server.</CardContent>
          </Card>
        )}
        {!isLoading && !isError && (
          <Grid cols={2} gap="lg">
            {filteredAgents.map((agent: any) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </Grid>
        )}
      </motion.div>
    </motion.div>
  );
}
