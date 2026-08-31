import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database.session import get_db, Base
from app.core.security import get_password_hash
from app.models.models import User, DetectionRule, SecurityLog, Alert, Incident
from app.detection.risk_scorer import calculate_risk_score

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_soc_sentinel.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    # Create test user
    user = User(
        username="admin",
        email="admin@example.com",
        password_hash=get_password_hash("Admin@123"),
        role="admin"
    )
    db.add(user)
    
    # Create test rules
    rules = [
        DetectionRule(
            rule_id="RULE-001",
            name="Brute Force Login Attempt",
            description="Brute force test rule",
            category="Credential Access",
            severity="HIGH",
            enabled=True,
            threshold=5,
            time_window=300,
            logic_type="brute_force"
        ),
        DetectionRule(
            rule_id="RULE-003",
            name="Network Port Scan Probe",
            description="Port scan test rule",
            category="Discovery",
            severity="MEDIUM",
            enabled=True,
            threshold=5,
            time_window=120,
            logic_type="port_scan"
        ),
        DetectionRule(
            rule_id="RULE-005",
            name="SQL Injection Web Attack",
            description="SQLi test rule",
            category="Initial Access",
            severity="HIGH",
            enabled=True,
            threshold=1,
            time_window=60,
            logic_type="sqli"
        ),
        DetectionRule(
            rule_id="RULE-004",
            name="Suspicious PowerShell Command Execution",
            description="PowerShell test rule",
            category="Execution",
            severity="HIGH",
            enabled=True,
            threshold=1,
            time_window=60,
            logic_type="powershell"
        ),
        DetectionRule(
            rule_id="RULE-007",
            name="Endpoint Malware Detection",
            description="Malware test rule",
            category="Execution",
            severity="CRITICAL",
            enabled=True,
            threshold=1,
            time_window=60,
            logic_type="malware"
        )
    ]
    db.add_all(rules)
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["services"]["database"]["status"] == "ONLINE"

def test_login_success():
    response = client.post("/api/auth/login", json={"username": "admin", "password": "Admin@123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["username"] == "admin"
    assert data["role"] == "admin"

def test_login_failure():
    response = client.post("/api/auth/login", json={"username": "admin", "password": "WrongPassword"})
    assert response.status_code == 401

def test_log_ingestion_single():
    log_data = {
        "event_type": "authentication",
        "source_ip": "192.168.1.50",
        "action": "login",
        "status": "success",
        "username": "admin"
    }
    response = client.post("/api/logs", json=log_data)
    assert response.status_code == 201
    data = response.json()
    assert data["source_ip"] == "192.168.1.50"
    assert data["event_type"] == "authentication"

def test_log_ingestion_bulk():
    bulk_data = {
        "logs": [
            {"event_type": "firewall", "source_ip": "10.0.0.1", "action": "allow"},
            {"event_type": "firewall", "source_ip": "10.0.0.2", "action": "block"}
        ]
    }
    response = client.post("/api/logs/bulk", json=bulk_data)
    assert response.status_code == 201
    assert response.json()["logs_ingested"] == 2

def test_brute_force_detection_rule():
    # Ingest 5 failed login logs from same IP
    for i in range(5):
        log_data = {
            "event_type": "authentication",
            "source_ip": "185.220.101.99",
            "action": "login",
            "status": "failed",
            "username": "admin",
            "message": f"Failed password attempt {i}"
        }
        client.post("/api/logs", json=log_data)

    # Check if Alert was generated
    response = client.get("/api/alerts?source_ip=185.220.101.99")
    assert response.status_code == 200
    alerts = response.json()
    assert len(alerts) >= 1
    assert "Brute Force" in alerts[0]["title"]
    assert alerts[0]["severity"] == "HIGH"

def test_sql_injection_detection_rule():
    log_data = {
        "event_type": "web",
        "source_ip": "45.12.77.21",
        "action": "HTTP POST",
        "status": "suspicious",
        "message": "Payload: ' OR 1=1 --",
        "raw_log": "POST /login.php HTTP/1.1 payload=' OR 1=1 --"
    }
    client.post("/api/logs", json=log_data)

    response = client.get("/api/alerts?source_ip=45.12.77.21")
    assert response.status_code == 200
    alerts = response.json()
    assert len(alerts) >= 1
    assert "SQL Injection" in alerts[0]["title"]

def test_powershell_detection_rule():
    log_data = {
        "event_type": "endpoint",
        "source_ip": "10.0.0.88",
        "action": "process_launch",
        "status": "suspicious",
        "message": "powershell.exe -EncodedCommand QXZhc3Q...",
        "hostname": "WKS-01"
    }
    client.post("/api/logs", json=log_data)

    response = client.get("/api/alerts?search=PowerShell")
    assert response.status_code == 200
    alerts = response.json()
    assert len(alerts) >= 1

def test_malware_detection_rule():
    log_data = {
        "event_type": "endpoint",
        "source_ip": "10.0.0.99",
        "action": "malware_detected",
        "status": "suspicious",
        "message": "Trojan.Win32.Generic execution detected by EDR agent",
        "hostname": "WKS-DEV"
    }
    client.post("/api/logs", json=log_data)

    response = client.get("/api/alerts?severity=CRITICAL")
    assert response.status_code == 200
    alerts = response.json()
    assert len(alerts) >= 1
    assert "Malware" in alerts[0]["title"]

def test_risk_scoring_calculation():
    score, factors = calculate_risk_score(
        rule_severity="CRITICAL",
        event_count=15,
        source_ip="185.220.101.5",
        username="admin",
        is_admin_target=True
    )
    assert 80 <= score <= 100
    assert len(factors) >= 3

def test_incident_creation_and_note():
    # Login to get JWT token
    login_res = client.post("/api/auth/login", json={"username": "admin", "password": "Admin@123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create incident
    inc_data = {
        "title": "Test Threat Incident",
        "description": "Investigating brute force campaign",
        "severity": "HIGH",
        "assigned_to": "admin"
    }
    inc_res = client.post("/api/incidents", json=inc_data, headers=headers)
    assert inc_res.status_code == 201
    incident = inc_res.json()
    assert incident["title"] == "Test Threat Incident"

    # Add note
    note_res = client.post(
        f"/api/incidents/{incident['incident_id']}/notes",
        json={"content": "Source IP blocked at perimeter."},
        headers=headers
    )
    assert note_res.status_code == 201
    assert note_res.json()["content"] == "Source IP blocked at perimeter."
