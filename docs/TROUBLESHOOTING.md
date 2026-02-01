# Troubleshooting Guide

Solutions for common issues in Gambletron.

## Connection Issues

### OANDA API Connection Failed

**Error**: `Connection failed to OANDA API`

**Solutions**:
1. **Verify API key**
   ```bash
   echo $OANDA_API_KEY  # Should show your key
   ```
   - If empty, add to `.env` file
   - Check OANDA account settings
   - Generate new token if needed

2. **Check internet connection**
   ```bash
   ping api-fxpractice.oanda.com  # Paper trading
   ping stream-fxpractice.oanda.com  # Stream data
   ```

3. **Verify firewall/proxy**
   - Not blocked by firewall
   - No proxy interference
   - VPN disconnected

4. **Check OANDA status**
   - Visit https://api-fxpractice.oanda.com/v3/accounts
   - Should return JSON account data
   - If 401: Invalid API key
   - If 503: Service down (wait)

5. **Restart agent**
   ```bash
   pkill -f "python.*trading_agent"
   python quickstart.py
   ```

### Yahoo Finance Data Not Loading

**Error**: `Failed to download data from Yahoo Finance`

**Solutions**:
1. **Check ticker symbol**
   ```python
   # Correct: EURUSD=X for forex
   # Correct: BTC-USD for crypto
   # Wrong: EURUSD (needs suffix)
   ```

2. **Rate limiting**
   ```python
   # Yahoo limits requests - add delay
   import time
   time.sleep(1)  # Between requests
   ```

3. **Network issue**
   ```bash
   curl -I https://query1.finance.yahoo.com/  # Should respond 200
   ```

## Data Issues

### Missing or Incomplete Data

**Error**: `Insufficient data for analysis`

**Solutions**:
1. **Increase lookback period**
   ```yaml
   # config/trading_config.yaml
   data:
     lookback_periods:
       short: 50    # Was 20
       medium: 200  # Was 100
       long: 500    # Was 200
   ```

2. **Check data gaps**
   ```python
   print(df.isnull().sum())  # Count missing values
   df = df.dropna()  # Remove gaps
   ```

3. **Use different timeframe**
   ```yaml
   timeframe: "4h"  # Try longer timeframe
   ```

### Price Spike Anomalies

**Error**: `Unrealistic prices / huge spikes`

**Solutions**:
1. **Enable outlier detection**
   ```yaml
   data:
     outlier_detection: true
     outlier_threshold: 3  # StdDev multiplier
   ```

2. **Use median filtering**
   ```python
   df['close'] = df['close'].rolling(window=3).median()
   ```

3. **Check for splits/dividends**
   - Yahoo Finance data may need adjustment
   - Manual correction: `df['close'] = df['close'] / split_ratio`

## Trading Issues

### No Signals Generated

**Error**: `Analysis complete, no signals`

**Solutions**:
1. **Check if all strategies disabled**
   ```yaml
   strategies:
     mean_reversion: enabled
     trend_following: enabled
     macd: enabled
     rsi: enabled
   ```

2. **Verify indicator calculations**
   ```python
   print(f"RSI: {rsi}")
   print(f"MACD: {macd}")
   print(f"Bollinger Bands: {bb_upper}, {bb_lower}")
   ```

3. **Check ensemble voting**
   ```yaml
   ensemble:
     min_agreement: 2  # Reduce if no signals
   ```

4. **Verify market conditions**
   - Market closed?
   - Minimal price movement?
   - Too stable for mean reversion?

### Too Many False Signals

**Error**: `Trading too frequently, losses accumulating`

**Solutions**:
1. **Increase confirmation requirements**
   ```yaml
   ensemble:
     min_agreement: 4  # All strategies must agree
   ```

2. **Increase confidence threshold**
   ```yaml
   ensemble:
     confidence_threshold: 0.7  # Was 0.5
   ```

3. **Add volume confirmation**
   ```python
   if volume < volume_sma:
       return None  # Skip signal
   ```

4. **Use higher timeframe**
   ```yaml
   timeframe: "4h"  # More stable signals
   ```

5. **Adjust strategy parameters**
   ```yaml
   strategies:
     mean_reversion:
       bb_std: 2.5  # Wider bands = fewer signals
     rsi:
       overbought: 75  # More extreme threshold
   ```

### Execution Failures

**Error**: `Failed to execute trade`

**Solutions**:
1. **Check account balance**
   ```python
   print(f"Available: ${account['balance']}")
   ```

2. **Verify position limit not exceeded**
   ```yaml
   risk:
     max_positions: 5
   ```

3. **Check order parameters**
   - Valid symbol
   - Reasonable price
   - Valid volume
   - Correct order type

