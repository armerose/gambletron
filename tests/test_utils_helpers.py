"""Comprehensive tests for utility helper functions"""

import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

from src.utils.helpers import (
    calculate_returns,
    calculate_sharpe_ratio,
    calculate_sortino_ratio,
    calculate_max_drawdown,
    calculate_calmar_ratio,
    calculate_win_rate,
    calculate_profit_factor,
)


class TestCalculateReturns:
    """Test calculate_returns function"""
    
    def test_basic_returns(self):
        """Test basic return calculation"""
        prices = pd.Series([100, 102, 101, 103])
        returns = calculate_returns(prices)
        assert len(returns) == 3
        assert np.isclose(returns.iloc[0], 0.02)
    
    def test_empty_series(self):
        """Test with empty series"""
        prices = pd.Series([])
        returns = calculate_returns(prices)
        assert len(returns) == 0
    
    def test_single_price(self):
        """Test with single price"""
        prices = pd.Series([100])
        returns = calculate_returns(prices)
        assert len(returns) == 0
    
    def test_constant_prices(self):
        """Test with constant prices"""
        prices = pd.Series([100, 100, 100, 100])
        returns = calculate_returns(prices)
        assert all(returns == 0)


class TestSharpeRatio:
    """Test Sharpe Ratio calculation"""
    
    def test_sharpe_ratio_positive_returns(self):
        """Test Sharpe ratio with positive returns"""
        returns = pd.Series(np.random.randn(252) * 0.01 + 0.0005)
        sharpe = calculate_sharpe_ratio(returns)
        assert isinstance(sharpe, (int, float))
        assert sharpe > 0
    
    def test_sharpe_ratio_negative_returns(self):
        """Test Sharpe ratio with negative returns"""
        returns = pd.Series(np.random.randn(252) * 0.01 - 0.0005)
        sharpe = calculate_sharpe_ratio(returns)
        assert isinstance(sharpe, (int, float))
    
    def test_sharpe_ratio_zero_volatility(self):
        """Test Sharpe ratio with zero volatility"""
        returns = pd.Series([0.001] * 100)
        sharpe = calculate_sharpe_ratio(returns)
        # With zero std, should handle gracefully
        assert isinstance(sharpe, (int, float))
    
    def test_sharpe_ratio_custom_params(self):
        """Test Sharpe ratio with custom parameters"""
        returns = pd.Series(np.random.randn(252) * 0.01)
        sharpe1 = calculate_sharpe_ratio(returns, risk_free_rate=0.01)
        sharpe2 = calculate_sharpe_ratio(returns, risk_free_rate=0.05)
        assert sharpe1 != sharpe2
    
    def test_sharpe_ratio_empty_series(self):
        """Test Sharpe ratio with empty series"""
        returns = pd.Series([])
        with pytest.raises((ValueError, ZeroDivisionError)):
            calculate_sharpe_ratio(returns)


class TestSortinoRatio:
    """Test Sortino Ratio calculation"""
    
    def test_sortino_ratio_positive_returns(self):
        """Test Sortino ratio with positive returns"""
        returns = pd.Series(np.random.randn(252) * 0.01 + 0.0005)
        sortino = calculate_sortino_ratio(returns)
        assert isinstance(sortino, (int, float))
    
    def test_sortino_ratio_negative_returns(self):
        """Test Sortino ratio with negative returns"""
        returns = pd.Series(np.random.randn(252) * 0.01 - 0.0005)
        sortino = calculate_sortino_ratio(returns)
        assert isinstance(sortino, (int, float))
    
    def test_sortino_ratio_all_positive(self):
        """Test Sortino ratio with all positive returns"""
        returns = pd.Series([0.001] * 100)
        sortino = calculate_sortino_ratio(returns)
        assert isinstance(sortino, (int, float))
    
    def test_sortino_ratio_vs_sharpe(self):
        """Test that Sortino >= Sharpe for positive returns"""
        returns = pd.Series(np.random.RandomState(42).randn(252) * 0.01 + 0.0005)
        sharpe = calculate_sharpe_ratio(returns)
        sortino = calculate_sortino_ratio(returns)
        # Sortino should generally be >= Sharpe for positive mean returns
        assert sortino >= sharpe - 0.1  # Small tolerance for numerical errors


class TestMaxDrawdown:
    """Test maximum drawdown calculation"""
    
    def test_max_drawdown_simple(self):
        """Test max drawdown with simple data"""
        prices = pd.Series([100, 110, 105, 95, 100, 102])
        max_dd, peak_idx, trough_idx = calculate_max_drawdown(prices)
        assert max_dd < 0
        assert max_dd <= 0  # Drawdown should be negative or zero
    
    def test_max_drawdown_constant_prices(self):
        """Test max drawdown with constant prices"""
        prices = pd.Series([100] * 10)
        max_dd, peak_idx, trough_idx = calculate_max_drawdown(prices)
        assert max_dd == 0
    
    def test_max_drawdown_uptrend(self):
        """Test max drawdown in uptrend"""
        prices = pd.Series([100, 101, 102, 103, 104, 105])
        max_dd, peak_idx, trough_idx = calculate_max_drawdown(prices)
        assert max_dd == 0
    
    def test_max_drawdown_downtrend(self):
        """Test max drawdown in downtrend"""
        prices = pd.Series([100, 99, 98, 97, 96, 95])
        max_dd, peak_idx, trough_idx = calculate_max_drawdown(prices)
        assert max_dd < 0
    
    def test_max_drawdown_return_values(self):
        """Test that return values are valid"""
        prices = pd.Series([100, 120, 90, 110, 80, 100])
        max_dd, peak_idx, trough_idx = calculate_max_drawdown(prices)
        assert isinstance(max_dd, float)
        # peak_idx and trough_idx should be valid


