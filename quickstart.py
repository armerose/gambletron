#!/usr/bin/env python
"""Quick start script for Gambletron"""

import asyncio
import pandas as pd
from src.trading.agent import ForexTradingAgent
from src.data.processor import MarketDataProcessor, YFinanceDataSource
from src.strategies import EnsembleStrategy, MeanReversionStrategy, TrendFollowingStrategy
from src.backtesting.engine import BacktestEngine


async def main():
    """Run quick start demo"""
    
    print("=" * 80)
    print("Gambletron AI Forex Trading Agent - Quick Start")
    print("=" * 80)
    
    # Initialize components
    print("\n[1] Initializing data processor...")
    processor = MarketDataProcessor()
    processor.register_source("yfinance", YFinanceDataSource())
    
    # Fetch sample data
    print("[2] Fetching market data...")
    try:
        df = await processor.fetch_data("EURUSD=X", "1d")
        print(f"   ✓ Fetched {len(df)} candlesticks")
    except Exception as e:
        print(f"   ✗ Error fetching data: {e}")
        print("   Using simulated data instead...")
        import numpy as np
        df = pd.DataFrame({
            "close": 100 + np.cumsum(np.random.randn(252) * 0.5),
            "open": 100 + np.cumsum(np.random.randn(252) * 0.5),
            "high": 100 + np.cumsum(np.random.randn(252) * 0.7),
            "low": 100 + np.cumsum(np.random.randn(252) * 0.3),
            "volume": np.random.randint(1000, 100000, 252),
        })
        df.index = pd.date_range("2023-01-01", periods=252, freq="1D")
    
    # Calculate indicators
    print("[3] Calculating technical indicators...")
    rsi = processor.calculate_rsi(df)
    atr = processor.calculate_atr(df)
    print(f"   ✓ RSI: {rsi.iloc[-1]:.2f}")
    print(f"   ✓ ATR: {atr.iloc[-1]:.5f}")
    
    # Test strategies
    print("[4] Testing strategies...")
    
    mr_strategy = MeanReversionStrategy()
    mr_signal, mr_conf = mr_strategy.generate_signal(df)
    print(f"   ✓ Mean Reversion: {mr_signal} (confidence: {mr_conf:.2%})")
    
    tf_strategy = TrendFollowingStrategy()
    tf_signal, tf_conf = tf_strategy.generate_signal(df)
    print(f"   ✓ Trend Following: {tf_signal} (confidence: {tf_conf:.2%})")
    
    # Ensemble
    ensemble = EnsembleStrategy([mr_strategy, tf_strategy])
    ens_signal, ens_conf = ensemble.generate_signal(df)
    print(f"   ✓ Ensemble: {ens_signal} (confidence: {ens_conf:.2%})")
    
    # Backtest
    print("[5] Running backtest...")
    backtester = BacktestEngine(ensemble)
    results = backtester.run_backtest(df, "EURUSD")
    print(f"   ✓ Total trades: {len(results.trades)}")
    print(f"   ✓ Win rate: {results.win_rate:.2%}")
    print(f"   ✓ Sharpe ratio: {results.sharpe_ratio:.3f}")
    
    print("\n" + "=" * 80)
    print("Demo complete! Check out the notebooks/ directory for more analysis.")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(main())
