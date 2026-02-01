# 🤖 Gambletron: Advanced AI Forex Trading Agent

**A state-of-the-art, production-ready AI agent that uses cutting-edge machine learning strategies to profitably trade foreign exchange markets.**

> **Status**: Alpha (v0.1.0) | **Python**: 3.10+ | **License**: MIT

## 🚀 Quick Start (2 minutes)

### Installation
```bash
git clone https://github.com/armerose/gambletron.git
cd gambletron
pip install -e .
cp .env.example .env
```

### Run Demo
```bash
python quickstart.py
```

### Start Trading
```python
from src.trading.agent import ForexTradingAgent

agent = ForexTradingAgent(config_path="config/trading_config.yaml")
agent.run(mode="paper_trading")  # Start with paper trading first!
```

## 📚 Documentation

- **[Getting Started](docs/GETTING_STARTED.md)** - Installation, setup, configuration
- **[Architecture](docs/ARCHITECTURE.md)** - System design, components, data flows
- **[Production Guide](docs/PRODUCTION_GUIDE.md)** - Deployment, troubleshooting, optimization
- **[Configuration Reference](docs/CONFIGURATION.md)** - All trading parameters
- **[API Reference](docs/API_REFERENCE.md)** - Code documentation
- **[Strategies Guide](docs/STRATEGIES.md)** - Strategy details, parameters, usage
- **[FAQ](docs/FAQ.md)** - Common questions and answers
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and fixes
- **[Roadmap](docs/ROADMAP.md)** - Future features and development timeline

## ✨ Features

### 🤖 Advanced AI & Machine Learning
- **Multi-Model Ensemble**: LSTM, Transformer, XGBoost, and attention mechanisms
- **Reinforcement Learning**: Policy gradient and actor-critic models
- **Transfer Learning**: Pretrained models on historical forex data
- **Hyperparameter Optimization**: Bayesian optimization with Optuna

### 📊 Real-Time Data Processing
- Multiple data sources: CCXT, OANDA, Interactive Brokers APIs
- 10+ technical indicators: RSI, MACD, Bollinger Bands, Ichimoku, ATR, EMA, SMA, etc.
- Market microstructure analysis
- Sentiment analysis integration

### 💰 Advanced Trading Strategies
- **Mean Reversion**: Entry/exit on volatility extremes
- **Trend Following**: Momentum-based strategies with adaptive thresholds
- **MACD Strategy**: Momentum-based entries
- **RSI Strategy**: Overbought/oversold identification
- **Ensemble Voting**: Combine multiple strategies with weighted voting

### 📈 Backtesting & Optimization
- Walk-forward analysis with out-of-sample validation
- Monte Carlo simulations
- Transaction cost and slippage modeling
- Performance metrics: Sharpe, Sortino, Calmar ratios
- Parallelized backtesting with Ray

### 🛡️ Risk Management
- Position sizing: Kelly Criterion, Volatility-based
- Dynamic stop-loss/take-profit
- Drawdown limits: Daily and monthly
- Correlation-based portfolio optimization
- Value-at-Risk (VaR) calculations
- Circuit breakers and safety limits

### 📉 Live Trading
- Paper trading mode for safe testing
- Live execution with major brokers
- Order management and execution algorithms
- Real-time P&L tracking
- Trade logging and analysis

## 📊 Project Structure

```
gambletron/
├── src/
│   ├── trading/           # Main trading agent & execution
│   ├── strategies/        # 5 trading strategies
│   ├── data/              # Data pipeline & indicators
│   ├── risk_management/   # Position sizing, controls
│   ├── backtesting/       # Backtesting engine
│   ├── models/            # ML models (LSTM, Transformer)
│   └── utils/             # Helpers, logging, config
├── config/                # Trading parameters (YAML)
├── tests/                 # Unit & integration tests
├── ui/                    # Web dashboard & management
├── docs/                  # Complete documentation
├── notebooks/             # Jupyter analysis notebooks
└── logs/                  # Trade logs and reports
```

## 🏗️ System Architecture

### Core Components
1. **Data Pipeline**: Real-time data fetching and feature engineering
2. **Model Stack**: Multiple ML models with ensemble voting
3. **Strategy Layer**: Rule-based and learned strategies
4. **Execution Engine**: Order placement and management
5. **Risk Framework**: Real-time risk monitoring and controls
6. **Backtesting Engine**: Historical validation and optimization

