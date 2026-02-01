"""Gambletron API server with Alpaca paper/live integration."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import json
import os
import random
import uuid

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import asyncio

from .db import init_db, load_integrations, load_settings, save_integration, save_settings, delete_integration

try:
    from alpaca.trading.client import TradingClient
    from alpaca.common.exceptions import APIError
except Exception:  # pragma: no cover - optional dependency
    TradingClient = None
    APIError = Exception


app = FastAPI(title="Gambletron API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================
# Models
# =====================

class Agent(BaseModel):
    id: str
    name: str
    strategy: str
    status: str
    equity: float
    equity_change: float
    equity_change_pct: float
    trades_today: int
    win_rate: float
    sharpe_ratio: float
    max_drawdown: float
    created_at: str


class Strategy(BaseModel):
    id: str
    name: str
    description: str
    type: str
    agents: int
    win_rate: float
    avg_return: float


class DataSource(BaseModel):
    id: str
    name: str
    type: str
    status: str
    symbols: int
    last_update: str


class IntegrationField(BaseModel):
    key: str
    label: str
    type: str
    required: bool = False
    placeholder: Optional[str] = None


class Integration(BaseModel):
    id: str
    name: str
    description: str
    status: str
    provider: str
    category: str
    icon: str
    fields: List[IntegrationField] = Field(default_factory=list)
    config: Dict[str, Any] = Field(default_factory=dict)
    last_tested_at: Optional[str] = None
    mode: Optional[str] = None


class Settings(BaseModel):
    email: str
    api_key: str
    max_drawdown: float
    max_leverage: float
    notify_profit: bool
    notify_loss: bool
    two_factor: bool


class OrderRequest(BaseModel):
    integration_id: str
    symbol: str
    qty: float
    side: str
    order_type: str = Field(default="market", validation_alias="type")
    time_in_force: str = "day"


# =====================
# In-memory store
# =====================

class Store:
    def __init__(self) -> None:
        now = datetime.utcnow().isoformat() + "Z"
        self.agents: Dict[str, Agent] = {
            "agent-001": Agent(
                id="agent-001",
                name="Momentum Trader Alpha",
                strategy="Momentum",
                status="running",
                equity=125000,
                equity_change=25000,
                equity_change_pct=25.0,
                trades_today=12,
                win_rate=0.67,
                sharpe_ratio=1.85,
                max_drawdown=-0.08,
                created_at="2024-01-15T08:30:00Z",
            ),
            "agent-002": Agent(
                id="agent-002",
                name="Mean Reversion Bot",
                strategy="Mean Reversion",
                status="paused",
                equity=98000,
                equity_change=-2000,
                equity_change_pct=-2.0,
                trades_today=8,
                win_rate=0.52,
                sharpe_ratio=1.12,
                max_drawdown=-0.12,
                created_at="2024-01-20T10:15:00Z",
            ),
        }
        self.strategies: Dict[str, Strategy] = {
            "strategy-001": Strategy(
                id="strategy-001",
                name="Momentum",
                description="Trend-following strategy based on momentum indicators",
                type="Trend",
                agents=1,
                win_rate=0.65,
                avg_return=0.28,
            ),
            "strategy-002": Strategy(
                id="strategy-002",
                name="Mean Reversion",
                description="Statistical arbitrage using mean reversion principles",
                type="Reversion",
                agents=1,
                win_rate=0.52,
                avg_return=0.12,
            ),
        }
        self.data_sources: Dict[str, DataSource] = {
            "ds-001": DataSource(
                id="ds-001",
                name="Polygon.io",
                type="market_data",
                status="connected",
                symbols=5000,
                last_update=now,
            ),
            "ds-002": DataSource(
                id="ds-002",
                name="IB Gateway",
                type="brokerage",
                status="disconnected",
                symbols=12000,
                last_update=now,
            ),
        }
        self.integrations: Dict[str, Integration] = {}
        self._seed_integrations()
        self.settings = Settings(
            email="trader@example.com",
            api_key="****-****-****-****",
            max_drawdown=10,
            max_leverage=2,
            notify_profit=True,
            notify_loss=True,
            two_factor=False,
        )
        self.logs_system = self._seed_logs()
        self.logs_trades = self._seed_trade_logs()
        self.logs_signals = []
        self.positions = self._seed_positions()
        self.trades = self._seed_trades()
        self.trade_streams: List[asyncio.Queue] = []
        self.position_streams: List[asyncio.Queue] = []

    def _seed_integrations(self) -> None:
        def alpaca_fields() -> List[IntegrationField]:
            return [
                IntegrationField(
                    key="api_key",
                    label="API Key",
                    type="text",
                    required=True,
                    placeholder="Your Alpaca API key",
                ),
                IntegrationField(
                    key="api_secret",
                    label="API Secret",
                    type="password",
                    required=True,
                    placeholder="Your Alpaca API secret",
                ),
                IntegrationField(
                    key="base_url",
                    label="Base URL",
                    type="url",
                    required=True,
                    placeholder="https://paper-api.alpaca.markets",
                ),
            ]

        self.integrations = {
            "int-alpaca-paper": Integration(
                id="int-alpaca-paper",
                name="Alpaca Paper Trading",
                description="Paper trading account connection for Alpaca.",
                status="inactive",
                provider="alpaca",
                category="brokerage",
                icon="alpaca",
                fields=alpaca_fields(),
                config={
                    "base_url": os.getenv("ALPACA_PAPER_BASE_URL", "https://paper-api.alpaca.markets"),
                },
                mode="paper",
            ),
            "int-alpaca-live": Integration(
                id="int-alpaca-live",
                name="Alpaca Live Trading",
                description="Live trading account connection for Alpaca.",
                status="inactive",
                provider="alpaca",
                category="brokerage",
                icon="alpaca",
                fields=alpaca_fields(),
                config={
                    "base_url": os.getenv("ALPACA_LIVE_BASE_URL", "https://api.alpaca.markets"),
                },
                mode="live",
            ),
            "int-telegram": Integration(
                id="int-telegram",
                name="Telegram Alerts",
                description="Instant notifications on Telegram",
                status="active",
                provider="telegram",
                category="notifications",
                icon="telegram",
                fields=[
                    IntegrationField(key="bot_token", label="Bot Token", type="password", required=True),
                    IntegrationField(key="chat_id", label="Chat ID", type="text", required=True),
                ],
                config={},
                last_tested_at="2024-02-01T16:41:00Z",
            ),
            "int-slack": Integration(
                id="int-slack",
                name="Slack Integration",
                description="Trade execution logs in Slack",
                status="active",
                provider="slack",
                category="notifications",
                icon="slack",
                fields=[
                    IntegrationField(key="webhook_url", label="Webhook URL", type="url", required=True),
                ],
                config={},
                last_tested_at="2024-02-01T16:42:00Z",
            ),
        }

    def load_persistent_state(self) -> None:
        init_db()
        integrations = load_integrations({key: integration.model_dump() for key, integration in self.integrations.items()})
        self.integrations = {key: Integration(**payload) for key, payload in integrations.items()}
        settings = load_settings(self.settings.model_dump())
        self.settings = Settings(**settings)

    def _seed_logs(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "log-001",
                "level": "info",
                "message": "Agent momentum_001 started trading session",
                "timestamp": "2024-02-01T16:45:00Z",
                "agent": "Momentum Trader Alpha",
            },
            {
                "id": "log-002",
                "level": "warning",
                "message": "High drawdown detected: 8.2%",
                "timestamp": "2024-02-01T16:43:15Z",
                "agent": "Risk Monitor",
            },
        ]

    def _seed_trade_logs(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "trade-log-001",
                "level": "info",
                "message": "Trade executed: BUY 100 AAPL @ $150.25",
                "timestamp": "2024-02-01T16:42:00Z",
                "agent": "Momentum Trader Alpha",
            }
        ]

    def _seed_positions(self) -> List[Dict[str, Any]]:
        return [
            {"symbol": "AAPL", "quantity": 100, "entry": 185.42, "current": 189.22, "pnl": 380, "pnlPercent": 2.05},
            {"symbol": "MSFT", "quantity": 50, "entry": 378.91, "current": 375.42, "pnl": -174, "pnlPercent": -0.92},
        ]

    def _seed_trades(self) -> List[Dict[str, Any]]:
        return [
            {"id": "t-001", "agent": "Momentum Trader Alpha", "symbol": "AAPL", "type": "BUY", "price": 185.42, "size": 100, "pnl": 2450, "time": "14:32:15"},
            {"id": "t-002", "agent": "Mean Reversion Bot", "symbol": "MSFT", "type": "SELL", "price": 378.91, "size": 50, "pnl": -1280, "time": "14:28:42"},
        ]


store = Store()
store.load_persistent_state()


# =====================
# Helpers
# =====================


def _response(data: Any) -> Dict[str, Any]:
    return {"data": data}


async def _broadcast(queues: List[asyncio.Queue], payload: Dict[str, Any]) -> None:
    for queue in list(queues):
        try:
            queue.put_nowait(payload)
        except asyncio.QueueFull:
            continue


async def _event_stream(queues: List[asyncio.Queue]):
    queue: asyncio.Queue = asyncio.Queue(maxsize=100)
    queues.append(queue)
    try:
        while True:
            payload = await queue.get()
            yield f"data: {json.dumps(payload)}\\n\\n"
    finally:
        if queue in queues:
            queues.remove(queue)


def _require_integration(integration_id: str) -> Integration:
    integration = store.integrations.get(integration_id)
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    return integration


def _alpaca_test(integration: Integration) -> Dict[str, Any]:
    if TradingClient is None:
        raise HTTPException(
            status_code=400,
            detail="alpaca-py not installed. Add 'alpaca-py' to dependencies and install.",
        )

    config = integration.config or {}
    api_key = config.get("api_key") or os.getenv("ALPACA_API_KEY")
    api_secret = config.get("api_secret") or os.getenv("ALPACA_API_SECRET")
    base_url = config.get("base_url")

    if not api_key or not api_secret:
        raise HTTPException(status_code=400, detail="Missing Alpaca API credentials.")

    is_paper = integration.mode == "paper"

    try:
        client = TradingClient(api_key, api_secret, paper=is_paper, base_url=base_url)
        account = client.get_account()
        integration.status = "active"
        integration.last_tested_at = datetime.utcnow().isoformat() + "Z"
        save_integration(integration.id, integration.model_dump())
        return {
            "status": "success",
            "account_id": getattr(account, "id", None),
            "equity": getattr(account, "equity", None),
        }
    except APIError as exc:
        integration.status = "error"
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        integration.status = "error"
        raise HTTPException(status_code=400, detail=str(exc))


def _alpaca_client(integration: Integration) -> TradingClient:
    if TradingClient is None:
        raise HTTPException(
            status_code=400,
            detail="alpaca-py not installed. Add 'alpaca-py' to dependencies and install.",
        )

    config = integration.config or {}
    api_key = config.get("api_key") or os.getenv("ALPACA_API_KEY")
    api_secret = config.get("api_secret") or os.getenv("ALPACA_API_SECRET")
    base_url = config.get("base_url")

    if not api_key or not api_secret:
        raise HTTPException(status_code=400, detail="Missing Alpaca API credentials.")

    is_paper = integration.mode == "paper"
    return TradingClient(api_key, api_secret, paper=is_paper, base_url=base_url)


# =====================
# Health
# =====================


@app.get("/api/health")
async def health() -> Dict[str, Any]:
    return {"status": "ok", "version": "0.1.0"}


# =====================
# Dashboard / Analytics
# =====================


@app.get("/api/dashboard")
async def dashboard_summary() -> Dict[str, Any]:
    total_equity = sum(agent.equity for agent in store.agents.values())
    active_agents = len([a for a in store.agents.values() if a.status == "running"])
    total_agents = len(store.agents)
    win_rate = sum(agent.win_rate for agent in store.agents.values()) / max(total_agents, 1)

    equity_curve = []
    base = total_equity * 0.85
    for i in range(12):
        date = (datetime.utcnow() - timedelta(days=30 * (11 - i))).strftime("%b")
        base += random.uniform(-2000, 5000)
        equity_curve.append({"name": date, "equity": round(base, 2), "benchmark": round(base * 0.98, 2)})

    agent_performance = [
        {"name": agent.name, "return": round(agent.equity_change_pct, 2), "trades": agent.trades_today}
        for agent in store.agents.values()
    ]

    return _response({
        "total_equity": round(total_equity, 2),
        "monthly_return_pct": round(random.uniform(-2, 12), 2),
        "active_agents": active_agents,
        "total_agents": total_agents,
        "win_rate": round(win_rate * 100, 2),
        "equity_curve": equity_curve,
        "agent_performance": agent_performance,
        "recent_trades": store.trades,
    })


@app.get("/api/analytics/equity")
async def analytics_equity() -> Dict[str, Any]:
    data = []
    base = 100000
    for i in range(30):
        date = (datetime.utcnow() - timedelta(days=29 - i)).strftime("%Y-%m-%d")
        base += random.uniform(-1000, 3500)
        data.append({"date": date, "equity": round(base, 2)})
    return _response(data)


@app.get("/api/analytics/performance")
async def analytics_performance() -> Dict[str, Any]:
    return _response({
        "total_trades": 456,
        "profitability": 62.4,
        "avg_win_loss": 1.45,
        "risk_reward": 2.8,
        "monthly": [
            {"month": "Jan", "return": 5.2, "benchmark": 2.1},
            {"month": "Feb", "return": 8.3, "benchmark": 3.2},
            {"month": "Mar", "return": -2.1, "benchmark": 1.5},
            {"month": "Apr", "return": 12.5, "benchmark": 4.3},
            {"month": "May", "return": 6.8, "benchmark": 2.9},
            {"month": "Jun", "return": 9.7, "benchmark": 3.5},
        ],
        "trade_distribution": [
            {"range": "-5 to -2%", "count": 12},
            {"range": "-2 to 0%", "count": 45},
            {"range": "0 to 2%", "count": 89},
            {"range": "2 to 5%", "count": 124},
            {"range": "5 to 10%", "count": 98},
            {"range": "10%+", "count": 34},
        ],
        "strategy_performance": [
            {"name": "Mean Reversion", "trades": 156, "win": 64.1, "ret": 12.5, "sharpe": 1.92},
            {"name": "Momentum", "trades": 132, "win": 58.3, "ret": 8.2, "sharpe": 1.45},
            {"name": "Arbitrage", "trades": 168, "win": 68.5, "ret": 15.3, "sharpe": 2.15},
        ],
    })


# =====================
# Agents
# =====================


@app.get("/api/agents")
async def list_agents() -> Dict[str, Any]:
    return _response(list(store.agents.values()))


@app.get("/api/agents/{agent_id}")
async def get_agent(agent_id: str) -> Dict[str, Any]:
    agent = store.agents.get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return _response(agent)


@app.post("/api/agents")
async def create_agent(data: Dict[str, Any]) -> Dict[str, Any]:
    agent_id = f"agent-{uuid.uuid4().hex[:6]}"
    agent = Agent(
        id=agent_id,
        name=data.get("name", "New Agent"),
        strategy=data.get("strategy", "Momentum"),
        status="created",
        equity=100000,
        equity_change=0,
        equity_change_pct=0,
        trades_today=0,
        win_rate=0,
        sharpe_ratio=0,
        max_drawdown=0,
        created_at=datetime.utcnow().isoformat() + "Z",
    )
    store.agents[agent_id] = agent
    return _response(agent)


@app.put("/api/agents/{agent_id}")
async def update_agent(agent_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    agent = store.agents.get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    updated = agent.model_copy(update=data)
    store.agents[agent_id] = updated
    return _response(updated)


@app.delete("/api/agents/{agent_id}")
async def delete_agent(agent_id: str) -> Dict[str, Any]:
    if agent_id in store.agents:
        del store.agents[agent_id]
    return _response({"success": True})


@app.post("/api/agents/{agent_id}/start")
async def start_agent(agent_id: str) -> Dict[str, Any]:
    agent = store.agents.get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    agent.status = "running"
    return _response(agent)


@app.post("/api/agents/{agent_id}/stop")
async def stop_agent(agent_id: str) -> Dict[str, Any]:
    agent = store.agents.get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    agent.status = "stopped"
    return _response(agent)


@app.post("/api/agents/{agent_id}/pause")
async def pause_agent(agent_id: str) -> Dict[str, Any]:
    agent = store.agents.get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    agent.status = "paused"
    return _response(agent)


@app.get("/api/agents/{agent_id}/status")
async def agent_status(agent_id: str) -> Dict[str, Any]:
    agent = store.agents.get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return _response({
        "agent_id": agent.id,
        "status": agent.status,
        "uptime_seconds": random.randint(600, 50000),
        "current_positions": random.randint(0, 8),
        "total_trades": random.randint(50, 400),
        "current_equity": agent.equity,
        "pnl": agent.equity_change,
        "pnl_percent": agent.equity_change_pct,
        "last_update": datetime.utcnow().isoformat() + "Z",
    })


@app.get("/api/agents/{agent_id}/metrics")
async def agent_metrics(agent_id: str) -> Dict[str, Any]:
    agent = store.agents.get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return _response({
        "total_trades": random.randint(100, 500),
        "winning_trades": random.randint(60, 300),
        "losing_trades": random.randint(20, 150),
        "win_rate": agent.win_rate,
        "profit_factor": 1.45,
        "sharpe_ratio": agent.sharpe_ratio,
        "sortino_ratio": 1.8,
        "calmar_ratio": 1.2,
        "max_drawdown": agent.max_drawdown,
        "recovery_factor": 1.5,
        "avg_trade_duration": 3.2,
        "annualized_return": 0.18,
        "monthly_returns": [0.02, 0.03, -0.01, 0.05],
        "period_start": "2024-01-01",
        "period_end": "2024-06-30",
    })


@app.get("/api/agents/{agent_id}/backtest")
async def agent_backtest(agent_id: str) -> Dict[str, Any]:
    if agent_id not in store.agents:
        raise HTTPException(status_code=404, detail="Agent not found")
    return _response({
        "sharpe": 1.52,
        "return_pct": 12.4,
        "max_drawdown": -0.08,
        "trades": 142,
        "equity_curve": [
            {"date": (datetime.utcnow() - timedelta(days=7 - i)).strftime("%Y-%m-%d"), "equity": 100000 + i * 1500}
            for i in range(8)
        ],
    })


# =====================
# Strategies
# =====================


@app.get("/api/strategies")
async def list_strategies() -> Dict[str, Any]:
    return _response(list(store.strategies.values()))


@app.get("/api/strategies/{strategy_id}")
async def get_strategy(strategy_id: str) -> Dict[str, Any]:
    strategy = store.strategies.get(strategy_id)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return _response(strategy)


@app.post("/api/strategies")
async def create_strategy(data: Dict[str, Any]) -> Dict[str, Any]:
    strategy_id = f"strategy-{uuid.uuid4().hex[:6]}"
    strategy = Strategy(
        id=strategy_id,
        name=data.get("name", "New Strategy"),
        description=data.get("description", ""),
        type=data.get("type", "Custom"),
        agents=0,
        win_rate=0,
        avg_return=0,
    )
    store.strategies[strategy_id] = strategy
    return _response(strategy)


@app.put("/api/strategies/{strategy_id}")
async def update_strategy(strategy_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    strategy = store.strategies.get(strategy_id)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    updated = strategy.model_copy(update=data)
    store.strategies[strategy_id] = updated
    return _response(updated)


@app.delete("/api/strategies/{strategy_id}")
async def delete_strategy(strategy_id: str) -> Dict[str, Any]:
    if strategy_id in store.strategies:
        del store.strategies[strategy_id]
    return _response({"success": True})


# =====================
# Data Sources
# =====================


@app.get("/api/data-sources")
async def list_data_sources() -> Dict[str, Any]:
    return _response(list(store.data_sources.values()))


@app.get("/api/data-sources/{source_id}")
async def get_data_source(source_id: str) -> Dict[str, Any]:
    source = store.data_sources.get(source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Data source not found")
    return _response(source)


@app.post("/api/data-sources")
async def create_data_source(data: Dict[str, Any]) -> Dict[str, Any]:
    source_id = f"ds-{uuid.uuid4().hex[:6]}"
    source = DataSource(
        id=source_id,
        name=data.get("name", "New Source"),
        type=data.get("type", "market_data"),
        status=data.get("status", "disconnected"),
        symbols=data.get("symbols", 0),
        last_update=datetime.utcnow().isoformat() + "Z",
    )
    store.data_sources[source_id] = source
    return _response(source)


@app.put("/api/data-sources/{source_id}")
async def update_data_source(source_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    source = store.data_sources.get(source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Data source not found")
    updated = source.model_copy(update=data)
    store.data_sources[source_id] = updated
    return _response(updated)


@app.delete("/api/data-sources/{source_id}")
async def delete_data_source(source_id: str) -> Dict[str, Any]:
    if source_id in store.data_sources:
        del store.data_sources[source_id]
    return _response({"success": True})


@app.post("/api/data-sources/{source_id}/test")
async def test_data_source(source_id: str) -> Dict[str, Any]:
    source = store.data_sources.get(source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Data source not found")
    source.status = "connected"
    source.last_update = datetime.utcnow().isoformat() + "Z"
    return _response({"status": "success"})


# =====================
# Integrations
# =====================


@app.get("/api/integrations")
async def list_integrations() -> Dict[str, Any]:
    return _response(list(store.integrations.values()))


@app.get("/api/integrations/{integration_id}")
async def get_integration(integration_id: str) -> Dict[str, Any]:
    integration = _require_integration(integration_id)
    return _response(integration)


@app.post("/api/integrations")
async def create_integration(data: Dict[str, Any]) -> Dict[str, Any]:
    integration_id = f"int-{uuid.uuid4().hex[:6]}"
    integration = Integration(
        id=integration_id,
        name=data.get("name", "New Integration"),
        description=data.get("description", ""),
        status=data.get("status", "inactive"),
        provider=data.get("provider", "custom"),
        category=data.get("category", "custom"),
        icon=data.get("icon", "plug"),
        fields=[IntegrationField(**field) for field in data.get("fields", [])],
        config=data.get("config", {}),
        mode=data.get("mode"),
    )
    store.integrations[integration_id] = integration
    save_integration(integration_id, integration.model_dump())
    return _response(integration)


@app.put("/api/integrations/{integration_id}")
async def update_integration(integration_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    integration = _require_integration(integration_id)
    updated = integration.model_copy(update=data)
    store.integrations[integration_id] = updated
    save_integration(integration_id, updated.model_dump())
    return _response(updated)


@app.delete("/api/integrations/{integration_id}")
async def delete_integration(integration_id: str) -> Dict[str, Any]:
    if integration_id in store.integrations:
        del store.integrations[integration_id]
        delete_integration(integration_id)
    return _response({"success": True})


@app.post("/api/integrations/{integration_id}/test")
async def test_integration(integration_id: str) -> Dict[str, Any]:
    integration = _require_integration(integration_id)

    if integration.provider == "alpaca":
        return _response(_alpaca_test(integration))

    missing = [
        field.label
        for field in integration.fields
        if field.required and not integration.config.get(field.key)
    ]
    if missing:
        integration.status = "error"
        raise HTTPException(status_code=400, detail=f"Missing required fields: {', '.join(missing)}")

    integration.status = "active"
    integration.last_tested_at = datetime.utcnow().isoformat() + "Z"
    return _response({"status": "success"})


# =====================
# Trades / Positions / Logs
# =====================


@app.get("/api/trades")
async def list_trades() -> Dict[str, Any]:
    return _response(store.trades)


@app.get("/api/trades/{trade_id}")
async def get_trade(trade_id: str) -> Dict[str, Any]:
    trade = next((t for t in store.trades if t["id"] == trade_id), None)
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    return _response(trade)


@app.get("/api/positions")
async def list_positions() -> Dict[str, Any]:
    return _response(store.positions)


@app.post("/api/orders")
async def create_order(order: OrderRequest) -> Dict[str, Any]:
    integration = _require_integration(order.integration_id)
    if integration.provider != "alpaca":
        raise HTTPException(status_code=400, detail="Only Alpaca integrations support order execution.")

    client = _alpaca_client(integration)
    try:
        alpaca_order = client.submit_order(
            symbol=order.symbol,
            qty=order.qty,
            side=order.side.lower(),
            type=order.order_type,
            time_in_force=order.time_in_force,
        )
    except APIError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    price = getattr(alpaca_order, "filled_avg_price", None) or getattr(alpaca_order, "limit_price", None) or 0
    trade = {
        "id": f"t-{uuid.uuid4().hex[:6]}",
        "agent": "Manual",
        "symbol": order.symbol,
        "type": order.side.upper(),
        "price": float(price),
        "size": order.qty,
        "pnl": 0,
        "time": datetime.utcnow().strftime("%H:%M:%S"),
    }
    store.trades.insert(0, trade)
    await _broadcast(store.trade_streams, trade)

    position = next((p for p in store.positions if p["symbol"] == order.symbol), None)
    if not position:
        position = {
            "symbol": order.symbol,
            "quantity": order.qty if order.side.lower() == "buy" else -order.qty,
            "entry": 0,
            "current": 0,
            "pnl": 0,
            "pnlPercent": 0,
        }
        store.positions.append(position)
    else:
        position["quantity"] += order.qty if order.side.lower() == "buy" else -order.qty
    await _broadcast(store.position_streams, position)

    return _response({
        "order_id": getattr(alpaca_order, "id", None),
        "status": getattr(alpaca_order, "status", "submitted"),
    })


@app.get("/api/logs/system")
async def logs_system() -> Dict[str, Any]:
    return _response(store.logs_system)


@app.get("/api/logs/trades")
async def logs_trades() -> Dict[str, Any]:
    return _response(store.logs_trades)


@app.get("/api/logs/signals")
async def logs_signals() -> Dict[str, Any]:
    return _response(store.logs_signals)


# =====================
# Streams (SSE)
# =====================


@app.get("/api/stream/trades")
async def stream_trades():
    return StreamingResponse(_event_stream(store.trade_streams), media_type="text/event-stream")


@app.get("/api/stream/positions")
async def stream_positions():
    return StreamingResponse(_event_stream(store.position_streams), media_type="text/event-stream")


# =====================
# Settings
# =====================


@app.get("/api/settings")
async def get_settings() -> Dict[str, Any]:
    return _response(store.settings)


@app.put("/api/settings")
async def update_settings(data: Dict[str, Any]) -> Dict[str, Any]:
    updated = store.settings.model_copy(update=data)
    store.settings = updated
    save_settings(updated.model_dump())
    return _response(updated)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
