from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.session import get_db
from app.models.models import SecurityLog
from app.schemas.schemas import LogCreate, LogBulkCreate, LogResponse
from app.detection.engine import evaluate_log_and_generate_alerts

router = APIRouter(prefix="/logs", tags=["Logs"])

@router.get("", response_model=List[LogResponse])
def get_logs(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    event_type: Optional[str] = None,
    severity: Optional[str] = None,
    source_ip: Optional[str] = None,
    username: Optional[str] = None
):
    query = db.query(SecurityLog)
    
    if event_type:
        query = query.filter(SecurityLog.event_type == event_type)
    if severity:
        query = query.filter(SecurityLog.severity == severity.upper())
    if source_ip:
        query = query.filter(SecurityLog.source_ip == source_ip)
    if username:
        query = query.filter(SecurityLog.username == username)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (SecurityLog.message.like(search_pattern)) |
            (SecurityLog.raw_log.like(search_pattern)) |
            (SecurityLog.source_ip.like(search_pattern)) |
            (SecurityLog.username.like(search_pattern)) |
            (SecurityLog.action.like(search_pattern))
        )
        
    logs = query.order_by(desc(SecurityLog.timestamp)).offset(skip).limit(limit).all()
    return logs

@router.post("", response_model=LogResponse, status_code=status.HTTP_201_CREATED)
def create_log(log_in: LogCreate, db: Session = Depends(get_db)):
    db_log = SecurityLog(
        timestamp=log_in.timestamp or datetime.utcnow(),
        source_ip=log_in.source_ip,
        destination_ip=log_in.destination_ip,
        source_port=log_in.source_port,
        destination_port=log_in.destination_port,
        protocol=log_in.protocol,
        event_type=log_in.event_type,
        username=log_in.username,
        hostname=log_in.hostname,
        action=log_in.action,
        status=log_in.status,
        message=log_in.message,
        raw_log=log_in.raw_log or f"{log_in.timestamp} {log_in.event_type} {log_in.source_ip} {log_in.action} {log_in.status}",
        severity=log_in.severity or "LOW"
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)

    # Pass through detection engine
    evaluate_log_and_generate_alerts(db, db_log)

    return db_log

@router.post("/bulk", status_code=status.HTTP_201_CREATED)
def create_logs_bulk(bulk_in: LogBulkCreate, db: Session = Depends(get_db)):
    created_count = 0
    alerts_generated = 0
    
    for log_in in bulk_in.logs:
        db_log = SecurityLog(
            timestamp=log_in.timestamp or datetime.utcnow(),
            source_ip=log_in.source_ip,
            destination_ip=log_in.destination_ip,
            source_port=log_in.source_port,
            destination_port=log_in.destination_port,
            protocol=log_in.protocol,
            event_type=log_in.event_type,
            username=log_in.username,
            hostname=log_in.hostname,
            action=log_in.action,
            status=log_in.status,
            message=log_in.message,
            raw_log=log_in.raw_log or f"{log_in.timestamp} {log_in.event_type} {log_in.source_ip} {log_in.action} {log_in.status}",
            severity=log_in.severity or "LOW"
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        created_count += 1
        
        alerts = evaluate_log_and_generate_alerts(db, db_log)
        alerts_generated += len(alerts)
        
    return {
        "status": "success",
        "logs_ingested": created_count,
        "alerts_generated": alerts_generated
    }
