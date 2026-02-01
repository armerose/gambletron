import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  sparkData?: Array<{ value: number }>;
  className?: string;
}

export default function MetricCard({
  title,
  value,
  change,
  trend,
  icon,
  sparkData,
  className,
}: MetricCardProps) {
  const isPositive = trend === 'up' || (change !== undefined && change >= 0);

  return (
    <motion.div
      className={`card-elevated p-6 ${className || ''}`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-surface-600 dark:text-surface-400 font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-surface-900 dark:text-white">{value}</h3>
        </div>
        {icon && (
          <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>

      {sparkData && (
        <div className="mb-4 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Tooltip cursor={false} contentStyle={{ display: 'none' }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={isPositive ? '#10b981' : '#ef4444'}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {change !== undefined && (
        <div className="flex items-center gap-2">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-success-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-danger-500" />
          )}
          <span className={`text-sm font-semibold ${isPositive ? 'text-success-500' : 'text-danger-500'}`}>
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="text-sm text-surface-500 dark:text-surface-400">vs last month</span>
        </div>
      )}
    </motion.div>
  );
}
