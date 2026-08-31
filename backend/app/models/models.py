from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="analyst") # admin, analyst, viewer
    created_at = Column(DateTime, default=datetime.utcnow)

class SecurityLog(Base):
    __tablename__ = "security_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    source_ip = Column(String(45), index=True, nullable=True)
    destination_ip = Column(String(45), index=True, nullable=True)
    source_port = Column(Integer, nullable=True)
    destination_port = Column(Integer, nullable=True)
    protocol = Column(String(20), nullable=True)
    event_type = Column(String(50), index=True, nullable=False) # authentication, firewall, web, endpoint, network
    username = Column(String(50), index=True, nullable=True)
    hostname = Column(String(100), nullable=True)
    action = Column(String(50), nullable=True) # login, allow, block, execute, query
    status = Column(String(20), nullable=True) # success, failed, blocked, suspicious
    message = Column(Text, nullable=True)
    raw_log = Column(Text, nullable=True)
    severity = Column(String(20), default="LOW") # LOW, MEDIUM, HIGH, CRITICAL
    created_at = Column(DateTime, default=datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String(50), unique=True, index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    rule_name = Column(String(100), nullable=False)
    source_ip = Column(String(45), nullable=True)
    destination_ip = Column(String(45), nullable=True)
    username = Column(String(50), nullable=True)
    severity = Column(String(20), nullable=False, default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    risk_score = Column(Integer, nullable=False, default=50) # 0-100
    risk_factors = Column(JSON, nullable=True) # Breakdown of risk calculation reasons
    status = Column(String(30), nullable=False, default="New") # New, Investigating, Resolved, False Positive
    category = Column(String(100), nullable=False) # Credential Access, Discovery, Execution, Initial Access, etc.
    mitre_technique = Column(String(50), nullable=True) # T1110, T1046, etc.
    mitre_name = Column(String(100), nullable=True)
    trigger_log_ids = Column(JSON, nullable=True) # List of associated log IDs
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    incident = relationship("Incident", back_populates="alerts")

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(20), nullable=False, default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(30), nullable=False, default="Open") # Open, Investigating, Contained, Resolved, Closed
    assigned_to = Column(String(50), nullable=True, default="Unassigned")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    alerts = relationship("Alert", back_populates="incident")
    notes = relationship("IncidentNote", back_populates="incident", cascade="all, delete-orphan")

class IncidentNote(Base):
    __tablename__ = "incident_notes"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    author = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="notes")

class DetectionRule(Base):
    __tablename__ = "detection_rules"

    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    severity = Column(String(20), nullable=False, default="HIGH")
    enabled = Column(Boolean, default=True)
    threshold = Column(Integer, default=5)
    time_window = Column(Integer, default=300) # seconds
    mitre_technique = Column(String(50), nullable=True)
    mitre_name = Column(String(100), nullable=True)
    logic_type = Column(String(50), nullable=False) # brute_force, password_spray, port_scan, powershell, sqli, priv_esc, malware, impossible_travel
    created_at = Column(DateTime, default=datetime.utcnow)

class ThreatIntel(Base):
    __tablename__ = "threat_intel"

    id = Column(Integer, primary_key=True, index=True)
    indicator = Column(String(255), unique=True, index=True, nullable=False)
    type = Column(String(20), nullable=False) # IP, Domain, Hash, URL
    reputation = Column(String(20), nullable=False, default="SUSPICIOUS") # MALICIOUS, SUSPICIOUS, BENIGN
    confidence = Column(Integer, default=85) # 0-100%
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)
    category = Column(String(100), nullable=False) # Botnet, C2, Scanner, Phishing, Ransomware
    description = Column(Text, nullable=True)
