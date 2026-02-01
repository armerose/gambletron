"""Backtesting engine"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from loguru import logger

from src.strategies import BaseStrategy
from src.risk_management import PositionSizer, StopLossManager
from src.utils.helpers import (
    calculate_sharpe_ratio,
    calculate_sortino_ratio,
    calculate_max_drawdown,
    calculate_calmar_ratio,
    calculate_win_rate,
    calculate_profit_factor,
)


@dataclass
class Trade:
    """Represents a single trade"""
    symbol: str
    entry_time: pd.Timestamp
    exit_time: pd.Timestamp
    entry_price: float
    exit_price: float
    position_size: float
    pnl: float
    pnl_percent: float
    reason: str


@dataclass
class BacktestResults:
    """Contains backtesting results"""
    trades: List[Trade]
    equity_curve: pd.Series
    daily_returns: pd.Series
    
    sharpe_ratio: float
    sortino_ratio: float
    max_drawdown: float
    calmar_ratio: float
    win_rate: float
    profit_factor: float
    total_return: float
    annual_return: float
    
    def summary(self) -> str:
        """Get summary statistics"""
        return f"""
Backtest Results Summary:
========================
Total Trades: {len(self.trades)}
Win Rate: {self.win_rate:.2%}
Profit Factor: {self.profit_factor:.2f}

