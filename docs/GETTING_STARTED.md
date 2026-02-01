"""
GETTING_STARTED.md - Comprehensive Guide to Gambletron
=======================================================
"""

# Getting Started with Gambletron

## Installation

### Prerequisites
- Python 3.10+
- pip or conda

### Setup

1. **Clone the repository**
```bash
cd /workspaces/gambletron
```

2. **Install dependencies**
```bash
pip install -e .
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your API keys and preferences
```

4. **Verify installation**
```bash
python quickstart.py
```

## Core Components

### 1. Data Pipeline
The data module handles market data fetching and technical indicator calculation.

```python
from src.data.processor import MarketDataProcessor, YFinanceDataSource

processor = MarketDataProcessor()
processor.register_source("yfinance", YFinanceDataSource())

# Fetch data
df = await processor.fetch_data("EURUSD=X", "1d")

# Calculate indicators
rsi = processor.calculate_rsi(df)
atr = processor.calculate_atr(df)
macd, signal, hist = processor.calculate_macd(df)
```

### 2. Trading Strategies
Multiple built-in strategies that can be used individually or combined.

```python
from src.strategies import (
    MeanReversionStrategy,
    TrendFollowingStrategy,
    RsiStrategy,
    EnsembleStrategy,
)

# Individual strategies
mr_strategy = MeanReversionStrategy()
signal, confidence = mr_strategy.generate_signal(df)

# Ensemble voting
ensemble = EnsembleStrategy([
    MeanReversionStrategy(),
    TrendFollowingStrategy(),
    RsiStrategy(),
])
signal, confidence = ensemble.generate_signal(df)
```

### 3. Risk Management
Sophisticated risk controls to protect capital.

```python
from src.risk_management import (
    PositionSizer,
    RiskMonitor,
    StopLossManager,
)

# Position sizing
position_size = PositionSizer.kelly_criterion(
    win_rate=0.55,
    avg_win=1.5,
    avg_loss=1.0,
)

# Risk monitoring
monitor = RiskMonitor(max_drawdown=0.20)
if monitor.should_stop_trading():
    print("Stop loss triggered!")

# Stop loss management
stop, take_profit = StopLossManager.calculate_atr_based_stop(
    entry_price=1.1050,
    atr=0.0012,
)
```

### 4. Backtesting Engine
Validate strategies on historical data before live trading.

```python
from src.backtesting.engine import BacktestEngine
from src.strategies import TrendFollowingStrategy

strategy = TrendFollowingStrategy()
backtester = BacktestEngine(strategy)

# Run backtest
results = backtester.run_backtest(df, symbol="EURUSD")

# View results
print(results.summary())
print(f"Sharpe Ratio: {results.sharpe_ratio:.3f}")
print(f"Max Drawdown: {results.max_drawdown:.2%}")
print(f"Win Rate: {results.win_rate:.2%}")

# Optimize parameters
best_params, best_results = backtester.optimize_parameters(
    df,
    parameter_grid={
        "window": [15, 20, 25],
        "std_threshold": [1.5, 2.0, 2.5],
    },
)
```

## Trading Strategies

### Mean Reversion
Trades price extremes assuming mean reversion.

**Best for:** Range-bound markets, volatile pairs
**Config:**
```yaml
strategies:
  mean_reversion:
    window: 20
    std_threshold: 2.0
    min_confidence: 0.65
```

### Trend Following
Trades in direction of established trends.

**Best for:** Trending markets, strong directional moves
**Config:**
```yaml
strategies:
  trend_following:
    ma_short: 12
    ma_long: 26
    min_slope_threshold: 0.005
```

### MACD
Trades momentum and trend changes.

**Best for:** Identifying trend reversals and continuations

### RSI
Identifies overbought/oversold conditions.

**Best for:** Mean reversion, identifying extremes

### Ensemble
Combines multiple strategies for robust signals.

**Advantages:**
- Reduces false signals
- More consistent performance
- Adaptive to market conditions

## Running the Trading Agent

