# SOC Sentinel — Architecture Documentation

## System Architecture

SOC Sentinel is designed following clean multi-tier SOC architecture principles.

```text
+-----------------------------------------------------------------------+
|                           FRONTEND LAYER                              |
|   React 18 + Vite + TypeScript + Tailwind CSS + Recharts + Lucide     |
|   Pages: Dashboard, Alert Feed, Log Explorer, Incident Manager,       |
|          Rules Config, Threat Intel, Attack Simulator, Health Monitor |
+-----------------------------------------------------------------------+
                                   │
                           REST API Calls (JSON / JWT)
                                   ▼
+-----------------------------------------------------------------------+
|                           BACKEND API LAYER                           |
|   FastAPI + Pydantic v2 + OAuth2 / PyJWT + Bcrypt Password Hash       |
|   Routers: /auth, /dashboard, /logs, /alerts, /incidents, /rules...   |
+-----------------------------------------------------------------------+
                                   │
                                   ▼
+-----------------------------------------------------------------------+
|                    DETECTION & RISK ENGINE LAYER                      |
|  - Log Normalization & Validation                                     |
|  - Modular Detection Rules (Brute Force, Spray, SQLi, PS, PrivEsc...) |
|  - Dynamic Risk Scoring Engine (0-100 Score + Itemized Factors)      |
|  - AI / Deterministic Fallback Triage Analyst Service                 |
+-----------------------------------------------------------------------+
                                   │
                                   ▼
+-----------------------------------------------------------------------+
|                          DATABASE STORAGE                             |
|   SQLAlchemy 2.0 ORM + SQLite (Production-ready PostgreSQL support)    |
|   Tables: users, security_logs, alerts, incidents, rules, threat_intel|
+-----------------------------------------------------------------------+
```

## Data Ingestion & Alert Flow

1. **Ingestion**: Raw log data enters via `POST /api/logs` or `POST /api/logs/bulk`.
2. **Normalization**: The backend normalizes timestamp, IP addresses, usernames, event types, action, and severity.
3. **Detection Engine**: Active rules in database are evaluated against the log and sliding time windows.
4. **Risk Calculation**: If a rule triggers, `calculate_risk_score()` assigns a score (0–100) based on base weight, event frequency, asset criticality, and threat reputation.
5. **Alert Creation**: A structured Alert with MITRE ATT&CK technique mapping is generated and stored.
6. **Incident Promotion**: SOC Analysts can escalate alerts to Incidents, assign responders, add notes, and track resolution workflows.
