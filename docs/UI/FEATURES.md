# 🤖 Gambletron UI - Complete Feature Reference

## Quick Reference Guide

This document provides a comprehensive overview of all UI features and how to use them.

## 📊 Dashboard

**Location**: Home page when opening the UI

### What It Shows
- Total number of agents
- Active agents count
- Total trades executed (all-time)
- Portfolio value (total equity)
- Quick links to each agent
- Performance summary

### Quick Actions
- View agent details
- Configure agents
- Start/Stop agents
- Access monitoring

---

## 🤖 Agents Management

**Location**: Agents → Active Agents / Create Agent

### Active Agents Tab

**Features:**
- View all created agents
- Real-time status (Enabled/Disabled)
- Agent type (Forex, Crypto, Stocks)
- Capital allocation
- Number of strategies
- Paper trading status

**Actions:**
- ▶️ **Start** - Launch agent trading
- ⏸️ **Pause** - Temporarily stop trading
- ⏹️ **Stop** - Stop agent completely
- 📋 **View Details** - See full agent information
- ⚙️ **Configure** - Modify agent settings

### Create Agent Tab

**Required Fields:**
- **Agent ID** (auto-generated if empty) - Unique identifier
- **Agent Name** - Display name for the agent
- **Agent Type** - forex, crypto, or stocks
- **Initial Capital** - Starting capital in USD
- **Description** - Optional notes about the agent

**Configuration:**
- **Paper Trading** - Enable for safe testing mode
- **Max Concurrent Trades** - Maximum open positions
- **Active Strategies** - Select from available strategies
- **Risk Configuration** - Set risk parameters

**Create Button:**
- Creates agent and stores configuration
- Agent starts in IDLE status
- Ready to configure and start

### Import/Export Tab

**Export:**
- Download all agent configurations as JSON
- Timestamped filename
- Useful for backup and migration

**Import:**
- Load agents from JSON file
- Bulk import multiple agents
- Restore from backups

---

## 📈 Strategies

**Location**: Strategies → Strategy Library / Backtest

### Strategy Library

**Available Strategies:**

1. **Mean Reversion**
   - Type: Oscillator
   - Difficulty: Easy
   - Avg Win Rate: 55%
   - Best For: Ranging markets
   - Parameters: window, std_threshold, min_confidence

2. **Trend Following**
   - Type: Trend
   - Difficulty: Medium
   - Avg Win Rate: 48%
   - Best For: Trending markets
   - Parameters: ma_short, ma_long, min_slope_threshold

3. **MACD Strategy**
   - Type: Momentum
   - Difficulty: Medium
   - Avg Win Rate: 52%
   - Best For: Momentum identification
   - Parameters: Fast EMA, Slow EMA, Signal line

4. **RSI Strategy**
   - Type: Oscillator
   - Difficulty: Easy
   - Avg Win Rate: 50%
   - Best For: Overbought/oversold conditions
   - Parameters: RSI period, threshold levels

5. **Ensemble Strategy**
   - Type: Combined
   - Difficulty: Hard
   - Avg Win Rate: 58%
   - Best For: Robust signals
   - Parameters: Strategy weights

**For Each Strategy:**
- View detailed description
- See performance metrics
- Check difficulty level
- Read parameter documentation
- Click "View Details" for more info

### Backtesting Tab

**Backtesting Configuration:**
- **Strategy** - Select which strategy to test
- **Symbol** - Trading pair (e.g., EURUSD)
- **Timeframe** - 1h, 4h, 1d, 1w, etc.
- **Start Date** - Beginning of test period
- **End Date** - End of test period

**Run Backtest:**
- Click "Run Backtest"
- Wait for processing
- View results:
  - Total Trades
  - Win Rate %
  - Profit Factor
  - Sharpe Ratio
  - Max Drawdown
  - ROI %
  - And more metrics...

---

## 🛡️ Risk Management

**Location**: Risk Management → Current Risk / Configuration / Alerts

### Current Risk Metrics

**Display:**
- Current equity (real-time)
- Daily loss (absolute and %)
- Monthly drawdown (absolute and %)
- Risk utilization percentage
- Current positions count
- Open position details table

**Position Details:**
- Symbol being traded
- Side (BUY/SELL)
- Entry price
- Current price
- P&L (profit/loss)
- Position size

### Risk Configuration

**Configurable Parameters:**

