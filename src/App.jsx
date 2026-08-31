import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AttackSimulator from './components/AttackSimulator';
import LogExplorer from './components/LogExplorer';
import MitreMatrix from './components/MitreMatrix';
import RulesStudio from './components/RulesStudio';
import SoarPlaybooks from './components/SoarPlaybooks';
import ThreatIntel from './components/ThreatIntel';
import CaseManagement from './components/CaseManagement';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [metrics, setMetrics] = useState({
    totalLogs: 1450,
    activeAlerts: 2,
    criticalAlerts: 1,
    highAlerts: 1,
    isolatedHostsCount: 0,
    blockedIPsCount: 2,
    mttd: '2.4 mins',
    mttr: '4.1 mins'
  });

  const [alerts, setAlerts] = useState([
    {
      id: 'ALT-1001',
      title: 'CRITICAL Ransomware Activity: Shadow Copies Deleted on FIN-SERVER-02',
      severity: 'CRITICAL',
      mitreId: 'T1490 - Inhibit System Recovery',
      attackerIp: '185.220.101.5',
      targetHost: 'FIN-SERVER-02 (192.168.1.45)',
      timestamp: new Date().toISOString(),
      status: 'UNHANDLED',
      description: 'Volume Shadow Copy deletion detected via vssadmin.exe followed by high volume file renames.',
      ruleId: 'RULE-002'
    },
    {
      id: 'ALT-1002',
      title: 'SSH Brute Force Attack detected on AUTH-GW-01',
      severity: 'HIGH',
      mitreId: 'T1110.001 - Password Guessing',
      attackerIp: '194.26.29.112',
      targetHost: 'GW-01 (10.0.0.1)',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      status: 'UNHANDLED',
      description: 'Over 120 failed SSH authentication attempts within 60 seconds.',
      ruleId: 'RULE-003'
    }
  ]);

  const [nodes, setNodes] = useState([
    { id: 'GW-01', name: 'Edge Firewall', ip: '10.0.0.1', type: 'firewall', status: 'HEALTHY' },
    { id: 'DC-01', name: 'Domain Controller', ip: '192.168.1.10', type: 'server', status: 'HEALTHY' },
    { id: 'FIN-SERVER-02', name: 'Finance Database', ip: '192.168.1.45', type: 'database', status: 'WARNING' },
    { id: 'WORKSTATION-88', name: 'Executive PC', ip: '192.168.1.105', type: 'endpoint', status: 'HEALTHY' },
    { id: 'WEB-APP-01', name: 'Public Web Portal', ip: '10.0.0.88', type: 'webserver', status: 'HEALTHY' },
  ]);

  const initialRules = [
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

  const initialCases = [
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

  const generateSeedLogs = () => {
    const sources = [
      { host: 'DC-01', ip: '192.168.1.10', service: 'Active Directory / Windows Security' },
      { host: 'FIN-SERVER-02', ip: '192.168.1.45', service: 'Sysmon / Endpoint EDR' },
      { host: 'WEB-APP-01', ip: '10.0.0.88', service: 'Nginx Access Audit' },
      { host: 'GW-01', ip: '10.0.0.1', service: 'PaloAlto Firewall Logs' },
      { host: 'WORKSTATION-88', ip: '192.168.1.105', service: 'Windows Event ID 4624' }
    ];
    const initialList = [];
    const now = Date.now();
    for (let i = 25; i >= 0; i--) {
      const src = sources[Math.floor(Math.random() * sources.length)];
      initialList.push({
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
    return initialList;
  };

  const [logs, setLogs] = useState(generateSeedLogs);
  const [isolatedHosts, setIsolatedHosts] = useState([]);
  const [blockedIPs, setBlockedIPs] = useState(['185.220.101.5', '194.26.29.112']);
  const [rules, setRules] = useState(initialRules);
  const [cases, setCases] = useState(initialCases);
  const [isSimulating, setIsSimulating] = useState(false);

  // Fetch Dashboard State & Logs from backend API
  const fetchData = async () => {
    try {
      const [dashRes, logsRes, rulesRes, casesRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/logs'),
        fetch('/api/rules'),
        fetch('/api/cases')
      ]);

      if (dashRes.ok) {
        const data = await dashRes.json();
        setMetrics(data.metrics);
        if (data.alerts && data.alerts.length > 0) setAlerts(data.alerts);
        if (data.nodes) setNodes(data.nodes);
        if (data.blockedIPs) setBlockedIPs(data.blockedIPs);
      }

      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data.logs);
      }

      if (rulesRes.ok) {
        const data = await rulesRes.json();
        setRules(data);
      }

      if (casesRes.ok) {
        const data = await casesRes.json();
        setCases(data);
      }
    } catch (err) {
      // Backend not running / static hosting mode
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handler: Trigger Attack Simulator Engine
  const handleTriggerAttack = async (attackType, targetHost = 'FIN-SERVER-02', attackerIp = '185.220.101.5') => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/simulate-attack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attackType, targetHost, attackerIp })
      });
      if (res.ok) {
        const data = await res.json();
        await fetchData();
        setIsSimulating(false);
        return data;
      }
    } catch (err) {
      // Fallback: client-side attack simulation
    }

    const now = new Date().toISOString();
    let generatedLogs = [];
    let generatedAlert = null;

    if (attackType === 'BRUTE_FORCE') {
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
    } else if (attackType === 'RANSOMWARE') {
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
        attackerIp,
        targetHost,
        timestamp: now,
        status: 'UNHANDLED',
        description: `Volume Shadow Copy deletion detected via vssadmin.exe followed by high volume file renames.`,
        ruleId: 'RULE-002'
      };
    } else if (attackType === 'SQL_INJECTION') {
      generatedLogs.push({
        id: `LOG-ATTK-${Date.now()}-1`,
        timestamp: now,
        host: 'WEB-APP-01',
        ip: attackerIp,
        service: 'Nginx Access Logs',
        eventType: 'WEB_EXPLOIT',
        eventCode: 403,
        severity: 'HIGH',
        summary: `SQL Injection payload in query params: /api/users?id=' OR '1'='1`,
        rawPayload: JSON.stringify({ URI: "/api/users?id=' OR '1'='1", Method: 'GET', UserAgent: 'sqlmap/1.7.2' })
      });
      generatedAlert = {
        id: `ALT-${Date.now()}`,
        title: `SQL Injection Attack Vector in Web Logs on WEB-APP-01`,
        severity: 'HIGH',
        mitreId: 'T1190 - Exploit Public-Facing Application',
        attackerIp,
        targetHost: 'WEB-APP-01',
        timestamp: now,
        status: 'UNHANDLED',
        description: `SQL injection string pattern detected in URL query string from ${attackerIp}.`,
        ruleId: 'RULE-005'
      };
    } else {
      generatedLogs.push({
        id: `LOG-ATTK-${Date.now()}-1`,
        timestamp: now,
        host: targetHost,
        ip: '192.168.1.105',
        service: 'Sysmon Process Execution',
        eventType: 'PRIV_ESC',
        eventCode: 10,
        severity: 'CRITICAL',
        summary: `Process Injection into lsass.exe by mimikatz.exe`,
        rawPayload: JSON.stringify({ SourceProcess: 'mimikatz.exe', TargetProcess: 'lsass.exe', GrantedAccess: '0x1010' })
      });
      generatedAlert = {
        id: `ALT-${Date.now()}`,
        title: `LSASS Memory Credential Dumping via Mimikatz on ${targetHost}`,
        severity: 'CRITICAL',
        mitreId: 'T1003.001 - OS Credential Dumping: LSASS Memory',
        attackerIp,
        targetHost,
        timestamp: now,
        status: 'UNHANDLED',
        description: `Mimikatz detected attempting to read LSASS memory to extract cleartext passwords.`,
        ruleId: 'RULE-001'
      };
    }

    setLogs(prev => [...prev, ...generatedLogs]);
    if (generatedAlert) {
      setAlerts(prev => [generatedAlert, ...prev]);
      setMetrics(prev => ({
        ...prev,
        totalLogs: prev.totalLogs + generatedLogs.length,
        activeAlerts: prev.activeAlerts + 1,
        criticalAlerts: generatedAlert.severity === 'CRITICAL' ? prev.criticalAlerts + 1 : prev.criticalAlerts,
        highAlerts: generatedAlert.severity === 'HIGH' ? prev.highAlerts + 1 : prev.highAlerts
      }));
    }
    setIsSimulating(false);
    return { success: true, alert: generatedAlert, logs: generatedLogs };
  };

  // Handler: Execute SOAR Playbook Action
  const handleExecutePlaybook = async (action, target, alertId) => {
    try {
      const res = await fetch('/api/playbook/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, target, alertId })
      });
      if (res.ok) {
        const data = await res.json();
        if (action === 'ISOLATE_HOST') {
          setIsolatedHosts(prev => [...new Set([...prev, target])]);
        } else if (action === 'BLOCK_IP') {
          setBlockedIPs(prev => [...new Set([...prev, target])]);
        }
        await fetchData();
        return data;
      }
    } catch (err) {
      // Fallback: client-side SOAR execution
    }

    let message = '';
    if (action === 'ISOLATE_HOST') {
      setIsolatedHosts(prev => [...new Set([...prev, target])]);
      setNodes(prev => prev.map(n => n.name === target || n.ip === target || n.id === target ? { ...n, status: 'ISOLATED' } : n));
      message = `Host ${target} isolated at firewall and VLAN layer`;
    } else if (action === 'BLOCK_IP') {
      setBlockedIPs(prev => [...new Set([...prev, target])]);
      message = `IP ${target} added to perimeter firewall drop rules`;
    } else if (action === 'KILL_PROCESS') {
      message = `Suspicious process ${target} killed via EDR agent`;
    } else if (action === 'AUTO_TRIAGE') {
      message = `Alert ${alertId || target} triaged by AI analyst`;
    }

    if (alertId) {
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'RESOLVED' } : a));
    }

    setMetrics(prev => ({
      ...prev,
      isolatedHostsCount: action === 'ISOLATE_HOST' ? prev.isolatedHostsCount + 1 : prev.isolatedHostsCount,
      blockedIPsCount: action === 'BLOCK_IP' ? prev.blockedIPsCount + 1 : prev.blockedIPsCount
    }));

    return { success: true, message };
  };

  // Handler: Add Custom Detection Rule
  const handleAddRule = async (newRule) => {
    try {
      const res = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule)
      });
      if (res.ok) {
        const data = await res.json();
        await fetchData();
        return data;
      }
    } catch (err) {
      // Fallback: client-side rule addition
    }

    const createdRule = {
      id: `RULE-${String(rules.length + 1).padStart(3, '0')}`,
      name: newRule.name,
      severity: newRule.severity || 'MEDIUM',
      mitreId: newRule.mitreId || 'T1000',
      enabled: true,
      condition: newRule.condition,
      author: newRule.author || 'SOC Analyst',
      description: newRule.description
    };
    setRules(prev => [...prev, createdRule]);
    return { message: 'Detection rule added successfully', rule: createdRule };
  };

  // Handler: Create Incident Case
  const handleCreateCaseFromAlert = async (alert) => {
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: alert.title,
          severity: alert.severity,
          assignedTo: 'Lead Security Analyst',
          host: alert.targetHost,
          mitreTechnique: alert.mitreId,
          notes: alert.description
        })
      });
      if (res.ok) {
        const data = await res.json();
        await fetchData();
        setActiveTab('cases');
        return data;
      }
    } catch (err) {
      // Fallback: client-side case creation
    }

    const newCase = {
      id: `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: alert.title,
      severity: alert.severity,
      status: 'NEW',
      assignedTo: 'Lead Security Analyst',
      timestamp: new Date().toISOString(),
      host: alert.targetHost || 'Unknown',
      mitreTechnique: alert.mitreId || 'T1000',
      notes: [alert.description],
      actionsTaken: []
    };
    setCases(prev => [newCase, ...prev]);
    setActiveTab('cases');
    return { message: 'Incident case created', case: newCase };
  };

  return (
    <div class="min-h-screen bg-cyber-bg text-slate-200 flex flex-col font-sans">
      {/* Top Cyber Navigation Bar */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        metrics={metrics}
        isLiveSimulating={isSimulating}
      />

      {/* Main Workspace Container */}
      <main class="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6">
        {activeTab === 'dashboard' && (
          <Dashboard 
            metrics={metrics}
            alerts={alerts}
            nodes={nodes}
            onTriggerAttack={handleTriggerAttack}
            onExecutePlaybook={handleExecutePlaybook}
            onTabChange={setActiveTab}
            onCreateCase={handleCreateCaseFromAlert}
          />
        )}

        {activeTab === 'simulator' && (
          <AttackSimulator 
            onTriggerAttack={handleTriggerAttack}
            isSimulating={isSimulating}
          />
        )}

        {activeTab === 'logs' && (
          <LogExplorer logs={logs} />
        )}

        {activeTab === 'mitre' && (
          <MitreMatrix />
        )}

        {activeTab === 'rules' && (
          <RulesStudio 
            rules={rules} 
            onAddRule={handleAddRule}
          />
        )}

        {activeTab === 'soar' && (
          <SoarPlaybooks 
            onExecutePlaybook={handleExecutePlaybook}
            isolatedHosts={isolatedHosts}
            blockedIPs={blockedIPs}
          />
        )}

        {activeTab === 'intel' && (
          <ThreatIntel />
        )}

        {activeTab === 'cases' && (
          <CaseManagement 
            cases={cases}
            onCreateCase={handleCreateCaseFromAlert}
          />
        )}
      </main>

      {/* SOC Footer */}
      <footer class="border-t border-cyber-border bg-[#080d17] py-4 px-6 text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          <span>AegisSOC Lab Operations • Security Analyst Workbench</span>
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-cyan-400">STATUS: ALL LAB SYSTEMS NOMINAL</span>
          <span>•</span>
          <span>LOG RETENTION: 90 DAYS</span>
        </div>
      </footer>
    </div>
  );
}
