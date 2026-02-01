import { Plus, Edit2, Trash2, Database, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, Grid, Button, Input } from '../components/ui';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useDataSources, useCreateDataSource, useUpdateDataSource, useDeleteDataSource, useTestDataSource } from '../hooks';

export default function DataSources() {
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
  const { data, isLoading, isError } = useDataSources();
  const createSource = useCreateDataSource();
  const updateSource = useUpdateDataSource();
  const deleteSource = useDeleteDataSource();
  const testSource = useTestDataSource();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'market_data', symbols: 0 });

  const sources = useMemo(() => {
    if (!data) return [];
    if (Array.isArray((data as any).data)) return (data as any).data;
    if (Array.isArray(data as any)) return data as any[];
    return [];
  }, [data]);

  const handleCreate = async () => {
    await createSource.mutateAsync({
      name: formData.name,
      type: formData.type,
      symbols: Number(formData.symbols || 0),
      status: 'disconnected',
    });
    setFormData({ name: '', type: 'market_data', symbols: 0 });
    setShowForm(false);
  };

  return (
    <motion.div className="space-y-8 p-6 md:p-8" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">Data Sources</h1>
          <p className="text-base text-neutral-600 dark:text-neutral-400">Connect and manage your market data sources</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowForm((prev) => !prev)}>
          <Plus className="w-5 h-5 mr-2" /> Connect Source
        </Button>
      </motion.div>

      {showForm && (
        <motion.div variants={itemVariants}>
          <Card elevated>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Source Name"
                value={formData.name}
                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="e.g., Polygon.io"
              />
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Type</label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                  value={formData.type}
                  onChange={(event) => setFormData((prev) => ({ ...prev, type: event.target.value }))}
                >
                  <option value="market_data">Market Data</option>
                  <option value="brokerage">Brokerage</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <Input
                label="Symbols"
                type="number"
                value={formData.symbols}
                onChange={(event) => setFormData((prev) => ({ ...prev, symbols: Number(event.target.value) }))}
                placeholder="5000"
              />
              <div className="md:col-span-3 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleCreate} isLoading={createSource.isLoading}>Save</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        {isLoading && (
          <Card elevated>
            <CardContent className="p-6 text-sm text-neutral-600 dark:text-neutral-400">Loading data sources…</CardContent>
          </Card>
        )}
        {isError && (
          <Card elevated>
            <CardContent className="p-6 text-sm text-danger-600">Failed to load data sources. Check the API server.</CardContent>
          </Card>
        )}
        {!isLoading && !isError && (
          <Grid cols={1} gap="lg">
            {sources.map((source: any) => (
              <Card key={source.id} elevated>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/20 rounded-lg flex items-center justify-center">
                      <Database className="w-6 h-6 text-brand-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-neutral-900 dark:text-neutral-100">{source.name}</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{source.type} • {source.symbols.toLocaleString()} symbols</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${source.status === 'connected' ? 'bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-300' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700'}`}>
                      {source.status}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => testSource.mutate(source.id)}
                      isLoading={testSource.isLoading}
                    >
                      {source.status === 'connected' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      Test
                    </Button>
                    <button
                      className="p-2 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                      onClick={() => updateSource.mutate({ id: source.id, data: { status: source.status === 'connected' ? 'disconnected' : 'connected' } })}
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg"
                      onClick={() => deleteSource.mutate(source.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
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
