#!/usr/bin/env python3
"""
Run a comprehensive backtest of all trading strategies
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from src.backtesting.engine import BacktestEngine
from src.data.processor import MarketDataProcessor
from src.strategies import (
    MeanReversionStrategy,
    TrendFollowingStrategy,
    MacdStrategy,
    RsiStrategy,
    EnsembleStrategy,
)
from src.utils.logger import get_logger, setup_logger
from src.utils.config import load_config

# Setup logging
setup_logger("gambletron", log_level="INFO", log_file="./logs/backtest.log")
logger = get_logger("Backtest")


def generate_test_data(symbol: str, periods: int = 500, start_price: float = None) -> pd.DataFrame:
    """Generate realistic simulated OHLCV data"""
    np.random.seed(hash(symbol) % 2**32)
    
    price_map = {
        'EURUSD=X': 1.10,
        'GBPUSD=X': 1.27,
        'USDJPY=X': 110.0,
        'AUDUSD=X': 0.75,
        'NZDUSD=X': 0.63,
        'EURUSD': 1.10,
        'GBPUSD': 1.27,
        'USDJPY': 110.0,
        'AUDUSD': 0.75,
        'NZDUSD': 0.63,
    }
    
    if start_price is None:
        start_price = price_map.get(symbol, 100.0)
    
    # Create date range
    end_date = datetime.now()
    start_date = end_date - timedelta(hours=periods)
    dates = pd.date_range(start=start_date, end=end_date, periods=periods, freq='1H')
    
    # Generate price path with trend and volatility
    trend = np.random.uniform(-0.0005, 0.0005)  # Random walk with drift
    volatility = 0.005
    
    returns = np.random.normal(trend, volatility, periods)
    prices = start_price * np.exp(np.cumsum(returns))
    
    # Generate OHLC
    opens = prices * (1 + np.random.normal(0, 0.001, periods))
    highs = np.maximum(prices, opens) * (1 + abs(np.random.normal(0, 0.002, periods)))
    lows = np.minimum(prices, opens) * (1 - abs(np.random.normal(0, 0.002, periods)))
    closes = prices
    
    volumes = np.random.uniform(1000000, 5000000, periods)
    
    df = pd.DataFrame({
        'open': opens,
        'high': highs,
        'low': lows,
        'close': closes,
        'volume': volumes,
    }, index=dates)
    
    return df


def run_strategy_backtest(strategy, data: pd.DataFrame, symbol: str, strategy_name: str):
    """Run a single strategy backtest"""
    logger.info(f"\n{'='*60}")
    logger.info(f"Testing {strategy_name} on {symbol}")
    logger.info(f"{'='*60}")
    
    trades = []
    position = None
    entry_price = 0
    
    for i in range(100, len(data)):
        current_data = data.iloc[:i+1]
        
        # Calculate indicators
        from src.utils.helpers import (
            calculate_rsi, calculate_macd, calculate_bollinger_bands,
            calculate_ema, calculate_sma, calculate_atr
        )
        
        try:
            close_prices = current_data['close']
            high_prices = current_data['high']
            low_prices = current_data['low']
            
            rsi = calculate_rsi(close_prices)
            macd, signal, hist = calculate_macd(close_prices)
            bb_high, bb_mid, bb_low = calculate_bollinger_bands(close_prices)
            ema = calculate_ema(close_prices)
            sma = calculate_sma(close_prices)
            atr = calculate_atr(high_prices, low_prices, close_prices)
            
            test_df = current_data.copy()
            test_df['rsi'] = rsi
            test_df['macd'] = macd
            test_df['macd_signal'] = signal
            test_df['bb_high'] = bb_high
            test_df['bb_low'] = bb_low
            test_df['ema'] = ema
            test_df['sma'] = sma
            test_df['atr'] = atr
            
            signal = strategy.generate_signal(test_df, symbol)
            
            if signal and signal['confidence'] > 0.6:
                if position is None:
                    position = signal['signal']
                    entry_price = close_prices.iloc[-1]
                    trades.append({
                        'entry_time': current_data.index[-1],
                        'entry_price': entry_price,
                        'side': position,
                        'confidence': signal['confidence'],
                    })
                    logger.info(f"  Entry: {position.upper()} @ {entry_price:.4f}")
                
                elif position != signal['signal']:
                    exit_price = close_prices.iloc[-1]
                    pnl = (exit_price - entry_price) * (1 if position == 'BUY' else -1)
                    pnl_pct = (pnl / entry_price) * 100
                    
                    trades[-1]['exit_time'] = current_data.index[-1]
                    trades[-1]['exit_price'] = exit_price
                    trades[-1]['pnl'] = pnl
                    trades[-1]['pnl_pct'] = pnl_pct
                    
                    logger.info(f"  Exit:  {signal['signal'].upper()} @ {exit_price:.4f} | PnL: {pnl_pct:+.2f}%")
                    
                    position = signal['signal']
                    entry_price = exit_price
                    trades.append({
                        'entry_time': current_data.index[-1],
                        'entry_price': entry_price,
                        'side': position,
                        'confidence': signal['confidence'],
                    })
        except Exception as e:
            logger.warning(f"  Error at {current_data.index[-1]}: {e}")
            continue
    
    # Close final position
    if position is not None and len(trades) > 0:
        exit_price = data['close'].iloc[-1]
        pnl = (exit_price - entry_price) * (1 if position == 'BUY' else -1)
        pnl_pct = (pnl / entry_price) * 100
        
        trades[-1]['exit_time'] = data.index[-1]
        trades[-1]['exit_price'] = exit_price
        trades[-1]['pnl'] = pnl
        trades[-1]['pnl_pct'] = pnl_pct
        
        logger.info(f"  Final: Close @ {exit_price:.4f} | PnL: {pnl_pct:+.2f}%")
    
    # Calculate statistics
    if trades:
        closed_trades = [t for t in trades if 'exit_price' in t]
        if closed_trades:
            total_pnl = sum([t['pnl_pct'] for t in closed_trades])
            avg_pnl = np.mean([t['pnl_pct'] for t in closed_trades])
            win_count = len([t for t in closed_trades if t['pnl_pct'] > 0])
            win_rate = (win_count / len(closed_trades)) * 100 if closed_trades else 0
            
            logger.info(f"\n  Closed Trades: {len(closed_trades)}")
            logger.info(f"  Win Rate: {win_rate:.1f}%")
            logger.info(f"  Avg P&L: {avg_pnl:+.2f}%")
            logger.info(f"  Total P&L: {total_pnl:+.2f}%")
    
    return trades


def main():
    """Run all backtests"""
    logger.info("=" * 80)
    logger.info("GAMBLETRON BACKTEST SUITE")
    logger.info("=" * 80)
    
    config = load_config()
    symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'NZDUSD']
    
    logger.info(f"Symbols: {', '.join(symbols)}")
    logger.info(f"Periods: 500 hours (~21 days)")
    logger.info(f"Timeframe: 1H")
    
    # Create strategies
    strategies = {
        'MeanReversion': MeanReversionStrategy(config['strategies']['mean_reversion']),
        'TrendFollowing': TrendFollowingStrategy(config['strategies']['trend_following']),
        'MACD': MacdStrategy(),
        'RSI': RsiStrategy(),
        'Ensemble': EnsembleStrategy([
            MeanReversionStrategy(config['strategies']['mean_reversion']),
            TrendFollowingStrategy(config['strategies']['trend_following']),
            MacdStrategy(),
            RsiStrategy(),
        ], weights=[0.25, 0.25, 0.25, 0.25]),
    }
    
    logger.info(f"Strategies: {', '.join(strategies.keys())}")
    
    # Run backtests
    for symbol in symbols:
        logger.info(f"\n\n{'#'*80}")
        logger.info(f"# {symbol} BACKTESTS")
        logger.info(f"{'#'*80}\n")
        
        # Generate test data
        data = generate_test_data(symbol)
        logger.info(f"Generated {len(data)} candles | Start: {data.index[0]} | End: {data.index[-1]}")
        logger.info(f"Price range: {data['low'].min():.4f} - {data['high'].max():.4f}")
        
        # Test each strategy
        for strategy_name, strategy in strategies.items():
            try:
                run_strategy_backtest(strategy, data, symbol, strategy_name)
            except Exception as e:
                logger.error(f"Error testing {strategy_name}: {e}")
    
    logger.info(f"\n\n{'='*80}")
    logger.info("BACKTEST COMPLETE")
    logger.info(f"{'='*80}")


if __name__ == "__main__":
    main()
