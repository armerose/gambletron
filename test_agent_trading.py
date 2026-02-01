#!/usr/bin/env python3
"""
Test script to run the forex agent with simulated data and verify trading signals
"""

import asyncio
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from src.utils.logger import logger

def generate_simulated_ohlcv(symbol: str, periods: int = 100) -> pd.DataFrame:
    """Generate simulated OHLCV data for testing"""
    np.random.seed(hash(symbol) % 2**32)  # Deterministic but different per symbol
    
    # Start price varies by symbol
    price_map = {
        'EURUSD=X': 1.10,
        'GBPUSD=X': 1.27,
        'USDJPY=X': 110.0,
        'AUDUSD=X': 0.75,
        'NZDUSD=X': 0.63,
    }
    start_price = price_map.get(symbol, 100.0)
    
    dates = pd.date_range(end=datetime.now(), periods=periods, freq='1H')
    closes = []
    price = start_price
    
    for _ in range(periods):
        # Random walk with drift
        change = np.random.normal(0.0001, 0.005)
        price = price * (1 + change)
        closes.append(price)
    
    closes = np.array(closes)
    
    # Generate OHLC data
    data = {
        'open': closes * (1 + np.random.normal(0, 0.002, periods)),
        'high': closes * (1 + abs(np.random.normal(0, 0.003, periods))),
        'low': closes * (1 - abs(np.random.normal(0, 0.003, periods))),
        'close': closes,
        'volume': np.random.uniform(1000000, 5000000, periods),
    }
    
    df = pd.DataFrame(data, index=dates)
    return df


async def run_test_trading():
    """Run agent with simulated data"""
    # Import here to avoid early agent initialization
    from src.trading.agent import ForexTradingAgent
    
    logger.info("=== Gambletron Test Trading Session ===")
    logger.info("Using simulated market data for testing")
    
    # Initialize agent
    agent = ForexTradingAgent()
    logger.info(f"Agent initialized with ${agent.portfolio.balance:,.2f} capital")
    logger.info(f"Risk limit: {agent.risk_monitor.max_drawdown_pct}%")
    logger.info(f"Portfolio max leverage: {agent.portfolio.max_leverage}x")
    
    # Manually inject simulated data for testing
    pairs = ['EURUSD=X', 'GBPUSD=X', 'USDJPY=X', 'AUDUSD=X', 'NZDUSD=X']
    simulated_data = {symbol: generate_simulated_ohlcv(symbol) for symbol in pairs}
    
    logger.info(f"Generated simulated data for {len(pairs)} currency pairs")
    
    # Run analysis cycle with simulated data
    logger.info("\n=== Running Analysis Cycle ===")
    
    analysis_results = []
    
    for symbol in pairs:
        try:
            df = simulated_data[symbol]
            logger.info(f"\nAnalyzing {symbol}:")
            logger.info(f"  Last close: ${df['close'].iloc[-1]:.4f}")
            logger.info(f"  24h change: {((df['close'].iloc[-1] / df['close'].iloc[0] - 1) * 100):.2f}%")
            
            # Process data with indicators
            processed_df = await agent.data_processor.process_data(df, symbol)
            
            if processed_df is not None and not processed_df.empty:
                logger.info(f"  Indicators calculated: {list(processed_df.columns[-8:])}")
                
                # Generate signals from all strategies
                signals = []
                for strategy_name, strategy in agent.strategies.items():
                    signal = strategy.generate_signal(processed_df, symbol)
                    if signal:
                        signals.append(signal)
                        logger.info(f"    {strategy_name}: {signal['signal']} (confidence: {signal['confidence']:.2%})")
                
                # Get ensemble vote
                if signals:
                    ensemble_signal = agent.ensemble_strategy.generate_signal(processed_df, symbol)
                    if ensemble_signal:
                        logger.info(f"  📊 ENSEMBLE SIGNAL: {ensemble_signal['signal']} (confidence: {ensemble_signal['confidence']:.2%})")
                        analysis_results.append({
                            'symbol': symbol,
                            'signal': ensemble_signal['signal'],
                            'confidence': ensemble_signal['confidence'],
                            'price': df['close'].iloc[-1]
                        })
            else:
                logger.warning(f"  ⚠️  Failed to process data for {symbol}")
        
        except Exception as e:
            logger.error(f"  Error analyzing {symbol}: {e}")
    
    # Execute test trades
    logger.info("\n=== Executing Test Trades ===")
    
    for result in analysis_results:
        if result['confidence'] > 0.6:  # Only trade high confidence signals
            try:
                # Calculate position size
                position_size = agent.risk_manager.calculate_position_size(
                    symbol=result['symbol'],
                    entry_price=result['price'],
                    stop_loss_pips=20
                )
                
                if position_size > 0:
                    logger.info(f"\n✅ {result['symbol']} - {result['signal'].upper()}")
                    logger.info(f"   Position size: {position_size:.2f} units at ${result['price']:.4f}")
                    logger.info(f"   Signal confidence: {result['confidence']:.2%}")
                    
                    # Simulate trade execution
                    agent.portfolio.open_positions[result['symbol']] = {
                        'side': result['signal'],
                        'entry_price': result['price'],
                        'quantity': position_size,
                        'entry_time': datetime.now(),
                        'stop_loss': result['price'] - (20 * 0.0001) if result['signal'] == 'BUY' else result['price'] + (20 * 0.0001),
                    }
                    logger.info(f"   Stop loss: {agent.portfolio.open_positions[result['symbol']]['stop_loss']:.4f}")
            except Exception as e:
                logger.error(f"Error executing trade for {result['symbol']}: {e}")
    
    # Summary
    logger.info("\n=== Session Summary ===")
    logger.info(f"Portfolio Value: ${agent.portfolio.balance:,.2f}")
    logger.info(f"Open Positions: {len(agent.portfolio.open_positions)}")
    for symbol, pos in agent.portfolio.open_positions.items():
        logger.info(f"  {symbol}: {pos['side'].upper()} {pos['quantity']:.2f} @ ${pos['entry_price']:.4f}")
    
    logger.info(f"Current Drawdown: {agent.risk_monitor.current_drawdown:.2%}")
    logger.info(f"Max Drawdown: {agent.risk_monitor.max_drawdown:.2%}")
    logger.info(f"Sharpe Ratio: {agent.risk_monitor.sharpe_ratio:.2f}")


if __name__ == "__main__":
    asyncio.run(run_test_trading())
