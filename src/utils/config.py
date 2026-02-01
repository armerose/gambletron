"""Configuration loading and management"""

import os
from pathlib import Path
from typing import Any, Dict
import yaml
from pydantic import BaseModel, ConfigDict


class Settings(BaseModel):
    """Application settings from environment variables"""
    
    model_config = ConfigDict(env_file=".env", env_file_encoding="utf-8")
    
    # API Keys
    oanda_api_key: str = ""
    oanda_account_id: str = ""
    oanda_environment: str = "practice"
    
    # Database
    database_url: str = "postgresql://user:password@localhost/gambletron"
    redis_url: str = "redis://localhost:6379/0"
    
    # Trading
    trading_mode: str = "paper_trading"
    max_position_size: float = 0.05
    max_drawdown: float = 0.20
    account_currency: str = "USD"
    
    # Model Configuration
    model_checkpoint_path: str = "./models/checkpoints"
    data_cache_path: str = "./data/cache"
    
    # Logging
    log_level: str = "INFO"
    log_file: str = "./logs/gambletron.log"
    
    # Development
    debug: bool = False
    env: str = "production"


def load_config(config_path: str = "config/trading_config.yaml") -> Dict[str, Any]:
    """
    Load YAML configuration file.
    
    Args:
        config_path: Path to YAML configuration file
        
    Returns:
        Dictionary containing configuration
    """
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Configuration file not found: {config_path}")
    
    with open(config_path, "r") as f:
        config = yaml.safe_load(f)
    
    return config


def get_settings() -> Settings:
    """Get application settings from environment variables"""
    return Settings()
