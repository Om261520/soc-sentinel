from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.session import get_db
from app.models.models import Alert
from app.schemas.schemas import AlertResponse, AlertStatusUpdate, AIAnalysisResponse
from app.services.ai_analyst import generate_alert_analysis

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertResponse])
def get_alerts(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    severity: Optional[str] = None,
    status_filter: Optional[str] = None,
    search: Optional[str] = None
):
    query = db.query(Alert)
    if severity:
        query = query.filter(Alert.severity == severity.upper())
    if status_filter:
        query = query.filter(Alert.status == status_filter)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Alert.title.like(search_pattern)) |
            (Alert.rule_name.like(search_pattern)) |
            (Alert.source_ip.like(search_pattern)) |
            (Alert.username.like(search_pattern)) |
            (Alert.alert_id.like(search_pattern))
        )
    alerts = query.order_by(desc(Alert.timestamp)).offset(skip).limit(limit).all()
    return alerts

@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert_by_id(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not alert:
        # Try integer ID fallback
        if alert_id.isdigit():
            alert = db.query(Alert).filter(Alert.id == int(alert_id)).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.patch("/{alert_id}", response_model=AlertResponse)
def update_alert_status(alert_id: str, status_update: AlertStatusUpdate, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not alert and alert_id.isdigit():
        alert = db.query(Alert).filter(Alert.id == int(alert_id)).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = status_update.status
    db.commit()
    db.refresh(alert)
    return alert

@router.post("/{alert_id}/analyze", response_model=AIAnalysisResponse)
def analyze_alert(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not alert and alert_id.isdigit():
        alert = db.query(Alert).filter(Alert.id == int(alert_id)).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    analysis = generate_alert_analysis(alert)
    return analysis
