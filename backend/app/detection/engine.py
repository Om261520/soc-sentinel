import uuid
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.models import SecurityLog, Alert, DetectionRule, ThreatIntel
from app.detection.risk_scorer import calculate_risk_score

def evaluate_log_and_generate_alerts(db: Session, log: SecurityLog) -> List[Alert]:
    """
    Evaluates an incoming SecurityLog against active detection rules in the database.
    Creates and persists Alert objects if rule criteria are satisfied.
    """
    generated_alerts: List[Alert] = []
    
    # Retrieve all enabled detection rules
    rules = db.query(DetectionRule).filter(DetectionRule.enabled == True).all()
    
    for rule in rules:
        alert = None
        
        # Rule 1: Brute Force Login (5+ failed logins from same IP in window)
        if rule.logic_type == "brute_force" and log.event_type == "authentication" and log.status == "failed":
            window_start = datetime.utcnow() - timedelta(seconds=rule.time_window)
            failed_logs = db.query(SecurityLog).filter(
                SecurityLog.event_type == "authentication",
                SecurityLog.status == "failed",
                SecurityLog.source_ip == log.source_ip,
                SecurityLog.timestamp >= window_start
            ).all()
            
            if len(failed_logs) >= rule.threshold:
                # Check if an alert for this IP was recently created to avoid duplicate spam
                recent_alert = db.query(Alert).filter(
                    Alert.rule_name == rule.name,
                    Alert.source_ip == log.source_ip,
                    Alert.created_at >= window_start
                ).first()
                
                if not recent_alert:
                    log_ids = [l.id for l in failed_logs]
                    risk_score, factors = calculate_risk_score(
                        rule_severity=rule.severity,
                        event_count=len(failed_logs),
                        source_ip=log.source_ip or "",
                        username=log.username or "",
                        is_admin_target=log.username in ["admin", "administrator", "root"] if log.username else False
                    )
                    alert = Alert(
                        alert_id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
                        timestamp=datetime.utcnow(),
                        title=f"Possible Brute Force Attack from {log.source_ip}",
                        description=f"Detected {len(failed_logs)} failed login attempts from source IP {log.source_ip} within {rule.time_window // 60} minutes.",
                        rule_name=rule.name,
                        source_ip=log.source_ip,
                        destination_ip=log.destination_ip,
                        username=log.username,
                        severity=rule.severity,
                        risk_score=risk_score,
                        risk_factors=factors,
                        status="New",
                        category=rule.category,
                        mitre_technique=rule.mitre_technique,
                        mitre_name=rule.mitre_name,
                        trigger_log_ids=log_ids
                    )

        # Rule 2: Password Spray (Multiple usernames targeted by 1 IP)
        elif rule.logic_type == "password_spray" and log.event_type == "authentication" and log.status == "failed":
            window_start = datetime.utcnow() - timedelta(seconds=rule.time_window)
            recent_logs = db.query(SecurityLog).filter(
                SecurityLog.event_type == "authentication",
                SecurityLog.status == "failed",
                SecurityLog.source_ip == log.source_ip,
                SecurityLog.timestamp >= window_start
            ).all()
            
            distinct_usernames = {l.username for l in recent_logs if l.username}
            if len(distinct_usernames) >= rule.threshold:
                recent_alert = db.query(Alert).filter(
                    Alert.rule_name == rule.name,
                    Alert.source_ip == log.source_ip,
                    Alert.created_at >= window_start
                ).first()
                
                if not recent_alert:
                    risk_score, factors = calculate_risk_score(
                        rule_severity=rule.severity,
                        event_count=len(recent_logs),
                        source_ip=log.source_ip or "",
                        username="Multiple Users",
                        additional_signals=[f"Targeted {len(distinct_usernames)} unique user accounts"]
                    )
                    alert = Alert(
                        alert_id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
                        timestamp=datetime.utcnow(),
                        title=f"Password Spraying Detected from {log.source_ip}",
                        description=f"Source IP {log.source_ip} attempted login against {len(distinct_usernames)} unique usernames ({', '.join(list(distinct_usernames)[:3])}...).",
                        rule_name=rule.name,
                        source_ip=log.source_ip,
                        destination_ip=log.destination_ip,
                        username="Multiple Accounts",
                        severity=rule.severity,
                        risk_score=risk_score,
                        risk_factors=factors,
                        status="New",
                        category=rule.category,
                        mitre_technique=rule.mitre_technique,
                        mitre_name=rule.mitre_name,
                        trigger_log_ids=[l.id for l in recent_logs]
                    )

        # Rule 3: Port Scan (1 source IP contacting multiple ports)
        elif rule.logic_type == "port_scan" and (log.event_type in ["firewall", "network"]):
            window_start = datetime.utcnow() - timedelta(seconds=rule.time_window)
            recent_logs = db.query(SecurityLog).filter(
                SecurityLog.event_type.in_(["firewall", "network"]),
                SecurityLog.source_ip == log.source_ip,
                SecurityLog.timestamp >= window_start
            ).all()
            
            distinct_ports = {l.destination_port for l in recent_logs if l.destination_port}
            if len(distinct_ports) >= rule.threshold:
                recent_alert = db.query(Alert).filter(
                    Alert.rule_name == rule.name,
                    Alert.source_ip == log.source_ip,
                    Alert.created_at >= window_start
                ).first()
                
                if not recent_alert:
                    risk_score, factors = calculate_risk_score(
                        rule_severity=rule.severity,
                        event_count=len(recent_logs),
                        source_ip=log.source_ip or "",
                        username=log.username or "",
                        additional_signals=[f"Probed {len(distinct_ports)} distinct destination ports"]
                    )
                    alert = Alert(
                        alert_id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
                        timestamp=datetime.utcnow(),
                        title=f"Possible Network Port Scan from {log.source_ip}",
                        description=f"Source IP {log.source_ip} connected to {len(distinct_ports)} distinct destination ports within {rule.time_window}s window.",
                        rule_name=rule.name,
                        source_ip=log.source_ip,
                        destination_ip=log.destination_ip,
                        username=log.username,
                        severity=rule.severity,
                        risk_score=risk_score,
                        risk_factors=factors,
                        status="New",
                        category=rule.category,
                        mitre_technique=rule.mitre_technique,
                        mitre_name=rule.mitre_name,
                        trigger_log_ids=[l.id for l in recent_logs]
                    )

        # Rule 4: Suspicious PowerShell Execution
        elif rule.logic_type == "powershell" and log.event_type == "endpoint":
            msg = (log.message or "") + " " + (log.raw_log or "")
            suspicious_keywords = ["encodedcommand", "downloadstring", "invoke-webrequest", "iex", "frombase64string", "bypass"]
            if any(kw in msg.lower() for kw in suspicious_keywords):
                risk_score, factors = calculate_risk_score(
                    rule_severity=rule.severity,
                    event_count=1,
                    source_ip=log.source_ip or "",
                    username=log.username or "",
                    additional_signals=["Suspicious obfuscated or download command string detected"]
                )
                alert = Alert(
                    alert_id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
                    timestamp=datetime.utcnow(),
                    title=f"Suspicious PowerShell Execution on {log.hostname or 'Host'}",
                    description=f"Execution of encoded/download PowerShell command string detected for user {log.username}.",
                    rule_name=rule.name,
                    source_ip=log.source_ip,
                    destination_ip=log.destination_ip,
                    username=log.username,
                    severity=rule.severity,
                    risk_score=risk_score,
                    risk_factors=factors,
                    status="New",
                    category=rule.category,
                    mitre_technique=rule.mitre_technique,
                    mitre_name=rule.mitre_name,
                    trigger_log_ids=[log.id]
                )

        # Rule 5: SQL Injection Attack
        elif rule.logic_type == "sqli" and log.event_type == "web":
            msg = (log.message or "") + " " + (log.raw_log or "")
            sqli_patterns = ["' or 1=1", "union select", "select * from", "drop table", "information_schema", "--"]
            if any(pat in msg.lower() for pat in sqli_patterns):
                risk_score, factors = calculate_risk_score(
                    rule_severity=rule.severity,
                    event_count=1,
                    source_ip=log.source_ip or "",
                    username=log.username or "",
                    additional_signals=["Payload matches known SQL Injection signature"]
                )
                alert = Alert(
                    alert_id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
                    timestamp=datetime.utcnow(),
                    title=f"Possible SQL Injection Attempt from {log.source_ip}",
                    description=f"Malicious SQL query pattern detected in HTTP web request from IP {log.source_ip}.",
                    rule_name=rule.name,
                    source_ip=log.source_ip,
                    destination_ip=log.destination_ip,
                    username=log.username,
                    severity=rule.severity,
                    risk_score=risk_score,
                    risk_factors=factors,
                    status="New",
                    category=rule.category,
                    mitre_technique=rule.mitre_technique,
                    mitre_name=rule.mitre_name,
                    trigger_log_ids=[log.id]
                )

        # Rule 6: Privilege Escalation
        elif rule.logic_type == "priv_esc":
            msg = (log.message or "") + " " + (log.action or "")
            if any(term in msg.lower() for term in ["sudo", "privilege_grant", "admin_role", "user_added_to_admin", "su root"]):
                risk_score, factors = calculate_risk_score(
                    rule_severity=rule.severity,
                    event_count=1,
                    source_ip=log.source_ip or "",
                    username=log.username or "",
                    is_admin_target=True,
                    additional_signals=["Unauthorized account elevation or admin rights modification"]
                )
                alert = Alert(
                    alert_id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
                    timestamp=datetime.utcnow(),
                    title=f"Privilege Escalation Event Detected for {log.username or 'User'}",
                    description=f"User {log.username} executed administrative privilege escalation command or received elevated group access.",
                    rule_name=rule.name,
                    source_ip=log.source_ip,
                    destination_ip=log.destination_ip,
                    username=log.username,
                    severity=rule.severity,
                    risk_score=risk_score,
                    risk_factors=factors,
                    status="New",
                    category=rule.category,
                    mitre_technique=rule.mitre_technique,
                    mitre_name=rule.mitre_name,
                    trigger_log_ids=[log.id]
                )

        # Rule 7: Malware Detection
        elif rule.logic_type == "malware" and (log.event_type == "endpoint" or log.status == "suspicious"):
            msg = (log.message or "") + " " + (log.raw_log or "") + " " + (log.action or "")
            malware_terms = ["malware_detected", "ransomware", "trojan", "suspicious_executable", "eicar", "mimikatz"]
            if any(term in msg.lower() for term in malware_terms):
                risk_score, factors = calculate_risk_score(
                    rule_severity=rule.severity,
                    event_count=1,
                    source_ip=log.source_ip or "",
                    username=log.username or "",
                    additional_signals=["Endpoint Antivirus / EDR flagged malicious binary signature"]
                )
                alert = Alert(
                    alert_id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
                    timestamp=datetime.utcnow(),
                    title=f"Malware / Ransomware Detected on {log.hostname or 'Endpoint'}",
                    description=f"EDR security agent detected malicious artifact on host {log.hostname} for user {log.username}.",
                    rule_name=rule.name,
                    source_ip=log.source_ip,
                    destination_ip=log.destination_ip,
                    username=log.username,
                    severity=rule.severity,
                    risk_score=risk_score,
                    risk_factors=factors,
                    status="New",
                    category=rule.category,
                    mitre_technique=rule.mitre_technique,
                    mitre_name=rule.mitre_name,
                    trigger_log_ids=[log.id]
                )

        # Rule 8: Impossible Travel / Suspicious Geo Login
        elif rule.logic_type == "impossible_travel" and log.event_type == "authentication" and log.status == "success":
            window_start = datetime.utcnow() - timedelta(seconds=rule.time_window)
            recent_logins = db.query(SecurityLog).filter(
                SecurityLog.event_type == "authentication",
                SecurityLog.status == "success",
                SecurityLog.username == log.username,
                SecurityLog.timestamp >= window_start
            ).all()
            
            # Check for multiple distinct IP addresses for the same user in short window
            ips = {l.source_ip for l in recent_logins if l.source_ip}
            if len(ips) >= 2:
                recent_alert = db.query(Alert).filter(
                    Alert.rule_name == rule.name,
                    Alert.username == log.username,
                    Alert.created_at >= window_start
                ).first()
                
                if not recent_alert:
                    risk_score, factors = calculate_risk_score(
                        rule_severity=rule.severity,
                        event_count=len(recent_logins),
                        source_ip=log.source_ip or "",
                        username=log.username or "",
                        additional_signals=[f"Successful logins from distant IPs ({', '.join(ips)}) within unrealistic timeframe"]
                    )
                    alert = Alert(
                        alert_id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
                        timestamp=datetime.utcnow(),
                        title=f"Suspicious Geo Login / Impossible Travel for {log.username}",
                        description=f"User {log.username} successfully authenticated from geographically distant IPs {', '.join(ips)} within a short timeframe.",
                        rule_name=rule.name,
                        source_ip=log.source_ip,
                        destination_ip=log.destination_ip,
                        username=log.username,
                        severity=rule.severity,
                        risk_score=risk_score,
                        risk_factors=factors,
                        status="New",
                        category=rule.category,
                        mitre_technique=rule.mitre_technique,
                        mitre_name=rule.mitre_name,
                        trigger_log_ids=[l.id for l in recent_logins]
                    )

        if alert:
            db.add(alert)
            db.commit()
            db.refresh(alert)
            generated_alerts.append(alert)

    return generated_alerts
