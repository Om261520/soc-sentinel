import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static assets from dist if built
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// In-Memory Database State
let telemetryLogs = [];
let activeAlerts = [];
let isolatedHosts = new Set();
let blockedIPs = new Set(['185.220.101.5', '194.26.29.112']);
let activeCases = [
  {
    id: 'INC-2026-8801',
    title: 'Possible Ransomware Shadow Copy Deletion on FIN-SERVER-02',
    severity: 'CRITICAL',
    status: 'IN_PROGRESS',
    assignedTo: 'Analyst Sarah Chen',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    host: '192.168.1.45 (FIN-SERVER-02)',
    mitreTechnique: 'T1490 - Inhibit System Recovery',
    notes: ['Initial triage completed. EDR triggered process termination alert.'],
    actionsTaken: ['Isolated Host from Subnet']
  },
  {
    id: 'INC-2026-8794',
    title: 'SSH Brute Force Attack detected from 185.220.101.5',
    severity: 'HIGH',
    status: 'NEW',
    assignedTo: 'Unassigned',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    host: '10.0.0.12 (AUTH-GW-01)',
    mitreTechnique: 'T1110 - Brute Force',
    notes: ['Over 150 failed SSH authentication attempts within 60 seconds.'],
    actionsTaken: []
  }
];

// Pre-defined Detection Rules (Sigma format)
let detectionRules = [
  {
    id: 'RULE-001',
    name: 'LSASS Memory Credential Dumping via Mimikatz',
    severity: 'CRITICAL',
    mitreId: 'T1003.001',
    enabled: true,
    condition: 'process.name == "mimikatz.exe" OR target.process == "lsass.exe"',
    author: 'SOC Team',
    description: 'Detects attempts to access LSASS process memory to extract cleartext passwords.'
  },
  {
    id: 'RULE-002',
    name: 'Volume Shadow Copy Deletion (Vssadmin)',
    severity: 'CRITICAL',
    mitreId: 'T1490',
    enabled: true,
    condition: 'process.cmd CONTAINS "vssadmin" AND process.cmd CONTAINS "delete shadows"',
    author: 'Sigma Standard',
    description: 'Ransomware technique used to prevent system restoration via Shadow Copies.'
  },
  {
    id: 'RULE-003',
    name: 'SSH Auth Brute Force Threshold Exceeded',
    severity: 'HIGH',
    mitreId: 'T1110.001',
    enabled: true,
    condition: 'event.code == 4625 AND count(event.type == "AUTH_FAIL") > 5 IN 30s',
    author: 'SOC Threat Intel',
    description: 'Triggers when a single IP generates multiple authentication failures.'
  },
  {
    id: 'RULE-004',
    name: 'DNS Beaconing to Known C2 Server',
    severity: 'HIGH',
    mitreId: 'T1071.004',
    enabled: true,
    condition: 'event.type == "DNS_QUERY" AND query.domain ENDSWITH ".evil.ru"',
    author: 'Threat Hunter Unit',
    description: 'Detects malicious command and control heartbeat over DNS protocol.'
  },
  {
    id: 'RULE-005',
    name: 'SQL Injection Attack Vector in Web Logs',
    severity: 'HIGH',
    mitreId: 'T1190',
    enabled: true,
    condition: 'event.type == "WEB_EXPLOIT" AND payload CONTAINS "\' OR \'1\'=\'1"',
    author: 'Web App Defender',
    description: 'Detects classic SQL injection pattern in web request parameters.'
  }
];