4. **Verify broker hours**
   - Market open during trade attempt?
   - Instrument traded 24/5?
   - Check OANDA holiday calendar

5. **Increase timeouts**
   ```yaml
   trading:
     order_timeout: 30  # seconds
   ```

## Position Issues

### Unexpected Position Opened

**Error**: `Position opened that I didn't authorize`

**Solutions**:
1. **Verify signal generation**
   ```python
   # Check logs for signal details
   grep "Signal generated" logs/trading_*.log
   ```

2. **Check risk limits applied**
   ```python
   print(f"Max position: {risk_manager.max_position}")
   print(f"Position taken: {actual_position}")
   ```

3. **Verify ensemble voting**
   ```yaml
   ensemble:
     enabled: true  # Require multiple confirmations
   ```

### Can't Close Position

**Error**: `Close order rejected`

**Solutions**:
1. **Verify position still exists**
   ```python
   positions = oanda.get_positions()
   print(positions)
   ```

2. **Check if order already closing it**
   - Wait 30 seconds
   - Check order status
   - Retry close

3. **Try market close instead of limit**
   ```python
   order = oanda.close_position(
       instrument,
       close_type="MARKET"  # Not limit
   )
   ```

4. **Check broker restrictions**
   - Liquidity crisis?
   - Margin requirements?
   - Instrument halted?

## Performance Issues

### High CPU Usage

**Error**: `CPU at 100%, system slow`

**Solutions**:
1. **Reduce analysis frequency**
   ```yaml
   trading:
     analysis_interval: 120  # Was 60 seconds
   ```

2. **Reduce number of pairs**
   ```yaml
   trading:
     symbols: ["EURUSD", "GBPUSD"]  # Was 10 symbols
   ```

3. **Reduce indicator calculations**
   ```yaml
   data:
     calculate_all_indicators: false
     only_required: true
   ```

4. **Use simpler strategies**
   ```yaml
   strategies:
     mean_reversion: enabled
     trend_following: disabled  # Skip expensive calcs
     macd: disabled
     rsi: enabled
   ```

### High Memory Usage

**Error**: `Out of memory / OOM killer`

**Solutions**:
1. **Reduce data history kept**
   ```yaml
   data:
     max_bars_in_memory: 500  # Was 1000
   ```

2. **Clear logs regularly**
   ```bash
   rm logs/trading_*.log  # Deletes old logs
   ```

3. **Enable garbage collection**
   ```python
   import gc
   gc.collect()  # Manual cleanup
   ```

4. **Reduce backtesting data**
   ```yaml
   backtesting:
     max_candles: 5000  # Was 10000
   ```

### Slow Analysis

**Error**: `Takes 30+ seconds per cycle`

**Solutions**:
1. **Profile to find bottleneck**
   ```bash
   python -m cProfile -s cumtime src/trading_agent.py | head -20
   ```

2. **Optimize data fetching**
   - Use batch requests
   - Cache data locally
   - Reduce fetch frequency

3. **Optimize indicators**
   - Use NumPy vectorization
   - Avoid loops
   - Cache calculations

4. **Parallelize strategies**
   ```python
   from concurrent.futures import ThreadPoolExecutor
   with ThreadPoolExecutor(max_workers=4) as executor:
       results = executor.map(strategy.generate_signal, symbols)
   ```

## Logging & Debugging

### Enable Debug Logging

```yaml
logging:
  level: DEBUG
  file: logs/debug.log
  console: true
```

Then run:
```bash
python quickstart.py
tail -f logs/debug.log
```

### Common Debug Messages

```
"Analysis cycle started" - Normal operation
"Signal generated" - Strategy found setup
"Position opened" - Trade executed
"Error in strategy" - Strategy failed (logged, skipped)
"Connection error" - Network issue
```

### Check Logs for Errors

```bash
grep "ERROR" logs/trading_*.log
grep "Exception" logs/trading_*.log
grep "Signal" logs/trading_*.log
```

## Getting Help

1. **Check [FAQ](FAQ.md)** for common questions
2. **Review [Configuration](CONFIGURATION.md)** for settings
3. **See [Architecture](ARCHITECTURE.md)** for system design
4. **Try backtesting** with problematic settings
5. **Enable debug logging** and collect trace
6. **Check external sources**:
   - OANDA API docs: https://developer.oanda.com
   - Python trading: https://github.com/topics/trading-bot
   - Technical analysis: https://en.wikipedia.org/wiki/Technical_analysis

## Related Documentation

- **[Production Guide](PRODUCTION_GUIDE.md)** - Deployment
- **[Configuration](CONFIGURATION.md)** - All settings
- **[Architecture](ARCHITECTURE.md)** - System design
- **[FAQ](FAQ.md)** - Common questions
