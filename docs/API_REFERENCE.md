# API Reference

Complete API documentation for Gambletron's core components.

## Trading Agent

### `ForexTradingAgent`

Main orchestrator for trading operations.

```python
from src.trading.trading_agent import ForexTradingAgent

agent = ForexTradingAgent(config_path="config/trading_config.yaml")
```

#### Methods

##### `run()`

Start the trading agent in continuous mode.

```python
agent.run()
```

**Parameters**: None

**Returns**: None (runs indefinitely)

**Raises**: 
- `ConnectionError` - Cannot connect to broker
- `ConfigError` - Invalid configuration

**Example**:
```python
agent = ForexTradingAgent()
agent.run()  # Runs until interrupted (Ctrl+C)
```

##### `run_analysis_cycle()`

Execute one analysis cycle (all pairs, all strategies).

```python
results = agent.run_analysis_cycle()
```

**Parameters**: None

**Returns**: `dict` - Analysis results
```python
{
    "timestamp": "2024-01-01T12:00:00Z",
    "symbols": ["EURUSD", "GBPUSD"],
    "analysis": {
        "EURUSD": {
            "signal": "BUY",
            "confidence": 0.85,
            "strategies": {
                "mean_reversion": {"signal": None, "confidence": 0.2},
                "trend_following": {"signal": "BUY", "confidence": 0.9},
                "macd": {"signal": "BUY", "confidence": 0.8},
                "rsi": {"signal": "BUY", "confidence": 0.7}
            }
        }
    },
    "trades_executed": 1
}
```

##### `analyze_symbol(symbol)`

Analyze a single symbol with all strategies.

```python
result = agent.analyze_symbol("EURUSD")
```

**Parameters**:
- `symbol` (str): Currency pair (e.g., "EURUSD")

**Returns**: `dict` - Analysis result
```python
{
    "signal": "BUY",           # BUY, SELL, or None
    "confidence": 0.85,        # 0.0-1.0
    "strategies": {...},       # Per-strategy results
    "position_size": 1.5,      # Lots
    "timestamp": "2024-01-01T12:00:00Z"
}
```

##### `execute_trade(symbol, signal, confidence)`

Execute a trade based on signal.

```python
order = agent.execute_trade("EURUSD", "BUY", 0.85)
```

**Parameters**:
- `symbol` (str): Currency pair
- `signal` (str): "BUY" or "SELL"
- `confidence` (float): 0.0-1.0

**Returns**: `dict` - Order details
```python
{
    "order_id": 123456789,
    "symbol": "EURUSD",
    "type": "MARKET",
    "side": "BUY",
    "volume": 1.5,
    "entry_price": 1.0945,
    "stop_loss": 1.0925,
    "take_profit": 1.0965,
    "status": "FILLED",
    "timestamp": "2024-01-01T12:00:00Z"
}
```

**Raises**:
- `InsufficientBalanceError` - Not enough capital
- `ExecutionError` - Order failed

---

## Data Pipeline

### `YFinanceDataSource`

Fetch historical data from Yahoo Finance.

```python
from src.data.data_sources import YFinanceDataSource

source = YFinanceDataSource()
```

#### Methods

##### `fetch_historical_data(symbol, timeframe, lookback)`

Get OHLCV data.

```python
df = source.fetch_historical_data("EURUSD=X", "1h", 100)
```

**Parameters**:
- `symbol` (str): Ticker with Yahoo suffix (e.g., "EURUSD=X")
- `timeframe` (str): "1m", "5m", "1h", "4h", "1d"
- `lookback` (int): Number of candles

**Returns**: `DataFrame` - OHLCV data
```
             Open    High     Low   Close  Volume
Date                                            
2024-01-01  1.0945  1.0965  1.0925  1.0950    0
```

### `MarketDataProcessor`

Calculate technical indicators.

```python
from src.data.processors import MarketDataProcessor

processor = MarketDataProcessor()
```

#### Methods

##### `calculate_indicators(df, indicators)`

Calculate specified indicators.

```python
df = processor.calculate_indicators(
    df,
    ["RSI", "MACD", "BB", "EMA"]
)
```

**Parameters**:
- `df` (DataFrame): OHLCV data
- `indicators` (list): Indicator names

**Returns**: `DataFrame` - Original data + indicator columns
```
             Open   ...    RSI   MACD  BB_upper  EMA_20
Date                ...
2024-01-01  1.0945  ...   65.4  0.002    1.0965  1.0950
```

---

## Strategies

### Strategy Base Class

All strategies inherit from `BaseStrategy`.

```python
from src.strategies.base import BaseStrategy

class MyStrategy(BaseStrategy):
    def generate_signal(self, df, symbol):
        # Your logic
        return {
            "signal": "BUY",      # or "SELL", None
            "confidence": 0.75
        }
```

#### Methods

##### `generate_signal(df, symbol)`

Generate trading signal.

```python
result = strategy.generate_signal(df, "EURUSD")
```

**Parameters**:
- `df` (DataFrame): Market data with indicators
- `symbol` (str): Currency pair

**Returns**: `dict`
```python
{
    "signal": "BUY",       # BUY, SELL, or None
    "confidence": 0.75     # 0.0-1.0
}
```

### Available Strategies

```python
from src.strategies import (
    MeanReversionStrategy,
    TrendFollowingStrategy,
    MACDStrategy,
    RSIStrategy,
    EnsembleStrategy
)
```

---

## Risk Management

### `PositionSizer`

Calculate position size based on risk.

```python
from src.risk_management.position_sizer import PositionSizer

sizer = PositionSizer(portfolio_value=10000, risk_percent=2.0)
```

#### Methods

##### `calculate_position_size(entry, stop_loss)`

Get position size in lots.

