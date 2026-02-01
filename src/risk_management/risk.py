"""Risk management module"""

import numpy as np
import pandas as pd
from typing import Optional, Tuple
from loguru import logger


class PositionSizer:
    """Calculate optimal position sizes"""
    
    @staticmethod
    def kelly_criterion(
        win_rate: float,
        avg_win: float,
        avg_loss: float,
        kelly_fraction: float = 0.25,
    ) -> float:
        """
        Calculate position size using Kelly Criterion.
        
        Args:
            win_rate: Proportion of winning trades
            avg_win: Average win per unit
            avg_loss: Average loss per unit
            kelly_fraction: Fraction of Kelly to use (safety factor)
            
        Returns:
            Optimal position size as fraction of capital
        """
        if avg_loss == 0 or win_rate == 0:
            return 0.0
        
        kelly = (win_rate * avg_win - (1 - win_rate) * avg_loss) / avg_win
        return max(0, min(kelly * kelly_fraction, 1.0))
    
    @staticmethod
    def volatility_based(
        volatility: float,
        target_volatility: float = 0.02,
        max_position: float = 0.05,
    ) -> float:
        """
        Calculate position size based on volatility.
        
        Args:
            volatility: Current market volatility (e.g., ATR)
            target_volatility: Target volatility for position
            max_position: Maximum position size
            
        Returns:
            Position size as fraction of capital
        """
        if volatility == 0:
            return 0.0
        
        size = min(target_volatility / volatility, max_position)
        return max(0, size)
    
    @staticmethod
    def fixed_fraction(
        capital: float,
        risk_per_trade: float,
        stop_loss_distance: float,
    ) -> float:
        """
        Calculate position size using fixed fraction method.
        
        Args:
            capital: Total trading capital
            risk_per_trade: Risk amount per trade
            stop_loss_distance: Distance to stop loss in price units
            
        Returns:
            Position size in units
        """
        return risk_per_trade / stop_loss_distance


class RiskMonitor:
    """Monitor and manage portfolio risk"""
    
    def __init__(
        self,
        max_drawdown: float = 0.20,
        max_daily_loss: float = 0.05,
        max_position_size: float = 0.05,
    ):
        self.max_drawdown = max_drawdown
        self.max_daily_loss = max_daily_loss
        self.max_position_size = max_position_size
        
        self.peak_capital = 1.0
        self.current_capital = 1.0
        self.daily_pnl = 0.0
    
    def update_capital(self, new_capital: float) -> None:
        """Update current capital and track peak"""
        self.current_capital = new_capital
        if new_capital > self.peak_capital:
            self.peak_capital = new_capital
    
    def get_current_drawdown(self) -> float:
        """Get current drawdown from peak"""
        if self.peak_capital == 0:
            return 0.0
        
        return (self.peak_capital - self.current_capital) / self.peak_capital
    
    def get_current_daily_loss(self) -> float:
        """Get current daily P&L"""
        return self.daily_pnl
    
    def is_drawdown_exceeded(self) -> bool:
        """Check if maximum drawdown has been exceeded"""
        return self.get_current_drawdown() > self.max_drawdown
    
    def is_daily_loss_exceeded(self) -> bool:
        """Check if maximum daily loss has been exceeded"""
        return self.daily_pnl < -self.max_daily_loss
    
    def should_stop_trading(self) -> bool:
        """Determine if trading should be halted"""
        if self.is_drawdown_exceeded():
            logger.warning(
                f"Maximum drawdown exceeded: {self.get_current_drawdown():.2%}"
            )
            return True
        
        if self.is_daily_loss_exceeded():
            logger.warning(
                f"Maximum daily loss exceeded: {self.daily_pnl:.2%}"
            )
            return True
        
        return False
    
    def get_max_position_size(self, leverage: float = 1.0) -> float:
        """Get maximum allowed position size"""
        return self.max_position_size / leverage


