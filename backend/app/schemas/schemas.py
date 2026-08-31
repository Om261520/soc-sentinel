from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, EmailStr

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    role: str
    email: str

class LoginRequest(BaseModel):
    username: str
    password: str

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Security Log Schemas
class LogCreate(BaseModel):
    timestamp: Optional[datetime] = None
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    source_port: Optional[int] = None
    destination_port: Optional[int] = None
    protocol: Optional[str] = None
    event_type: str
    username: Optional[str] = None
    hostname: Optional[str] = None
    action: Optional[str] = None
    status: Optional[str] = None
    message: Optional[str] = None
    raw_log: Optional[str] = None
    severity: Optional[str] = "LOW"

class LogBulkCreate(BaseModel):
    logs: List[LogCreate]

class LogResponse(LogCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Alert Schemas
class AlertResponse(BaseModel):
    id: int
    alert_id: str
    timestamp: datetime
    title: str
    description: str
    rule_name: str
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    username: Optional[str] = None
    severity: str
    risk_score: int
    risk_factors: Optional[List[Dict[str, Any]]] = None
    status: str
    category: str
    mitre_technique: Optional[str] = None
    mitre_name: Optional[str] = None
    trigger_log_ids: Optional[List[int]] = None
    incident_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AlertStatusUpdate(BaseModel):
    status: str # New, Investigating, Resolved, False Positive

# Incident Schemas
class IncidentNoteCreate(BaseModel):
    content: str

class IncidentNoteResponse(BaseModel):
    id: int
    incident_id: int
    author: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class IncidentCreate(BaseModel):
    title: str
    description: str
    severity: str = "HIGH"
    assigned_to: Optional[str] = "Unassigned"
    alert_ids: Optional[List[int]] = []

class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None # Open, Investigating, Contained, Resolved, Closed
    assigned_to: Optional[str] = None

class IncidentResponse(BaseModel):
    id: int
    incident_id: str
    title: str
    description: str
    severity: str
    status: str
    assigned_to: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    alerts: List[AlertResponse] = []
    notes: List[IncidentNoteResponse] = []

    class Config:
        from_attributes = True

# Detection Rule Schemas
class RuleUpdate(BaseModel):
    enabled: Optional[bool] = None
    threshold: Optional[int] = None
    time_window: Optional[int] = None
    severity: Optional[str] = None

class RuleResponse(BaseModel):
    id: int
    rule_id: str
    name: str
    description: str
    category: str
    severity: str
    enabled: bool
    threshold: int
    time_window: int
    mitre_technique: Optional[str] = None
    mitre_name: Optional[str] = None
    logic_type: str
    created_at: datetime

    class Config:
        from_attributes = True

# Threat Intel Schema
class ThreatIntelResponse(BaseModel):
    id: int
    indicator: str
    type: str
    reputation: str
    confidence: int
    first_seen: datetime
    last_seen: datetime
    category: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

# Simulation Request
class SimulationRequest(BaseModel):
    attack_type: str # brute_force, port_scan, sqli, powershell, priv_esc, malware, impossible_travel
    source_ip: Optional[str] = "185.220.101.5"
    target_user: Optional[str] = "admin"
    count: Optional[int] = 10

# AI Analysis Response
class AIAnalysisResponse(BaseModel):
    alert_id: str
    threat_summary: str
    attack_type: str
    suspicious_indicators: List[str]
    mitre_context: str
    recommended_steps: List[str]
    containment_recommendation: str
