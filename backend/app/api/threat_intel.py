from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.session import get_db
from app.models.models import ThreatIntel
from app.schemas.schemas import ThreatIntelResponse

router = APIRouter(prefix="/threat-intelligence", tags=["Threat Intelligence"])

@router.get("", response_model=List[ThreatIntelResponse])
def get_threat_intelligence(
    db: Session = Depends(get_db),
    indicator_type: Optional[str] = None,
    search: Optional[str] = None
):
    query = db.query(ThreatIntel)
    if indicator_type:
        query = query.filter(ThreatIntel.type == indicator_type.upper())
    if search:
        search_pat = f"%{search}%"
        query = query.filter(
            (ThreatIntel.indicator.like(search_pat)) |
            (ThreatIntel.category.like(search_pat)) |
            (ThreatIntel.description.like(search_pat))
        )
    return query.order_by(desc(ThreatIntel.last_seen)).all()
