"""Main trading agent"""

import asyncio
from typing import Dict, Optional, List
import pandas as pd
from loguru import logger

from src.data.processor import MarketDataProcessor, YFinanceDataSource
from src.strategies import (
    EnsembleStrategy,
    MeanReversionStrategy,
    TrendFollowingStrategy,
    MacdStrategy,
    RsiStrategy,
)
from src.risk_management import (
    PositionSizer,
    RiskMonitor,
    StopLossManager,
    Portfolio,
)
from src.utils.config import load_config, get_settings
from src.utils.logger import setup_logger, get_logger


class ForexTradingAgent:
    """Main AI Forex Trading Agent"""
    
    def __init__(self, config_path: str = "config/trading_config.yaml"):
        """Initialize the trading agent"""
        self.config = load_config(config_path)
        self.settings = get_settings()
        
        # Setup logging
        setup_logger(
            "gambletron",
            log_level=self.settings.log_level,
            log_file=self.settings.log_file,
        )
        self.logger = get_logger("ForexTradingAgent")
        
        # Initialize components
        self.data_processor = MarketDataProcessor(cache_enabled=True)
        self.data_processor.register_source("yfinance", YFinanceDataSource())
        
        # Initialize strategies
        self.strategy = self._build_strategy()
        
        # Initialize risk management
        self.risk_monitor = RiskMonitor(
            max_drawdown=self.config["risk_management"]["drawdown_limits"]["max_monthly_drawdown"],
            max_daily_loss=self.config["risk_management"]["drawdown_limits"]["max_daily_drawdown"],
            max_position_size=self.config["risk_management"]["position_sizing"]["max_position_percent"],
        )
        
        self.portfolio = Portfolio(initial_capital=100000)
        self.position_sizer = PositionSizer()
        self.stop_loss_manager = StopLossManager()
        
        self.logger.info("Forex Trading Agent initialized successfully")
    
    def _build_strategy(self) -> EnsembleStrategy:
        """Build ensemble strategy from config"""
        strategies = [
            MeanReversionStrategy(self.config["strategies"]["mean_reversion"]),
            TrendFollowingStrategy(self.config["strategies"]["trend_following"]),
            MacdStrategy(),
            RsiStrategy(),
        ]
        
        ensemble = EnsembleStrategy(strategies=strategies)
        
        # Set weights
        weights = self.config["strategies"]["ensemble"]["strategy_weights"]
        for strategy, weight in weights.items():
            for s in strategies:
                if s.name.lower() == strategy.lower():
                    ensemble.set_strategy_weight(s.name, weight)
        
        self.logger.info(f"Built ensemble strategy with {len(strategies)} sub-strategies")
        return ensemble
    
    async def fetch_market_data(
        self,
        symbol: str,
        timeframe: str = "1h",
        periods: int = 500,
    ) -> pd.DataFrame:
        """Fetch market data"""
        try:
            df = await self.data_processor.fetch_data(
                symbol=symbol,
                timeframe=timeframe,
                source="yfinance",
            )
            
            return df.tail(periods)
        except Exception as e:
            self.logger.error(f"Error fetching market data for {symbol}: {e}")
            raise
    
    async def analyze_symbol(self, symbol: str) -> Dict:
        """Analyze a single symbol"""
        try:
            df = await self.fetch_market_data(symbol)
            
            # Generate signal
            signal, confidence = self.strategy.generate_signal(df)
            
            # Calculate technical indicators
            rsi = self.data_processor.calculate_rsi(df)
            macd, signal_line, hist = self.data_processor.calculate_macd(df)
            atr = self.data_processor.calculate_atr(df)
            
            return {
                "symbol": symbol,
                "signal": signal,
                "confidence": confidence,
                "price": df["close"].iloc[-1],
                "rsi": rsi.iloc[-1],
                "atr": atr.iloc[-1],
                "macd": macd.iloc[-1],
                "timestamp": df.index[-1],
            }
        except Exception as e:
            self.logger.error(f"Error analyzing {symbol}: {e}")
            return None
    
    async def run_analysis_cycle(self) -> List[Dict]:
        """Run a complete analysis cycle on all configured symbols"""
        pairs = self.config["trading"]["pairs"]
        self.logger.info(f"Starting analysis cycle for {len(pairs)} pairs")
        
        tasks = [self.analyze_symbol(pair) for pair in pairs]
        results = await asyncio.gather(*tasks)
        
        return [r for r in results if r is not None]
    
    async def run(self, mode: str = "paper_trading", dry_run: bool = True) -> None:
        """
        Run the trading agent.
        
        Args:
            mode: "paper_trading" or "live_trading"
            dry_run: Print signals without executing trades
        """
        self.logger.info(f"Starting Forex Trading Agent in {mode} mode (dry_run={dry_run})")
        
        try:
            while not self.risk_monitor.should_stop_trading():
                # Run analysis cycle
                signals = await self.run_analysis_cycle()
                
                # Process signals
                for signal in signals:
                    self.logger.info(
                        f"{signal['symbol']}: {signal['signal']} "
                        f"(confidence: {signal['confidence']:.2%}, price: {signal['price']:.5f})"
                    )
                    
                    if not dry_run and signal["signal"] != "HOLD":
                        # Execute trade (in real implementation)
                        pass
                
                # Wait before next cycle
                await asyncio.sleep(60)
        
        except KeyboardInterrupt:
            self.logger.info("Trading agent stopped by user")
        except Exception as e:
            self.logger.error(f"Trading agent error: {e}")
            raise
    
    def get_portfolio_summary(self) -> Dict:
        """Get current portfolio summary"""
        return {
            "capital": self.portfolio.current_capital,
            "open_positions": len(self.portfolio.positions),
            "total_trades": len(self.portfolio.trades),
            "current_drawdown": self.risk_monitor.get_current_drawdown(),
        }


def main():
    """Main entry point"""
    agent = ForexTradingAgent()
    
    # Run in paper trading mode
    asyncio.run(agent.run(mode="paper_trading", dry_run=True))


if __name__ == "__main__":
    main()
