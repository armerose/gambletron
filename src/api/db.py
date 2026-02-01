"""Database helpers for persistent API storage."""

from __future__ import annotations

import json
import os
from typing import Any, Dict, Optional

from sqlalchemy import Column, Integer, String, Text, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


DATABASE_URL = os.getenv("GAMBLETRON_DATABASE_URL", "sqlite:///./data/gambletron.db")

if DATABASE_URL.startswith("sqlite:///"):
    db_path = DATABASE_URL.replace("sqlite:///", "", 1)
    db_dir = os.path.dirname(db_path)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class SettingsModel(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    data = Column(Text, nullable=False)


class IntegrationModel(Base):
    __tablename__ = "integrations"

    id = Column(String, primary_key=True, index=True)
    data = Column(Text, nullable=False)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def _json_load(data: str) -> Dict[str, Any]:
    return json.loads(data) if data else {}


def _json_dump(data: Dict[str, Any]) -> str:
    return json.dumps(data)


def load_settings(defaults: Dict[str, Any]) -> Dict[str, Any]:
    with SessionLocal() as session:
        row = session.query(SettingsModel).first()
        if not row:
            row = SettingsModel(data=_json_dump(defaults))
            session.add(row)
            session.commit()
            session.refresh(row)
        return _json_load(row.data)


def save_settings(data: Dict[str, Any]) -> Dict[str, Any]:
    with SessionLocal() as session:
        row = session.query(SettingsModel).first()
        if not row:
            row = SettingsModel(data=_json_dump(data))
            session.add(row)
        else:
            row.data = _json_dump(data)
        session.commit()
        return data


def load_integrations(defaults: Dict[str, Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    with SessionLocal() as session:
        rows = session.query(IntegrationModel).all()
        if not rows:
            for integration_id, payload in defaults.items():
                session.add(IntegrationModel(id=integration_id, data=_json_dump(payload)))
            session.commit()
            rows = session.query(IntegrationModel).all()
        return {row.id: _json_load(row.data) for row in rows}


def save_integration(integration_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    with SessionLocal() as session:
        row = session.query(IntegrationModel).filter(IntegrationModel.id == integration_id).first()
        if not row:
            row = IntegrationModel(id=integration_id, data=_json_dump(payload))
            session.add(row)
        else:
            row.data = _json_dump(payload)
        session.commit()
        return payload


def delete_integration(integration_id: str) -> None:
    with SessionLocal() as session:
        row = session.query(IntegrationModel).filter(IntegrationModel.id == integration_id).first()
        if row:
            session.delete(row)
            session.commit()
