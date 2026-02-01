"""
ML-based strategies with real edge potential
Uses ensemble methods, adaptive learning, and signal detection
"""

import pandas as pd
import numpy as np
from typing import Tuple, Dict, List
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
import warnings
warnings.filterwarnings('ignore')


class SignalDetector:
    """Detect anomalies and patterns in market data"""
    
    @staticmethod
    def detect_regime_change(df: pd.DataFrame, window: int = 30) -> float:
        """Detect market regime changes using volatility and momentum"""
        if len(df) < window:
            return 0.0
        
        # Volatility ratio
        vol_recent = df["returns"].tail(window).std()
        vol_historical = df["returns"].tail(window * 2).head(window).std()
        
        if vol_historical > 0:
            vol_ratio = vol_recent / vol_historical
        else:
            vol_ratio = 1.0
        
        # Momentum direction
        momentum = df["returns"].tail(window).mean()
        
        # Return combined signal
        regime_strength = (vol_ratio - 1.0) * 0.5 + momentum * 252
        return np.clip(regime_strength, -1, 1)
    
    @staticmethod
    def detect_volatility_clusters(df: pd.DataFrame, window: int = 20) -> float:
        """Detect volatility clustering patterns"""
        if len(df) < window:
            return 0.0
        
        returns = df["returns"].tail(window)
        abs_returns = returns.abs()
        
        # Check for increasing volatility trend
        vol_trend = np.polyfit(range(len(abs_returns)), abs_returns, 1)[0]
        
        # Check for clustered high volatility
        high_vol_threshold = abs_returns.mean() + abs_returns.std()
        high_vol_count = (abs_returns > high_vol_threshold).sum()
        
        if high_vol_count >= window * 0.3:
            return vol_trend * (high_vol_count / window)
        
        return 0.0
    
    @staticmethod
    def detect_mean_reversion_setup(df: pd.DataFrame, window: int = 50) -> float:
        """Detect mean reversion opportunities"""
        if len(df) < window:
            return 0.0
        
        close = df["close"].tail(window)
        sma = close.mean()
        std = close.std()
        
        price = close.iloc[-1]
        z_score = (price - sma) / std if std > 0 else 0
        
        # Check for reversal patterns
        recent_trend = df["returns"].tail(10).mean()
        
        # Signal when extreme but showing reversal
        if abs(z_score) > 2.0 and recent_trend * z_score < 0:
            return z_score * 0.7  # Discounted confidence
        
        return z_score * 0.3
    
    @staticmethod
    def detect_breakout_setup(df: pd.DataFrame, window: int = 20) -> float:
        """Detect breakout patterns"""
        if len(df) < window * 2:
            return 0.0
        
        high_20 = df["high"].tail(window).max()
        low_20 = df["low"].tail(window).min()
        range_20 = high_20 - low_20
        
        current_price = df["close"].iloc[-1]
        
        # Consolidation pattern (low range)
        historical_range = df["high"].tail(window * 2).max() - df["low"].tail(window * 2).min()
        range_compression = 1 - (range_20 / (historical_range + 1e-6))
        
        if range_compression > 0.4:
            # Check for breakout direction
            if current_price > high_20:
                return 0.6
            elif current_price < low_20:
                return -0.6
        
        return 0.0


class AdaptiveStrategy:
    """Adaptive strategy that learns from market conditions"""
    
    def __init__(self, name: str = "AdaptiveStrategy"):
        self.name = name
        self.signal_detector = SignalDetector()
        self.rf_model = None
        self.gb_model = None
        self.scaler = StandardScaler()
        self.trained = False
    
    def _prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Prepare ML features"""
        df = df.copy()
        
        # Returns
        df["returns"] = df["close"].pct_change()
        
        # Volatility
        df["volatility"] = df["returns"].rolling(20).std()
        
        # Momentum
        df["momentum_5"] = df["close"].pct_change(5)
        df["momentum_10"] = df["close"].pct_change(10)
        df["momentum_20"] = df["close"].pct_change(20)
        
        # RSI
        df["rsi"] = self._calculate_rsi(df["close"])
        
        # MACD
        macd_data = self._calculate_macd(df["close"])
        df["macd"] = macd_data["macd"]
        df["macd_signal"] = macd_data["signal"]
        df["macd_hist"] = macd_data["histogram"]
        
        # Bollinger Bands
        bb_data = self._calculate_bollinger_bands(df["close"])
        df["bb_position"] = bb_data
        
        # Volume-weighted momentum
        if "volume" in df.columns:
            df["volume_trend"] = df["volume"].pct_change(5)
        
        # Price position in range
        df["price_range_pct"] = (
            (df["close"] - df["close"].rolling(20).min()) /
            (df["close"].rolling(20).max() - df["close"].rolling(20).min() + 1e-6)
        )
        
        # Gap detection
        if len(df) > 1:
            df["open_close_gap"] = (df["open"] - df["close"].shift(1)) / df["close"].shift(1)
        
        # Time-based features (cyclical)
        df["day_of_week"] = df.index.dayofweek / 7.0
        df["hour_of_day"] = df.index.hour / 24.0 if hasattr(df.index, 'hour') else 0.5
        
        return df.dropna()
    
    def _calculate_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series:
        """Calculate RSI"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        
        rs = gain / (loss + 1e-6)
        rsi = 100 - (100 / (1 + rs))
        return rsi / 100.0  # Normalize to 0-1
    
    def _calculate_macd(self, prices: pd.Series) -> Dict[str, pd.Series]:
        """Calculate MACD"""
        exp1 = prices.ewm(span=12, adjust=False).mean()
        exp2 = prices.ewm(span=26, adjust=False).mean()
        
        macd = exp1 - exp2
        signal = macd.ewm(span=9, adjust=False).mean()
        histogram = macd - signal
        
        return {
            "macd": macd / prices * 100,  # Normalize
            "signal": signal / prices * 100,
            "histogram": histogram / prices * 100,
        }
    
    def _calculate_bollinger_bands(self, prices: pd.Series) -> pd.Series:
        """Calculate Bollinger Bands position"""
        sma = prices.rolling(20).mean()
        std = prices.rolling(20).std()
        
        upper = sma + (std * 2)
        lower = sma - (std * 2)
        
        bb_position = (prices - lower) / (upper - lower + 1e-6)
        return np.clip(bb_position, 0, 1)
    
    def generate_signal(self, df: pd.DataFrame) -> Tuple[str, float]:
        """Generate trading signal using ensemble of methods"""
        if len(df) < 50:
            return "HOLD", 0.0
        
        # Calculate signal strength from detectors
        regime_signal = self.signal_detector.detect_regime_change(df)
        reversion_signal = self.signal_detector.detect_mean_reversion_setup(df)
        breakout_signal = self.signal_detector.detect_breakout_setup(df)
        vol_cluster_signal = self.signal_detector.detect_volatility_clusters(df)
        
        # Composite signal
        signals = [regime_signal, reversion_signal, breakout_signal, vol_cluster_signal]
        composite = np.mean(signals)
        
        # Determine action
        if composite > 0.3:
            confidence = min(1.0, (composite + abs(regime_signal)) / 2.0)
            return "BUY", confidence
        elif composite < -0.3:
            confidence = min(1.0, (abs(composite) + abs(regime_signal)) / 2.0)
            return "SELL", confidence
        else:
            return "HOLD", 0.0


