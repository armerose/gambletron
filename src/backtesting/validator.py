"""
Comprehensive backtesting validation suite
Tests strategies on real market data with walk-forward analysis
"""

import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
import json
from pathlib import Path
from typing import Dict, List

from src.backtesting.advanced import AdvancedBacktester, BacktestMetrics
from src.strategies.advanced import (
    AdaptiveStrategy, 
    RobustMeanReversion,
    TrendFollowingEdge,
    MultiTimeframeStrategy,
)


class StrategyValidator:
    """Validate strategies on real historical data"""
    
    def __init__(self, data_dir: str = "backtest_data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        self.results = {}
    
    def fetch_historical_data(
        self,
        symbol: str,
        start_date: str,
        end_date: str,
        interval: str = "1d",
    ) -> pd.DataFrame:
        """Fetch and prepare historical data"""
        print(f"Fetching {symbol} from {start_date} to {end_date}...")
        
        df = yf.download(
            symbol,
            start=start_date,
            end=end_date,
            interval=interval,
            progress=False,
        )
        
        # Handle case where yfinance returns tuple
        if isinstance(df, tuple):
            df = df[0] if df else pd.DataFrame()
        
        if df.empty:
            raise ValueError(f"No data found for {symbol}")
        
        # Handle MultiIndex columns from yfinance
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = [col[0].lower() for col in df.columns]
        else:
            df.columns = [str(col).lower().replace(' ', '_') for col in df.columns]
        
        # Calculate returns
        df["returns"] = df["close"].pct_change()
        
        return df
    
    def test_strategy(
        self,
        strategy_name: str,
        strategy_func,
        df: pd.DataFrame,
        initial_capital: float = 100000,
    ) -> BacktestMetrics:
        """Test a strategy on historical data"""
        print(f"\n{'='*60}")
        print(f"Testing {strategy_name}")
        print(f"{'='*60}")
        print(f"Data points: {len(df)}")
        print(f"Date range: {df.index[0].date()} to {df.index[-1].date()}")
        
        backtester = AdvancedBacktester(
            initial_capital=initial_capital,
            max_position_pct=0.02,
        )
        
        metrics = backtester.run(
            df,
            signal_func=strategy_func,
            symbol=df.columns[0].split('_')[0].upper(),
            warmup_periods=50,
        )
        
        print(metrics.print_report())
        
        return metrics
    
    def walk_forward_test(
        self,
        strategy_name: str,
        strategy_func,
        df: pd.DataFrame,
        train_period: int = 252,  # 1 year
        test_period: int = 63,    # ~3 months
        step: int = 21,           # ~1 month
    ) -> Dict:
        """Perform walk-forward analysis"""
        print(f"\n{'='*60}")
        print(f"Walk-Forward Analysis: {strategy_name}")
        print(f"{'='*60}")
        
        results = {
            "strategy": strategy_name,
            "total_tests": 0,
            "avg_return": 0,
            "avg_sharpe": 0,
            "avg_win_rate": 0,
            "profitable_periods": 0,
            "test_results": [],
        }
        
        total_return = 0
        total_sharpe = 0
        total_win_rate = 0
        profitable = 0
        
        i = 0
        while i + train_period + test_period < len(df):
            train_data = df.iloc[i:i + train_period]
            test_data = df.iloc[i + train_period:i + train_period + test_period]
            
            period_num = len(results["test_results"]) + 1
            print(f"\nPeriod {period_num}: {test_data.index[0].date()} to {test_data.index[-1].date()}")
            
            # Run test
            backtester = AdvancedBacktester(initial_capital=100000, max_position_pct=0.02)
            metrics = backtester.run(test_data, signal_func=strategy_func, warmup_periods=20)
            
            print(f"  Return: {metrics.total_return:.2%} | Sharpe: {metrics.sharpe_ratio:.2f} | Win Rate: {metrics.win_rate:.1%}")
            
            results["test_results"].append({
                "period": period_num,
                "return": float(metrics.total_return),
                "sharpe": float(metrics.sharpe_ratio),
                "win_rate": float(metrics.win_rate),
                "trades": metrics.total_trades,
            })
            
            total_return += metrics.total_return
            total_sharpe += metrics.sharpe_ratio
            total_win_rate += metrics.win_rate
            
            if metrics.total_return > 0:
                profitable += 1
            
            i += step
        
        results["total_tests"] = len(results["test_results"])
        if results["total_tests"] > 0:
            results["avg_return"] = total_return / results["total_tests"]
            results["avg_sharpe"] = total_sharpe / results["total_tests"]
            results["avg_win_rate"] = total_win_rate / results["total_tests"]
            results["profitable_periods"] = profitable
        
        print(f"\n{'─'*60}")
        print(f"Walk-Forward Summary:")
        print(f"  Total Periods: {results['total_tests']}")
        print(f"  Profitable Periods: {results['profitable_periods']}/{results['total_tests']}")
        print(f"  Avg Return: {results['avg_return']:.2%}")
        print(f"  Avg Sharpe: {results['avg_sharpe']:.2f}")
        print(f"  Avg Win Rate: {results['avg_win_rate']:.1%}")
        print(f"{'─'*60}")
        
        return results
    
    def analyze_drawdown_recovery(
        self,
        metrics: BacktestMetrics,
    ) -> Dict:
        """Analyze drawdown and recovery patterns"""
        equity = pd.Series(metrics.equity_curve)
        running_max = equity.cummax()
        drawdown = (equity - running_max) / running_max
        
        analysis = {
            "max_drawdown": float(metrics.max_drawdown),
            "avg_drawdown": float(drawdown.mean()),
            "drawdown_recovery_time": 0,
            "consecutive_loss_streaks": [],
        }
        
        # Find max drawdown recovery time
        if len(drawdown) > 0:
            max_dd_idx = drawdown.idxmin()
            recovery_idx = (drawdown[max_dd_idx:] >= 0).idxmax()
            if recovery_idx > max_dd_idx:
                analysis["drawdown_recovery_time"] = recovery_idx - max_dd_idx
        
        # Analyze loss streaks
        streak = 0
        for trade in metrics.trades:
            if trade.net_pnl <= 0:
                streak += 1
            else:
                if streak > 0:
                    analysis["consecutive_loss_streaks"].append(streak)
                streak = 0
        
        return analysis
    
    def compare_strategies(
        self,
        symbols: List[str],
        start_date: str,
        end_date: str,
    ) -> Dict:
        """Compare multiple strategies on same data"""
        strategies = {
            "Adaptive": AdaptiveStrategy().generate_signal,
            "Mean Reversion": RobustMeanReversion().generate_signal,
            "Trend Following": TrendFollowingEdge().generate_signal,
        }
        
        comparison_results = {}
        
        for symbol in symbols:
            print(f"\n{'='*60}")
            print(f"Symbol: {symbol}")
            print(f"{'='*60}")
            
            df = self.fetch_historical_data(symbol, start_date, end_date)
            symbol_results = {}
            
            for strat_name, strat_func in strategies.items():
                metrics = self.test_strategy(strat_name, strat_func, df)
                
                symbol_results[strat_name] = {
                    "return": float(metrics.total_return),
                    "sharpe": float(metrics.sharpe_ratio),
                    "win_rate": float(metrics.win_rate),
                    "max_drawdown": float(metrics.max_drawdown),
                    "profit_factor": float(metrics.profit_factor),
                    "trades": metrics.total_trades,
                }
            
            comparison_results[symbol] = symbol_results
        
        # Print comparison table
        print(f"\n{'='*60}")
        print("STRATEGY COMPARISON")
        print(f"{'='*60}")
        
        for symbol, results in comparison_results.items():
            print(f"\n{symbol}:")
            print(f"{'Strategy':<20} {'Return':<12} {'Sharpe':<10} {'Win Rate':<12} {'Max DD':<12}")
            print("─" * 66)
            
            for strat, metrics in results.items():
                print(
                    f"{strat:<20} {metrics['return']:>10.2%}  "
                    f"{metrics['sharpe']:>8.2f}  "
                    f"{metrics['win_rate']:>10.1%}  "
                    f"{metrics['max_drawdown']:>10.2%}"
                )
        
        return comparison_results


def run_comprehensive_backtest():
    """Run complete backtesting suite"""
    validator = StrategyValidator()
    
    # Test on multiple symbols and timeframes
    symbols = ["SPY", "QQQ", "IWM"]  # Stock index ETFs
    start_date = "2022-01-01"
    end_date = "2025-02-01"
    
    print("\n" + "="*60)
    print("GAMBLETRON STRATEGY VALIDATION SUITE")
    print("="*60)
    print(f"Testing period: {start_date} to {end_date}")
    print(f"Symbols: {', '.join(symbols)}")
    print("="*60)
    
    # Fetch data
    all_results = {}
    
    for symbol in symbols:
        try:
            df = validator.fetch_historical_data(symbol, start_date, end_date)
            symbol_results = {}
            
            # Test each strategy
            symbol_results["adaptive"] = validator.test_strategy(
                f"Adaptive Strategy ({symbol})",
                AdaptiveStrategy().generate_signal,
                df,
            )
            
            symbol_results["mean_reversion"] = validator.test_strategy(
                f"Mean Reversion ({symbol})",
                RobustMeanReversion().generate_signal,
                df,
            )
            
            symbol_results["trend_following"] = validator.test_strategy(
                f"Trend Following ({symbol})",
                TrendFollowingEdge().generate_signal,
                df,
            )
            
            # Walk-forward analysis
            wf_results = validator.walk_forward_test(
                f"Adaptive ({symbol})",
                AdaptiveStrategy().generate_signal,
                df,
                train_period=252,
                test_period=63,
                step=21,
            )
            
            all_results[symbol] = {
                "strategies": symbol_results,
                "walk_forward": wf_results,
            }
            
        except Exception as e:
            print(f"Error testing {symbol}: {e}")
            continue
    
    # Save results
    results_file = "backtest_results.json"
    with open(results_file, "w") as f:
        json.dump(all_results, f, indent=2, default=str)
    
    print(f"\n✓ Results saved to {results_file}")
    
    return all_results


if __name__ == "__main__":
    results = run_comprehensive_backtest()
