# SOC Sentinel — Detection Rules Documentation

This document describes the active rule-based detection logic implemented inside `backend/app/detection/engine.py`.

---

## Rule Summary Table

| Rule ID | Rule Name | Category | Default Severity | MITRE ATT&CK | Logic Summary |
|---------|-----------|----------|------------------|--------------|---------------|
| `RULE-001` | Brute Force Login Attempt | Credential Access | HIGH | T1110 | 5+ failed logins from same source IP in 5 min |
| `RULE-002` | Password Spray Attack | Credential Access | HIGH | T1110.003 | Failed logins across 4+ unique usernames from same IP |
| `RULE-003` | Network Port Scan Probe | Discovery | MEDIUM | T1046 | Connection attempts to 8+ distinct destination ports in 2 min |
| `RULE-004` | Suspicious PowerShell Execution | Execution | HIGH | T1059.001 | Encoded command strings, DownloadString, IEX, or Bypass flags |
| `RULE-005` | SQL Injection Web Attack | Initial Access | HIGH | T1190 | Web request matching `' OR 1=1`, `UNION SELECT`, `DROP TABLE` |
| `RULE-006` | Privilege Escalation Event | Privilege Escalation | CRITICAL | T1068 | Unauthorized admin role grant, sudo usage, or group changes |
| `RULE-007` | Endpoint Malware / Ransomware | Execution | CRITICAL | T1204 | EDR agent detections (ransomware, trojan, mimikatz, WannaCry) |
| `RULE-008` | Impossible Travel / Geo Login | Credential Access | HIGH | T1078 | Successful logins for same user from distant IPs within 10 min |

---

## Detailed Rule Specifications

### RULE-001: Brute Force Login Attempt
- **MITRE Technique**: T1110 (Brute Force)
- **Log Source**: Authentication logs (`event_type == "authentication"`)
- **Condition**: Count of logs with `status == "failed"` from the same `source_ip` $\ge 5$ within 300 seconds.
- **Risk Score Impact**: +60 base + frequency points + admin target bonus.

### RULE-002: Password Spray Attack
- **MITRE Technique**: T1110.003 (Password Spraying)
- **Condition**: Distinct count of targeted `username` values $\ge 4$ from same `source_ip` within 300 seconds.

### RULE-003: Network Port Scan Probe
- **MITRE Technique**: T1046 (Network Service Scanning)
- **Condition**: Distinct count of `destination_port` values $\ge 8$ from same `source_ip` within 120 seconds.

### RULE-004: Suspicious PowerShell Execution
- **MITRE Technique**: T1059.001 (PowerShell)
- **Condition**: Log payload contains substrings: `EncodedCommand`, `DownloadString`, `Invoke-WebRequest`, `IEX`, `FromBase64String`, `Bypass`.

### RULE-005: SQL Injection Web Attack
- **MITRE Technique**: T1190 (Exploit Public-Facing Application)
- **Condition**: Web log payload contains substrings: `' OR 1=1`, `UNION SELECT`, `SELECT * FROM`, `DROP TABLE`, `--`.

### RULE-006: Privilege Escalation Event
- **MITRE Technique**: T1068 (Exploitation for Privilege Escalation)
- **Condition**: Endpoint log action contains: `sudo`, `privilege_grant`, `admin_role`, `user_added_to_admin`.

### RULE-007: Endpoint Malware Detection
- **MITRE Technique**: T1204 (User Execution)
- **Condition**: Log message contains: `malware_detected`, `ransomware`, `trojan`, `suspicious_executable`, `mimikatz`.

### RULE-008: Impossible Travel / Suspicious Geo Login
- **MITRE Technique**: T1078 (Valid Accounts)
- **Condition**: Successful authentications for same user from $\ge 2$ distinct IP addresses within 600 seconds.
