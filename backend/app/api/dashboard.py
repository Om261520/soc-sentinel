from datetime import datetime, timedelta
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database.session import get_db
from app.models.models import SecurityLog, Alert, Incident

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)) -> Dict[str, Any]:
    total_events = db.query(func.count(SecurityLog.id)).scalar() or 0
    critical_alerts = db.query(func.count(Alert.id)).filter(Alert.severity == "CRITICAL").scalar() or 0
    high_alerts = db.query(func.count(Alert.id)).filter(Alert.severity == "HIGH").scalar() or 0
    open_incidents = db.query(func.count(Incident.id)).filter(Incident.status.in_(["Open", "Investigating"])).scalar() or 0
    threats_detected = db.query(func.count(Alert.id)).scalar() or 0
    active_investigations = db.query(func.count(Alert.id)).filter(Alert.status == "Investigating").scalar() or 0

    return {
        "total_events": total_events,
        "critical_alerts": critical_alerts,
        "high_alerts": high_alerts,
        "open_incidents": open_incidents,
        "threats_detected": threats_detected,
        "active_investigations": active_investigations,
    }

@router.get("/charts")
def get_dashboard_charts(db: Session = Depends(get_db)) -> Dict[str, Any]:
    # 1. Alert Severity Distribution
    severity_counts = db.query(
        Alert.severity, func.count(Alert.id)
    ).group_by(Alert.severity).all()
    
    severity_dist = {sev: count for sev, count in severity_counts}
    severity_data = [
        {"name": "Critical", "value": severity_dist.get("CRITICAL", 0), "color": "#EF4444"},
        {"name": "High", "value": severity_dist.get("HIGH", 0), "color": "#F97316"},
        {"name": "Medium", "value": severity_dist.get("MEDIUM", 0), "color": "#EAB308"},
        {"name": "Low", "value": severity_dist.get("LOW", 0), "color": "#3B82F6"},
    ]

    # 2. Attack Categories Distribution
    category_counts = db.query(
        Alert.category, func.count(Alert.id)
    ).group_by(Alert.category).order_by(desc(func.count(Alert.id))).limit(8).all()
    
    category_data = [{"category": cat, "count": cnt} for cat, cnt in category_counts]

    # 3. Top Source IPs
    top_ips = db.query(
        Alert.source_ip, 
        func.count(Alert.id).label("alert_count"),
        func.max(Alert.severity).label("max_severity")
    ).filter(Alert.source_ip.isnot(None)).group_by(Alert.source_ip).order_by(desc("alert_count")).limit(5).all()

    top_ips_data = [
        {"ip": ip, "alerts": count, "severity": max_sev or "MEDIUM"} 
        for ip, count, max_sev in top_ips
    ]

    # 4. Alerts Over Time (24 Hour trend)
    now = datetime.utcnow()
    hourly_trends = []
    for i in range(12, -1, -1):
        hour_start = now - timedelta(hours=i*2)
        hour_end = hour_start + timedelta(hours=2)
        
        crit = db.query(func.count(Alert.id)).filter(Alert.severity == "CRITICAL", Alert.timestamp >= hour_start, Alert.timestamp < hour_end).scalar() or 0
        high = db.query(func.count(Alert.id)).filter(Alert.severity == "HIGH", Alert.timestamp >= hour_start, Alert.timestamp < hour_end).scalar() or 0
        med = db.query(func.count(Alert.id)).filter(Alert.severity == "MEDIUM", Alert.timestamp >= hour_start, Alert.timestamp < hour_end).scalar() or 0
        low = db.query(func.count(Alert.id)).filter(Alert.severity == "LOW", Alert.timestamp >= hour_start, Alert.timestamp < hour_end).scalar() or 0

        hourly_trends.append({
            "time": hour_start.strftime("%H:%M"),
            "Critical": crit,
            "High": high,
            "Medium": med,
            "Low": low
        })

    return {
        "severity_distribution": severity_data,
        "attack_categories": category_data,
        "top_source_ips": top_ips_data,
        "alerts_over_time": hourly_trends
    }
