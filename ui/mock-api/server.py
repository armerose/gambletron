#!/usr/bin/env python3
"""
Mock API server for Gambletron Trading Agent Manager UI development
Provides mock data for all API endpoints
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import random
import uvicorn

app = FastAPI(title="Gambletron Mock API", version="1.0.0")

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============= MOCK DATA =============

MOCK_AGENTS = [
    {
        "id": "agent-001",
        "name": "Momentum Trader Alpha",
        "strategy": "momentum",
        "status": "running",
        "equity": 125000,
        "equity_change": 25000,
        "equity_change_pct": 25.0,
        "trades_today": 12,
        "win_rate": 0.67,
        "sharpe_ratio": 1.85,
        "max_drawdown": -0.08,
        "created_at": "2024-01-15T08:30:00Z"
    },
    {
        "id": "agent-002",
        "name": "Mean Reversion Bot",
        "strategy": "mean_reversion",
        "status": "running",
        "equity": 98000,
        "equity_change": -2000,
        "equity_change_pct": -2.0,
        "trades_today": 8,
        "win_rate": 0.52,
        "sharpe_ratio": 1.12,
        "max_drawdown": -0.12,
        "created_at": "2024-01-20T10:15:00Z"
    },
    {
        "id": "agent-003",
        "name": "Volatility Hunter",
        "strategy": "volatility",
        "status": "paused",
        "equity": 75000,
        "equity_change": 5000,
        "equity_change_pct": 7.1,
        "trades_today": 0,
        "win_rate": 0.61,
        "sharpe_ratio": 2.15,
        "max_drawdown": -0.06,
        "created_at": "2024-02-01T14:45:00Z"
    }
]

MOCK_STRATEGIES = [
    {
        "id": "strategy-001",
        "name": "Momentum",
        "description": "Trend-following strategy based on momentum indicators",
        "type": "momentum",
        "agents": 1,
        "win_rate": 0.65,
        "avg_return": 0.28
    },
    {
        "id": "strategy-002",
        "name": "Mean Reversion",
        "description": "Statistical arbitrage using mean reversion principles",
        "type": "mean_reversion",
        "agents": 1,
        "win_rate": 0.52,
        "avg_return": 0.12
    },
    {
        "id": "strategy-003",
        "name": "Volatility Trading",
        "description": "Options and volatility-based trading strategies",
        "type": "volatility",
        "agents": 1,
        "win_rate": 0.61,
        "avg_return": 0.35
    }
]

MOCK_DATA_SOURCES = [
    {
        "id": "ds-001",
        "name": "Polygon.io",
        "type": "market_data",
        "status": "connected",
        "symbols": 5000,
        "last_update": "2024-02-01T16:30:00Z"
    },
    {
        "id": "ds-002",
        "name": "Alpha Vantage",
        "type": "market_data",
        "status": "connected",
        "symbols": 500,
        "last_update": "2024-02-01T16:29:00Z"
    },
    {
        "id": "ds-003",
        "name": "IB Gateway",
        "type": "brokerage",
        "status": "disconnected",
        "symbols": 12000,
        "last_update": "2024-02-01T14:15:00Z"
    }
]

MOCK_INTEGRATIONS = [
    {
        "id": "int-000",
        "name": "Alpaca Paper Trading",
        "description": "Paper trading account connection for Alpaca",
        "status": "inactive",
        "provider": "alpaca",
        "category": "brokerage",
        "icon": "alpaca",
        "fields": [
            {
                "key": "api_key",
                "label": "API Key",
                "type": "text",
                "required": True,
                "placeholder": "Your Alpaca API key"
            },
            {
                "key": "api_secret",
                "label": "API Secret",
                "type": "password",
                "required": True,
                "placeholder": "Your Alpaca API secret"
            },
            {
                "key": "base_url",
                "label": "Base URL",
                "type": "url",
                "required": True,
                "placeholder": "https://paper-api.alpaca.markets"
            }
        ],
        "config": {
            "base_url": "https://paper-api.alpaca.markets"
        },
        "last_tested_at": None
    },
    {
        "id": "int-001",
        "name": "Discord Notifications",
        "description": "Real-time trade alerts via Discord",
        "status": "active",
        "provider": "discord",
        "category": "notifications",
        "icon": "discord",
        "fields": [
            {
                "key": "webhook_url",
                "label": "Webhook URL",
                "type": "url",
                "required": True,
                "placeholder": "https://discord.com/api/webhooks/..."
            }
        ],
        "config": {},
        "last_tested_at": "2024-02-01T16:40:00Z"
    },
    {
        "id": "int-002",
        "name": "Telegram Alerts",
        "description": "Instant notifications on Telegram",
        "status": "active",
        "provider": "telegram",
        "category": "notifications",
        "icon": "telegram",
        "fields": [
            {
                "key": "bot_token",
                "label": "Bot Token",
                "type": "password",
                "required": True,
                "placeholder": "123456:ABC-DEF..."
            },
            {
                "key": "chat_id",
                "label": "Chat ID",
                "type": "text",
                "required": True,
                "placeholder": "Chat ID or channel name"
            }
        ],
        "config": {},
        "last_tested_at": "2024-02-01T16:41:00Z"
    },
    {
        "id": "int-003",
        "name": "Email Reports",
        "description": "Daily performance reports via email",
        "status": "inactive",
        "provider": "email",
        "category": "reports",
        "icon": "mail",
        "fields": [
            {
                "key": "recipient",
                "label": "Recipient Email",
                "type": "text",
                "required": True,
                "placeholder": "trader@example.com"
            }
        ],
        "config": {},
        "last_tested_at": None
    },
    {
        "id": "int-004",
        "name": "Slack Integration",
        "description": "Trade execution logs in Slack",
        "status": "active",
        "provider": "slack",
        "category": "notifications",
        "icon": "slack",
        "fields": [
            {
                "key": "webhook_url",
                "label": "Webhook URL",
                "type": "url",
                "required": True,
                "placeholder": "https://hooks.slack.com/services/..."
            }
        ],
        "config": {},
        "last_tested_at": "2024-02-01T16:42:00Z"
    },
    {
        "id": "int-005",
        "name": "Database Sync",
        "description": "PostgreSQL database synchronization",
        "status": "inactive",
        "provider": "postgres",
        "category": "storage",
        "icon": "database",
        "fields": [
            {
                "key": "connection_string",
                "label": "Connection String",
                "type": "password",
                "required": True,
                "placeholder": "postgresql://user:pass@host:5432/db"
            }
        ],
        "config": {},
        "last_tested_at": None
    },
    {
        "id": "int-006",
        "name": "Cloud Backup",
        "description": "Automated AWS S3 backups",
        "status": "active",
        "provider": "aws",
        "category": "storage",
        "icon": "cloud",
        "fields": [
            {
                "key": "bucket",
                "label": "S3 Bucket",
                "type": "text",
                "required": True,
                "placeholder": "my-backups-bucket"
            },
            {
                "key": "region",
                "label": "Region",
                "type": "text",
                "required": True,
                "placeholder": "us-east-1"
            }
        ],
        "config": {},
        "last_tested_at": "2024-02-01T16:43:00Z"
    }
]

MOCK_LOGS = [
    {"id": "log-001", "level": "info", "message": "Agent momentum_001 started trading session", "timestamp": "2024-02-01T16:45:00Z"},
    {"id": "log-002", "level": "info", "message": "Market data connection established", "timestamp": "2024-02-01T16:44:30Z"},
    {"id": "log-003", "level": "warning", "message": "High drawdown detected: 8.2%", "timestamp": "2024-02-01T16:43:15Z"},
    {"id": "log-004", "level": "info", "message": "Trade executed: BUY 100 AAPL @ $150.25", "timestamp": "2024-02-01T16:42:00Z"},
    {"id": "log-005", "level": "error", "message": "Failed to fetch data from Alpha Vantage API", "timestamp": "2024-02-01T16:40:45Z"},
    {"id": "log-006", "level": "info", "message": "Risk management check passed", "timestamp": "2024-02-01T16:39:30Z"},
    {"id": "log-007", "level": "warning", "message": "API rate limit approaching (850/1000)", "timestamp": "2024-02-01T16:38:00Z"},
    {"id": "log-008", "level": "info", "message": "Portfolio rebalancing completed", "timestamp": "2024-02-01T16:35:20Z"},
]

# ============= AGENTS ENDPOINTS =============

@app.get("/api/agents")
async def list_agents():
    return {"data": MOCK_AGENTS}

@app.get("/api/agents/{agent_id}")
async def get_agent(agent_id: str):
    agent = next((a for a in MOCK_AGENTS if a["id"] == agent_id), None)
    if not agent:
        return {"error": "Agent not found"}, 404
    return {"data": agent}

@app.post("/api/agents")
async def create_agent(data: dict):
    new_agent = {
        "id": f"agent-{len(MOCK_AGENTS) + 1:03d}",
        "name": data.get("name", "New Agent"),
        "strategy": data.get("strategy", "momentum"),
        "status": "created",
        "equity": 100000,
        "equity_change": 0,
        "equity_change_pct": 0,
        "trades_today": 0,
        "win_rate": 0,
        "sharpe_ratio": 0,
        "max_drawdown": 0,
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    MOCK_AGENTS.append(new_agent)
    return {"data": new_agent}

# ============= STRATEGIES ENDPOINTS =============

@app.get("/api/strategies")
async def list_strategies():
    return {"data": MOCK_STRATEGIES}

@app.get("/api/strategies/{strategy_id}")
async def get_strategy(strategy_id: str):
    strategy = next((s for s in MOCK_STRATEGIES if s["id"] == strategy_id), None)
    if not strategy:
        return {"error": "Strategy not found"}, 404
    return {"data": strategy}

# ============= DATA SOURCES ENDPOINTS =============

@app.get("/api/data-sources")
async def list_data_sources():
    return {"data": MOCK_DATA_SOURCES}

@app.get("/api/data-sources/{source_id}")
async def get_data_source(source_id: str):
    source = next((s for s in MOCK_DATA_SOURCES if s["id"] == source_id), None)
    if not source:
        return {"error": "Data source not found"}, 404
    return {"data": source}

# ============= INTEGRATIONS ENDPOINTS =============

@app.get("/api/integrations")
async def list_integrations():
    return {"data": MOCK_INTEGRATIONS}

@app.get("/api/integrations/{integration_id}")
async def get_integration(integration_id: str):
    integration = next((i for i in MOCK_INTEGRATIONS if i["id"] == integration_id), None)
    if not integration:
        return {"error": "Integration not found"}, 404
    return {"data": integration}

@app.post("/api/integrations")
async def create_integration(data: dict):
    new_integration = {
        "id": f"int-{len(MOCK_INTEGRATIONS) + 1:03d}",
        "name": data.get("name", "New Integration"),
        "description": data.get("description", ""),
        "status": data.get("status", "inactive"),
        "provider": data.get("provider", "custom"),
        "category": data.get("category", "custom"),
        "icon": data.get("icon", "plug"),
        "fields": data.get("fields", []),
        "config": data.get("config", {}),
        "last_tested_at": None
    }
    MOCK_INTEGRATIONS.append(new_integration)
    return {"data": new_integration}

@app.put("/api/integrations/{integration_id}")
async def update_integration(integration_id: str, data: dict):
    integration = next((i for i in MOCK_INTEGRATIONS if i["id"] == integration_id), None)
    if not integration:
        return {"error": "Integration not found"}, 404
    integration.update({
        "name": data.get("name", integration.get("name")),
        "description": data.get("description", integration.get("description")),
        "status": data.get("status", integration.get("status")),
        "provider": data.get("provider", integration.get("provider")),
        "category": data.get("category", integration.get("category")),
        "fields": data.get("fields", integration.get("fields")),
        "config": data.get("config", integration.get("config")),
    })
    return {"data": integration}

@app.post("/api/integrations/{integration_id}/test")
async def test_integration(integration_id: str):
    integration = next((i for i in MOCK_INTEGRATIONS if i["id"] == integration_id), None)
    if not integration:
        return {"error": "Integration not found"}, 404
    fields = integration.get("fields", [])
    config = integration.get("config", {})
    missing = [field["label"] for field in fields if field.get("required") and not config.get(field["key"])]
    if missing:
        integration["status"] = "error"
        return {"error": f"Missing required fields: {', '.join(missing)}"}, 400
    integration["status"] = "active"
    integration["last_tested_at"] = datetime.utcnow().isoformat() + "Z"
    return {"data": {"status": "success", "message": "Connection verified."}}

# ============= LOGS ENDPOINTS =============

@app.get("/api/logs")
async def list_logs():
    return {"data": MOCK_LOGS}

# ============= DASHBOARD ENDPOINTS =============

@app.get("/api/dashboard/metrics")
async def get_dashboard_metrics():
    return {
        "data": {
            "total_equity": 298000,
            "daily_return": 28000,
            "daily_return_pct": 10.35,
            "active_agents": 2,
            "win_rate": 0.61,
            "sharpe_ratio": 1.71,
            "max_drawdown": -0.12
        }
    }

@app.get("/api/dashboard/equity-chart")
async def get_equity_chart():
    # Generate mock equity curve data
    data = []
    base_value = 250000
    for i in range(30):
        date = (datetime.now() - timedelta(days=30-i)).strftime("%Y-%m-%d")
        value = base_value + random.randint(-5000, 8000) * (i // 2 + 1)
        data.append({"date": date, "equity": value})
    return {"data": data}

@app.get("/api/dashboard/agent-performance")
async def get_agent_performance():
    data = [
        {"name": "Momentum Trader Alpha", "return": 25.0},
        {"name": "Mean Reversion Bot", "return": -2.0},
        {"name": "Volatility Hunter", "return": 7.1},
    ]
    return {"data": data}

@app.get("/api/dashboard/recent-trades")
async def get_recent_trades():
    trades = [
        {"id": "t-001", "symbol": "AAPL", "side": "buy", "quantity": 100, "price": 150.25, "pnl": 2500, "pnl_pct": 16.67, "timestamp": "2024-02-01T16:42:00Z"},
        {"id": "t-002", "symbol": "MSFT", "side": "sell", "quantity": 50, "price": 380.50, "pnl": -1200, "pnl_pct": -5.68, "timestamp": "2024-02-01T16:35:00Z"},
        {"id": "t-003", "symbol": "TSLA", "side": "buy", "quantity": 75, "price": 245.80, "pnl": 3600, "pnl_pct": 19.23, "timestamp": "2024-02-01T16:28:00Z"},
    ]
    return {"data": trades}

# ============= HEALTH CHECK =============

@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
