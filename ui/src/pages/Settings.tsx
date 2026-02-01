import { Save, Bell, Lock, User, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Grid, Input, Button } from '../components/ui';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useSettings, useUpdateSettings } from '../hooks';

export default function Settings() {
  const { data, isLoading, isError } = useSettings();
  const updateSettings = useUpdateSettings();
  const [settings, setSettings] = useState({
    email: '',
    api_key: '',
    max_drawdown: 10,
    max_leverage: 2,
    notify_profit: true,
    notify_loss: true,
    two_factor: false,
  });

  useEffect(() => {
    if (!data) return;
    const payload = (data as any).data || data;
    if (!payload) return;
    setSettings({
      email: payload.email || '',
      api_key: payload.api_key || '',
      max_drawdown: payload.max_drawdown ?? 10,
      max_leverage: payload.max_leverage ?? 2,
      notify_profit: payload.notify_profit ?? true,
      notify_loss: payload.notify_loss ?? true,
      two_factor: payload.two_factor ?? false,
    });
  }, [data]);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const handleSave = async () => {
    await updateSettings.mutateAsync(settings);
  };

  return (
    <motion.div className="space-y-8 p-6 md:p-8" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
      <motion.div variants={itemVariants} className="space-y-2">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">Settings</h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400">Manage your preferences and configuration</p>
      </motion.div>

      {isLoading && (
        <Card elevated>
          <CardContent className="p-6 text-sm text-neutral-600 dark:text-neutral-400">Loading settings…</CardContent>
        </Card>
      )}
      {isError && (
        <Card elevated>
          <CardContent className="p-6 text-sm text-danger-600">Failed to load settings. Check the API server.</CardContent>
        </Card>
      )}

      {!isLoading && !isError && (
        <>
          <motion.div variants={itemVariants}>
            <Card elevated>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" /> Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Input
                  label="Email Address"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                />
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">API Key</label>
                  <div className="flex gap-2">
                    <Input type="password" value={settings.api_key} disabled />
                    <Button variant="secondary">Regenerate</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card elevated>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" /> Risk Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Grid cols={2} gap="md">
                  <Input
                    label="Max Drawdown %"
                    type="number"
                    value={settings.max_drawdown}
                    onChange={(e) => setSettings((prev) => ({ ...prev, max_drawdown: Number(e.target.value) }))}
                    placeholder="10"
                  />
                  <Input
                    label="Max Leverage"
                    type="number"
                    value={settings.max_leverage}
                    onChange={(e) => setSettings((prev) => ({ ...prev, max_leverage: Number(e.target.value) }))}
                    placeholder="2"
                  />
                </Grid>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card elevated>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" /> Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notify_profit}
                    onChange={(e) => setSettings((prev) => ({ ...prev, notify_profit: e.target.checked }))}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Notify on profitable trades</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notify_loss}
                    onChange={(e) => setSettings((prev) => ({ ...prev, notify_loss: e.target.checked }))}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Notify on losing trades</span>
                </label>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card elevated>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" /> Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.two_factor}
                    onChange={(e) => setSettings((prev) => ({ ...prev, two_factor: e.target.checked }))}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Enable two-factor authentication</span>
                </label>
                <Button variant="secondary">Change Password</Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="flex gap-2">
            <Button variant="primary" size="lg" className="flex items-center gap-2" onClick={handleSave} isLoading={updateSettings.isLoading}>
              <Save className="w-5 h-5" /> Save Changes
            </Button>
            <Button variant="secondary" size="lg">Cancel</Button>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