// Threat Intelligence Database (Simulated VirusTotal / OTX)
const threatIntelDb = {
  hashes: {
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855': {
      verdict: 'MALICIOUS',
      threatName: 'WannaCry.Ransomware.Gen',
      threatType: 'Ransomware',
      reputationScore: 98,
      firstSeen: '2025-11-12',
      mitre: ['T1486', 'T1490'],
      communityRating: '89/92 Antivirus Engines Detected'
    },
    '4a8a08f09d37b737956490386cfb819661a3375f': {
      verdict: 'MALICIOUS',
      threatName: 'Mimikatz.PassTheHash.Tool',
      threatType: 'Credential Stealer',
      reputationScore: 95,
      firstSeen: '2025-09-04',
      mitre: ['T1003.001'],
      communityRating: '85/90 Antivirus Engines Detected'
    }
  },
  ips: {
    '185.220.101.5': {
      verdict: 'MALICIOUS',
      country: 'Russia (RU)',
      asn: 'AS44050 CyberGhost',
      threatActor: 'APT29 (Cozy Bear)',
      associatedMalware: ['Cobalt Strike Beacon'],
      abuseScore: 94
    },
    '194.26.29.112': {
      verdict: 'SUSPICIOUS',
      country: 'Netherlands (NL)',
      asn: 'AS208046 Hostinger',
      threatActor: 'Unknown Scanner',
      associatedMalware: ['Masscan Botnet'],
      abuseScore: 78
    }
  },
  domains: {
    'c2-server-x9.evil.ru': {
      verdict: 'MALICIOUS',
      category: 'Command & Control',
      ip: '185.220.101.5',
      registrar: 'REGRU-RU',
      threatScore: 99
    }
  }
};

// Subnets & Hosts for Network Map
const networkNodes = [
  { id: 'GW-01', name: 'Edge Firewall', ip: '10.0.0.1', type: 'firewall', status: 'HEALTHY' },
  { id: 'DC-01', name: 'Domain Controller', ip: '192.168.1.10', type: 'server', status: 'HEALTHY' },
  { id: 'FIN-SERVER-02', name: 'Finance Database', ip: '192.168.1.45', type: 'database', status: 'WARNING' },
  { id: 'WORKSTATION-88', name: 'Executive PC', ip: '192.168.1.105', type: 'endpoint', status: 'HEALTHY' },
  { id: 'WEB-APP-01', name: 'Public Web Portal', ip: '10.0.0.88', type: 'webserver', status: 'HEALTHY' },
];

// Helper: Seed initial telemetry log generator
const seedLogs = () => {
  const sources = [
    { host: 'DC-01', ip: '192.168.1.10', service: 'Active Directory / Windows Security' },
    { host: 'FIN-SERVER-02', ip: '192.168.1.45', service: 'Sysmon / Endpoint EDR' },
    { host: 'WEB-APP-01', ip: '10.0.0.88', service: 'Nginx Access Audit' },
    { host: 'GW-01', ip: '10.0.0.1', service: 'PaloAlto Firewall Logs' },
    { host: 'WORKSTATION-88', ip: '192.168.1.105', service: 'Windows Event ID 4624' }
  ];

  const now = Date.now();
  for (let i = 25; i >= 0; i--) {
    const src = sources[Math.floor(Math.random() * sources.length)];
    telemetryLogs.push({
      id: `LOG-${1000 + i}`,
      timestamp: new Date(now - i * 15000).toISOString(),
      host: src.host,
      ip: src.ip,
      service: src.service,
      eventType: 'INFO',
      eventCode: 4624,
      severity: 'LOW',
      summary: `User Administrator logged in successfully from subnet 192.168.1.0/24`,
      rawPayload: JSON.stringify({
        EventID: 4624,
        LogonType: 3,
        TargetUserName: 'Administrator',
        WorkstationName: src.host,
        IpAddress: src.ip,
        Status: '0x0'
      })
    });
  }
};

seedLogs();

// API Endpoints

// 1. Get Live Telemetry Logs
app.get('/api/logs', (req, res) => {
  res.json({
    total: telemetryLogs.length,
    logs: telemetryLogs.slice(-100) // return last 100 logs
  });
});

