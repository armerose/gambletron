"""
Advanced backtesting engine with realistic market conditions
Includes proper accounting for slippage, commissions, and market microstructure
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, field
from datetime import datetime
import json


@dataclass
class ExecutionMetrics:
    """Realistic execution metrics"""
    slippage_bps: float = 2.0  # basis points
    commission_pct: float = 0.001  # 0.1% 
    spread_bps: float = 1.5  # market spread
    
    def get_slippage_multiplier(self, direction: str) -> float:
        """Get realistic slippage for buy/sell"""
        base = 1 + (self.slippage_bps / 10000)
        spread = 1 + (self.spread_bps / 10000)
        if direction == "buy":
            return base * spread
        return 1 / (base * spread)
    
    def apply_costs(self, pnl: float) -> float:
        """Apply realistic trading costs"""
        return pnl * (1 - self.commission_pct)


@dataclass
class Trade:
    """Complete trade record"""
    symbol: str
    entry_time: pd.Timestamp
    exit_time: pd.Timestamp
    entry_price: float
    exit_price: float
    position_size: float
    gross_pnl: float
    net_pnl: float
    net_pnl_pct: float
    commission_paid: float
    slippage_cost: float
    holding_bars: int
    reason: str
    confidence: float = 0.5


@dataclass 
class BacktestMetrics:
    """Complete backtest metrics"""
    total_trades: int = 0
    winning_trades: int = 0
    losing_trades: int = 0
    
    gross_profit: float = 0.0
    gross_loss: float = 0.0
    net_profit: float = 0.0
    
    win_rate: float = 0.0
    profit_factor: float = 0.0
    
    total_return: float = 0.0
    annual_return: float = 0.0
    monthly_return: float = 0.0
    
    sharpe_ratio: float = 0.0
    sortino_ratio: float = 0.0
    calmar_ratio: float = 0.0
    
    max_drawdown: float = 0.0
    drawdown_duration: int = 0
    
    avg_trade_duration: float = 0.0
    avg_win: float = 0.0
    avg_loss: float = 0.0
    avg_winner_size: float = 0.0
    max_consecutive_losses: int = 0
    
    starting_capital: float = 0.0
    ending_capital: float = 0.0
    max_capital: float = 0.0
    
    trades: List[Trade] = field(default_factory=list)
    equity_curve: List[float] = field(default_factory=list)
    drawdown_curve: List[float] = field(default_factory=list)
    monthly_returns: Dict[str, float] = field(default_factory=dict)
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization"""
        return {
            "total_trades": self.total_trades,
            "winning_trades": self.winning_trades,
            "losing_trades": self.losing_trades,
            "win_rate": float(self.win_rate),
            "profit_factor": float(self.profit_factor),
            "total_return": float(self.total_return),
            "annual_return": float(self.annual_return),
            "sharpe_ratio": float(self.sharpe_ratio),
            "sortino_ratio": float(self.sortino_ratio),
            "calmar_ratio": float(self.calmar_ratio),
            "max_drawdown": float(self.max_drawdown),
            "avg_trade_duration": float(self.avg_trade_duration),
            "avg_win": float(self.avg_win),
            "avg_loss": float(self.avg_loss),
            "starting_capital": float(self.starting_capital),
            "ending_capital": float(self.ending_capital),
            "max_capital": float(self.max_capital),
        }
    
    def print_report(self) -> str:
        """Generate human-readable performance report"""
        return f"""
╔════════════════════════════════════════════════════════════════╗
║                    BACKTEST REPORT                             ║
╠════════════════════════════════════════════════════════════════╣
║ TRADE STATISTICS
║  Total Trades:        {self.total_trades}
║  Winning Trades:      {self.winning_trades} ({self.win_rate:.1%})
║  Losing Trades:       {self.losing_trades}
║  Max Consecutive Losses: {self.max_consecutive_losses}
║  Profit Factor:       {self.profit_factor:.2f}x
║
║ PERFORMANCE METRICS
║  Total Return:        {self.total_return:.2%}
║  Annual Return:       {self.annual_return:.2%}
║  Monthly Avg Return:  {self.monthly_return:.2%}
║  Sharpe Ratio:        {self.sharpe_ratio:.3f}
║  Sortino Ratio:       {self.sortino_ratio:.3f}
║  Calmar Ratio:        {self.calmar_ratio:.3f}
║
║ RISK METRICS  
║  Max Drawdown:        {self.max_drawdown:.2%}
║  Drawdown Duration:   {self.drawdown_duration} bars
║
║ CAPITAL FLOW
║  Starting Capital:    ${self.starting_capital:,.0f}
║  Ending Capital:      ${self.ending_capital:,.0f}
║  Max Capital:         ${self.max_capital:,.0f}
║
║ TRADE METRICS
║  Avg Trade Duration:  {self.avg_trade_duration:.0f} bars
║  Avg Winner Size:     ${self.avg_winner_size:,.0f}
║  Avg Win:             {self.avg_win:.2%}
║  Avg Loss:            {self.avg_loss:.2%}
║  Gross Profit:        ${self.gross_profit:,.0f}
║  Gross Loss:          ${self.gross_loss:,.0f}
║  Net Profit:          ${self.net_profit:,.0f}
╚════════════════════════════════════════════════════════════════╝
"""


