"""Logging configuration and utilities"""

import os
from pathlib import Path
from loguru import logger
from typing import Optional


def setup_logger(
    name: str,
    log_level: str = "INFO",
    log_file: Optional[str] = None,
) -> None:
    """
    Setup logger with file and console handlers.
    
    Args:
        name: Logger name
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Path to log file (optional)
    """
    # Remove default handler
    logger.remove()
    
    # Console handler
    logger.add(
        lambda msg: print(msg, end=""),
        level=log_level,
        format="<level>{time:YYYY-MM-DD HH:mm:ss}</level> | <level>{level: <8}</level> | {name}:{function}:{line} - <level>{message}</level>",
    )
    
    # File handler if specified
    if log_file:
        log_dir = Path(log_file).parent
        log_dir.mkdir(parents=True, exist_ok=True)
        logger.add(
            log_file,
            level=log_level,
            format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
            rotation="500 MB",
            retention="7 days",
        )


def get_logger(name: str):
    """Get logger instance"""
    return logger.bind(name=name)