### Paper Trading Mode
Test the agent with simulated trades:

```python
from src.trading.agent import ForexTradingAgent
import asyncio

agent = ForexTradingAgent(config_path="config/trading_config.yaml")
await agent.run(mode="paper_trading", dry_run=True)
```

### Live Trading Mode
WARNING: Only use after extensive testing!

```python
agent = ForexTradingAgent(config_path="config/trading_config.yaml")
await agent.run(mode="live_trading", dry_run=False)
```

## Configuration

Edit `config/trading_config.yaml` to customize:

```yaml
trading:
  pairs: ["EURUSD", "GBPUSD", "USDJPY"]
  timeframes: ["1h", "4h", "1d"]

risk_management:
  position_sizing:
    method: "kelly_criterion"
    kelly_fraction: 0.25
    max_position_percent: 5.0
  
  drawdown_limits:
    max_daily_drawdown: 0.05
    max_monthly_drawdown: 0.20
```

## Performance Metrics

Gambletron calculates key performance indicators:

- **Sharpe Ratio**: Risk-adjusted returns (higher is better)
- **Sortino Ratio**: Returns per unit downside risk
- **Max Drawdown**: Largest peak-to-trough decline
- **Calmar Ratio**: Return divided by max drawdown
- **Win Rate**: Percentage of profitable trades
- **Profit Factor**: Gross profit / gross loss

## Testing

Run the test suite:

```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=src --cov-report=html

# Run specific test
pytest tests/test_core.py::TestStrategies -v
```

## Advanced Features

### Feature Engineering
Create custom features for ML models:

```python
from src.data.processor import FeatureEngineer

engineer = FeatureEngineer()

# Lag features
features = engineer.create_lag_features(df, lags=[1, 2, 3, 5])

# Rolling features
features = engineer.create_rolling_features(df, windows=[5, 10, 20])

# Normalize
features = engineer.normalize_features(features)
```

### Machine Learning Models
Train custom models:

```python
# LSTM model for price prediction
from src.models import LSTMPredictor

model = LSTMPredictor(hidden_size=128, num_layers=3)

# Transformer model
from src.models import TransformerPredictor

model = TransformerPredictor(d_model=256, n_heads=8)

# Ensemble of models
from src.models import EnsemblePredictor

ensemble = EnsemblePredictor()
ensemble.add_model("lstm", lstm_model, weight=0.5)
ensemble.add_model("transformer", transformer_model, weight=0.5)
```

### Custom Strategies
Create your own strategies:

```python
from src.strategies import BaseStrategy

class MyCustomStrategy(BaseStrategy):
    def __init__(self):
        super().__init__("MyStrategy")
    
    def generate_signal(self, df):
        # Your trading logic here
        if your_condition:
            return "BUY", 0.85
        else:
            return "HOLD", 0.0
```

## Best Practices

1. **Always Backtest**: Never trade live without extensive backtesting
2. **Use Paper Trading**: Test your configuration in paper trading first
3. **Risk Management**: Never risk more than 1-2% per trade
4. **Diversify**: Use multiple strategies and pairs
5. **Monitor**: Continuously monitor live trading performance
6. **Update**: Regularly update strategies based on market changes

## Troubleshooting

### Data Fetching Issues
- Check your internet connection
- Verify API keys in `.env`
- Try alternative data source in config

### Strategy Not Generating Signals
- Ensure minimum data periods are met
- Check indicator parameters
- Verify data quality

### Backtesting Performance Issues
- Reduce data period
- Use smaller parameter grid
- Enable multiprocessing in config

## Resources

- [Pandas Documentation](https://pandas.pydata.org/)
- [NumPy Guide](https://numpy.org/)
- [PyTorch Tutorials](https://pytorch.org/tutorials/)
- [Technical Analysis Theory](https://www.investopedia.com/)

## Disclaimer

Forex trading involves substantial risk of loss. Past performance does not guarantee future results.
Use this software at your own risk. Only trade with capital you can afford to lose.

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

Last Updated: February 2026
Gambletron v0.1.0
