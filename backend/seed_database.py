import random
import uuid
from datetime import datetime, timedelta
from app.database.session import SessionLocal, engine, Base
from app.models.models import User, SecurityLog, Alert, Incident, IncidentNote, DetectionRule, ThreatIntel
from app.core.security import get_password_hash
from app.detection.risk_scorer import calculate_risk_score

def seed_db():
    print("Initializing Database Schemas...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Seeding Demo Users...")
        users = [
            User(
                username="admin",
                email="admin@example.com",
                password_hash=get_password_hash("Admin@123"),
                role="admin"
            ),
            User(
                username="analyst",
                email="analyst@example.com",
                password_hash=get_password_hash("Analyst@123"),
                role="analyst"
            ),
            User(
                username="viewer",
                email="viewer@example.com",
                password_hash=get_password_hash("Viewer@123"),
                role="viewer"
            )
        ]
        db.add_all(users)
        db.commit()

        print("Seeding Detection Rules...")
        rules = [
            DetectionRule(
                rule_id="RULE-001",
                name="Brute Force Login Attempt",
                description="Detects 5 or more failed login attempts from the same source IP address within a 5-minute window.",
                category="Credential Access",
                severity="HIGH",
                enabled=True,
                threshold=5,
                time_window=300,
                mitre_technique="T1110",
                mitre_name="Brute Force",
                logic_type="brute_force"
            ),
            DetectionRule(
                rule_id="RULE-002",
                name="Password Spray Attack",
                description="Detects multiple authentication failures across multiple distinct usernames from a single source IP.",
                category="Credential Access",
                severity="HIGH",
                enabled=True,
                threshold=4,
                time_window=300,
                mitre_technique="T1110.003",
                mitre_name="Password Spraying",
                logic_type="password_spray"
            ),
            DetectionRule(
                rule_id="RULE-003",
                name="Network Port Scan Probe",
                description="Detects a single source IP address initiating connections to multiple distinct destination ports in a short period.",
                category="Discovery",
                severity="MEDIUM",
                enabled=True,
                threshold=8,
                time_window=120,
                mitre_technique="T1046",
                mitre_name="Network Service Scanning",
                logic_type="port_scan"
            ),
            DetectionRule(
                rule_id="RULE-004",
                name="Suspicious PowerShell Command Execution",
                description="Identifies obfuscated PowerShell calls, Base64 decoding, or memory download strings.",
                category="Execution",
                severity="HIGH",
                enabled=True,
                threshold=1,
                time_window=60,
                mitre_technique="T1059.001",
                mitre_name="PowerShell Execution",
                logic_type="powershell"
            ),
            DetectionRule(
                rule_id="RULE-005",
                name="SQL Injection Web Attack",
                description="Detects SQL injection signatures and logic bypass constructs in HTTP web requests.",
                category="Initial Access",
                severity="HIGH",
                enabled=True,
                threshold=1,
                time_window=60,
                mitre_technique="T1190",
                mitre_name="Exploit Public-Facing Application",
                logic_type="sqli"
            ),
            DetectionRule(
                rule_id="RULE-006",
                name="Privilege Escalation Event",
                description="Detects unauthorized administrator role assignment, sudo elevation, or local admin additions.",
                category="Privilege Escalation",
                severity="CRITICAL",
                enabled=True,
                threshold=1,
                time_window=60,
                mitre_technique="T1068",
                mitre_name="Exploitation for Privilege Escalation",
                logic_type="priv_esc"
            ),
            DetectionRule(
                rule_id="RULE-007",
                name="Endpoint Malware / Ransomware Detection",
                description="Detects endpoint security agent alerts regarding ransomware, trojans, or malicious executables.",
                category="Execution",
                severity="CRITICAL",
                enabled=True,
                threshold=1,
                time_window=60,
                mitre_technique="T1204",
                mitre_name="User Execution / Malicious File",
                logic_type="malware"
            ),
            DetectionRule(
                rule_id="RULE-008",
                name="Impossible Travel / Suspicious Geo Login",
                description="Detects successful authentications for the same account from geographically distant locations in an unrealistic timeframe.",
                category="Credential Access",
                severity="HIGH",
                enabled=True,
                threshold=2,
                time_window=600,
                mitre_technique="T1078",
                mitre_name="Valid Accounts",
                logic_type="impossible_travel"
            ),
        ]
        db.add_all(rules)
        db.commit()

        print("Seeding Threat Intelligence Records...")
        threat_intel = [
            ThreatIntel(
                indicator="185.220.101.5",
                type="IP",
                reputation="MALICIOUS",
                confidence=95,
                category="Tor Exit / Botnet C2",
                description="Known active Tor exit node involved in SSH brute-force campaigns."
            ),
            ThreatIntel(
                indicator="45.142.214.165",
                type="IP",
                reputation="MALICIOUS",
                confidence=90,
                category="Scanner",
                description="Automated mass port scanning infrastructure targeting SMB & RDP ports."
            ),
            ThreatIntel(
                indicator="103.21.244.2",
                type="IP",
                reputation="SUSPICIOUS",
                confidence=70,
                category="Proxy / VPN",
                description="Commercial proxy IP associated with credential stuffing attempts."
            ),
            ThreatIntel(
                indicator="malicious-update-server.com",
                type="Domain",
                reputation="MALICIOUS",
                confidence=98,
                category="C2 Domain",
                description="Command & Control domain for Cobalt Strike beacon payloads."
            ),
            ThreatIntel(
                indicator="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                type="Hash",
                reputation="MALICIOUS",
                confidence=100,
                category="Ransomware",
                description="SHA-256 hash corresponding to WannaCry payload binary."
            ),
        ]
        db.add_all(threat_intel)
        db.commit()

        print("Generating Historical Logs and Alerts...")
        now = datetime.utcnow()
        sample_ips = ["192.168.1.105", "10.0.0.25", "185.220.101.5", "45.142.214.165", "103.21.244.2", "172.16.0.40"]
        sample_users = ["admin", "jsmith", "bwayne", "cclark", "analyst", "dev_lead", "system"]
        event_types = ["authentication", "firewall", "web", "endpoint", "network"]
        
        # 200+ logs generation
        logs = []
        for i in range(220):
            timestamp = now - timedelta(minutes=random.randint(1, 1440))
            event_type = random.choice(event_types)
            source_ip = random.choice(sample_ips)
            usr = random.choice(sample_users)
            
            if event_type == "authentication":
                status_choice = random.choice(["success", "failed", "failed", "success"])
                action = "login"
                msg = f"User {usr} authentication {status_choice} from {source_ip}"
                sev = "LOW" if status_choice == "success" else "MEDIUM"
            elif event_type == "firewall":
                status_choice = random.choice(["allow", "blocked"])
                action = status_choice
                msg = f"Firewall rule {status_choice} packet from {source_ip}"
                sev = "LOW"
            elif event_type == "web":
                status_choice = random.choice(["success", "suspicious"])
                action = "HTTP GET"
                msg = f"Web request processed for URI /api/v1/resource"
                sev = "LOW"
            elif event_type == "endpoint":
                status_choice = random.choice(["success", "suspicious"])
                action = "process_execute"
                msg = f"Process svchost.exe launched by user {usr}"
                sev = "LOW"
            else:
                status_choice = "success"
                action = "traffic_flow"
                msg = f"Network traffic flow recorded between {source_ip} and internal server"
                sev = "LOW"

            log = SecurityLog(
                timestamp=timestamp,
                source_ip=source_ip,
                destination_ip="10.0.0.10",
                source_port=random.randint(10000, 65000),
                destination_port=random.choice([22, 80, 443, 3389, 8080]),
                protocol="TCP",
                event_type=event_type,
                username=usr,
                hostname=f"host-srv-{random.randint(1, 10)}",
                action=action,
                status=status_choice,
                message=msg,
                raw_log=f"{timestamp.isoformat()} {event_type} {source_ip} {action} {status_choice}",
                severity=sev
            )
            logs.append(log)
            
        db.add_all(logs)
        db.commit()

        print("Seeding 30 Structured Security Alerts...")
        alerts = []
        alert_templates = [
            ("Possible Brute Force Attack from 185.220.101.5", "Brute Force Login Attempt", "185.220.101.5", "admin", "HIGH", 85, "Credential Access", "T1110", "Brute Force"),
            ("Password Spraying Detected from 103.21.244.2", "Password Spray Attack", "103.21.244.2", "Multiple Users", "HIGH", 78, "Credential Access", "T1110.003", "Password Spraying"),
            ("Possible Network Port Scan from 45.142.214.165", "Network Port Scan Probe", "45.142.214.165", None, "MEDIUM", 55, "Discovery", "T1046", "Network Service Scanning"),
            ("Suspicious PowerShell Execution on WKS-FINANCE-04", "Suspicious PowerShell Command Execution", "10.0.0.105", "jsmith", "HIGH", 82, "Execution", "T1059.001", "PowerShell Execution"),
            ("Possible SQL Injection Attempt from 185.220.101.5", "SQL Injection Web Attack", "185.220.101.5", "anonymous", "HIGH", 88, "Initial Access", "T1190", "Exploit Public-Facing Application"),
            ("Privilege Escalation Event Detected for bwayne", "Privilege Escalation Event", "10.0.0.112", "bwayne", "CRITICAL", 92, "Privilege Escalation", "T1068", "Exploitation for Privilege Escalation"),
            ("Malware / Ransomware Detected on WKS-DEV-09", "Endpoint Malware / Ransomware Detection", "10.0.0.140", "cclark", "CRITICAL", 98, "Execution", "T1204", "User Execution / Malicious File"),
            ("Suspicious Geo Login / Impossible Travel for admin", "Impossible Travel / Suspicious Geo Login", "185.220.101.5", "admin", "HIGH", 75, "Credential Access", "T1078", "Valid Accounts"),
        ]

        statuses = ["New", "Investigating", "Resolved", "False Positive"]

        for i in range(32):
            tpl = alert_templates[i % len(alert_templates)]
            ts = now - timedelta(hours=random.randint(1, 23), minutes=random.randint(0, 59))
            
            score, factors = calculate_risk_score(
                rule_severity=tpl[4],
                event_count=random.randint(5, 25),
                source_ip=tpl[2] or "192.168.1.100",
                username=tpl[3] or "user",
                is_admin_target=tpl[3] == "admin"
            )
            
            alt = Alert(
                alert_id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
                timestamp=ts,
                title=f"{tpl[0]} #{i+1}",
                description=f"Automated security detection rule '{tpl[1]}' triggered due to anomalous log pattern matching threshold.",
                rule_name=tpl[1],
                source_ip=tpl[2],
                destination_ip="10.0.0.10",
                username=tpl[3],
                severity=tpl[4],
                risk_score=score,
                risk_factors=factors,
                status=statuses[i % len(statuses)],
                category=tpl[6],
                mitre_technique=tpl[7],
                mitre_name=tpl[8]
            )
            alerts.append(alt)

        db.add_all(alerts)
        db.commit()

        print("Seeding Incidents...")
        incidents = [
            Incident(
                incident_id=f"INC-{uuid.uuid4().hex[:8].upper()}",
                title="Active Brute Force & Password Spraying Campaign",
                description="External IP address 185.220.101.5 initiating multi-vector credential attacks against executive and admin user accounts.",
                severity="CRITICAL",
                status="Investigating",
                assigned_to="analyst"
            ),
            Incident(
                incident_id=f"INC-{uuid.uuid4().hex[:8].upper()}",
                title="Malware Outbreak on Dev Workstation WKS-DEV-09",
                description="Ransomware binary execution flagged and contained by EDR agent. Requires host isolation and post-incident forensic image review.",
                severity="CRITICAL",
                status="Open",
                assigned_to="admin"
            ),
            Incident(
                incident_id=f"INC-{uuid.uuid4().hex[:8].upper()}",
                title="Public Web Server SQL Injection Attempts",
                description="Automated vulnerability scanner probing web application endpoint /products.php with SQL injection payloads.",
                severity="HIGH",
                status="Contained",
                assigned_to="analyst"
            ),
            Incident(
                incident_id=f"INC-{uuid.uuid4().hex[:8].upper()}",
                title="Unauthorized Privilege Escalation via Sudo",
                description="Standard user account bwayne executed unauthorized privilege grant commands.",
                severity="HIGH",
                status="Resolved",
                assigned_to="admin",
                resolved_at=now - timedelta(hours=2)
            ),
            Incident(
                incident_id=f"INC-{uuid.uuid4().hex[:8].upper()}",
                title="Network Subnet Reconnaissance Scanning",
                description="Internal workstation 45.142.214.165 probed multiple core subnet ports.",
                severity="MEDIUM",
                status="Closed",
                assigned_to="analyst",
                resolved_at=now - timedelta(hours=5)
            )
        ]
        db.add_all(incidents)
        db.commit()

        # Add notes to incidents
        note1 = IncidentNote(
            incident_id=incidents[0].id,
            author="analyst",
            content="Initial triage complete. Source IP 185.220.101.5 added to perimeter firewall blocklist. Resetting password for affected admin account."
        )
        note2 = IncidentNote(
            incident_id=incidents[0].id,
            author="admin",
            content="Verified no active sessions remain for admin from suspicious UK IP block."
        )
        db.add_all([note1, note2])
        db.commit()

        print("Database Seed Completed Successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
