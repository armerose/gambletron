# Gambletron - Complete Documentation Index

## 📚 Documentation Map

### 🚀 Getting Started
- **[README.md](README.md)** - Project overview, features, quick start
- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Installation, configuration, usage guide
- **[quickstart.py](quickstart.py)** - Executable demo script

### 🏗️ System Design
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Detailed system architecture, data flows, components
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Project completion summary, statistics

### 🗺️ Development
- **[ROADMAP.md](ROADMAP.md)** - Future features, development timeline

## 💻 Core Modules

### Data Processing (`src/data/`)
- **processor.py** - Data fetching, technical indicators, feature engineering
  - `MarketDataProcessor` - Central data management
  - `YFinanceDataSource` - Yahoo Finance integration
  - `CCXTDataSource` - CCXT exchange integration
  - `FeatureEngineer` - ML feature creation

### Trading Strategies (`src/strategies/`)
- **base.py** - Trading strategy implementations
  - `MeanReversionStrategy` - Trades extremes
  - `TrendFollowingStrategy` - Trend-based trades
  - `MacdStrategy` - Momentum-based strategy
  - `RsiStrategy` - RSI overbought/oversold
  - `EnsembleStrategy` - Combines multiple strategies

### Risk Management (`src/risk_management/`)
- **risk.py** - Position sizing, stops, limits
  - `PositionSizer` - Kelly criterion, volatility-based sizing
  - `RiskMonitor` - Drawdown tracking, circuit breakers
  - `StopLossManager` - Stop loss calculation
  - `CorrelationManager` - Correlation-based position filtering
  - `Portfolio` - Position tracking

### Backtesting (`src/backtesting/`)
- **engine.py** - Historical validation
  - `BacktestEngine` - Run backtests
  - `BacktestResults` - Performance metrics
  - Parameter optimization

### Trading Agent (`src/trading/`)
- **agent.py** - Main trading orchestrator
  - `ForexTradingAgent` - Central control system
  - Market analysis coordination
  - Signal generation and execution

### Machine Learning (`src/models/`)
- **nn.py** - Neural network models
  - `LSTMPredictor` - LSTM network
  - `TransformerPredictor` - Transformer model
  - `EnsemblePredictor` - Model ensemble

### Utilities (`src/utils/`)
- **config.py** - Configuration management
- **logger.py** - Logging setup
- **helpers.py** - Financial calculations
  - Sharpe ratio, Sortino ratio
  - Max drawdown, Kelly criterion

## 📋 Configuration Files

### Main Configuration
- **config/trading_config.yaml** - All trading parameters
  - Strategy configuration
  - Risk limits
  - Position sizing
  - Performance targets

### Environment Setup
- **.env.example** - Environment variables template
- **.gitignore** - Git ignore rules

## 🧪 Testing

- **tests/test_core.py** - Comprehensive test suite
  - Helper functions tests
  - Strategy tests
  - Risk management tests
  - Data processing tests
  - Backtesting tests

## 📊 Project Statistics

| Component | Details |
|-----------|---------|
| **Lines of Code** | 2,150+ |
| **Python Modules** | 8 |
| **Classes** | 25+ |
| **Functions** | 100+ |
| **Documentation** | 5 guides |
| **Test Cases** | 20+ |

## 🎯 How to Use This Project

### Step 1: Understand the System
Read in this order:
1. [README.md](README.md) - Overview
2. [ARCHITECTURE.md](ARCHITECTURE.md) - Design details
3. Module docstrings - Implementation details

### Step 2: Get Started
1. Follow [GETTING_STARTED.md](GETTING_STARTED.md)
2. Run [quickstart.py](quickstart.py)
3. Explore the config files

### Step 3: Develop
1. Study the module structure
2. Create custom strategies
3. Backtest and validate
4. Run in paper trading

### Step 4: Deploy
1. Validate performance
2. Configure risk parameters
3. Deploy to live trading (carefully!)
4. Monitor continuously

## 🔍 Quick Reference

### Create a Strategy
```python
from src.strategies import BaseStrategy

class MyStrategy(BaseStrategy):
    def generate_signal(self, df):
        # Your logic
        return "BUY", 0.85
```

### Run Backtesting
```python
from src.backtesting import BacktestEngine
engine = BacktestEngine(strategy)
results = engine.run_backtest(df)
```

### Run Trading Agent
```python
from src.trading.agent import ForexTradingAgent
agent = ForexTradingAgent()
await agent.run(mode="paper_trading")
```

## 🛠️ Development Workflow

1. **Plan** - Define requirements
2. **Design** - Review architecture
3. **Develop** - Create/modify code
4. **Test** - Run test suite
5. **Validate** - Backtest strategies
6. **Deploy** - Paper trade first
7. **Monitor** - Track performance

## 📞 Support Resources

### Within Project
- Code docstrings
- Inline comments
- Examples in quickstart.py
- Configuration examples

### External
- Pandas documentation
- NumPy documentation
- PyTorch documentation
- CCXT documentation

## ✅ Quality Checklist

- ✅ Type hints throughout
- ✅ Comprehensive docstrings
- ✅ Error handling
- ✅ Unit tests
- ✅ Configuration system
- ✅ Logging system
- ✅ Documentation

## 🎓 Learning Path

**Beginner**: Start with README → GETTING_STARTED → quickstart.py

**Intermediate**: Study ARCHITECTURE → Review module code → Create custom strategy

**Advanced**: Study ML models → Implement custom features → Optimize backtesting

## 📈 Next Steps

1. **Immediate**: Install and run quickstart
2. **Short-term**: Create custom strategy, backtest
3. **Medium-term**: Paper trade, validate
4. **Long-term**: Live trading with risk controls

## 🔐 Safety First

Before live trading:
- ✅ Thoroughly backtest your strategy
- ✅ Paper trade for 1-3 months
- ✅ Understand all risk parameters
- ✅ Have manual override ready
- ✅ Monitor continuously
- ✅ Start with small positions

## 📝 License

MIT License - Free for commercial and personal use

---

**Version**: 0.1.0  
**Status**: Alpha  
**Last Updated**: February 2026

For questions or issues, refer to the documentation or code comments.