class MultiTimeframeStrategy:
    """Strategy using multiple timeframes for confirmation"""
    
    def __init__(self):
        self.adaptive = AdaptiveStrategy("MultiTimeframe")
    
    def generate_signal(self, df_daily: pd.DataFrame, df_intraday: pd.DataFrame) -> Tuple[str, float]:
        """Generate signal with multi-timeframe confirmation"""
        # Get signals from each timeframe
        signal_daily, conf_daily = self.adaptive.generate_signal(df_daily)
        signal_intraday, conf_intraday = self.adaptive.generate_signal(df_intraday)
        
        # Confirm only if both timeframes agree
        if signal_daily == signal_intraday and signal_daily != "HOLD":
            combined_confidence = (conf_daily + conf_intraday) / 2.0
            return signal_daily, combined_confidence
        elif signal_daily == "HOLD" or signal_intraday == "HOLD":
            return "HOLD", 0.0
        else:
            # Conflicting signals, use higher confidence
            if conf_daily > conf_intraday:
                return signal_daily, conf_daily * 0.7
            else:
                return signal_intraday, conf_intraday * 0.7


class RobustMeanReversion:
    """Robust mean reversion with adaptive thresholds"""
    
    def __init__(self):
        pass
    
    def generate_signal(self, df: pd.DataFrame) -> Tuple[str, float]:
        """Generate mean reversion signal"""
        if len(df) < 100:
            return "HOLD", 0.0
        
        # Calculate adaptive z-score threshold
        returns = df["returns"]
        
        # Check for normality - adjust threshold accordingly
        recent_returns = returns.tail(30)
        skewness = recent_returns.skew()
        kurtosis = recent_returns.kurtosis()
        
        # Adaptive threshold (higher in non-normal markets)
        base_threshold = 2.0
        adjusted_threshold = base_threshold + (abs(skewness) * 0.5) + (kurtosis * 0.1)
        
        # Calculate z-score
        close = df["close"].tail(50)
        price = close.iloc[-1]
        mean = close.mean()
        std = close.std()
        
        z_score = (price - mean) / std if std > 0 else 0
        
        # Additional confirmation: check trend
        trend = df["returns"].tail(5).mean()
        
        # Generate signal
        if z_score < -adjusted_threshold and trend < 0:
            confidence = min(1.0, abs(z_score) / adjusted_threshold * 0.8)
            return "BUY", confidence
        elif z_score > adjusted_threshold and trend > 0:
            confidence = min(1.0, abs(z_score) / adjusted_threshold * 0.8)
            return "SELL", confidence
        
        return "HOLD", 0.0


class TrendFollowingEdge:
    """Trend following with market regime adaptation"""
    
    def __init__(self):
        self.signal_detector = SignalDetector()
    
    def generate_signal(self, df: pd.DataFrame) -> Tuple[str, float]:
        """Generate trend following signal"""
        if len(df) < 50:
            return "HOLD", 0.0
        
        # Check regime
        regime = self.signal_detector.detect_regime_change(df)
        
        # Calculate trend strength
        returns_short = df["returns"].tail(10).mean()
        returns_long = df["returns"].tail(30).mean()
        
        # Momentum acceleration
        momentum_trend = np.polyfit(range(30), df["returns"].tail(30).values, 1)[0]
        
        # Signal only in appropriate regimes
        if regime > 0.3:  # Bullish regime
            if returns_short > returns_long * 1.2 and momentum_trend > 0:
                confidence = min(1.0, returns_short * 100 * 0.5)
                return "BUY", confidence
        
        elif regime < -0.3:  # Bearish regime
            if returns_short < returns_long * 0.8 and momentum_trend < 0:
                confidence = min(1.0, abs(returns_short) * 100 * 0.5)
                return "SELL", confidence
        
        return "HOLD", 0.0