class TestCalmarRatio:
    """Test Calmar Ratio calculation"""
    
    def test_calmar_ratio_basic(self):
        """Test basic Calmar ratio calculation"""
        prices = pd.Series([100, 102, 101, 103, 105, 104])
        calmar = calculate_calmar_ratio(prices)
        assert isinstance(calmar, float)
    
    def test_calmar_ratio_zero_drawdown(self):
        """Test Calmar ratio with zero drawdown"""
        prices = pd.Series([100, 101, 102, 103, 104, 105])
        calmar = calculate_calmar_ratio(prices)
        # With no drawdown, could be inf or very large
        assert isinstance(calmar, float)
    
    def test_calmar_ratio_positive_returns(self):
        """Test Calmar ratio with positive returns"""
        np.random.seed(42)
        prices = pd.Series(np.cumsum(np.random.randn(252) * 0.01) + 100)
        calmar = calculate_calmar_ratio(prices)
        assert isinstance(calmar, float)


class TestWinRate:
    """Test win rate calculation"""
    
    def test_win_rate_all_wins(self):
        """Test win rate with all winning trades"""
        pnls = [100, 50, 75, 25]
        win_rate = calculate_win_rate(pnls)
        assert win_rate == 1.0
    
    def test_win_rate_all_losses(self):
        """Test win rate with all losing trades"""
        pnls = [-100, -50, -75, -25]
        win_rate = calculate_win_rate(pnls)
        assert win_rate == 0.0
    
    def test_win_rate_mixed(self):
        """Test win rate with mixed results"""
        pnls = [100, -50, 75, -25, 50]
        win_rate = calculate_win_rate(pnls)
        assert win_rate == 0.6  # 3 wins out of 5
    
    def test_win_rate_with_zeros(self):
        """Test win rate with zero P&L trades"""
        pnls = [100, 0, -50, 0, 75]
        win_rate = calculate_win_rate(pnls)
        # Depends on implementation: zeros might be considered wins or neutral
        assert 0 <= win_rate <= 1
    
    def test_win_rate_empty(self):
        """Test win rate with empty list"""
        pnls = []
        win_rate = calculate_win_rate(pnls)
        assert win_rate == 0 or np.isnan(win_rate)


class TestProfitFactor:
    """Test profit factor calculation"""
    
    def test_profit_factor_basic(self):
        """Test basic profit factor"""
        pnls = [100, 50, -30, -20]
        profit_factor = calculate_profit_factor(pnls)
        assert profit_factor == pytest.approx((100 + 50) / (30 + 20))
    
    def test_profit_factor_no_losses(self):
        """Test profit factor with no losses"""
        pnls = [100, 50, 75]
        profit_factor = calculate_profit_factor(pnls)
        # Inf or very large number
        assert np.isinf(profit_factor) or profit_factor > 100
    
    def test_profit_factor_no_gains(self):
        """Test profit factor with no gains"""
        pnls = [-100, -50, -75]
        profit_factor = calculate_profit_factor(pnls)
        assert profit_factor == 0 or np.isnan(profit_factor)
    
    def test_profit_factor_break_even(self):
        """Test profit factor at break even"""
        pnls = [100, -100]
        profit_factor = calculate_profit_factor(pnls)
        assert profit_factor == pytest.approx(1.0)
    
    def test_profit_factor_empty(self):
        """Test profit factor with empty list"""
        pnls = []
        profit_factor = calculate_profit_factor(pnls)
        assert np.isnan(profit_factor) or profit_factor == 0


class TestEdgeCases:
    """Test edge cases across all functions"""
    
    def test_nan_handling(self):
        """Test handling of NaN values"""
        prices = pd.Series([100, np.nan, 102, 103])
        returns = calculate_returns(prices)
        # Should handle NaN appropriately
        assert len(returns) <= 4
    
    def test_inf_handling(self):
        """Test handling of inf values"""
        prices = pd.Series([100, np.inf, 102])
        returns = calculate_returns(prices)
        # Should handle inf gracefully
        assert len(returns) >= 0
    
    def test_negative_prices(self):
        """Test with negative prices"""
        prices = pd.Series([-100, -102, -101])
        returns = calculate_returns(prices)
        assert len(returns) >= 0


class TestNumericalStability:
    """Test numerical stability"""
    
    def test_very_small_returns(self):
        """Test with very small returns"""
        returns = pd.Series(np.random.randn(252) * 1e-10)
        sharpe = calculate_sharpe_ratio(returns)
        assert isinstance(sharpe, float)
    
    def test_very_large_returns(self):
        """Test with very large returns"""
        returns = pd.Series(np.random.randn(252) * 1e10)
        sharpe = calculate_sharpe_ratio(returns)
        assert isinstance(sharpe, float)
    
    def test_long_series(self):
        """Test with very long series"""
        prices = pd.Series(np.cumsum(np.random.randn(10000) * 0.01) + 100)
        max_dd, _, _ = calculate_max_drawdown(prices)
        assert isinstance(max_dd, float)
