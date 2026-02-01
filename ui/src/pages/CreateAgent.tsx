import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '../components/ui';
import { useMemo, useState } from 'react';
import { useCreateAgent, useStrategies } from '../hooks';

export default function CreateAgent() {
  const [step] = useState(1);
  const [formData, setFormData] = useState({ name: '', strategy: '', symbols: '', budget: '' });
  const createAgent = useCreateAgent();
  const { data } = useStrategies();
  const navigate = useNavigate();

  const strategies = useMemo(() => {
    if (!data) return [];
    return (data as any).data || data;
  }, [data]);

  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  const handleCreate = async () => {
    await createAgent.mutateAsync({
      name: formData.name,
      strategy: formData.strategy || (strategies[0]?.name ?? 'Momentum'),
      symbols: formData.symbols,
      budget: formData.budget,
    });
    navigate('/agents');
  };

  return (
    <motion.div className="space-y-8 p-6 md:p-8" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <Link to="/agents" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
        </Link>
        <div>
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">Create New Agent</h1>
          <p className="text-base text-neutral-600 dark:text-neutral-400">Step {step} of 3</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card elevated>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Agent Name</label>
              <Input type="text" placeholder="e.g., Momentum Trader 1" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Strategy</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                value={formData.strategy}
                onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
              >
                {strategies.map((strategy: any) => (
                  <option key={strategy.id} value={strategy.name}>{strategy.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Initial Budget ($)</label>
              <Input type="number" placeholder="e.g., 10000" value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-4 justify-end">
        <Button variant="secondary" size="lg" onClick={() => navigate('/agents')}>Cancel</Button>
        <Button variant="primary" size="lg" onClick={handleCreate} isLoading={createAgent.isLoading}>Create Agent</Button>
      </motion.div>
    </motion.div>
  );
}