```python
size = sizer.calculate_position_size(
    entry_price=1.0945,
    stop_loss=1.0925
)
```

**Parameters**:
- `entry_price` (float): Entry level
- `stop_loss` (float): Stop-loss level

**Returns**: `float` - Position size in lots
```python
1.5  # 1.5 lots
```

### `StopLossManager`

Set stop-loss levels.

```python
from src.risk_management.stop_loss import StopLossManager

sl_manager = StopLossManager()
```

#### Methods

##### `calculate_stop_loss(entry, signal, volatility)`

Get stop-loss level.

```python
sl = sl_manager.calculate_stop_loss(
    entry_price=1.0945,
    signal="BUY",
    volatility=0.005
)
```

**Parameters**:
- `entry_price` (float): Entry price
- `signal` (str): "BUY" or "SELL"
- `volatility` (float): Current volatility

**Returns**: `float` - Stop-loss price
```python
1.0920  # ATR-based stop
```

---

## Portfolio Management

### `Portfolio`

Track open positions and P&L.

```python
from src.portfolio.portfolio import Portfolio

portfolio = Portfolio(initial_balance=10000)
```

#### Methods

##### `open_position(symbol, side, entry_price, size, stop_loss, take_profit)`

Open new position.

```python
pos = portfolio.open_position(
    symbol="EURUSD",
    side="BUY",
    entry_price=1.0945,
    size=1.5,
    stop_loss=1.0920,
    take_profit=1.0970
)
```

**Parameters**:
- `symbol` (str): Pair
- `side` (str): "BUY" or "SELL"
- `entry_price` (float): Entry level
- `size` (float): Lots
- `stop_loss` (float): SL level
- `take_profit` (float): TP level

**Returns**: `Position` object

##### `close_position(symbol, exit_price, reason)`

Close position.

```python
result = portfolio.close_position(
    symbol="EURUSD",
    exit_price=1.0960,
    reason="SIGNAL"
)
```

**Parameters**:
- `symbol` (str): Pair
- `exit_price` (float): Exit level
- `reason` (str): "SIGNAL", "SL", "TP", "MANUAL"

**Returns**: `dict` - Trade result
```python
{
    "entry_price": 1.0945,
    "exit_price": 1.0960,
    "pnl": 150,           # In account currency
    "pnl_percent": 0.5,   # Percent return
    "duration": "1:30:45" # HH:MM:SS
}
```

##### `get_positions()`

Get all open positions.

```python
positions = portfolio.get_positions()
```

**Returns**: `list` - Position objects
```python
[
    Position(symbol="EURUSD", size=1.5, entry=1.0945),
    Position(symbol="GBPUSD", size=1.0, entry=1.2750)
]
```

##### `get_account_value(current_prices)`

Calculate current portfolio value.

```python
value = portfolio.get_account_value({
    "EURUSD": 1.0960,
    "GBPUSD": 1.2755
})
```

**Parameters**:
- `current_prices` (dict): Symbol → Current price

**Returns**: `float` - Total account value (balance + unrealized P&L)

---

## Backtesting

### `BacktestEngine`

Run historical backtests.

```python
from src.backtesting import BacktestEngine

engine = BacktestEngine(config_path="config/trading_config.yaml")
```

#### Methods

##### `run(strategy, symbols, start_date, end_date, initial_balance)`

Run backtest.

```python
results = engine.run(
    strategy="trend",
    symbols=["EURUSD", "GBPUSD"],
    start_date="2023-01-01",
    end_date="2023-12-31",
    initial_balance=10000
)
```

**Parameters**:
- `strategy` (str): Strategy name
- `symbols` (list): Currency pairs
- `start_date` (str): "YYYY-MM-DD"
- `end_date` (str): "YYYY-MM-DD"
- `initial_balance` (float): Starting capital

**Returns**: `dict` - Backtest results
```python
{
    "total_return": 0.25,          # 25% return
    "total_pnl": 2500,             # Absolute profit
    "num_trades": 45,              # Total trades
    "win_rate": 0.58,              # 58% winning
    "avg_win": 75,                 # Avg profit per win
    "avg_loss": -65,               # Avg loss per loss
    "sharpe_ratio": 1.5,           # Risk-adjusted return
    "max_drawdown": 0.15,          # Max 15% drawdown
    "recovery_factor": 1.67,       # Profit / Max DD
    "trades": [...]                # Individual trades
}
```

---

## Configuration

### Load Configuration

```python
from src.utils.config import load_config

config = load_config("config/trading_config.yaml")
```

**Returns**: `dict` - Configuration

### Validate Configuration

```python
from src.utils.config import validate_config

is_valid = validate_config(config)
```

**Returns**: `bool` - Valid or not

---

## Error Handling

All errors inherit from `GambletronError`:

```python
from src.exceptions import (
    GambletronError,
    ConfigError,
    DataFetchError,
    ExecutionError,
    InsufficientBalanceError
)
```

Example:
```python
try:
    agent.execute_trade("EURUSD", "BUY", 0.85)
except InsufficientBalanceError:
    print("Not enough balance!")
except ExecutionError as e:
    print(f"Execution failed: {e}")
```

---

## Logging

Access logs:

```python
import logging

logger = logging.getLogger("gambletron")
logger.info("Trading started")
logger.warning("Low balance warning")
logger.error("Trade execution failed")
```

Check log files:
```bash
tail -f logs/trading_*.log
grep "ERROR" logs/*.log
```

---

## Related Documentation

- **[Architecture](ARCHITECTURE.md)** - System design
- **[Configuration](CONFIGURATION.md)** - Config options
- **[Strategies](STRATEGIES.md)** - Strategy details
- **[Getting Started](GETTING_STARTED.md)** - Setup guide
