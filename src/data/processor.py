"""Core data fetching and processing module"""

import asyncio
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import pandas as pd
import numpy as np
import ccxt
import yfinance as yf
from loguru import logger


class DataSource(ABC):
    """Abstract base class for data sources"""
    
    @abstractmethod
    async def fetch_ohlcv(
        self,
        symbol: str,
        timeframe: str,
        since: Optional[int] = None,
        limit: int = 1000,
    ) -> pd.DataFrame:
        """Fetch OHLCV data"""
        pass
    
    @abstractmethod
    async def fetch_ticker(self, symbol: str) -> Dict:
        """Fetch current ticker information"""
        pass


class CCXTDataSource(DataSource):
    """CCXT-based data source for forex and crypto"""
    
    def __init__(self, exchange_name: str = "binance"):
        self.exchange = getattr(ccxt, exchange_name)()
        logger.info(f"Initialized CCXT exchange: {exchange_name}")
    
    async def fetch_ohlcv(
        self,
        symbol: str,
        timeframe: str,
        since: Optional[int] = None,
        limit: int = 1000,
    ) -> pd.DataFrame:
        """Fetch OHLCV data from CCXT exchange"""
        try:
            ohlcv = await asyncio.to_thread(
                self.exchange.fetch_ohlcv,
                symbol,
                timeframe,
                since,
                limit,
            )
            
            df = pd.DataFrame(
                ohlcv,
                columns=["timestamp", "open", "high", "low", "close", "volume"],
            )
            df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
            df = df.set_index("timestamp")
            
            return df
        except Exception as e:
            logger.error(f"Error fetching OHLCV from CCXT: {e}")
            raise
    
    async def fetch_ticker(self, symbol: str) -> Dict:
        """Fetch ticker information"""
        return await asyncio.to_thread(self.exchange.fetch_ticker, symbol)


class YFinanceDataSource(DataSource):
    """Yahoo Finance data source"""
    
    async def fetch_ohlcv(
        self,
        symbol: str,
        timeframe: str,
        since: Optional[int] = None,
        limit: int = 1000,
    ) -> pd.DataFrame:
        """Fetch OHLCV data from Yahoo Finance"""
        try:
            # Convert timeframe
            interval_map = {
                "1m": "1m",
                "5m": "5m",
                "15m": "15m",
                "1h": "1h",
                "1d": "1d",
                "1wk": "1wk",
                "1mo": "1mo",
            }
            interval = interval_map.get(timeframe, "1h")
            
            # Calculate start date
            if since:
                start = datetime.fromtimestamp(since / 1000)
            else:
                start = datetime.now() - timedelta(days=365)
            
            df = await asyncio.to_thread(
                yf.download,
                symbol,
                start=start,
                interval=interval,
                progress=False,
            )
            
            # Handle case where yfinance returns tuple or empty DataFrame
            if isinstance(df, tuple):
                logger.warning(f"YFinance returned tuple for {symbol}, likely no data")
                return pd.DataFrame()
            
            if df.empty:
                logger.warning(f"No data fetched for {symbol}")
                return df
            
            # Rename columns to match standard format
            if hasattr(df.columns, '__iter__'):
                df.columns = [str(c).lower() for c in df.columns]
            
            return df
        except Exception as e:
            logger.error(f"Error fetching from Yahoo Finance for {symbol}: {e}")
            return pd.DataFrame()
    
    async def fetch_ticker(self, symbol: str) -> Dict:
        """Fetch ticker information"""
        ticker = yf.Ticker(symbol)
        return ticker.info