class AdvancedBacktester:
    """Production-grade backtesting engine"""
    
    def __init__(
        self,
        initial_capital: float = 100000,
        max_position_pct: float = 0.02,
        execution: Optional[ExecutionMetrics] = None,
    ):
        self.initial_capital = initial_capital
        self.max_position_pct = max_position_pct
        self.execution = execution or ExecutionMetrics()
        
        self.capital = initial_capital
        self.equity_curve = [initial_capital]
        self.trades: List[Trade] = []
    
    def run(
        self,
        df: pd.DataFrame,
        signal_func,
        symbol: str = "STOCK",
        warmup_periods: int = 100,
    ) -> BacktestMetrics:
        """
        Run backtest with given signal function
        
        signal_func: callable(df) -> (signal, confidence)
        Returns: signal ("BUY", "SELL", "HOLD"), confidence (0-1)
        """
        metrics = BacktestMetrics(
            starting_capital=self.initial_capital,
            equity_curve=self.equity_curve.copy(),
        )
        
        position = None
        entry_price = None
        entry_time = None
        entry_confidence = 0
        
        capital_high = self.initial_capital
        
        # Main backtest loop
        for i in range(warmup_periods, len(df)):
            current_data = df.iloc[:i+1]
            current_price = df["close"].iloc[i]
            current_time = df.index[i]
            
            # Get signal
            try:
                signal, confidence = signal_func(current_data)
            except:
                signal, confidence = "HOLD", 0.0
            
            # Entry logic
            if signal == "BUY" and position is None and confidence > 0.3:
                position_size = (self.capital * self.max_position_pct) / current_price
                entry_price = current_price * self.execution.get_slippage_multiplier("buy")
                entry_time = current_time
                entry_confidence = confidence
                position = "LONG"
            
            # Exit logic  
            elif signal == "SELL" and position == "LONG":
                exit_price = current_price * self.execution.get_slippage_multiplier("sell")
                holding_bars = i - df.index.get_loc(entry_time)
                
                gross_pnl = (exit_price - entry_price) * position_size
                commission = abs(entry_price * position_size) * self.execution.commission_pct
                commission += abs(exit_price * position_size) * self.execution.commission_pct
                
                net_pnl = gross_pnl - commission
                net_pnl_pct = (exit_price - entry_price) / entry_price
                
                trade = Trade(
                    symbol=symbol,
                    entry_time=entry_time,
                    exit_time=current_time,
                    entry_price=entry_price,
                    exit_price=exit_price,
                    position_size=position_size,
                    gross_pnl=gross_pnl,
                    net_pnl=net_pnl,
                    net_pnl_pct=net_pnl_pct,
                    commission_paid=commission,
                    slippage_cost=0,
                    holding_bars=holding_bars,
                    reason="signal",
                    confidence=entry_confidence,
                )
                
                self.trades.append(trade)
                self.capital += net_pnl
                self.equity_curve.append(self.capital)
                
                metrics.trades.append(trade)
                
                if net_pnl > 0:
                    metrics.winning_trades += 1
                    metrics.gross_profit += gross_pnl
                else:
                    metrics.losing_trades += 1
                    metrics.gross_loss += abs(gross_pnl)
                
                position = None
            
            # Update equity curve regardless
            if position is None:
                self.equity_curve.append(self.capital)
            else:
                # Mark-to-market for open position
                unrealized = (current_price - entry_price) * position_size
                unrealized_equity = self.capital + unrealized
                self.equity_curve.append(unrealized_equity)
                capital_high = max(capital_high, unrealized_equity)
        
        # Close any open position
        if position == "LONG":
            exit_price = df["close"].iloc[-1]
            holding_bars = len(df) - df.index.get_loc(entry_time)
            
            gross_pnl = (exit_price - entry_price) * position_size
            commission = abs(entry_price * position_size) * self.execution.commission_pct
            commission += abs(exit_price * position_size) * self.execution.commission_pct
            
            net_pnl = gross_pnl - commission
            
            trade = Trade(
                symbol=symbol,
                entry_time=entry_time,
                exit_time=df.index[-1],
                entry_price=entry_price,
                exit_price=exit_price,
                position_size=position_size,
                gross_pnl=gross_pnl,
                net_pnl=net_pnl,
                net_pnl_pct=(exit_price - entry_price) / entry_price,
                commission_paid=commission,
                slippage_cost=0,
                holding_bars=holding_bars,
                reason="end_of_data",
                confidence=entry_confidence,
            )
            
            self.trades.append(trade)
            metrics.trades.append(trade)
            self.capital += net_pnl
            
            if net_pnl > 0:
                metrics.winning_trades += 1
                metrics.gross_profit += gross_pnl
            else:
                metrics.losing_trades += 1
                metrics.gross_loss += abs(gross_pnl)
        
        # Calculate final metrics
        metrics.total_trades = len(self.trades)
        metrics.ending_capital = self.capital
        metrics.max_capital = max(self.equity_curve)
        metrics.net_profit = self.capital - self.initial_capital
        metrics.equity_curve = self.equity_curve
        
        if metrics.total_trades > 0:
            metrics.win_rate = metrics.winning_trades / metrics.total_trades
            if metrics.gross_loss > 0:
                metrics.profit_factor = metrics.gross_profit / metrics.gross_loss
            metrics.avg_trade_duration = np.mean([t.holding_bars for t in self.trades])
            
            winning_trades = [t for t in self.trades if t.net_pnl > 0]
            losing_trades = [t for t in self.trades if t.net_pnl <= 0]
            
            if winning_trades:
                metrics.avg_win = np.mean([t.net_pnl_pct for t in winning_trades])
                metrics.avg_winner_size = np.mean([t.net_pnl for t in winning_trades])
            if losing_trades:
                metrics.avg_loss = np.mean([t.net_pnl_pct for t in losing_trades])
            
            # Count max consecutive losses
            consecutive_losses = 0
            max_consecutive = 0
            for trade in self.trades:
                if trade.net_pnl <= 0:
                    consecutive_losses += 1
                    max_consecutive = max(max_consecutive, consecutive_losses)
                else:
                    consecutive_losses = 0
            metrics.max_consecutive_losses = max_consecutive
        
        # Calculate return metrics
        metrics.total_return = (self.capital - self.initial_capital) / self.initial_capital
        
        # Calculate Sharpe, Sortino, Calmar
        equity_series = pd.Series(self.equity_curve)
        returns = equity_series.pct_change().dropna()
        
        if len(returns) > 0:
            annual_returns = returns * 252  # Daily returns assumed
            metrics.annual_return = annual_returns.mean()
            
            if returns.std() > 0:
                metrics.sharpe_ratio = np.sqrt(252) * returns.mean() / returns.std()
            
            # Sortino: only penalize downside
            downside_returns = returns[returns < 0]
            if len(downside_returns) > 0 and downside_returns.std() > 0:
                metrics.sortino_ratio = np.sqrt(252) * returns.mean() / downside_returns.std()
            
            # Max drawdown
            cummax = equity_series.cummax()
            drawdown = (equity_series - cummax) / cummax
            metrics.max_drawdown = drawdown.min()
            
            if abs(metrics.max_drawdown) > 0:
                metrics.calmar_ratio = metrics.annual_return / abs(metrics.max_drawdown)
        
        return metrics