### Technology Stack
- **ML/DL**: TensorFlow, PyTorch, Scikit-learn, XGBoost
- **Data**: Pandas, NumPy, Redis
- **Optimization**: Optuna, Ray
- **APIs**: CCXT, OANDA REST API
- **Monitoring**: MLflow, Loguru
- **Testing**: Pytest, Pytest-asyncio

For detailed architecture, see [Architecture Guide](docs/ARCHITECTURE.md).

## 🎯 Key Features by Component

### Data Module (`src/data/`)
- Multi-source market data fetching (Yahoo Finance, CCXT)
- Real-time caching system
- 10+ technical indicators
- Feature engineering for ML models
- Async data pipeline

### Strategies Module (`src/strategies/`)
- 5 independent trading strategies
- Ensemble voting system
- Strategy performance tracking
- Adaptive parameter adjustment
- Confidence scoring

### Risk Management (`src/risk_management/`)
- Kelly Criterion position sizing
- Volatility-based position sizing
- Maximum drawdown limits
- ATR-based stop loss management
- Portfolio correlation filtering
- Real-time P&L tracking

### Trading Agent (`src/trading/`)
- Orchestrates all components
- Real-time market analysis
- Signal generation and execution
- Order management
- Logging and reporting

### Backtesting Engine (`src/backtesting/`)
- Historical data analysis
- Transaction cost modeling
- Performance metrics calculation
- Parameter optimization
- Walk-forward analysis

For complete component details, see [Architecture Guide](docs/ARCHITECTURE.md).

## ⚙️ Configuration

### Quick Configuration
Edit `config/trading_config.yaml`:

```yaml
trading:
  pairs: [EURUSD=X, GBPUSD=X, USDJPY=X, AUDUSD=X, NZDUSD=X]
  analysis_cycle_seconds: 60

risk_management:
  drawdown_limits:
    max_monthly_drawdown: 0.20
    max_daily_drawdown: 0.05
  position_sizing:
    max_position_percent: 0.05
    max_leverage: 5.0
```

For all configuration options, see [Configuration Reference](docs/CONFIGURATION.md).

## 🧪 Development

### Running Tests
```bash
pytest tests/
pytest tests/ --cov=src --cov-report=html
```

### Code Quality
```bash
black src/
flake8 src/
mypy src/
```

## 📊 Performance Metrics

The agent tracks and optimizes:
- **Sharpe Ratio**: Risk-adjusted returns
- **Sortino Ratio**: Return / downside deviation
- **Maximum Drawdown**: Peak-to-trough decline
- **Win Rate**: Profitable trades / total trades
- **Profit Factor**: Gross profit / gross loss
- **Calmar Ratio**: Return / maximum drawdown

## 🔐 Live Trading Safety

- ✅ Paper trading mode for validation
- ✅ Position size limits (max 5% per trade)
- ✅ Maximum drawdown circuit breaker
- ✅ All trades logged for audit
- ✅ Real-time monitoring dashboard
- ✅ Automated risk alerts
- ✅ Order validation and pre-flight checks

## 🎨 UI Dashboard

Gambletron includes a **web-based dashboard** for managing and monitoring trading agents:

- Agent management and configuration
- Real-time trading status and P&L
- Strategy performance analytics
- Risk monitoring and alerts
- Backtesting and strategy testing
- Trade history and analysis

See [UI Documentation](docs/UI/README.md) for details.

## 📈 Project Statistics

| Metric | Value |
|--------|-------|
| **Core Modules** | 8 |
| **Lines of Code** | 2,500+ |
| **Trading Strategies** | 5 + ensemble |
| **Technical Indicators** | 10+ |
| **Risk Controls** | 8+ |
| **Test Cases** | 20+ |
| **Documentation Pages** | 10+ |

## ⚠️ Disclaimer

**Forex trading involves substantial risk of loss. Past performance does not guarantee future results. Only trade with capital you can afford to lose. Always backtest thoroughly and validate with paper trading before using real money. This is not financial advice.**

## 🤝 Contributing

Contributions are welcome! Please ensure code quality with:
- `black` for formatting
- `flake8` for linting
- `mypy` for type checking
- `pytest` for testing

See [Contributing Guide](docs/CONTRIBUTING.md) for details.

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

- 📖 [Documentation](docs/)
- ❓ [FAQ](docs/FAQ.md)
- 🐛 [Issues](https://github.com/armerose/gambletron/issues)
- 💬 [Discussions](https://github.com/armerose/gambletron/discussions)