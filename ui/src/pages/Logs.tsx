import { motion } from 'framer-motion';
import { AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Card, CardContent, Input } from '../components/ui';
import { useMemo, useState } from 'react';
import { useLogsSystem } from '../hooks';

function getLevelIcon(level: string) {
  switch (level) {
    case 'error':
      return <AlertCircle className="w-4 h-4 text-danger-600" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-warning-600" />;
    case 'info':
      return <Info className="w-4 h-4 text-info-600" />;
    default:
      return null;
  }
}

function getLevelColor(level: string) {
  switch (level) {
    case 'error':
      return 'bg-danger-100 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300';
    case 'warning':
      return 'bg-warning-100 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300';
    case 'info':
      return 'bg-info-100 dark:bg-info-900/20 text-info-700 dark:text-info-300';
    default:
      return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300';
  }
}

export default function Logs() {
  const [filterLevel, setFilterLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading, isError } = useLogsSystem();

  const logs = useMemo(() => {
    if (!data) return [];
    const payload = (data as any).data || data;
    if (!Array.isArray(payload)) return [];
    return payload;
  }, [data]);

  const filteredLogs = logs.filter((log: any) => {
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.agent || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div className="space-y-8 p-6 md:p-8" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
      <motion.div variants={itemVariants} className="space-y-2">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">System Logs</h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400">View system events, trades, and agent activity</p>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-4">
        <div className="flex-1">
          <Input type="text" placeholder="Search logs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
        >
          <option value="all">All Levels</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>
      </motion.div>

      <motion.div variants={itemVariants}>
        {isLoading && (
          <Card elevated>
            <CardContent className="p-6 text-sm text-neutral-600 dark:text-neutral-400">Loading logs…</CardContent>
          </Card>
        )}
        {isError && (
          <Card elevated>
            <CardContent className="p-6 text-sm text-danger-600">Failed to load logs.</CardContent>
          </Card>
        )}
        {!isLoading && !isError && (
          <Card elevated>
            <CardContent className="pt-0 pb-0">
              <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {filteredLogs.map((log: any) => (
                  <div key={log.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{getLevelIcon(log.level)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getLevelColor(log.level)}`}>
                            {log.level.toUpperCase()}
                          </span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">{log.timestamp}</span>
                        </div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">{log.agent || 'System'}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{log.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </motion.div>
  );
}
