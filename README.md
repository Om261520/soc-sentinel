# SOC Sentinel

### Security Operations Center — Threat Detection & Analysis Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-00f0ff?style=for-the-badge&logo=githubpages&logoColor=black)](https://om261520.github.io/soc-sentinel/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC.svg)](https://tailwindcss.com/)

> 🌐 **Live Website / Interactive Demo:** [https://om261520.github.io/soc-sentinel/](https://om261520.github.io/soc-sentinel/)
>
> Experience the full SOC analyst dashboard, attack simulation triggers, Sigma detection rule evaluation, MITRE ATT&CK matrix mapping, and AI triage directly in your browser.

**SOC Sentinel** is a portfolio-ready, full-stack Cybersecurity Operations Center (SOC) threat detection and incident analysis platform built from scratch. It ingests security event logs, normalizes telemetry data, evaluates events using a rule-based Detection Engine, calculates threat risk scores (0–100), generates structured alerts mapped to MITRE ATT&CK techniques, and provides SOC analysts with investigation tools, incident management workflows, and attack scenario simulations.

---

## Architecture Overview

```mermaid
flowchart TD
    subgraph Data Sources & Simulation
        SIM[Attack Simulator / Demo Mode Stream]
        EXT[POST /api/logs & /api/logs/bulk]
    end

    subgraph Backend - FastAPI Architecture
        INGEST[Log Ingestion & Normalizer]
        ENGINE[Detection Engine]
        RULES[Rule Set: Brute Force, Port Scan, SQLi, PS, PrivEsc...]
        RISK[Risk Scoring Engine 0-100]
        AI[AI Threat Analyst / Fallback Rule Analyzer]
        AUTH[JWT Auth & Password Hash]
        DB[(SQLite / PostgreSQL)]
    end

    subgraph Frontend - React Vite TS UI
        DASH[SOC Dashboard: KPIs & Recharts]
        ALERTS[Alert Feed & Alert Investigation Page]
        LOGS[Security Log Explorer & Filter Bar]
        INCIDENTS[Incident Manager & Notes Editor]
        RULES_UI[Detection Rule Manager]
        INTEL[Threat Intelligence IOC Table]
        SIM_UI[Attack Simulator Page]
        HEALTH[System Health Monitor]
    end

    SIM --> INGEST
    EXT --> INGEST
    INGEST --> ENGINE
    ENGINE --> RULES
    RULES --> RISK
    RISK --> DB
    AI --> DB
    AUTH --> DB
    
    DASH <--> Backend API
    ALERTS <--> Backend API
    LOGS <--> Backend API
    INCIDENTS <--> Backend API
    RULES_UI <--> Backend API
    INTEL <--> Backend API
    SIM_UI <--> Backend API
    HEALTH <--> Backend API
```

---

## Key Features

- 🛡️ **Real-Time SOC Dashboard**: High-density dark cybersecurity theme with top KPI cards, 24-hour alert trend line chart, severity distribution donut chart, attack categories bar chart, and top suspicious IPs list.
- ⚙️ **Rule-Based Detection Engine**: Evaluates incoming logs against 8 modular rules with sliding time window analysis.
- 🎯 **Dynamic Risk Scoring (0–100)**: Calculates risk scores based on base severity, event velocity, asset criticality, and source IP reputation with clear point factor breakdowns.
- 🎯 **MITRE ATT&CK Mapping**: Integrates technique IDs (`T1110`, `T1046`, `T1059.001`, `T1190`, `T1068`, `T1204`, `T1078`) into alerts and incidents.
- 🔎 **Security Log Explorer**: Filterable log table with search, event type dropdowns, raw JSON payload modal viewer, and pagination.
- 🚨 **Alert Triage & Investigation**: Detailed alert investigation workstation featuring chronological event timeline, raw syslog details, educational *"Why Was This Detected?"* context, and status workflows.
- 📁 **Incident Management**: Escalate alerts to incidents, assign SOC responders, track containment statuses (`Open`, `Investigating`, `Contained`, `Resolved`, `Closed`), and maintain investigation notes.
- ⚡ **Interactive Attack Simulator**: Single-click attack generators (`Brute Force`, `Port Scan`, `SQL Injection`, `PowerShell Payload`, `Privilege Escalation`, `Malware Detection`, `Impossible Travel`).
- 🤖 **AI Threat Triage Module**: Automated threat hypothesis and recommended containment steps (with offline deterministic fallback).
- 🩺 **System Health Diagnostics**: Real-time diagnostic monitor checking API, Database, Detection Engine, and Log Pipeline health.

---

## Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Recharts, Lucide React icons, React Router DOM v6
- **Backend**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0 ORM, PyJWT, Passlib (bcrypt), Pytest
- **Database**: SQLite (local development) / PostgreSQL (production compatible)
- **DevOps**: Docker, Docker Compose

---

## Detection Rules & MITRE ATT&CK Mapping

| Rule ID | Rule Name | Category | Default Severity | MITRE ATT&CK |
|---------|-----------|----------|------------------|--------------|
| `RULE-001` | Brute Force Login Attempt | Credential Access | HIGH | T1110 |
| `RULE-002` | Password Spray Attack | Credential Access | HIGH | T1110.003 |
| `RULE-003` | Network Port Scan Probe | Discovery | MEDIUM | T1046 |
| `RULE-004` | Suspicious PowerShell Execution | Execution | HIGH | T1059.001 |
| `RULE-005` | SQL Injection Web Attack | Initial Access | HIGH | T1190 |
| `RULE-006` | Privilege Escalation Event | Privilege Escalation | CRITICAL | T1068 |
| `RULE-007` | Endpoint Malware / Ransomware | Execution | CRITICAL | T1204 |
| `RULE-008` | Impossible Travel / Geo Login | Credential Access | HIGH | T1078 |

---

## Quick Start Guide (Windows / Linux / macOS)

### Prerequisites
- Python 3.11+
- Node.js v18+ and npm

### 1. Setup Backend
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python seed_database.py
uvicorn app.main:app --reload
```
*Backend API running at:* `http://localhost:8000`  
*Swagger Documentation:* `http://localhost:8000/docs`

### 2. Setup Frontend
```powershell
cd frontend
npm install
npm run dev
```
*Frontend Application running at:* `http://localhost:5173`

---

## Demo Accounts

The database seed script creates 3 demo accounts (auto-fill options available on the login page):

- **Admin Account**: `admin` / `Admin@123`
- **Analyst Account**: `analyst` / `Analyst@123`
- **Viewer Account**: `viewer` / `Viewer@123`

---

## Running Unit Tests

Backend tests verify authentication, log ingestion, all 8 detection engine rules, risk scoring calculations, and incident workflows:

```powershell
cd backend
.\venv\Scripts\activate
python -m pytest tests/ -v
```

---

## Containerized Deployment (Docker)

Run the complete platform using Docker Compose:

```powershell
docker compose up --build
```

---

## Future Scope & Improvements

- Integration with Wazuh EDR / SIEM agents
- Elasticsearch / OpenSearch indexing for log storage
- Apache Kafka event stream pipeline
- Machine Learning Anomaly Detection (Isolation Forest)
- Real threat intelligence API integrations (VirusTotal, AlienVault OTX)
