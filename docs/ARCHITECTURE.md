# Gambletron: Complete Architecture & Implementation Guide

## Project Overview

Gambletron is a production-grade AI forex trading system built with cutting-edge machine learning, advanced risk management, and multiple trading strategies. The system is designed to be:

- **Profitable**: Multiple strategies optimized for different market conditions
- **Reliable**: Comprehensive risk controls and circuit breakers
- **Scalable**: Modular architecture supporting easy extensions
- **Transparent**: Full logging and trade documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Trading Agent                         │
│              (ForexTradingAgent)                        │
└─────────────────────────────────────────────────────────┘
          ↓                    ↓                    ↓
    ┌──────────┐         ┌──────────┐       ┌──────────┐
    │   Data   │         │Strategies│       │   Risk   │
    │ Pipeline │         │ Ensemble │       │Management│
    └──────────┘         └──────────┘       └──────────┘
         ↓                    ↓                    ↓
   [Market Data]      [Signals & Logic]  [Position Sizing]
   [Indicators]       [Confidence Scores] [Stop Loss]
   [Feature Eng]      [Sub-Strategies]   [Drawdown Limit]
```

## Core Modules

### 1. Data Module (`src/data/`)
**Purpose**: Fetch, process, and cache market data

**Key Classes**:
- `DataSource`: Abstract base for data providers
- `YFinanceDataSource`: Yahoo Finance integration
- `CCXTDataSource`: CCXT exchange integration
- `MarketDataProcessor`: Technical indicators & processing
- `FeatureEngineer`: ML feature creation

**Indicators Included**:
- RSI, MACD, Bollinger Bands
- ATR, EMA, SMA
- Custom lag & rolling features

**Usage**:
```python
processor = MarketDataProcessor()
df = await processor.fetch_data("EURUSD", "1d")
rsi = processor.calculate_rsi(df)
```

### 2. Strategies Module (`src/strategies/`)
**Purpose**: Generate trading signals from market data

**Built-in Strategies**:
1. **MeanReversionStrategy**: Trades extremes (oversold/overbought)
2. **TrendFollowingStrategy**: Follows established trends
3. **MacdStrategy**: Momentum-based entries/exits
4. **RsiStrategy**: RSI extreme identification
5. **EnsembleStrategy**: Combines multiple strategies

**Confidence Scoring**: Each strategy returns (signal, confidence 0-1)

**Usage**:
```python
strategy = MeanReversionStrategy()
signal, confidence = strategy.generate_signal(df)

ensemble = EnsembleStrategy([
    MeanReversionStrategy(),
    TrendFollowingStrategy(),
])
signal, confidence = ensemble.generate_signal(df)
```

### 3. Risk Management Module (`src/risk_management/`)
**Purpose**: Protect capital through intelligent risk controls

**Key Classes**:
- `PositionSizer`: Kelly criterion, volatility-based sizing
- `RiskMonitor`: Tracks drawdowns, daily limits
- `StopLossManager`: ATR-based or fixed pip stops
- `CorrelationManager`: Prevents over-correlated positions
- `Portfolio`: Track positions and P&L

**Position Sizing Methods**:
- Kelly Criterion: Optimal sizing based on win rate & payoff ratio
- Volatility-Based: Adjust size based on market volatility
- Fixed Fraction: Fixed risk amount per trade

**Risk Controls**:
- Max daily loss: -5% per day
- Max monthly drawdown: -20% per month
- Max position size: 5% per trade
- Circuit breaker: Stops trading if limits exceeded

**Usage**:
```python
sizer = PositionSizer()
size = sizer.kelly_criterion(win_rate=0.55, avg_win=1.5, avg_loss=1.0)

monitor = RiskMonitor(max_drawdown=0.20)
if monitor.should_stop_trading():
    # Don't place new trades