// 2. Get Alerts & Dashboard Summary
app.get('/api/dashboard', (req, res) => {
  const criticalCount = activeAlerts.filter(a => a.severity === 'CRITICAL').length;
  const highCount = activeAlerts.filter(a => a.severity === 'HIGH').length;
  const medCount = activeAlerts.filter(a => a.severity === 'MEDIUM').length;

  res.json({
    metrics: {
      totalLogs: telemetryLogs.length + 1420,
      activeAlerts: activeAlerts.length,
      criticalAlerts: criticalCount,
      highAlerts: highCount,
      isolatedHostsCount: isolatedHosts.size,
      blockedIPsCount: blockedIPs.size,
      mttd: '2.4 mins',
      mttr: '4.1 mins'
    },
    alerts: activeAlerts,
    nodes: networkNodes.map(n => ({
      ...n,
      status: isolatedHosts.has(n.ip) ? 'ISOLATED' : n.status
    })),
    blockedIPs: Array.from(blockedIPs)
  });
});

// 3. Trigger Attack Simulator Engine
app.post('/api/simulate-attack', (req, res) => {
  const { attackType, targetHost = 'FIN-SERVER-02', attackerIp = '185.220.101.5' } = req.body;
  const now = new Date().toISOString();
  let generatedLogs = [];
  let generatedAlert = null;

  switch (attackType) {
    case 'BRUTE_FORCE': {
      // Generate multiple SSH failures followed by 1 alert
      for (let i = 1; i <= 6; i++) {
        generatedLogs.push({
          id: `LOG-ATTK-${Date.now()}-${i}`,
          timestamp: new Date(Date.now() - (6 - i) * 1000).toISOString(),
          host: targetHost,
          ip: attackerIp,
          service: 'SSH Server Audit',
          eventType: 'AUTH_FAIL',
          eventCode: 4625,
          severity: 'MEDIUM',
          summary: `Failed SSH password attempt for user 'root' from ${attackerIp} port ${45000 + i}`,
          rawPayload: JSON.stringify({ event: 'SSHD_AUTH_FAILURE', user: 'root', src_ip: attackerIp, attempts: i })
        });
      }

      generatedAlert = {
        id: `ALT-${Date.now()}`,
        title: `SSH Brute Force Attack detected on ${targetHost}`,
        severity: 'HIGH',
        mitreId: 'T1110.001 - Brute Force: Password Guessing',
        attackerIp,
        targetHost,
        timestamp: now,
        status: 'UNHANDLED',
        description: `Over 6 failed authentication attempts triggered Sigma Rule RULE-003.`,
        ruleId: 'RULE-003'
      };
      break;
    }

    case 'RANSOMWARE': {
      generatedLogs.push(
        {
          id: `LOG-ATTK-${Date.now()}-1`,
          timestamp: now,
          host: targetHost,
          ip: '192.168.1.45',
          service: 'Sysmon Process Execution',
          eventType: 'PROCESS_CREATE',
          eventCode: 1,
          severity: 'CRITICAL',
          summary: `Suspicious execution: vssadmin.exe Delete Shadows /All /Quiet`,
          rawPayload: JSON.stringify({ Process: 'C:\\Windows\\System32\\vssadmin.exe', CommandLine: 'vssadmin delete shadows /all /quiet', ParentProcess: 'cmd.exe' })
        },
        {
          id: `LOG-ATTK-${Date.now()}-2`,
          timestamp: now,
          host: targetHost,
          ip: '192.168.1.45',
          service: 'EDR File Monitor',
          eventType: 'FILE_ENCRYPTED',
          eventCode: 11,
          severity: 'CRITICAL',
          summary: `Bulk file extensions modified to .locked in C:\\FinancialRecords\\`,
          rawPayload: JSON.stringify({ Action: 'FileRename', Extension: '.locked', FilesAffected: 240 })
        }
      );

      generatedAlert = {
        id: `ALT-${Date.now()}`,
        title: `CRITICAL Ransomware Activity: Shadow Copies Deleted on ${targetHost}`,
        severity: 'CRITICAL',
        mitreId: 'T1490 - Inhibit System Recovery',
        attackerIp: 'Internal EDR Trigger',
        targetHost,
        timestamp: now,
        status: 'UNHANDLED',
        description: `Volume Shadow Copy deletion detected via vssadmin.exe followed by high volume .locked file creations.`,
        ruleId: 'RULE-002'
      };
      break;
    }

    case 'CREDENTIAL_DUMPING': {
      generatedLogs.push({
        id: `LOG-ATTK-${Date.now()}-1`,
        timestamp: now,
        host: 'DC-01',
        ip: '192.168.1.10',
        service: 'Sysmon Event ID 10',
        eventType: 'PROCESS_ACCESS',
        eventCode: 10,
        severity: 'CRITICAL',
        summary: `Process mimikatz.exe requested PROCESS_VM_READ access on lsass.exe`,
        rawPayload: JSON.stringify({ SourceImage: 'C:\\Temp\\mimikatz.exe', TargetImage: 'C:\\Windows\\System32\\lsass.exe', GrantedAccess: '0x1410' })
      });

      generatedAlert = {
        id: `ALT-${Date.now()}`,
        title: `LSASS Credential Memory Dump detected via Mimikatz on DC-01`,
        severity: 'CRITICAL',
        mitreId: 'T1003.001 - OS Credential Dumping: LSASS Memory',
        attackerIp: '192.168.1.10',
        targetHost: 'DC-01 (Domain Controller)',
        timestamp: now,
        status: 'UNHANDLED',
        description: `Mimikatz tool accessed LSASS memory space to harvest domain passwords.`,
        ruleId: 'RULE-001'
      };
      break;
    }

    case 'C2_BEACON': {
      generatedLogs.push({
        id: `LOG-ATTK-${Date.now()}-1`,
        timestamp: now,
        host: 'WORKSTATION-88',
        ip: '192.168.1.105',
        service: 'DNS Client Audit',
        eventType: 'DNS_QUERY',
        eventCode: 3008,
        severity: 'HIGH',
        summary: `DNS query for domain 'c2-server-x9.evil.ru' resolved to 185.220.101.5`,
        rawPayload: JSON.stringify({ QueryName: 'c2-server-x9.evil.ru', RecordType: 'A', QueryStatus: 'NOERROR' })
      });

      generatedAlert = {
        id: `ALT-${Date.now()}`,
        title: `Command & Control (C2) DNS Beaconing detected from WORKSTATION-88`,
        severity: 'HIGH',
        mitreId: 'T1071.004 - Application Layer Protocol: DNS',
        attackerIp: '185.220.101.5',
        targetHost: 'WORKSTATION-88',
        timestamp: now,
        status: 'UNHANDLED',
        description: `Periodic DNS queries sent to malicious domain matching Threat Intel feed.`,
        ruleId: 'RULE-004'
      };
      break;
    }

    case 'SQL_INJECTION': {
      generatedLogs.push({
        id: `LOG-ATTK-${Date.now()}-1`,
        timestamp: now,
        host: 'WEB-APP-01',
        ip: attackerIp,
        service: 'Web Application Firewall (WAF)',
        eventType: 'WEB_EXPLOIT',
        eventCode: 403,
        severity: 'HIGH',
        summary: `SQL Injection pattern matched in GET /api/v1/users?id=1' UNION SELECT username, password FROM users--`,
        rawPayload: JSON.stringify({ URI: "/api/v1/users?id=1' OR '1'='1", UserAgent: "sqlmap/1.6.2#stable", Method: "GET" })
      });

      generatedAlert = {
        id: `ALT-${Date.now()}`,
        title: `SQL Injection Attack Attempt on WEB-APP-01`,
        severity: 'HIGH',
        mitreId: 'T1190 - Exploit Public-Facing Application',
        attackerIp,
        targetHost: 'WEB-APP-01',
        timestamp: now,
        status: 'UNHANDLED',
        description: `WAF rule caught SQL query manipulation payload in incoming web request.`,
        ruleId: 'RULE-005'
      };
      break;
    }

    default:
      return res.status(400).json({ error: 'Unknown attack type' });
  }

  // Push logs and alert
  telemetryLogs.push(...generatedLogs);
  if (generatedAlert) {
    activeAlerts.unshift(generatedAlert);
  }

  res.json({
    message: `Attack scenario '${attackType}' executed successfully in laboratory environment!`,
    logsGenerated: generatedLogs.length,
    alertTriggered: generatedAlert
  });
});

