import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent, Grid, Button, Badge, Input } from '../components/ui';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useStrategies, useCreateStrategy, useDeleteStrategy, useUpdateStrategy } from '../hooks';

export default function Strategies() {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const { data, isLoading, isError } = useStrategies();
  const createStrategy = useCreateStrategy();
  const deleteStrategy = useDeleteStrategy();
  const updateStrategy = useUpdateStrategy();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'Custom', description: '' });

  const strategies = useMemo(() => {
    if (!data) return [];
    if (Array.isArray((data as any).data)) return (data as any).data;
    if (Array.isArray(data as any)) return data as any[];
    return [];
  }, [data]);

  const handleCreate = async () => {
    await createStrategy.mutateAsync({
      name: formData.name,
      type: formData.type,
      description: formData.description,
    });
    setFormData({ name: '', type: 'Custom', description: '' });
    setShowForm(false);
  };

  return (
    <motion.div className="space-y-8 p-6 md:p-8" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">Trading Strategies</h1>
          <p className="text-base text-neutral-600 dark:text-neutral-400">Create and manage your trading strategies</p>
        </div>
        <Button variant="primary" size="lg" className="flex items-center gap-2" onClick={() => setShowForm((prev) => !prev)}>
          <Plus className="w-5 h-5" /> New Strategy
        </Button>
      </motion.div>

      {showForm && (
        <motion.div variants={itemVariants}>
          <Card elevated>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Strategy Name"
                value={formData.name}
                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Mean Reversion"
              />
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Type</label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                  value={formData.type}
                  onChange={(event) => setFormData((prev) => ({ ...prev, type: event.target.value }))}
                >
                  <option value="Reversion">Reversion</option>
                  <option value="Trend">Trend</option>
                  <option value="Arbitrage">Arbitrage</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              <Input
                label="Description"
                value={formData.description}
                onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Describe the strategy..."
              />
              <div className="md:col-span-3 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleCreate} isLoading={createStrategy.isLoading}>Save</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        {isLoading && (
          <Card elevated>
            <CardContent className="p-6 text-sm text-neutral-600 dark:text-neutral-400">Loading strategies…</CardContent>
          </Card>
        )}
        {isError && (
          <Card elevated>
            <CardContent className="p-6 text-sm text-danger-600">Failed to load strategies. Check the API server.</CardContent>
          </Card>
        )}
        {!isLoading && !isError && (
          <Grid cols={1} gap="lg">
            {strategies.map((strategy: any) => (
              <Card key={strategy.id} elevated>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{strategy.name}</h3>
                        <Badge variant="primary" size="sm">{strategy.type}</Badge>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">{strategy.description}</p>
                      <div className="flex gap-6 text-sm">
                        <div>
                          <p className="text-neutral-600 dark:text-neutral-400">Active Agents</p>
                          <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{strategy.agents}</p>
                        </div>
                        <div>
                          <p className="text-neutral-600 dark:text-neutral-400">Win Rate</p>
                          <p className="text-lg font-bold text-success-600">{Math.round(strategy.win_rate * 100)}%</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="p-2 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        onClick={() => updateStrategy.mutate({ id: strategy.id, data: { type: strategy.type } })}
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors"
                        onClick={() => deleteStrategy.mutate(strategy.id)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </Grid>
        )}
      </motion.div>
    </motion.div>
  );
}