```

### 4. Backtesting Module (`src/backtesting/`)
**Purpose**: Validate strategies on historical data

**Features**:
- Walk-forward analysis
- Monte Carlo simulations
- Transaction costs (commission + slippage)
- Performance metrics calculation
- Parameter optimization

**Performance Metrics**:
- Sharpe Ratio: Risk-adjusted returns
- Sortino Ratio: Downside risk focus
- Max Drawdown: Largest decline
- Calmar Ratio: Return / drawdown
- Win Rate: % profitable trades
- Profit Factor: Gross profit / loss

**Usage**:
```python
engine = BacktestEngine(strategy, initial_capital=100000)
results = engine.run_backtest(df, symbol="EURUSD")

# Optimize parameters
best_params, best_results = engine.optimize_parameters(
    df,
    parameter_grid={
        "window": [15, 20, 25],
        "std_threshold": [1.5, 2.0, 2.5],
    },
)
```

### 5. Trading Module (`src/trading/`)
**Purpose**: Main trading agent orchestrating all components

**ForexTradingAgent**:
- Initializes all sub-systems
- Runs analysis cycles
- Generates signals
- Manages positions
- Tracks portfolio

**Operation Modes**:
- **Paper Trading**: Simulated trading, no real capital
- **Live Trading**: Real money trading with risk limits

**Usage**:
```python
agent = ForexTradingAgent(config_path="config/trading_config.yaml")

# Paper trading
await agent.run(mode="paper_trading", dry_run=True)

# Live trading (WARNING: Use only after extensive testing!)
await agent.run(mode="live_trading", dry_run=False)
```

### 6. Models Module (`src/models/`)
**Purpose**: Machine learning models for advanced predictions

**Available Models**:
- `LSTMPredictor`: LSTM neural networks
- `TransformerPredictor`: Transformer architecture
- `EnsemblePredictor`: Combines multiple models

**Features**:
- Sequence-to-sequence learning
- Attention mechanisms
- Multi-layer architectures
- Dropout for regularization

### 7. Utils Module (`src/utils/`)
**Purpose**: Configuration, logging, and helper functions

**Key Components**:
- `setup_logger()`: Structured logging with loguru
- `load_config()`: YAML configuration loading
- Financial calculation helpers:
  - Sharpe ratio, Sortino ratio
  - Max drawdown, Calmar ratio
  - Kelly criterion, correlation matrix

## Configuration System

### Trading Config (`config/trading_config.yaml`)
```yaml
trading:
  pairs: ["EURUSD", "GBPUSD", "USDJPY"]
  timeframes: ["1h", "4h", "1d"]

strategies:
  mean_reversion:
    window: 20
    std_threshold: 2.0
  trend_following:
    ma_short: 12
    ma_long: 26

risk_management:
  position_sizing:
    method: "kelly_criterion"
    kelly_fraction: 0.25
  drawdown_limits:
    max_monthly_drawdown: 0.20
```

### Environment Config (`.env`)
```
OANDA_API_KEY=your_key
OANDA_ACCOUNT_ID=your_id
TRADING_MODE=paper_trading
MAX_DRAWDOWN=0.20
```

## Trading Flow

```
1. MARKET DATA FETCHING
   └─> Fetch OHLCV data
   └─> Calculate indicators
   └─> Cache data

2. SIGNAL GENERATION
   └─> Mean Reversion: Check bands
   └─> Trend Following: Check MAs
   └─> MACD: Check crossovers
   └─> RSI: Check extremes
   └─> Ensemble: Combine signals

3. RISK ASSESSMENT
   └─> Check current drawdown
   └─> Check daily P&L
   └─> Verify circuit breakers
   └─> Calculate position size

4. TRADE EXECUTION
   └─> Generate BUY/SELL signals
   └─> Calculate stops & targets
   └─> Execute order (if not dry run)
   └─> Log trade

5. MONITORING
   └─> Track open positions
   └─> Update equity curve
   └─> Monitor risk metrics