// 4. SOAR Playbook Action Execution
app.post('/api/playbook/execute', (req, res) => {
  const { action, target, alertId } = req.body;

  let message = '';
  if (action === 'ISOLATE_HOST') {
    isolatedHosts.add(target);
    message = `Host '${target}' has been isolated from network subnet. EDR agent blocked all ingress/egress interface traffic.`;
  } else if (action === 'BLOCK_IP') {
    blockedIPs.add(target);
    message = `Attacker IP '${target}' added to Edge Firewall drop table.`;
  } else if (action === 'KILL_PROCESS') {
    message = `Process '${target}' killed on host. Memory footprint cleared.`;
  } else if (action === 'RESET_CREDENTIALS') {
    message = `Active Directory user account '${target}' force disabled & credentials revoked.`;
  }

  // Update alert status if provided
  if (alertId) {
    const alert = activeAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'REMEDIATED';
    }
  }

  res.json({
    success: true,
    action,
    target,
    message,
    isolatedHosts: Array.from(isolatedHosts),
    blockedIPs: Array.from(blockedIPs)
  });
});

// 5. Sigma Detection Rules Endpoints
app.get('/api/rules', (req, res) => {
  res.json(detectionRules);
});

app.post('/api/rules', (req, res) => {
  const { name, severity, mitreId, condition, description, author } = req.body;
  const newRule = {
    id: `RULE-${String(detectionRules.length + 1).padStart(3, '0')}`,
    name,
    severity: severity || 'MEDIUM',
    mitreId: mitreId || 'T1000',
    enabled: true,
    condition,
    author: author || 'SOC Analyst',
    description
  };
  detectionRules.push(newRule);
  res.json({ message: 'Detection rule added successfully', rule: newRule });
});