1. **Daily Loss Limit**
   - Default: -5%
   - Stops trading if exceeded
   - Auto-calculated in real-time

2. **Monthly Drawdown Limit**
   - Default: -20%
   - Resets monthly
   - Critical threshold

3. **Position Sizing**
   - **Method**: Kelly Criterion, Volatility-based, or Fixed Fraction
   - **Max Position %**: 5% per trade
   - **Max Concurrent**: 5 positions

4. **Stop Loss**
   - **Method**: ATR, Fixed Pips, or Percent
   - **Value**: Multiplier or fixed amount
   - Applied automatically to all trades

5. **Take Profit**
   - **Method**: Risk-Reward ratio
   - **Ratio**: 1:2, 1:3, 1:5, etc.
   - Target levels calculated automatically

6. **Correlation Management**
   - **Threshold**: 0.7 default
   - Prevents over-correlated positions
   - Avoids concentrated risk

7. **Circuit Breaker**
   - **Enabled**: Yes/No
   - **Trigger**: -10% loss
   - Stops all trading temporarily

### Risk Alerts

**Alert Types:**
- 🔴 **CRITICAL** - Immediate action needed
- 🟡 **WARNING** - Monitor closely
- 🟢 **INFO** - Informational

**Common Alerts:**
- Daily loss limit approaching
- Max drawdown reached
- Position correlation high
- Circuit breaker triggered
- Insufficient capital for position

---

## 📊 Monitoring

**Location**: Monitoring → Live Feeds / Equity Curve / Performance

### Live Feeds

**Trading Events:**
- Real-time trade executions
- Signal generation
- Position updates
- Order fills

**Display Columns:**
- Timestamp
- Event type (BUY/SELL/HOLD)
- Symbol
- Price
- Size
- Status (✅ filled, ⏳ pending, ❌ rejected)

**Agent Status Panel:**
- Green dot = Running
- Status text and uptime
- Number of positions
- Total trades today

### Equity Curve

**Features:**
- Interactive chart
- Hover for exact values
- Zoom in/out
- Time period selection
- Download capability

**Metrics on Chart:**
- Equity progression over time
- Peaks and troughs
- Drawdown visualization
- Performance compared to initial capital

### Performance Metrics

**Key Metrics Displayed:**

1. **Returns**
   - Total Return %
   - Month-to-Date Return
   - Year-to-Date Return

2. **Risk Metrics**
   - Sharpe Ratio
   - Sortino Ratio
   - Calmar Ratio

3. **Profitability**
   - Max Drawdown %
   - Profit Factor
   - Win Rate %

4. **Trade Statistics**
   - Total Trades
   - Winning Trades
   - Losing Trades
   - Consecutive Wins/Losses

---

## 🎓 Training & Optimization

**Location**: Training → Active Jobs / New Training / Results

### Active Training Jobs

**Job Information:**
- Job ID
- Training type
- Associated agent
- Progress bar (%)
- ETA (estimated time)
- Status (PENDING, RUNNING, COMPLETED, FAILED)

**Controls:**
- View detailed progress
- Cancel running job
- View partial results (if available)

### Start New Training Job

**Configuration:**

1. **Agent Selection**
   - Choose which agent to train
   - Agent must exist and be configured

2. **Training Type**
   - Parameter Optimization - Optimize strategy parameters
   - Model Training - Train ML models
   - Strategy Tuning - Fine-tune strategy weights

3. **Data Source**
   - Last 6 Months
   - Last Year
   - All Available Data

4. **Duration**
   - Minimum: 30 minutes
   - Recommended: 2-4 hours
   - Maximum: 24 hours

5. **Optimization Target**
   - Sharpe Ratio (recommended)
   - Win Rate
   - Profit Factor
   - ROI
   - Calmar Ratio

**Submit Button:**
- Creates training job
- Job starts immediately (if resources available)
- Can monitor progress in Active Jobs

### Results

**Viewing Results:**
- Best parameters found
- Performance improvement (before/after)
- Charts showing optimization progress
- Recommended actions

**Applying Results:**
- One-click apply to agent
- Manual review before applying
- Rollback capability

---

## 📋 Logs & Audit Trail

**Location**: Logs → Trade Logs / Signal Logs / System Logs / Equity History

### Trade Logs

**Filter By:**
- Agent ID
- Symbol
- Status (OPEN, CLOSED, CANCELLED)
- Date range
- Strategy

