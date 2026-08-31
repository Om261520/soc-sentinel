# SOC Sentinel — REST API Endpoint Documentation

FastAPI automatically serves interactive Swagger UI documentation at `http://localhost:8000/docs`.

---

## Base URL
`http://localhost:8000/api`

---

## Authentication Endpoints

### `POST /api/auth/login`
Authenticates a SOC analyst or admin user and returns a JWT access token.
- **Request Body**: `{"username": "analyst", "password": "Analyst@123"}`
- **Response**: `{"access_token": "...", "token_type": "bearer", "username": "analyst", "role": "analyst"}`

### `GET /api/auth/me`
Returns current authenticated user details. Requires `Authorization: Bearer <token>`.

---

## Dashboard Endpoints

### `GET /api/dashboard/stats`
Returns aggregated KPI counts (Total Events, Critical/High Alerts, Open Incidents, Threats Detected, Active Investigations).

### `GET /api/dashboard/charts`
Returns dataset payloads for Recharts visualizations (Alert Severity distribution, Attack Categories, Top Source IPs, Alerts Over Time 24h trend).

---

## Security Logs Endpoints

### `GET /api/logs`
Query security logs with optional filters: `skip`, `limit`, `search`, `event_type`, `severity`, `source_ip`.

### `POST /api/logs`
Ingest a single security event log. Automatically triggers the Detection Engine.
- **Request Body**:
  ```json
  {
    "event_type": "authentication",
    "source_ip": "185.220.101.5",
    "destination_ip": "10.0.0.10",
    "username": "admin",
    "action": "login",
    "status": "failed",
    "message": "SSH authentication failed for user admin"
  }
  ```

### `POST /api/logs/bulk`
Ingest bulk array of security logs.

---

## Alerts Endpoints

### `GET /api/alerts`
Retrieves generated threat alerts with optional query parameters: `severity`, `status_filter`, `search`, `limit`.

### `GET /api/alerts/{id}`
Retrieves detailed alert summary, risk factors, and MITRE mapping.

### `PATCH /api/alerts/{id}`
Updates alert status (`New`, `Investigating`, `Resolved`, `False Positive`).

### `POST /api/alerts/{id}/analyze`
Generates automated AI / rule-based triage recommendations.

---

## Incidents Endpoints

### `GET /api/incidents`
Lists all security incident cases.

### `POST /api/incidents`
Creates a new incident case file.

### `GET /api/incidents/{id}`
Retrieves incident case file, attached alerts, and analyst notes.

### `PATCH /api/incidents/{id}`
Updates incident status (`Open`, `Investigating`, `Contained`, `Resolved`, `Closed`) or assignee.

### `POST /api/incidents/{id}/notes`
Adds an investigation note to an incident.

---

## Detection Rules & System Health

### `GET /api/rules`
Lists all detection rules and status.

### `PATCH /api/rules/{id}`
Enables/disables rule or updates threshold/time window settings.

### `GET /api/threat-intelligence`
Lists threat intelligence IOC records.

### `POST /api/simulations/trigger`
Triggers simulated attack scenario (`brute_force`, `port_scan`, `sqli`, `powershell`, `priv_esc`, `malware`, `impossible_travel`).

### `GET /api/health`
Returns live diagnostic health metrics of backend components.
