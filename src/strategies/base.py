"""Trading strategies module"""

from abc import ABC, abstractmethod
from typing import Optional, Dict, List, Tuple
import pandas as pd
import numpy as np
from loguru import logger


class BaseStrategy(ABC):
    """Base class for trading strategies"""
    
    def __init__(self, name: str, params: Dict = None):
        self.name = name
        self.params = params or {}
        self.signals: List[Dict] = []
    
    @abstractmethod
    def generate_signal(
        self,
        df: pd.DataFrame,
    ) -> Tuple[str, float]:  # Signal type (BUY, SELL, HOLD) and confidence
        """Generate trading signal"""
        pass
    
    def add_signal(
        self,
        timestamp: pd.Timestamp,
        signal_type: str,
        confidence: float,
        price: float,
    ) -> None:
        """Record a signal"""
        self.signals.append({
            "timestamp": timestamp,
            "type": signal_type,
            "confidence": confidence,
            "price": price,
        })


class MeanReversionStrategy(BaseStrategy):
    """Mean reversion trading strategy"""
    
    def __init__(self, params: Dict = None):
        default_params = {
            "window": 20,
            "std_threshold": 2.0,
            "min_confidence": 0.65,
        }
        if params:
            default_params.update(params)
        
        super().__init__("MeanReversion", default_params)
    
    def generate_signal(self, df: pd.DataFrame) -> Tuple[str, float]:
        """Generate mean reversion signal"""
        if len(df) < self.params["window"]:
            return "HOLD", 0.0
        
        close = df["close"].iloc[-1]
        sma = df["close"].rolling(window=self.params["window"]).mean().iloc[-1]
        std = df["close"].rolling(window=self.params["window"]).std().iloc[-1]
        
        upper_band = sma + (std * self.params["std_threshold"])
        lower_band = sma - (std * self.params["std_threshold"])
        
        # Buy signal when price is below lower band
        if close < lower_band:
            z_score = (close - sma) / std if std > 0 else 0
            confidence = min(1.0, abs(z_score) / self.params["std_threshold"])
            return "BUY", confidence
        
        # Sell signal when price is above upper band
        elif close > upper_band:
            z_score = (close - sma) / std if std > 0 else 0
            confidence = min(1.0, abs(z_score) / self.params["std_threshold"])
            return "SELL", confidence
        
        return "HOLD", 0.0


class TrendFollowingStrategy(BaseStrategy):
    """Trend following strategy"""
    
    def __init__(self, params: Dict = None):
        default_params = {
            "ma_short": 12,
            "ma_long": 26,
            "min_slope_threshold": 0.005,
            "min_confidence": 0.60,
        }
        if params:
            default_params.update(params)
        
        super().__init__("TrendFollowing", default_params)
    
    def generate_signal(self, df: pd.DataFrame) -> Tuple[str, float]:
        """Generate trend following signal"""
        if len(df) < self.params["ma_long"]:
            return "HOLD", 0.0
        
        ma_short = df["close"].ewm(span=self.params["ma_short"]).mean()
        ma_long = df["close"].ewm(span=self.params["ma_long"]).mean()
        
        short_current = ma_short.iloc[-1]
        short_prev = ma_short.iloc[-2]
        long_current = ma_long.iloc[-1]
        
        # Check if short MA is above long MA and trending up
        if short_current > long_current:
            slope = (short_current - short_prev) / short_prev
            if slope > self.params["min_slope_threshold"]:
                confidence = min(1.0, slope / self.params["min_slope_threshold"])
                return "BUY", confidence
        
        # Check if short MA is below long MA and trending down
        elif short_current < long_current:
            slope = (short_prev - short_current) / short_prev
            if slope > self.params["min_slope_threshold"]:
                confidence = min(1.0, slope / self.params["min_slope_threshold"])
                return "SELL", confidence
        
        return "HOLD", 0.0