**Display Columns:**
- Timestamp
- Symbol
- Side (BUY/SELL)
- Entry Price
- Exit Price
- Quantity
- P&L
- Status
- Duration

**Actions:**
- Export trades to CSV
- View detailed trade info
- Filter and search
- Pagination

### Signal Logs

**Information:**
- Timestamp of signal generation
- Strategy that generated signal
- Signal type (BUY, SELL, HOLD)
- Confidence level (0-1)
- Symbol
- Price at signal time

**Analysis:**
- Filter by strategy
- View signal accuracy
- Compare strategies
- Identify best performers

### System Logs

**Log Types:**
- ℹ️ **INFO** - Normal operations
- ⚠️ **WARNING** - Potential issues
- 🔴 **ERROR** - Something went wrong
- 🐛 **DEBUG** - Detailed technical info

**Common Messages:**
- Market data fetched
- Strategy analysis completed
- Trade executed
- Risk limit triggered
- Connection errors
- Configuration changes

### Equity History

**Features:**
- Historical equity curve
- Selectable timeframe (Hourly, Daily, Weekly)
- Zoom and pan
- Data export
- Comparison tools

**Data Points:**
- Date/Time
- Total equity
- Daily P&L
- Cumulative return
- Positions count

---

## ⚙️ Settings

**Location**: Settings → General / Data Sources / Notifications

### General Settings

**Configuration:**
- Application Name
- Backend URL
- Theme (Light/Dark)
- Refresh Interval (1-60 seconds)
- Auto-refresh toggle

### Data Sources

**Enabled Sources:**
- ✅ Yahoo Finance (default)
- ❌ CCXT (optional)
- ❌ Custom API (optional)

**Managing Sources:**
- Enable/disable existing sources
- Add new data source
- Test connection
- Configure API keys (if needed)

### Notifications

**Alert Types:**
- ✅ Email notifications
- ✅ Trade entry alerts
- ✅ Trade exit alerts
- ✅ Risk threshold alerts

**Configuration:**
- Email address for alerts
- Alert preferences
- Quiet hours (optional)
- Alert severity levels

---

## 🔧 API Reference

All UI features are backed by REST APIs. For automation:

```
Base URL: http://localhost:8000/api

GET    /health                           # Check backend status
GET    /agents                           # List all agents
POST   /agents                           # Create new agent
GET    /agents/{id}                      # Get agent details
PUT    /agents/{id}                      # Update agent
DELETE /agents/{id}                      # Delete agent
GET    /agents/{id}/status               # Get agent status
GET    /agents/{id}/metrics              # Get agent metrics
POST   /agents/{id}/start                # Start agent
POST   /agents/{id}/stop                 # Stop agent
```

**Interactive API Docs**: http://localhost:8000/docs

---

## 💡 Tips & Best Practices

### For New Users
1. Start with paper trading enabled
2. Use Mean Reversion or Trend Following first
3. Set conservative risk limits (-5% daily loss)
4. Backtest strategies before using
5. Monitor closely for first week

### For Optimization
1. Run backtests on 1-year minimum data
2. Start optimization with conservative parameters
3. Use Sharpe Ratio as primary metric
4. Validate on out-of-sample data
5. Re-optimize quarterly

### For Risk Management
1. Never risk more than 5% per trade
2. Set circuit breaker at -10%
3. Monitor daily drawdown closely
4. Keep emergency stop at -20%
5. Review alerts daily

### For Performance
1. Monitor Sharpe Ratio (target: > 1.0)
2. Keep win rate above 50%
3. Maintain profit factor > 1.5
4. Review monthly performance
5. Adjust parameters as needed

---

## 🆘 Troubleshooting

### Agent won't start
- Check if backend is running
- Verify agent configuration
- Check market data source
- Review error logs

### No trades being executed
- Verify market is trading
- Check strategy signals
- Review risk limits
- Check order execution

### Performance metrics missing
- Ensure trades have completed
- Check data source connection
- Wait for data to load
- Refresh page

### UI not connecting
- Verify backend URL in settings
- Check if backend is running
- Check browser console for errors
- Restart both frontend and backend

---

**Happy Trading! 🚀**

For more information, see:
- README.md - Full documentation
- QUICKSTART.md - Getting started
- DEVELOPER.md - Development guide
- API Documentation - http://localhost:8000/docs
