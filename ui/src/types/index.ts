// Trading Agent Types
export type AgentType = 'forex' | 'crypto' | 'stocks' | 'etf';
export type AgentStatus = 'running' | 'stopped' | 'paused' | 'error' | 'initializing';
export type TradeStatus = 'OPEN' | 'CLOSED' | 'CANCELLED' | 'PENDING';
export type TradeSide = 'BUY' | 'SELL';
export type OrderType = 'market' | 'limit' | 'stop' | 'stop-limit';
export type TimeFrame = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1mo';

// Enums for consistency
export const TransactionType = {
  TRADE: 'trade',
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  FEE: 'fee',
} as const;

// Agent Configuration
export interface AgentConfig {
  id: string;
  name: string;
  description?: string;
  agent_type: AgentType;
  active_strategies: string[];
  risk_config: RiskConfig;
  data_sources: string[];
  paper_trading: boolean;
  initial_capital: number;
  max_concurrent_trades: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

// Agent Runtime Status
export interface AgentStatusData {
  agent_id: string;
  status: AgentStatus;
  uptime_seconds: number;
  current_positions: number;
  total_trades: number;
  current_equity: number;
  pnl: number;
  pnl_percent: number;
  last_signal_time?: string;
  error_message?: string;
  last_update: string;
}

// Performance Metrics
export interface PerformanceMetrics {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  profit_factor: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  calmar_ratio: number;
  max_drawdown: number;
  recovery_factor: number;
  avg_trade_duration: number;
  annualized_return: number;
  monthly_returns: number[];
  period_start: string;
  period_end: string;
}

// Trade Record
export interface TradeRecord {
  trade_id: string;
  agent_id: string;
  symbol: string;
  side: TradeSide;
  entry_price: number;
  entry_time: string;
  exit_price?: number;
  exit_time?: string;
  quantity: number;
  pnl?: number;
  pnl_percent?: number;
  strategy: string;
  confidence_score: number;
  status: TradeStatus;
  fees?: number;
}

// Log Records
export interface TradeLog {
  id: string;
  agent_id: string;
  symbol: string;
  type: TradeSide;
  price: number;
  size: number;
  pnl?: number;
  status: string;
  timestamp: string;
  order_type: OrderType;
}

export interface SignalLog {
  id: string;
  agent_id: string;
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  timestamp: string;
  strategy: string;
  reason?: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  message: string;
  agent_id?: string;
  context?: Record<string, unknown>;
}

// Training Job
export interface TrainingJob {
  job_id: string;
  agent_id: string;
  job_type: 'parameter_optimization' | 'model_training' | 'strategy_tuning';
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progress: number;
  estimated_completion?: string;
  best_result?: Record<string, unknown>;
  error_message?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  duration_seconds?: number;
}

// Strategy
export interface Strategy {
  id: string;
  name: string;
  description: string;
  parameters: StrategyParameter[];
  performance?: PerformanceMetrics;
  icon?: string;
  tags?: string[];
  version?: string;
}

export interface StrategyParameter {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'select';
  default: unknown;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  description?: string;
}

// Risk Management
export interface RiskConfig {
  max_daily_loss_percent: number;
  max_drawdown_percent: number;
  position_size_strategy: 'kelly' | 'volatility' | 'fixed' | 'fractional';
  risk_per_trade: number;
  stop_loss_percent: number;
  take_profit_percent: number;
  max_concurrent_trades: number;
  position_size_fixed?: number;
  correlation_threshold?: number;
}

export interface RiskAlert {
  id: string;
  agent_id: string;
  alert_type: 'drawdown' | 'daily_loss' | 'correlation' | 'margin' | 'position_size';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

// Dashboard Data
export interface DashboardData {
  summary: {
    total_agents: number;
    active_agents: number;
    total_equity: number;
    total_pnl: number;
    total_pnl_percent: number;
    total_trades: number;
    win_rate: number;
  };
  agents: AgentConfig[];
  agent_statuses: Record<string, AgentStatusData>;
  top_performers: (AgentConfig & { metrics: PerformanceMetrics })[];
  recent_trades: TradeRecord[];
  alerts: RiskAlert[];
  equity_history: EquityPoint[];
}

// Equity History
export interface EquityPoint {
  timestamp: string;
  value: number;
  agent_id?: string;
  change_percent?: number;
}

// Position
export interface Position {
  symbol: string;
  quantity: number;
  entry_price: number;
  current_price: number;
  pnl: number;
  pnl_percent: number;
  percentage_of_portfolio: number;
  side: TradeSide;
  opened_at: string;
}

// Settings
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  refresh_interval: number;
  api_url: string;
  notifications_enabled: boolean;
  notifications_sound: boolean;
  auto_update: boolean;
  currency: string;
}

// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// Pagination
export interface PaginationParams {
  limit: number;
  offset: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

// Filter Options
export interface FilterOptions {
  search?: string;
  status?: AgentStatus[];
  agent_type?: AgentType[];
  date_range?: {
    start: string;
    end: string;
  };
  min_equity?: number;
  max_equity?: number;
}

// UI State Types
export interface ModalState {
  isOpen: boolean;
  data?: unknown;
}

export interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: () => void;
}

// WebSocket Events
export interface WebSocketMessage {
  type: 'trade' | 'signal' | 'status' | 'equity' | 'alert' | 'log';
  data: unknown;
  timestamp: string;
  agent_id?: string;
}

// Chart Data
export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
  agent_id?: string;
}

export interface PerformanceChartData {
  label: string;
  value: number;
  benchmark?: number;
  color?: string;
}