// 6. Threat Intel Lookup Endpoint
app.post('/api/threat-intel/lookup', (req, res) => {
  const { query } = req.body;
  const cleanQuery = (query || '').trim();

  // Check Hashes
  if (threatIntelDb.hashes[cleanQuery.toLowerCase()]) {
    return res.json({ type: 'HASH', query: cleanQuery, result: threatIntelDb.hashes[cleanQuery.toLowerCase()] });
  }
  // Check IPs
  if (threatIntelDb.ips[cleanQuery]) {
    return res.json({ type: 'IP', query: cleanQuery, result: threatIntelDb.ips[cleanQuery] });
  }
  // Check Domains
  if (threatIntelDb.domains[cleanQuery]) {
    return res.json({ type: 'DOMAIN', query: cleanQuery, result: threatIntelDb.domains[cleanQuery] });
  }

  // Generic fallback response for sandbox demo
  res.json({
    type: 'UNKNOWN',
    query: cleanQuery,
    result: {
      verdict: 'CLEAN / UNKNOWN',
      threatScore: 0,
      notes: 'No malicious indicators or blacklist records matched in Threat Intelligence feeds.'
    }
  });
});

// 7. Case Management Endpoints
app.get('/api/cases', (req, res) => {
  res.json(activeCases);
});

app.post('/api/cases', (req, res) => {
  const { title, severity, assignedTo, host, mitreTechnique, notes } = req.body;
  const newCase = {
    id: `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    title,
    severity: severity || 'HIGH',
    status: 'NEW',
    assignedTo: assignedTo || 'Unassigned',
    timestamp: new Date().toISOString(),
    host: host || 'Unknown',
    mitreTechnique: mitreTechnique || 'T1000',
    notes: notes ? [notes] : [],
    actionsTaken: []
  };
  activeCases.unshift(newCase);
  res.json({ message: 'Incident case created', case: newCase });
});

// SPA fallback for non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('SOC Sentinel API Server is active. Please build the frontend (`npm run build`) to serve the UI.');
  }
});

app.listen(PORT, () => {
  console.log(`🛡️  SOC Sentinel Platform running on http://localhost:${PORT}`);
});
