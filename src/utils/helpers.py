"""Helper functions for financial calculations"""

import numpy as np
import pandas as pd
from typing import Tuple, Optional


def calculate_returns(prices: pd.Series) -> pd.Series:
    """
    Calculate returns from price series.
    
    Args:
        prices: Series of prices
        
    Returns:
        Series of returns
    """
    return prices.pct_change().dropna()


def calculate_sharpe_ratio(
    returns: pd.Series,
    risk_free_rate: float = 0.02,
    periods_per_year: int = 252,
) -> float:
    """
    Calculate Sharpe Ratio.
    
    Args:
        returns: Series of returns
        risk_free_rate: Annual risk-free rate
        periods_per_year: Number of trading periods per year
        
    Returns:
        Sharpe ratio
    """
    excess_returns = returns - (risk_free_rate / periods_per_year)
    return np.sqrt(periods_per_year) * excess_returns.mean() / excess_returns.std()


def calculate_sortino_ratio(
    returns: pd.Series,
    risk_free_rate: float = 0.02,
    periods_per_year: int = 252,
) -> float:
    """
    Calculate Sortino Ratio (downside deviation only).
    
    Args:
        returns: Series of returns
        risk_free_rate: Annual risk-free rate
        periods_per_year: Number of trading periods per year
        
    Returns:
        Sortino ratio
    """
    excess_returns = returns - (risk_free_rate / periods_per_year)
    downside_returns = excess_returns[excess_returns < 0]
    downside_std = np.sqrt(np.mean(downside_returns ** 2))
    
    return np.sqrt(periods_per_year) * excess_returns.mean() / downside_std


def calculate_max_drawdown(prices: pd.Series) -> Tuple[float, int, int]:
    """
    Calculate maximum drawdown.
    
    Args:
        prices: Series of prices
        
    Returns:
        Tuple of (max_drawdown, peak_idx, trough_idx)
    """
    cumulative = (1 + prices.pct_change()).cumprod()
    running_max = cumulative.expanding().max()
    drawdown = (cumulative - running_max) / running_max
    
    # Handle case where all values are NA
    drawdown = drawdown.fillna(0)
    
    if drawdown.empty or (drawdown == 0).all():
        return 0.0, 0, 0
    
    max_dd_idx = drawdown.idxmin()
    max_dd = drawdown.loc[max_dd_idx]
    
    # Find peak before trough
    max_dd_position = drawdown.index.get_loc(max_dd_idx)
    if max_dd_position > 0:
        peak_slice = cumulative.iloc[:max_dd_position]
        if len(peak_slice) > 0:
            peak_idx = peak_slice.idxmax()
        else:
            peak_idx = cumulative.index[0]
    else:
        peak_idx = cumulative.index[0]
    
    return float(max_dd), peak_idx, max_dd_idx


def calculate_calmar_ratio(
    returns: pd.Series,
    periods_per_year: int = 252,
) -> float:
    """
    Calculate Calmar Ratio (Return / Max Drawdown).
    
    Args:
        returns: Series of returns
        periods_per_year: Number of trading periods per year
        
    Returns:
        Calmar ratio
    """
    prices = (1 + returns).cumprod()
    max_dd, _, _ = calculate_max_drawdown(prices)
    
    annual_return = returns.mean() * periods_per_year
    
    if max_dd == 0:
        return 0.0
    
    return annual_return / abs(max_dd)


def calculate_win_rate(trades: pd.DataFrame) -> float:
    """
    Calculate win rate from trades dataframe.
    
    Args:
        trades: DataFrame with 'pnl' column
        
    Returns:
        Win rate (0-1)
    """
    winning_trades = (trades['pnl'] > 0).sum()
    total_trades = len(trades)
    
    return winning_trades / total_trades if total_trades > 0 else 0.0


def calculate_profit_factor(trades: pd.DataFrame) -> float:
    """
    Calculate profit factor (gross profit / gross loss).
    
    Args:
        trades: DataFrame with 'pnl' column
        
    Returns:
        Profit factor
    """
    gross_profit = trades[trades['pnl'] > 0]['pnl'].sum()
    gross_loss = abs(trades[trades['pnl'] < 0]['pnl'].sum())
    
    return gross_profit / gross_loss if gross_loss > 0 else 0.0


def calculate_var(
    returns: pd.Series,
    confidence: float = 0.95,
) -> float:
    """
    Calculate Value at Risk (VaR).
    
    Args:
        returns: Series of returns
        confidence: Confidence level (e.g., 0.95 for 95%)
        
    Returns:
        VaR at specified confidence level
    """
    return np.percentile(returns, (1 - confidence) * 100)


def kelly_criterion(
    win_rate: float,
    avg_win: float,
    avg_loss: float,
) -> float:
    """
    Calculate Kelly Criterion for optimal position sizing.
    
    Args:
        win_rate: Proportion of winning trades
        avg_win: Average win size
        avg_loss: Average loss size
        
    Returns:
        Kelly fraction (0-1)
    """
    if avg_loss == 0:
        return 0.0
    
    return (win_rate * avg_win - (1 - win_rate) * avg_loss) / avg_win


def calculate_correlation_matrix(returns_df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculate correlation matrix for multiple assets.
    
    Args:
        returns_df: DataFrame with returns for each asset
        
    Returns:
        Correlation matrix
    """
    return returns_df.corr()
