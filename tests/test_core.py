"""Unit tests for core modules"""

import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Tests for helpers
from src.utils.helpers import (
    calculate_sharpe_ratio,
    calculate_sortino_ratio,
    calculate_max_drawdown,
    kelly_criterion,
)


class TestHelpers:
    """Test helper functions"""
    
    def test_sharpe_ratio(self):
        """Test Sharpe ratio calculation"""
        returns = pd.Series(np.random.randn(252) * 0.01)
        sharpe = calculate_sharpe_ratio(returns)
        assert isinstance(sharpe, (int, float))
    
    def test_sortino_ratio(self):
        """Test Sortino ratio calculation"""
        returns = pd.Series(np.random.randn(252) * 0.01)
        sortino = calculate_sortino_ratio(returns)
        assert isinstance(sortino, (int, float))
    
    def test_max_drawdown(self):
        """Test maximum drawdown calculation"""
        prices = pd.Series([100, 105, 103, 98, 102, 101, 104, 106, 105])
        max_dd, peak_idx, trough_idx = calculate_max_drawdown(prices)
        
        assert max_dd < 0
        assert isinstance(max_dd, (int, float))
    
    def test_kelly_criterion(self):
        """Test Kelly criterion calculation"""
        kelly = kelly_criterion(win_rate=0.55, avg_win=1.5, avg_loss=1.0)
        assert 0 <= kelly <= 1


# Tests for risk management
from src.risk_management import PositionSizer, RiskMonitor


class TestRiskManagement:
    """Test risk management modules"""
    
    def test_position_sizer_kelly(self):
        """Test Kelly criterion position sizing"""
        size = PositionSizer.kelly_criterion(
            win_rate=0.55,
            avg_win=1.5,
            avg_loss=1.0,
            kelly_fraction=0.25,
        )
        assert 0 <= size <= 0.1
    
    def test_position_sizer_volatility(self):
        """Test volatility-based position sizing"""
        size = PositionSizer.volatility_based(
            volatility=0.02,
            target_volatility=0.02,
            max_position=0.05,
        )
        assert 0 <= size <= 0.05
    
    def test_risk_monitor(self):
        """Test risk monitor"""
        monitor = RiskMonitor(max_drawdown=0.20)
        monitor.update_capital(100000)
        
        assert monitor.get_current_drawdown() == 0.0
        
        # Simulate drawdown
        monitor.update_capital(95000)
        assert monitor.get_current_drawdown() > 0


# Tests for strategies
from src.strategies import (
    MeanReversionStrategy,
    TrendFollowingStrategy,
    RsiStrategy,
    EnsembleStrategy,
)


class TestStrategies:
    """Test trading strategies"""
    
    @pytest.fixture
    def sample_data(self):
        """Generate sample price data"""
        dates = pd.date_range(start="2023-01-01", periods=100, freq="1H")
        prices = 100 + np.cumsum(np.random.randn(100) * 0.5)
        
        return pd.DataFrame({
            "close": prices,
            "open": prices - np.abs(np.random.randn(100) * 0.2),
            "high": prices + np.abs(np.random.randn(100) * 0.3),
            "low": prices - np.abs(np.random.randn(100) * 0.3),
            "volume": np.random.randint(1000, 10000, 100),
        }, index=dates)
    
    def test_mean_reversion_strategy(self, sample_data):
        """Test mean reversion strategy"""
        strategy = MeanReversionStrategy()
        signal, confidence = strategy.generate_signal(sample_data)
        
        assert signal in ["BUY", "SELL", "HOLD"]
        assert 0 <= confidence <= 1
    
    def test_trend_following_strategy(self, sample_data):
        """Test trend following strategy"""
        strategy = TrendFollowingStrategy()
        signal, confidence = strategy.generate_signal(sample_data)
        
        assert signal in ["BUY", "SELL", "HOLD"]
        assert 0 <= confidence <= 1
    
    def test_rsi_strategy(self, sample_data):
        """Test RSI strategy"""
        strategy = RsiStrategy()
        signal, confidence = strategy.generate_signal(sample_data)
        
        assert signal in ["BUY", "SELL", "HOLD"]
        assert 0 <= confidence <= 1
    
    def test_ensemble_strategy(self, sample_data):
        """Test ensemble strategy"""
        strategies = [
            MeanReversionStrategy(),
            TrendFollowingStrategy(),
            RsiStrategy(),
        ]
        ensemble = EnsembleStrategy(strategies=strategies)
        
        signal, confidence = ensemble.generate_signal(sample_data)
        
        assert signal in ["BUY", "SELL", "HOLD"]
        assert 0 <= confidence <= 1


# Tests for data processing
from src.data.processor import MarketDataProcessor, FeatureEngineer


class TestDataProcessing:
    """Test data processing modules"""
    
    @pytest.fixture
    def sample_df(self):
        """Generate sample data"""
        dates = pd.date_range(start="2023-01-01", periods=100, freq="1H")
        prices = 100 + np.cumsum(np.random.randn(100) * 0.5)
        
        return pd.DataFrame({
            "close": prices,
            "open": prices - np.abs(np.random.randn(100) * 0.2),
            "high": prices + np.abs(np.random.randn(100) * 0.3),
            "low": prices - np.abs(np.random.randn(100) * 0.3),
            "volume": np.random.randint(1000, 10000, 100),
        }, index=dates)
    
    def test_market_data_processor_returns(self, sample_df):
        """Test return calculation"""
        processor = MarketDataProcessor()
        returns = processor.calculate_returns(sample_df)
        
        assert len(returns) == len(sample_df) - 1
        assert returns.dtype == np.float64
    
    def test_atr_calculation(self, sample_df):
        """Test ATR calculation"""
        processor = MarketDataProcessor()
        atr = processor.calculate_atr(sample_df)
        
        assert len(atr) == len(sample_df)
        assert atr.iloc[-1] > 0
    
    def test_rsi_calculation(self, sample_df):
        """Test RSI calculation"""
        processor = MarketDataProcessor()
        rsi = processor.calculate_rsi(sample_df)
        
        assert len(rsi) == len(sample_df)
        assert 0 <= rsi.iloc[-1] <= 100
    
    def test_macd_calculation(self, sample_df):
        """Test MACD calculation"""
        processor = MarketDataProcessor()
        macd, signal, hist = processor.calculate_macd(sample_df)
        
        assert len(macd) == len(sample_df)
        assert len(signal) == len(sample_df)
        assert len(hist) == len(sample_df)
    
    def test_feature_engineer_lag_features(self, sample_df):
        """Test lag feature creation"""
        engineer = FeatureEngineer()
        features = engineer.create_lag_features(sample_df, lags=[1, 2])
        
        assert "close_lag_1" in features.columns
        assert "close_lag_2" in features.columns
    
    def test_feature_engineer_normalize(self, sample_df):
        """Test feature normalization"""
        engineer = FeatureEngineer()
        normalized = engineer.normalize_features(sample_df[["close"]])
        
        assert normalized["close"].min() >= -1.0
        assert normalized["close"].max() <= 1.0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