class MacdStrategy(BaseStrategy):
    """MACD-based strategy"""
    
    def __init__(self, params: Dict = None):
        default_params = {
            "fast": 12,
            "slow": 26,
            "signal": 9,
            "min_confidence": 0.65,
        }
        if params:
            default_params.update(params)
        
        super().__init__("MACD", default_params)
    
    def generate_signal(self, df: pd.DataFrame) -> Tuple[str, float]:
        """Generate MACD signal"""
        if len(df) < self.params["slow"]:
            return "HOLD", 0.0
        
        ema_fast = df["close"].ewm(span=self.params["fast"]).mean()
        ema_slow = df["close"].ewm(span=self.params["slow"]).mean()
        
        macd = ema_fast - ema_slow
        signal_line = macd.ewm(span=self.params["signal"]).mean()
        histogram = macd - signal_line
        
        # Get current and previous histogram
        hist_current = histogram.iloc[-1]
        hist_prev = histogram.iloc[-2]
        
        # Bullish crossover
        if hist_prev <= 0 and hist_current > 0:
            confidence = min(1.0, abs(hist_current) / abs(hist_prev) if hist_prev != 0 else 0.8)
            return "BUY", confidence
        
        # Bearish crossover
        elif hist_prev >= 0 and hist_current < 0:
            confidence = min(1.0, abs(hist_current) / abs(hist_prev) if hist_prev != 0 else 0.8)
            return "SELL", confidence
        
        return "HOLD", 0.0


class RsiStrategy(BaseStrategy):
    """RSI-based strategy"""
    
    def __init__(self, params: Dict = None):
        default_params = {
            "period": 14,
            "oversold": 30,
            "overbought": 70,
            "min_confidence": 0.65,
        }
        if params:
            default_params.update(params)
        
        super().__init__("RSI", default_params)
    
    def generate_signal(self, df: pd.DataFrame) -> Tuple[str, float]:
        """Generate RSI signal"""
        if len(df) < self.params["period"]:
            return "HOLD", 0.0
        
        # Calculate RSI
        delta = df["close"].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=self.params["period"]).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=self.params["period"]).mean()
        
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        
        rsi_current = rsi.iloc[-1]
        
        # Oversold (buy signal)
        if rsi_current < self.params["oversold"]:
            confidence = (self.params["oversold"] - rsi_current) / self.params["oversold"]
            return "BUY", confidence
        
        # Overbought (sell signal)
        elif rsi_current > self.params["overbought"]:
            confidence = (rsi_current - self.params["overbought"]) / (100 - self.params["overbought"])
            return "SELL", confidence
        
        return "HOLD", 0.0


class EnsembleStrategy(BaseStrategy):
    """Ensemble strategy combining multiple strategies"""
    
    def __init__(self, strategies: List[BaseStrategy] = None, weights: Dict[str, float] = None):
        self.sub_strategies = strategies or []
        self.weights = weights or {s.name: 1.0 / len(strategies) for s in strategies}
        
        super().__init__("Ensemble", {"num_strategies": len(strategies)})
    
    def add_strategy(self, strategy: BaseStrategy, weight: float = None) -> None:
        """Add a strategy to the ensemble"""
        self.sub_strategies.append(strategy)
        if weight is None:
            weight = 1.0 / len(self.sub_strategies)
        self.weights[strategy.name] = weight
    
    def generate_signal(self, df: pd.DataFrame) -> Tuple[str, float]:
        """Generate ensemble signal by combining sub-strategies"""
        if not self.sub_strategies:
            return "HOLD", 0.0
        
        buy_score = 0.0
        sell_score = 0.0
        
        for strategy in self.sub_strategies:
            signal, confidence = strategy.generate_signal(df)
            weight = self.weights.get(strategy.name, 1.0 / len(self.sub_strategies))
            
            if signal == "BUY":
                buy_score += confidence * weight
            elif signal == "SELL":
                sell_score += confidence * weight
        
        # Determine final signal
        if buy_score > sell_score and buy_score > 0.5:
            return "BUY", buy_score
        elif sell_score > buy_score and sell_score > 0.5:
            return "SELL", sell_score
        else:
            return "HOLD", 0.0
    
    def set_strategy_weight(self, strategy_name: str, weight: float) -> None:
        """Update strategy weight"""
        self.weights[strategy_name] = weight
        # Normalize weights
        total = sum(self.weights.values())
        self.weights = {k: v / total for k, v in self.weights.items()}
