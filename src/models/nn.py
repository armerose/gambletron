"""Machine Learning Models for Forex Prediction"""

import numpy as np
import pandas as pd
from typing import Tuple
from loguru import logger

try:
    import torch
    import torch.nn as nn
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

try:
    from sklearn.preprocessing import StandardScaler
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


class LSTMPredictor(nn.Module):
    """LSTM-based price prediction model"""
    
    def __init__(
        self,
        input_size: int = 1,
        hidden_size: int = 128,
        num_layers: int = 3,
        output_size: int = 1,
        dropout: float = 0.3,
    ):
        super().__init__()
        
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            dropout=dropout if num_layers > 1 else 0,
            batch_first=True,
        )
        
        self.fc = nn.Sequential(
            nn.Linear(hidden_size, 64),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(64, output_size),
        )
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass"""
        lstm_out, _ = self.lstm(x)
        # Take only the last output
        last_out = lstm_out[:, -1, :]
        output = self.fc(last_out)
        return output


class TransformerPredictor(nn.Module):
    """Transformer-based price prediction model"""
    
    def __init__(
        self,
        d_model: int = 256,
        n_heads: int = 8,
        n_layers: int = 4,
        output_size: int = 1,
        dropout: float = 0.1,
    ):
        super().__init__()
        
        self.embedding = nn.Linear(1, d_model)
        
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=n_heads,
            dropout=dropout,
            batch_first=True,
        )
        
        self.transformer = nn.TransformerEncoder(
            encoder_layer,
            num_layers=n_layers,
        )
        
        self.fc = nn.Sequential(
            nn.Linear(d_model, 128),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(128, output_size),
        )
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass"""
        # x: (batch, seq_len, 1)
        x = self.embedding(x)  # (batch, seq_len, d_model)
        x = self.transformer(x)  # (batch, seq_len, d_model)
        x = x[:, -1, :]  # Take last output
        x = self.fc(x)  # (batch, output_size)
        return x


class EnsemblePredictor:
    """Ensemble of multiple ML models"""
    
    def __init__(self):
        self.models = {}
        self.weights = {}
        self.scaler = StandardScaler() if SKLEARN_AVAILABLE else None
    
    def add_model(self, name: str, model, weight: float = 1.0) -> None:
        """Add a model to the ensemble"""
        self.models[name] = model
        self.weights[name] = weight
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """
        Make predictions using ensemble voting.
        
        Args:
            X: Input features
            
        Returns:
            Ensemble predictions
        """
        predictions = []
        total_weight = sum(self.weights.values())
        
        for name, model in self.models.items():
            weight = self.weights.get(name, 1.0)
            pred = model.predict(X)
            predictions.append(pred * weight / total_weight)
        
        return np.mean(predictions, axis=0)
    
    def fit(self, X: np.ndarray, y: np.ndarray) -> None:
        """Fit the ensemble"""
        if self.scaler:
            X = self.scaler.fit_transform(X)
        
        for model in self.models.values():
            if hasattr(model, "fit"):
                model.fit(X, y)
