# SOC Sentinel — SOC Analyst Investigation Guide

This guide walks through the step-by-step SOC analyst workflow demonstrated by SOC Sentinel.

---

## Complete Analyst Workflow (15 Steps)

```text
1. Login to Platform  ────►  2. Review SOC Dashboard  ────►  3. Identify Critical Alert
                                                                    │
8. MITRE Technique    ◄────  7. Event Timeline        ◄────  4. Open Alert Details
        │                                                           │
        ▼                                                           ▼
9. Check Risk Score   ────► 10. Run AI Triage         ────► 5. Investigate Source IP
                                                                    │
14. Mark Contained    ◄──── 13. Add Case Notes        ◄──── 11. Promote to Incident
        │
        ▼
15. Resolve Incident
```

### Detailed Step Guide

1. **Login**: Authenticate at `http://localhost:5173/login` using analyst credentials (`analyst` / `Analyst@123`).
2. **Dashboard Overview**: Inspect KPI cards (Total Events, Critical/High Alerts, Open Incidents), Alert Trend line chart, and Top Suspicious Source IPs.
3. **Identify Critical Alert**: Locate an alert with `CRITICAL` or `HIGH` severity badge in the real-time Alert Feed.
4. **Open Alert Details**: Click **Triage** or **Investigate** to navigate to `/alerts/:id`.
5. **Investigate Source IP**: Review the offender's IP address (e.g., `185.220.101.5`), destination IP, and target username.
6. **Review Log Timeline**: Scroll down to inspect the raw security event timeline showing preceding failed logins or web queries.
7. **Educational Context**: Read the *"Why Was This Detected?"* panel explaining the underlying security logic.
8. **MITRE ATT&CK Mapping**: Check the mapped MITRE technique (e.g. `T1110 - Brute Force` or `T1190 - SQL Injection`).
9. **Calculate & Inspect Risk Score**: Inspect the dynamic Risk Score meter (0–100) and itemized point breakdown (+25 repeated failed auth, +20 high frequency...).
10. **Run AI Triage**: Click **Run Triage** to generate automated threat summary, attack hypotheses, and containment steps.
11. **Promote to Incident**: Click **Promote to Incident** to create an escalation case file.
12. **Assign Analyst**: Set the assigned SOC responder in the Incident Management workstation (`/incidents/:id`).
13. **Add Investigation Notes**: Record containment actions (e.g., *"Blocked source IP on perimeter firewall"*).
14. **Mark Contained**: Transition the incident workflow status to `Contained`.
15. **Resolve Case**: Transition status to `Resolved` once remediation verification is complete.
