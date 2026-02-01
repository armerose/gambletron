# Gambletron UI - Integration Guide

## Connecting the UI to Your Trading Engine

The UI is designed to work seamlessly with the existing Gambletron trading engine. Here's how to integrate them:

## 🔗 Integration Points

### 1. Agent Management Service

**Location**: `src/trading/agent.py` (Existing)

The UI's `AgentManager` service needs to integrate with your `ForexTradingAgent`:

```python
# In ui/backend/app/services/__init__.py

# Import the trading engine
from src.trading.agent import ForexTradingAgent

class AgentManager:
    def __init__(self, agents_dir: str = "data/agents"):
        # ... existing code ...
        self.active_agents = {}  # Store running agent instances
    
    async def start_agent(self, agent_id: str) -> ForexTradingAgent:
        """Start an agent instance"""
        config = self.get_agent(agent_id)
        agent = ForexTradingAgent(config_path="config/trading_config.yaml")
        
        # Store reference
        self.active_agents[agent_id] = agent
        
        # Start agent (implement based on your engine)
        await agent.run()
        
        return agent
    
    def stop_agent(self, agent_id: str) -> None:
        """Stop an agent instance"""
        if agent_id in self.active_agents:
            agent = self.active_agents[agent_id]
            # Stop agent
            del self.active_agents[agent_id]
```

### 2. Data Synchronization

**Location**: `src/data/processor.py` (Existing)

Connect the UI to your market data processor:

```python
# In ui/backend/app/api/__init__.py

from src.data.processor import MarketDataProcessor

processor = MarketDataProcessor(cache_enabled=True)

@router.get("/agents/{agent_id}/market-data")
async def get_market_data(agent_id: str, symbol: str = "EURUSD"):
    """Fetch market data for display"""
    df = await processor.fetch_data(symbol, "1h")
    return df.to_dict()
```

### 3. Strategy Integration

**Location**: `src/strategies/` (Existing)

The UI automatically detects available strategies:

```python
# In ui/backend/app/services/__init__.py

from src.strategies import (
    MeanReversionStrategy,
    TrendFollowingStrategy,
    MacdStrategy,
    RsiStrategy,
    EnsembleStrategy,
)

AVAILABLE_STRATEGIES = {
    "MeanReversion": MeanReversionStrategy,
    "TrendFollowing": TrendFollowingStrategy,
    "MACD": MacdStrategy,
    "RSI": RsiStrategy,
    "Ensemble": EnsembleStrategy,
}
```

### 4. Risk Management Integration

**Location**: `src/risk_management/risk.py` (Existing)

Connect risk monitoring to the UI:

```python
# In ui/backend/app/api/risk.py

from src.risk_management import RiskMonitor, Portfolio

@router.get("/risk/{agent_id}/metrics")
async def get_risk_metrics(agent_id: str):
    """Get current risk metrics from trading engine"""
    agent = get_active_agent(agent_id)
    
    return RiskMetrics(
        current_equity=agent.portfolio.current_equity,
        daily_loss_amount=agent.risk_monitor.current_daily_loss,
        daily_loss_percent=agent.risk_monitor.daily_loss_percent,
        # ... map other metrics
    )
```

### 5. Trade Logging

**Location**: `src/backtesting/engine.py` (Existing)

Connect trade execution to UI logging:

```python
# In ui/backend/app/api/logs.py

@router.get("/logs/trades/{agent_id}")
async def get_trade_logs(agent_id: str, limit: int = 100):
    """Fetch trade logs from trading engine"""
    agent = get_active_agent(agent_id)
    
    # Fetch trades from agent's trade history
    trades = agent.portfolio.get_trades()
    
    return {
        "total": len(trades),
        "trades": trades[-limit:]
    }
```

## 📊 Configuration Integration

### Mapping UI Config to Trading Engine

```python
# When user creates an agent in UI
{
    "name": "Agent 1",
    "agent_type": "forex",
    "initial_capital": 100000.0,
    "active_strategies": ["MeanReversion", "TrendFollowing"],
    "risk_config": {
        "max_daily_loss_percent": -5.0,
        "max_monthly_drawdown_percent": -20.0,
        "max_position_size_percent": 5.0,
    }
}

# Convert to trading engine config
config = {
    "risk_management": {
        "drawdown_limits": {
            "max_daily_drawdown": 5.0,
            "max_monthly_drawdown": 20.0,
        },
        "position_sizing": {
            "max_position_percent": 5.0,
        }
    },
    "strategies": {
        "mean_reversion": {...},
        "trend_following": {...},
        "ensemble": {
            "strategy_weights": {
                "mean_reversion": 0.33,
                "trend_following": 0.33,
                "macd": 0.17,
                "rsi": 0.17,
            }
        }
    }
}
```

