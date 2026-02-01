import { Check, AlertCircle, Plug, TestTube2, Settings } from 'lucide-react';
import { Card, CardContent, Grid, Button, Input, Badge } from '../components/ui';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useIntegrations, useUpdateIntegration, useTestIntegration } from '../hooks';

interface IntegrationField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'number';
  required?: boolean;
  placeholder?: string;
}

interface Integration {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'error' | 'pending' | string;
  provider?: string;
  category?: string;
  fields?: IntegrationField[];
  config?: Record<string, string | number | boolean>;
  last_tested_at?: string;
}

const statusBadgeVariant = (status: string) => {
  if (status === 'active') return 'success';
  if (status === 'error') return 'danger';
  if (status === 'pending') return 'warning';
  return 'neutral';
};

const statusLabel = (status: string) => status.charAt(0).toUpperCase() + status.slice(1);

export default function Integrations() {
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
  const { data, isLoading, isError } = useIntegrations();
  const updateIntegration = useUpdateIntegration();
  const testIntegration = useTestIntegration();

  const integrations = useMemo<Integration[]>(() => {
    if (!data) return [];
    if (Array.isArray((data as any).data)) return (data as any).data as Integration[];
    if (Array.isArray(data as any)) return data as Integration[];
    return [];
  }, [data]);

  const [activeIntegration, setActiveIntegration] = useState<Integration | null>(null);
  const [formState, setFormState] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const openModal = (integration: Integration) => {
    setActiveIntegration(integration);
    const nextState: Record<string, string> = {};
    (integration.fields || []).forEach((field) => {
      const value = integration.config?.[field.key];
      nextState[field.key] = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
    });
    setFormState(nextState);
    setFormError(null);
  };

  const closeModal = () => {
    setActiveIntegration(null);
    setFormState({});
    setFormError(null);
  };

  const handleSave = async () => {
    if (!activeIntegration) return;
    const requiredMissing = (activeIntegration.fields || []).find(
      (field) => field.required && !formState[field.key]
    );
    if (requiredMissing) {
      setFormError(`Please fill in ${requiredMissing.label}.`);
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      await updateIntegration.mutateAsync({
        id: activeIntegration.id,
        data: { config: formState },
      });
    } catch (error) {
      setFormError('Failed to save integration settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!activeIntegration) return;
    setIsSaving(true);
    setFormError(null);
    try {
      await testIntegration.mutateAsync(activeIntegration.id);
    } catch (error) {
      setFormError('Connection test failed.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div className="space-y-8 p-6 md:p-8" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
      <motion.div variants={itemVariants} className="space-y-2">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">Integrations</h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400">Connect third-party services and trading APIs</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        {isLoading && (
          <Card elevated>
            <CardContent className="p-6 text-sm text-neutral-600 dark:text-neutral-400">Loading integrations…</CardContent>
          </Card>
        )}
        {isError && (
          <Card elevated>
            <CardContent className="p-6 text-sm text-danger-600">Failed to load integrations. Check the API server.</CardContent>
          </Card>
        )}
        {!isLoading && !isError && (
          <Grid cols={2} gap="lg">
            {integrations.map((integration) => (
              <Card key={integration.id} elevated>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-bold text-neutral-900 dark:text-neutral-100">{integration.name}</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{integration.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusBadgeVariant(integration.status)} size="sm">{statusLabel(integration.status)}</Badge>
                      {integration.status === 'active' ? (
                        <Check className="w-5 h-5 text-success-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-warning-600" />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    {integration.provider && <span className="flex items-center gap-1"><Plug className="w-3 h-3" /> {integration.provider}</span>}
                    {integration.category && <span className="flex items-center gap-1"><Settings className="w-3 h-3" /> {integration.category}</span>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant={integration.status === 'active' ? 'secondary' : 'primary'}
                      size="sm"
                      className="w-full"
                      onClick={() => openModal(integration)}
                    >
                      {integration.status === 'active' ? 'Configure' : 'Connect'}
                    </Button>
                    {integration.last_tested_at && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Last tested: {new Date(integration.last_tested_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </Grid>
        )}
      </motion.div>

      {activeIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{activeIntegration.name} settings</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Update credentials and test the connection.</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              {(activeIntegration.fields || []).length === 0 && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">This integration does not require configuration.</p>
              )}
              {(activeIntegration.fields || []).map((field) => (
                <Input
                  key={field.key}
                  label={field.label}
                  type={field.type}
                  required={field.required}
                  placeholder={field.placeholder}
                  value={formState[field.key] || ''}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      [field.key]: event.target.value,
                    }))
                  }
                />
              ))}
              {formError && <p className="text-sm text-danger-500">{formError}</p>}
            </div>
            <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-2 justify-end">
              <Button variant="ghost" onClick={closeModal}>Cancel</Button>
              <Button
                variant="secondary"
                onClick={handleTest}
                isLoading={isSaving || testIntegration.isLoading}
              >
                <TestTube2 className="w-4 h-4" /> Test Connection
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                isLoading={isSaving || updateIntegration.isLoading}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