class StopLossManager:
    """Manage stop losses and take profits"""
    
    @staticmethod
    def calculate_atr_based_stop(
        entry_price: float,
        atr: float,
        atr_multiplier: float = 2.0,
    ) -> Tuple[float, float]:
        """
        Calculate stop loss and take profit based on ATR.
        
        Args:
            entry_price: Entry price
            atr: Average True Range
            atr_multiplier: ATR multiplier for stop loss
            
        Returns:
            Tuple of (stop_loss, take_profit)
        """
        stop_loss = entry_price - (atr * atr_multiplier)
        take_profit = entry_price + (atr * atr_multiplier * 2)
        
        return stop_loss, take_profit
    
    @staticmethod
    def calculate_fixed_pips_stop(
        entry_price: float,
        stop_loss_pips: int,
        take_profit_pips: int,
    ) -> Tuple[float, float]:
        """
        Calculate stop loss and take profit with fixed pips.
        
        Args:
            entry_price: Entry price
            stop_loss_pips: Stop loss in pips
            take_profit_pips: Take profit in pips
            
        Returns:
            Tuple of (stop_loss, take_profit)
        """
        pip_value = 0.0001  # Standard pip value for most pairs
        
        stop_loss = entry_price - (stop_loss_pips * pip_value)
        take_profit = entry_price + (take_profit_pips * pip_value)
        
        return stop_loss, take_profit
    
    @staticmethod
    def update_trailing_stop(
        current_price: float,
        current_stop: float,
        trailing_distance: float,
        is_long: bool = True,
    ) -> float:
        """
        Update trailing stop loss.
        
        Args:
            current_price: Current price
            current_stop: Current stop loss level
            trailing_distance: Distance for trailing stop
            is_long: Long position if True, short if False
            
        Returns:
            Updated stop loss level
        """
        if is_long:
            new_stop = current_price - trailing_distance
            return max(new_stop, current_stop)
        else:
            new_stop = current_price + trailing_distance
            return min(new_stop, current_stop)


class CorrelationManager:
    """Manage correlated positions"""
    
    @staticmethod
    def get_correlation_matrix(returns_df: pd.DataFrame) -> pd.DataFrame:
        """Calculate correlation matrix"""
        return returns_df.corr()
    
    @staticmethod
    def filter_correlated_pairs(
        pairs: list,
        correlation_matrix: pd.DataFrame,
        max_correlation: float = 0.7,
    ) -> list:
        """
        Filter out pairs that are too correlated.
        
        Args:
            pairs: List of trading pairs
            correlation_matrix: Correlation matrix
            max_correlation: Maximum allowed correlation
            
        Returns:
            Filtered list of pairs
        """
        filtered_pairs = [pairs[0]]  # Always include first pair
        
        for i, pair in enumerate(pairs[1:], 1):
            # Check correlation with existing pairs
            max_corr = 0
            for existing_pair in filtered_pairs:
                if pair in correlation_matrix.columns and existing_pair in correlation_matrix.index:
                    corr = abs(correlation_matrix.loc[existing_pair, pair])
                    max_corr = max(max_corr, corr)
            
            if max_corr <= max_correlation:
                filtered_pairs.append(pair)
                logger.info(f"Added pair {pair} (max_corr: {max_corr:.3f})")
            else:
                logger.warning(
                    f"Skipped pair {pair} (max_corr: {max_corr:.3f} > {max_correlation})"
                )
        
        return filtered_pairs


class Portfolio:
    """Portfolio management and tracking"""
    
    def __init__(self, initial_capital: float = 100000):
        self.initial_capital = initial_capital
        self.current_capital = initial_capital
        self.positions: dict = {}
        self.trades: list = []
        self.equity_curve: list = [initial_capital]
    
    def add_position(
        self,
        symbol: str,
        quantity: float,
        entry_price: float,
        stop_loss: float,
        take_profit: float,
    ) -> None:
        """Add a new position"""
        self.positions[symbol] = {
            "quantity": quantity,
            "entry_price": entry_price,
            "stop_loss": stop_loss,
            "take_profit": take_profit,
            "entry_time": pd.Timestamp.now(),
        }
    
    def close_position(
        self,
        symbol: str,
        exit_price: float,
        exit_reason: str = "manual",
    ) -> float:
        """
        Close a position and calculate P&L.
        
        Returns:
            P&L of the trade
        """
        if symbol not in self.positions:
            logger.warning(f"Position {symbol} not found")
            return 0.0
        
        pos = self.positions.pop(symbol)
        
        pnl = (exit_price - pos["entry_price"]) * pos["quantity"]
        pnl_percent = (exit_price - pos["entry_price"]) / pos["entry_price"]
        
        trade = {
            "symbol": symbol,
            "entry_price": pos["entry_price"],
            "exit_price": exit_price,
            "quantity": pos["quantity"],
            "pnl": pnl,
            "pnl_percent": pnl_percent,
            "entry_time": pos["entry_time"],
            "exit_time": pd.Timestamp.now(),
            "reason": exit_reason,
        }
        
        self.trades.append(trade)
        self.current_capital += pnl
        self.equity_curve.append(self.current_capital)
        
        return pnl
    
    def get_open_positions(self) -> dict:
        """Get all open positions"""
        return self.positions.copy()
    
    def get_position_value(self, symbol: str, current_price: float) -> float:
        """Get current value of a position"""
        if symbol not in self.positions:
            return 0.0
        
        pos = self.positions[symbol]
        return pos["quantity"] * current_price
    
    def get_total_exposure(self, prices: dict) -> float:
        """Get total portfolio exposure"""
        total = 0.0
        for symbol, pos in self.positions.items():
            total += pos["quantity"] * prices.get(symbol, 0)
        
        return total
