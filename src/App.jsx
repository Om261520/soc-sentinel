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

  const [logs, setLogs] = useState([]);
  const [isolatedHosts, setIsolatedHosts] = useState([]);
  const [blockedIPs, setBlockedIPs] = useState(['185.220.101.5', '194.26.29.112']);
  const [rules, setRules] = useState([]);
  const [cases, setCases] = useState([]);
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
      console.warn("Backend server connection pending, using local lab state.");
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handler: Trigger Attack Simulator
  const handleTriggerAttack = async (attackType, targetHost, attackerIp) => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/simulate-attack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attackType, targetHost, attackerIp })
      });
      const data = await res.json();
      await fetchData();
      return data;
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Handler: Execute SOAR Playbook Action
  const handleExecutePlaybook = async (action, target, alertId) => {
    try {
      const res = await fetch('/api/playbook/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, target, alertId })
      });
      const data = await res.json();

      if (action === 'ISOLATE_HOST') {
        setIsolatedHosts(prev => [...new Set([...prev, target])]);
      } else if (action === 'BLOCK_IP') {
        setBlockedIPs(prev => [...new Set([...prev, target])]);
      }

      await fetchData();
      return data;
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Add Custom Detection Rule
  const handleAddRule = async (newRule) => {
    try {
      const res = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule)
      });
      const data = await res.json();
      await fetchData();
      return data;
    } catch (err) {
      console.error(err);
    }
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
      const data = await res.json();
      await fetchData();
      setActiveTab('cases');
      return data;
    } catch (err) {
      console.error(err);
    }
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