## 🔄 Real-Time Updates

To provide real-time updates in the UI, implement WebSocket connections:

```python
# In ui/backend/app/api/__init__.py

from fastapi import WebSocket

@router.websocket("/ws/agent/{agent_id}/metrics")
async def websocket_agent_metrics(websocket: WebSocket, agent_id: str):
    await websocket.accept()
    
    while True:
        agent = get_active_agent(agent_id)
        
        # Send metrics to frontend
        metrics = {
            "status": agent.get_status(),
            "current_equity": agent.portfolio.current_equity,
            "pnl": agent.portfolio.pnl,
            "positions": len(agent.portfolio.open_positions),
        }
        
        await websocket.send_json(metrics)
        await asyncio.sleep(1)  # Update every second
```

## 🏗️ Deployment Architecture

### Development
```
ui/
├── backend (FastAPI)
├── frontend (Streamlit)
└── Existing Gambletron Core
```

### Production (Multi-Container)
```
Docker Network:
├── UI Backend (FastAPI)
├── UI Frontend (Streamlit)
├── Trading Engine (Python)
├── Database (PostgreSQL)
└── Redis Cache (Optional)
```

## 📋 Step-by-Step Integration

### Step 1: Start UI Backend
```bash
cd ui/backend
python main.py
```

### Step 2: Connect Trading Engine
```python
# In your main trading script
from ui.backend.app.services import AgentManager

agent_manager = AgentManager()

# Create agent through UI API
agent_config = agent_manager.create_agent({
    "name": "Main Trader",
    "strategies": ["MeanReversion", "TrendFollowing"],
})

# Start trading
agent = ForexTradingAgent()
await agent.run()
```

### Step 3: Start UI Frontend
```bash
cd ui/frontend
streamlit run app.py
```

## 📡 API Mapping to Existing Code

| UI Endpoint | Existing Code | Purpose |
|-------------|---------------|---------|
| `/api/agents/{id}/status` | `src/trading/agent.py` | Get agent status |
| `/api/agents/{id}/metrics` | `src/backtesting/engine.py` | Get performance metrics |
| `/api/strategies` | `src/strategies/` | List available strategies |
| `/api/risk/{id}/metrics` | `src/risk_management/risk.py` | Get risk metrics |
| `/api/logs/trades/{id}` | `src/backtesting/engine.py` | Get trade logs |
| `/api/logs/signals/{id}` | `src/strategies/base.py` | Get signal history |

## 🔌 Database Integration (Optional)

For production, connect to your database:

```python
# ui/backend/app/services/__init__.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://user:pass@localhost/gambletron"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# Use in services
def save_agent(agent: AgentConfig):
    with SessionLocal() as db:
        db.add(agent)
        db.commit()
```

## 🚀 Testing Integration

```python
# Test script: test_integration.py

import asyncio
from src.trading.agent import ForexTradingAgent
from ui.backend.app.services import AgentManager

async def test_integration():
    # Initialize manager
    manager = AgentManager()
    
    # Create agent
    config = {
        "name": "Test Agent",
        "agent_type": "forex",
        "active_strategies": ["MeanReversion"],
    }
    agent = manager.create_agent(config)
    
    # Create trading engine agent
    trading_agent = ForexTradingAgent()
    
    # Get status
    status = manager.get_agent_status(agent.id)
    print(f"Agent Status: {status}")
    
    # Run backtest
    await manager.backtest_agent(agent.id, "EURUSD", "2024-01-01", "2024-03-01")

asyncio.run(test_integration())
```

## 📚 Resources

- **FastAPI Integration**: https://fastapi.tiangolo.com/advanced/
- **Async Programming**: https://docs.python.org/3/library/asyncio.html
- **WebSockets**: https://fastapi.tiangolo.com/advanced/websockets/
- **Database ORM**: https://docs.sqlalchemy.org/

## 🎯 Next Steps

1. ✅ Review the UI architecture
2. ✅ Map UI endpoints to your trading engine
3. ✅ Implement data synchronization
4. ✅ Add real-time WebSocket updates
5. ✅ Deploy with Docker Compose
6. ✅ Add database persistence
7. ✅ Configure authentication
8. ✅ Set up monitoring and alerts

## 💡 Tips

- Use the UI API documentation (`/docs`) to explore endpoints
- Start with basic integration, then add advanced features
- Implement caching for frequently accessed data
- Use async/await for non-blocking operations
- Monitor performance and optimize as needed

---

**Your UI is ready to control your trading empire!** 🚀
