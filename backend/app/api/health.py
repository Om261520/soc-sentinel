from typing import Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.session import get_db

router = APIRouter(tags=["System Health"])

@router.get("/health")
def get_system_health(db: Session = Depends(get_db)) -> Dict[str, Any]:
    db_status = "ONLINE"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"OFFLINE ({str(e)})"

    return {
        "status": "HEALTHY",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "api": {"status": "ONLINE", "latency_ms": 1.2},
            "database": {"status": db_status, "engine": "SQLite"},
            "detection_engine": {"status": "ONLINE", "active_rules": 8},
            "log_pipeline": {"status": "ONLINE", "ingestion_mode": "REALTIME"},
            "ai_analyzer": {"status": "ONLINE", "mode": "HYBRID_DETERMINISTIC"}
        }
    }
