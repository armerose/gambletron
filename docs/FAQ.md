# FAQ - Frequently Asked Questions

## General Questions

### What is Gambletron?

Gambletron is an automated forex trading agent that uses ensemble machine learning strategies to generate trading signals, manage risk, and execute trades.

### Can I use it for real trading?

Yes, but with caution. Start with paper trading to validate settings. Backtesting is recommended before live trading. Always use risk management.

### What brokers are supported?

Currently: **OANDA** (primary)

Planned: Interactive Brokers, Alpaca, CCXT (crypto)

### What currencies can I trade?

Any currency pair supported by OANDA:
- Major pairs: EURUSD, GBPUSD, USDJPY, etc.
- Minor pairs: EURGBP, EURJPY, etc.
- Emerging: USDMXN, USDZAR, etc.

See [OANDA pair list](https://developer.oanda.com/rest-live-v20/instrument-details/)

### Is this a get-rich-quick scheme?

No. This is a systematic trading system. Returns depend on:
- Market conditions
- Strategy performance
- Risk management
- Capital available

**Realistic expectations**:
- Good month: +5-10%
- Normal month: +1-3%
- Bad month: -2-5%
- Best case annually: +30-50%

## Setup & Installation

### How do I get started?

1. Install: `pip install -r requirements.txt`
2. Configure: Edit `config/trading_config.yaml`
3. Test: `python quickstart.py` (paper trading)
4. Backtest: `python run_backtest.py`
5. Deploy: See [Production Guide](PRODUCTION_GUIDE.md)

See [Getting Started](GETTING_STARTED.md) for details.

### Do I need an OANDA account?

Yes. You need:
1. OANDA Trading account (free practice account available)
2. API key (generate from OANDA platform)
3. Account ID (from OANDA dashboard)

**Sign up**: https://www.oanda.com/

### What Python version is required?

Python 3.8+

Check: `python --version`

Upgrade: `python -m pip install --upgrade python`

### How do I set up the database?

1. **Install PostgreSQL**
   ```bash
   apt-get install postgresql postgresql-contrib
   ```

2. **Create database**
   ```bash
   createdb gambletron
   ```

3. **Run migrations**
   ```bash
   python -m alembic upgrade head
   ```

4. **Update config**
   ```yaml
   database:
     url: postgresql://user:password@localhost:5432/gambletron
   ```

### Can I run without a database?

Yes, but with limited features:
- ✅ Trading works
- ✅ Backtesting works
- ❌ Trade history not saved
- ❌ Performance tracking limited

## Configuration

### How do I change trading pairs?

Edit `config/trading_config.yaml`:

```yaml
trading:
  symbols:
    - EURUSD
    - GBPUSD
    - USDJPY
```

Add or remove pairs as needed.

### How do I adjust risk?

Edit risk settings:

```yaml
risk:
  max_position_size: 5  # Percent of portfolio
  max_leverage: 1.5
  max_daily_loss: 5
  stop_loss_atr_multiplier: 2.0
```

Lower values = less risk

See [Configuration Guide](CONFIGURATION.md) for all options.

### How do I enable/disable strategies?

```yaml
strategies:
  mean_reversion: enabled
  trend_following: enabled
  macd: enabled
  rsi: enabled
```

Set to `disabled` to skip a strategy.

### Can I use different settings for paper vs live?

Yes, create separate config files:
- `config/paper_trading.yaml`
- `config/live_trading.yaml`

Then:
```bash
python quickstart.py --config config/paper_trading.yaml
```

## Performance & Results

### Why am I losing money?

Possible causes:
1. **Too aggressive** - Reduce leverage/position size
2. **Wrong market** - Strategy works better in trends or ranges?
3. **Wrong timeframe** - Try longer timeframe (4h vs 1h)
4. **Slippage** - Bid-ask spread is expensive
5. **Fees** - OANDA spreads eat into profits
6. **Luck** - Small sample size, try longer backtest

**Solution**: Run longer backtest, validate strategy, reduce risk.

### How often should I expect signals?

Depends on:
- **Strategy**: Mean reversion 5-10/day, Trend 2-5/day
- **Market conditions**: Active markets = more signals
- **Settings**: Strict ensemble = fewer signals

Typical: 3-8 signals per pair per day

### What's a good win rate?

**Breakeven**: 50% win rate (with equal gains/losses)

**Good**: 55-60% win rate

**Excellent**: 65%+ win rate

**Reality check**: 50-55% is realistic, make money on average win > average loss.

### How do I improve results?

1. **Backtest extensively** - Validate strategy first
2. **Reduce position size** - Accept smaller wins
3. **Improve entries** - Use higher timeframes
4. **Better exits** - Trail stops, use targets
5. **Combine signals** - Multiple timeframes
6. **Manage winners** - Let profits run
7. **Cut losses** - Exit quickly if wrong

See [Production Guide](PRODUCTION_GUIDE.md) for optimization tips.

## Strategies

### Which strategy is best?

Depends on market:
- **Trending**: Trend Following + MACD
- **Range**: Mean Reversion + RSI
- **Mixed**: Ensemble (all together)

**Safe choice**: Ensemble (most robust)

### Can I add my own strategy?

Yes! Create new strategy file:

```python
# src/strategies/my_strategy.py
class MyStrategy:
    def generate_signal(self, df, symbol):
        # Your logic here
        return {"signal": "BUY", "confidence": 0.8}
```

Add to ensemble in config.

See [Architecture](ARCHITECTURE.md) for details.

### Why does backtesting show 20% returns but live shows 2%?

Common causes:
1. **Overfitting** - Strategy too tuned to past data
2. **Slippage** - Backtest assumes perfect fills
3. **Spread** - Real spreads larger than assumed
4. **Fees** - Transaction costs not modeled
5. **Sample size** - Live: 2 weeks, Backtest: 5 years
6. **Market change** - Past behavior != future behavior

**Solution**: Use more conservative backtest assumptions, validate live trading longer.

## Monitoring & Operations

### How do I monitor the agent?

```bash
# View logs
tail -f logs/trading_*.log

# Check status
ps aux | grep python  # See if running

# Monitor system
top  # CPU, memory
```

Or visit web dashboard (if enabled): `http://localhost:5000`

### How often should I check the agent?

- **Daily**: Review logs, check results
- **Weekly**: Performance analysis, strategy review
- **Monthly**: Full audit, rebalance if needed

Do NOT check every minute - adds stress!

### What happens if the server crashes?

1. Agent stops trading
2. Open positions remain open
3. Restart server when ready
4. Agent resumes trading

**Prevention**: Use process manager like `supervisord`

See [Production Guide](PRODUCTION_GUIDE.md) for setup.

### Can I run multiple instances?

Yes, but carefully:
- Different pairs per instance
- Same pair = potential conflicts
- Use database to coordinate

Example:
- Instance 1: EURUSD, GBPUSD
- Instance 2: USDJPY, AUDUSD

NOT:
- Instance 1: EURUSD
- Instance 2: EURUSD (CONFLICT!)

## Troubleshooting

### I'm getting connection errors

1. Check internet
2. Verify API key in `.env`
3. Check OANDA server status
4. Try manual curl: `curl https://api-fxpractice.oanda.com/`

See [Troubleshooting](TROUBLESHOOTING.md) for more.

### Where are the logs?

```bash
ls -la logs/
tail -f logs/trading_agent.log
```

### How do I report a bug?

1. Check [Troubleshooting](TROUBLESHOOTING.md) first
2. Collect logs: `tar czf logs.tar.gz logs/`
3. Check [GitHub Issues](https://github.com/your-repo/gambletron/issues)
4. Create new issue with:
   - Error message
   - Steps to reproduce
   - Your config (without API keys)
   - Logs attached

## Learning & Development

### How do I learn more about trading?

Resources:
- **Technical Analysis**: https://school.stockcharts.com/
- **Forex Basics**: https://www.investopedia.com/forex/
- **Python Trading**: https://github.com/topics/trading-bot
- **OANDA API**: https://developer.oanda.com/

### How do I contribute improvements?

1. Fork repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

See **CONTRIBUTING.md** (coming soon).

### How do I test my strategy?

```bash
# Backtest
python run_backtest.py --strategy my_strategy --symbols EURUSD --days 365

# Paper trade
python quickstart.py  # (uses OANDA practice account)
```

See [Architecture](ARCHITECTURE.md) for more details.

## Common Errors

### "Invalid API Key"
- Check `.env` file
- Generate new token in OANDA
- Verify key format (no extra spaces)

### "Insufficient Balance"
- Backtest assumes full balance available
- Live: deposit more capital
- Reduce position size

### "Rate Limited"
- OANDA limits requests
- Increase cycle interval (60→120 seconds)
- Reduce data fetch frequency

### "Database Connection Failed"
- Check PostgreSQL running: `sudo service postgresql status`
- Verify connection string in `.env`
- Check credentials

See [Troubleshooting](TROUBLESHOOTING.md) for solutions.

## Performance & Optimization

### Can I improve speed?

1. Reduce analysis frequency (120s instead of 60s)
2. Trade fewer pairs
3. Use higher timeframes
4. Disable unused strategies
5. Parallelize analysis

See [Production Guide](PRODUCTION_GUIDE.md) for optimization.

### What's the minimum capital?

- **Paper trading**: $0 (practice)
- **Live micro lots**: $100-500
- **Live standard**: $2,000+
- **Comfortable**: $5,000+

Larger capital = fewer liquidation risk, better risk management.

---

**Can't find answer?**
- Check [Getting Started](GETTING_STARTED.md)
- Review [Configuration](CONFIGURATION.md)
- See [Troubleshooting](TROUBLESHOOTING.md)
- Check [Architecture](ARCHITECTURE.md) for system design
