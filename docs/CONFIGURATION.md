# Configuration Reference

Complete guide to all Gambletron configuration options.

## Main Configuration File

Location: `config/trading_config.yaml`

### Trading Settings

```yaml
trading:
  # Currency pairs (use =X suffix for Yahoo Finance forex)
  pairs:
    - EURUSD=X
    - GBPUSD=X
    - USDJPY=X
    - AUDUSD=X
    - NZDUSD=X
  
  # Timeframes for analysis
  timeframes:
    - 1h
    - 4h
    - 1d
  
  # Analysis cycle in seconds
  analysis_cycle_seconds: 60
  
  # Trading hours (UTC)
  trading_hours:
    start: "00:00"
    end: "23:59"
```

### Strategy Settings

```yaml
strategies:
  # Mean Reversion Strategy
  mean_reversion:
    bb_period: 20              # Bollinger Band period
    bb_std_dev: 2.0           # Standard deviations
    rsi_period: 14            # RSI period
    confidence_threshold: 0.6 # Min confidence for signal
  
  # Trend Following Strategy
  trend_following:
    fast_ema_period: 20
    slow_ema_period: 50
    sma_period: 200
    confidence_threshold: 0.6
```

### Risk Management

```yaml
risk_management:
  # Drawdown limits
  drawdown_limits:
    max_monthly_drawdown: 0.20      # 20% max
    max_daily_drawdown: 0.05        # 5% max
    circuit_breaker_pct: 0.15       # Stop at 15%
  
  # Position sizing
  position_sizing:
    method: "volatility"            # "kelly" or "volatility"
    max_position_percent: 0.05      # Max 5% per trade
    max_leverage: 5.0               # Max 1:5 leverage
    kelly_fraction: 0.25            # Kelly criterion fraction
  
  # Stop loss settings
  stop_loss:
    method: "atr"                   # "atr", "fixed_pips", "percent"
    atr_multiplier: 2.0             # For ATR method
    fixed_pips: 20                  # For fixed pips method
    percent: 0.02                   # For percent method
```

### Portfolio Settings

```yaml
portfolio:
  initial_capital: 100000           # Starting capital in USD
  base_currency: "USD"
  rebalance_frequency: "daily"      # "daily", "weekly", "monthly"
```

### Model Settings (Optional)

```yaml
models:
  # Deep Learning Models
  lstm:
    enabled: true
    lookback_periods: 60
    hidden_units: 128
    layers: 3
    dropout: 0.3
  
  transformer:
    enabled: true
    n_heads: 8
    n_layers: 4
    d_model: 256
    lookback_periods: 60
  
  # Gradient Boosting
  xgboost:
    enabled: true
    n_estimators: 100
    max_depth: 7
    learning_rate: 0.1
  
  # Reinforcement Learning
  rl_agent:
    enabled: true
    type: "ppo"  # "ppo" or "a3c"
    training_steps: 100000
```

### Logging Settings

```yaml
logging:
  level: "INFO"                     # DEBUG, INFO, WARNING, ERROR
  file: "logs/gambletron.log"
  max_size: "500MB"
  retention_days: 30
  format: "json"                    # "json" or "text"
```

## Environment Variables

Set in `.env` file:

```bash
# Trading Mode
TRADING_MODE=paper_trading          # "paper_trading" or "live_trading"

# OANDA API (for live trading)
OANDA_API_KEY=your_api_key
OANDA_ACCOUNT_ID=your_account_id
OANDA_ENVIRONMENT=practice          # "practice" or "live"

# Database
DATABASE_URL=postgresql://user:pass@localhost/gambletron
REDIS_URL=redis://localhost:6379/0

# Logging
LOG_LEVEL=INFO
DEBUG=false
```

## Using Configuration Programmatically

```python
from src.utils.config import load_config

# Load configuration
config = load_config("config/trading_config.yaml")

# Access settings
pairs = config["trading"]["pairs"]
max_drawdown = config["risk_management"]["drawdown_limits"]["max_monthly_drawdown"]

# Print all config
import json
print(json.dumps(config, indent=2))
```

## Common Configurations

### Conservative (Lower Risk)

```yaml
risk_management:
  drawdown_limits:
    max_monthly_drawdown: 0.10      # 10%
    max_daily_drawdown: 0.02        # 2%
  position_sizing:
    max_position_percent: 0.02      # 2% per trade
    max_leverage: 2.0               # 1:2 leverage
```

### Aggressive (Higher Risk/Reward)

```yaml
risk_management:
  drawdown_limits:
    max_monthly_drawdown: 0.30      # 30%
    max_daily_drawdown: 0.10        # 10%
  position_sizing:
    max_position_percent: 0.10      # 10% per trade
    max_leverage: 10.0              # 1:10 leverage
```

### Balanced (Recommended)

```yaml
risk_management:
  drawdown_limits:
    max_monthly_drawdown: 0.20      # 20%
    max_daily_drawdown: 0.05        # 5%
  position_sizing:
    max_position_percent: 0.05      # 5% per trade
    max_leverage: 5.0               # 1:5 leverage
```

## Validating Configuration

```bash
# Check configuration loads correctly
python -c "from src.utils.config import load_config; c = load_config(); print('✓ Config OK')"

# View all settings
python -c "from src.utils.config import load_config; import json; print(json.dumps(load_config(), indent=2))"
```

## Next Steps

- **[Strategies](STRATEGIES.md)** - How each strategy works
- **[Production Guide](PRODUCTION_GUIDE.md)** - Deploy to production
- **[Troubleshooting](TROUBLESHOOTING.md)** - Configuration issues
