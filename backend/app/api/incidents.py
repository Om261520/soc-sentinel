import uuid
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.session import get_db
from app.models.models import Incident, IncidentNote, Alert
from app.schemas.schemas import (
    IncidentCreate, IncidentUpdate, IncidentResponse, 
    IncidentNoteCreate, IncidentNoteResponse
)
from app.core.security import get_current_user_payload

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("", response_model=List[IncidentResponse])
def get_incidents(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    status_filter: Optional[str] = None,
    severity: Optional[str] = None
):
    query = db.query(Incident)
    if status_filter:
        query = query.filter(Incident.status == status_filter)
    if severity:
        query = query.filter(Incident.severity == severity.upper())
        
    incidents = query.order_by(desc(Incident.created_at)).offset(skip).limit(limit).all()
    return incidents

@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(inc_in: IncidentCreate, db: Session = Depends(get_db)):
    inc_id = f"INC-{uuid.uuid4().hex[:8].upper()}"
    incident = Incident(
        incident_id=inc_id,
        title=inc_in.title,
        description=inc_in.description,
        severity=inc_in.severity,
        status="Open",
        assigned_to=inc_in.assigned_to or "Unassigned"
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)

    if inc_in.alert_ids:
        alerts = db.query(Alert).filter(Alert.id.in_(inc_in.alert_ids)).all()
        for alert in alerts:
            alert.incident_id = incident.id
            alert.status = "Investigating"
        db.commit()
        db.refresh(incident)

    return incident

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident_by_id(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.incident_id == incident_id).first()
    if not inc and incident_id.isdigit():
        inc = db.query(Incident).filter(Incident.id == int(incident_id)).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

@router.patch("/{incident_id}", response_model=IncidentResponse)
def update_incident(incident_id: str, inc_update: IncidentUpdate, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.incident_id == incident_id).first()
    if not inc and incident_id.isdigit():
        inc = db.query(Incident).filter(Incident.id == int(incident_id)).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    if inc_update.title is not None:
        inc.title = inc_update.title
    if inc_update.description is not None:
        inc.description = inc_update.description
    if inc_update.severity is not None:
        inc.severity = inc_update.severity
    if inc_update.assigned_to is not None:
        inc.assigned_to = inc_update.assigned_to
    if inc_update.status is not None:
        inc.status = inc_update.status
        if inc_update.status in ["Resolved", "Closed"] and not inc.resolved_at:
            inc.resolved_at = datetime.utcnow()

    db.commit()
    db.refresh(inc)
    return inc

@router.post("/{incident_id}/notes", response_model=IncidentNoteResponse, status_code=status.HTTP_201_CREATED)
def add_incident_note(
    incident_id: str, 
    note_in: IncidentNoteCreate, 
    db: Session = Depends(get_db),
    payload: dict = Depends(get_current_user_payload)
):
    inc = db.query(Incident).filter(Incident.incident_id == incident_id).first()
    if not inc and incident_id.isdigit():
        inc = db.query(Incident).filter(Incident.id == int(incident_id)).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    author = payload.get("sub", "SOC Analyst")
    note = IncidentNote(
        incident_id=inc.id,
        author=author,
        content=note_in.content
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note