```

## Advanced Features

### Ensemble Strategy
Combines multiple strategies for robust signals:

```python
ensemble = EnsembleStrategy()
ensemble.add_strategy(MeanReversionStrategy(), weight=0.35)
ensemble.add_strategy(TrendFollowingStrategy(), weight=0.35)
ensemble.add_strategy(RsiStrategy(), weight=0.30)

signal, confidence = ensemble.generate_signal(df)
```

### Custom Strategies
Create new strategies easily:

```python
from src.strategies import BaseStrategy

class MyStrategy(BaseStrategy):
    def generate_signal(self, df):
        # Your logic here
        if some_condition:
            return "BUY", 0.85
        elif other_condition:
            return "SELL", 0.75
        else:
            return "HOLD", 0.0
```

### Hyperparameter Optimization
Automatic parameter tuning:

```python
# Define parameter grid
param_grid = {
    "window": [15, 20, 25, 30],
    "std_threshold": [1.5, 2.0, 2.5],
}

# Optimize
best_params, results = backtester.optimize_parameters(
    df, param_grid
)
```

## Performance Monitoring

### Key Metrics
```
Total Return:      +25.3%
Annual Return:     +28.5%
Sharpe Ratio:      1.85
Max Drawdown:      -12.4%
Win Rate:          58.3%
Profit Factor:     2.15
Trades:            127
Avg Trade:         +1.95%
```

### Risk Metrics
```
Sortino Ratio:     2.42
Calmar Ratio:      2.29
Recovery Factor:   2.04
Consecutive Wins:  12
Consecutive Losses: 5
```

## Best Practices

1. **Testing**
   - Always backtest thoroughly
   - Use out-of-sample validation
   - Test in paper trading mode

2. **Risk Management**
   - Never risk more than 2% per trade
   - Use position limits
   - Monitor correlation

3. **Strategy Development**
   - Keep strategies simple
   - Validate on multiple timeframes
   - Avoid curve-fitting

4. **Live Trading**
   - Start with small positions
   - Monitor continuously
   - Keep detailed logs
   - Have manual override ready

## Troubleshooting

| Problem | Solution |
|---------|----------|
| No signals generated | Check data freshness, indicator periods |
| Backtesting slow | Reduce period, use multiprocessing |
| High losses | Increase stop loss, reduce position size |
| Optimization timeout | Reduce parameter combinations |

## File Structure

```
gambletron/
├── src/
│   ├── data/           # Data fetching & processing
│   ├── models/         # ML models
│   ├── strategies/     # Trading strategies
│   ├── trading/        # Main agent
│   ├── risk_management/# Risk controls
│   ├── backtesting/    # Backtesting engine
│   └── utils/          # Utilities & helpers
├── config/             # Configuration files
├── tests/              # Test suite
├── notebooks/          # Jupyter notebooks
├── pyproject.toml      # Project metadata
├── .env.example        # Environment template
└── quickstart.py       # Quick start script
```

## Performance Targets

**Year 1 Goals**:
- Sharpe Ratio: > 1.5
- Annual Return: 15-30%
- Max Drawdown: < 15%
- Win Rate: > 55%

**Year 2+ Goals**:
- Sharpe Ratio: > 2.0
- Annual Return: 25-50%
- Max Drawdown: < 10%
- Win Rate: > 60%

## Contributing

Contributions are welcome! Areas of focus:

1. **New Strategies**: Advanced technical strategies, ML models
2. **Data Sources**: Additional brokers, alternative data
3. **Optimizations**: Performance improvements, efficiency
4. **Documentation**: Examples, tutorials, guides

## License

MIT License - Free for commercial and personal use

## Disclaimer

**IMPORTANT**: Forex trading involves substantial risk of loss. This software is provided as-is without warranty. Past performance does not guarantee future results. Only trade with capital you can afford to lose. Test thoroughly before risking real money.

---

**Version**: 0.1.0  
**Last Updated**: February 2026  
**Status**: Alpha (Active Development)