class MarketDataProcessor:
    """Process and cache market data"""
    
    def __init__(self, cache_enabled: bool = True):
        self.cache: Dict[str, pd.DataFrame] = {}
        self.cache_enabled = cache_enabled
        self.data_sources: Dict[str, DataSource] = {}
    
    def register_source(self, name: str, source: DataSource) -> None:
        """Register a data source"""
        self.data_sources[name] = source
    
    async def fetch_data(
        self,
        symbol: str,
        timeframe: str,
        source: str = "yfinance",
        cache: bool = True,
    ) -> pd.DataFrame:
        """
        Fetch market data with caching.
        
        Args:
            symbol: Trading symbol (e.g., 'EURUSD')
            timeframe: Timeframe (e.g., '1h', '1d')
            source: Data source name
            cache: Use cache if available
            
        Returns:
            DataFrame with OHLCV data
        """
        cache_key = f"{symbol}_{timeframe}_{source}"
        
        # Check cache
        if cache and cache_key in self.cache:
            logger.debug(f"Using cached data for {cache_key}")
            return self.cache[cache_key]
        
        # Fetch data
        if source not in self.data_sources:
            raise ValueError(f"Unknown data source: {source}")
        
        df = await self.data_sources[source].fetch_ohlcv(
            symbol,
            timeframe,
        )
        
        # Cache data
        if self.cache_enabled and cache:
            self.cache[cache_key] = df
        
        return df
    
    def calculate_returns(self, df: pd.DataFrame) -> pd.Series:
        """Calculate returns from price data"""
        return df["close"].pct_change().dropna()
    
    def calculate_log_returns(self, df: pd.DataFrame) -> pd.Series:
        """Calculate log returns"""
        return np.log(df["close"] / df["close"].shift(1)).dropna()
    
    def calculate_atr(
        self,
        df: pd.DataFrame,
        period: int = 14,
    ) -> pd.Series:
        """Calculate Average True Range (ATR)"""
        high_low = df["high"] - df["low"]
        high_close = (df["high"] - df["close"].shift()).abs()
        low_close = (df["low"] - df["close"].shift()).abs()
        
        tr = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
        atr = tr.rolling(window=period).mean()
        
        return atr
    
    def calculate_rsi(
        self,
        df: pd.DataFrame,
        period: int = 14,
    ) -> pd.Series:
        """Calculate Relative Strength Index (RSI)"""
        delta = df["close"].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        
        return rsi
    
    def calculate_macd(
        self,
        df: pd.DataFrame,
        fast: int = 12,
        slow: int = 26,
        signal: int = 9,
    ) -> Tuple[pd.Series, pd.Series, pd.Series]:
        """Calculate MACD"""
        ema_fast = df["close"].ewm(span=fast).mean()
        ema_slow = df["close"].ewm(span=slow).mean()
        
        macd = ema_fast - ema_slow
        signal_line = macd.ewm(span=signal).mean()
        histogram = macd - signal_line
        
        return macd, signal_line, histogram
    
    def calculate_bollinger_bands(
        self,
        df: pd.DataFrame,
        period: int = 20,
        std_dev: float = 2.0,
    ) -> Tuple[pd.Series, pd.Series, pd.Series]:
        """Calculate Bollinger Bands"""
        sma = df["close"].rolling(window=period).mean()
        std = df["close"].rolling(window=period).std()
        
        upper_band = sma + (std * std_dev)
        lower_band = sma - (std * std_dev)
        
        return upper_band, sma, lower_band
    
    def calculate_ema(
        self,
        df: pd.DataFrame,
        period: int = 12,
    ) -> pd.Series:
        """Calculate Exponential Moving Average (EMA)"""
        return df["close"].ewm(span=period, adjust=False).mean()
    
    def calculate_sma(
        self,
        df: pd.DataFrame,
        period: int = 20,
    ) -> pd.Series:
        """Calculate Simple Moving Average (SMA)"""
        return df["close"].rolling(window=period).mean()


class FeatureEngineer:
    """Feature engineering for ML models"""
    
    @staticmethod
    def create_lag_features(
        df: pd.DataFrame,
        lags: List[int] = [1, 2, 3, 5],
        columns: List[str] = ["close"],
    ) -> pd.DataFrame:
        """Create lag features"""
        features = df.copy()
        
        for col in columns:
            for lag in lags:
                features[f"{col}_lag_{lag}"] = features[col].shift(lag)
        
        return features.dropna()
    
    @staticmethod
    def create_rolling_features(
        df: pd.DataFrame,
        windows: List[int] = [5, 10, 20],
        columns: List[str] = ["close"],
        agg_funcs: List[str] = ["mean", "std", "min", "max"],
    ) -> pd.DataFrame:
        """Create rolling window features"""
        features = df.copy()
        
        for col in columns:
            for window in windows:
                for func in agg_funcs:
                    feat_name = f"{col}_rolling_{window}_{func}"
                    features[feat_name] = features[col].rolling(window).agg(func)
        
        return features.dropna()
    
    @staticmethod
    def normalize_features(df: pd.DataFrame) -> pd.DataFrame:
        """Normalize features to [-1, 1]"""
        normalized = df.copy()
        
        for col in df.columns:
            min_val = df[col].min()
            max_val = df[col].max()
            normalized[col] = 2 * (df[col] - min_val) / (max_val - min_val) - 1
        
        return normalized