Total Return: {self.total_return:.2%}
Annual Return: {self.annual_return:.2%}
Sharpe Ratio: {self.sharpe_ratio:.3f}
Sortino Ratio: {self.sortino_ratio:.3f}
Max Drawdown: {self.max_drawdown:.2%}
Calmar Ratio: {self.calmar_ratio:.3f}
"""


class BacktestEngine:
    """Backtesting engine for strategy validation"""
    
    def __init__(
        self,
        strategy: BaseStrategy,
        initial_capital: float = 100000,
        commission: float = 0.0002,
        slippage_pips: float = 1.0,
    ):
        self.strategy = strategy
        self.initial_capital = initial_capital
        self.commission = commission
        self.slippage_pips = slippage_pips
        
        self.trades: List[Trade] = []
        self.equity_curve: List[float] = [initial_capital]
        self.current_capital = initial_capital
        
        self.logger = logger.bind(name="BacktestEngine")
    
    def run_backtest(
        self,
        df: pd.DataFrame,
        symbol: str = "EURUSD",
        start_idx: int = 100,
    ) -> BacktestResults:
        """
        Run backtest on historical data.
        
        Args:
            df: DataFrame with OHLCV data
            symbol: Trading symbol
            start_idx: Starting index for backtesting (warm-up period)
            
        Returns:
            BacktestResults object
        """
        self.logger.info(f"Starting backtest for {symbol}")
        
        position = None
        entry_time = None
        entry_price = None
        
        # Run through historical data
        for i in range(start_idx, len(df)):
            current_data = df.iloc[:i+1]
            current_price = df["close"].iloc[i]
            current_time = df.index[i]
            
            # Generate signal
            signal, confidence = self.strategy.generate_signal(current_data)
            
            # Execute trades
            if signal == "BUY" and position is None and confidence > 0.5:
                # Calculate position size
                position_size = self.initial_capital * 0.05 / current_price
                entry_price = current_price * (1 + self.slippage_pips * 0.0001)
                entry_time = current_time
                position = "LONG"
                
                self.logger.debug(f"BUY {symbol} @ {entry_price:.5f}")
            
            elif signal == "SELL" and position == "LONG":
                # Close position
                exit_price = current_price * (1 - self.slippage_pips * 0.0001)
                pnl = (exit_price - entry_price) * position_size
                pnl_percent = (exit_price - entry_price) / entry_price
                
                # Apply commission
                pnl -= self.initial_capital * self.commission
                
                trade = Trade(
                    symbol=symbol,
                    entry_time=entry_time,
                    exit_time=current_time,
                    entry_price=entry_price,
                    exit_price=exit_price,
                    position_size=position_size,
                    pnl=pnl,
                    pnl_percent=pnl_percent,
                    reason="signal",
                )
                
                self.trades.append(trade)
                self.current_capital += pnl
                self.equity_curve.append(self.current_capital)
                position = None
                
                self.logger.debug(f"SELL {symbol} @ {exit_price:.5f}, PnL: {pnl:.2f}")
        
        # Close any remaining position
        if position == "LONG":
            exit_price = df["close"].iloc[-1]
            pnl = (exit_price - entry_price) * position_size
            pnl -= self.initial_capital * self.commission
            
            trade = Trade(
                symbol=symbol,
                entry_time=entry_time,
                exit_time=df.index[-1],
                entry_price=entry_price,
                exit_price=exit_price,
                position_size=position_size,
                pnl=pnl,
                pnl_percent=(exit_price - entry_price) / entry_price,
                reason="end_of_data",
            )
            
            self.trades.append(trade)
            self.current_capital += pnl
            self.equity_curve.append(self.current_capital)
        
        # Calculate results
        results = self._calculate_results(df)
        
        self.logger.info(f"Backtest complete: {results.summary()}")
        
        return results
    
    def _calculate_results(self, df: pd.DataFrame) -> BacktestResults:
        """Calculate backtest statistics"""
        equity_series = pd.Series(self.equity_curve, index=df.index[:len(self.equity_curve)])
        returns = equity_series.pct_change().dropna()
        
        # Calculate metrics
        sharpe = calculate_sharpe_ratio(returns)
        sortino = calculate_sortino_ratio(returns)
        max_dd, _, _ = calculate_max_drawdown(equity_series)
        calmar = calculate_calmar_ratio(returns)
        
        trades_df = pd.DataFrame([
            {"pnl": t.pnl} for t in self.trades
        ])
        
        win_rate = calculate_win_rate(trades_df) if len(trades_df) > 0 else 0.0
        profit_factor = calculate_profit_factor(trades_df) if len(trades_df) > 0 else 0.0
        
        total_return = (self.equity_curve[-1] - self.initial_capital) / self.initial_capital
        annual_return = returns.mean() * 252
        
        return BacktestResults(
            trades=self.trades,
            equity_curve=equity_series,
            daily_returns=returns,
            sharpe_ratio=sharpe,
            sortino_ratio=sortino,
            max_drawdown=max_dd,
            calmar_ratio=calmar,
            win_rate=win_rate,
            profit_factor=profit_factor,
            total_return=total_return,
            annual_return=annual_return,
        )
    
    def optimize_parameters(
        self,
        df: pd.DataFrame,
        parameter_grid: Dict[str, List],
        symbol: str = "EURUSD",
    ) -> Tuple[Dict, BacktestResults]:
        """
        Grid search for optimal parameters.
        
        Args:
            df: Historical data
            parameter_grid: Grid of parameters to test
            symbol: Trading symbol
            
        Returns:
            Tuple of (best_parameters, best_results)
        """
        self.logger.info(f"Starting parameter optimization with {len(parameter_grid)} combinations")
        
        best_sharpe = -float("inf")
        best_params = None
        best_results = None
        
        # Grid search
        for params_dict in self._generate_parameter_combinations(parameter_grid):
            # Update strategy parameters
            self.strategy.params.update(params_dict)
            
            # Run backtest
            self.trades = []
            self.equity_curve = [self.initial_capital]
            self.current_capital = self.initial_capital
            
            results = self.run_backtest(df, symbol)
            
            # Track best results
            if results.sharpe_ratio > best_sharpe:
                best_sharpe = results.sharpe_ratio
                best_params = params_dict
                best_results = results
        
        self.logger.info(f"Best parameters: {best_params} (Sharpe: {best_sharpe:.3f})")
        
        return best_params, best_results
    
    def _generate_parameter_combinations(self, param_grid: Dict[str, List]) -> List[Dict]:
        """Generate all parameter combinations from grid"""
        import itertools
        
        keys = param_grid.keys()
        values = param_grid.values()
        
        combinations = []
        for combination in itertools.product(*values):
            combinations.append(dict(zip(keys, combination)))
        
        return combinations
