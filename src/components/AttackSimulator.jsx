import React, { useState } from 'react';
import { 
  Zap, 
  ShieldAlert, 
  Terminal, 
  Flame, 
  Key, 
  Globe, 
  Database, 
  Cpu, 
  CheckCircle2, 
  Play,
  Settings,
  HelpCircle
} from 'lucide-react';

export default function AttackSimulator({ onTriggerAttack, isSimulating }) {
  const [selectedTarget, setSelectedTarget] = useState('FIN-SERVER-02');
  const [attackerIp, setAttackerIp] = useState('185.220.101.5');
  const [lastExecuted, setLastExecuted] = useState(null);
  const [simLogStream, setSimLogStream] = useState([]);

  const attackScenarios = [
    {
      id: 'RANSOMWARE',
      name: 'Ransomware & Shadow Copy Deletion',
      mitre: 'T1490 - Inhibit System Recovery',
      severity: 'CRITICAL',
      icon: Flame,
      color: 'from-red-600 to-rose-700',
      description: 'Simulates shadow copy wipe via vssadmin.exe followed by rapid file encryption on high-value finance server.'
    },
    {
      id: 'CREDENTIAL_DUMPING',
      name: 'LSASS Memory Credential Dumping',
      mitre: 'T1003.001 - OS Credential Dumping',
      severity: 'CRITICAL',
      icon: Key,
      color: 'from-purple-600 to-indigo-700',
      description: 'Simulates Mimikatz execution targeting LSASS process memory to harvest domain admin NTLM hashes.'
    },
    {
      id: 'BRUTE_FORCE',
      name: 'SSH / RDP Authentication Brute Force',
      mitre: 'T1110.001 - Password Guessing',
      severity: 'HIGH',
      icon: Zap,
      color: 'from-amber-500 to-orange-600',
      description: 'Launches high-frequency failed authentication stream from rogue external Tor exit node IP.'
    },
    {
      id: 'C2_BEACON',
      name: 'C2 DNS Heartbeat Beaconing',
      mitre: 'T1071.004 - DNS Command & Control',
      severity: 'HIGH',
      icon: Globe,
      color: 'from-cyan-500 to-blue-600',
      description: 'Simulates compromised host sending DNS queries to known APT29 command & control domain.'
    },
    {
      id: 'SQL_INJECTION',
      name: 'SQL Injection Web App Exploit',
      mitre: 'T1190 - Exploit Public Application',
      severity: 'HIGH',
      icon: Database,
      color: 'from-emerald-500 to-teal-600',
      description: 'Executes malicious SQL query payloads against public web application database endpoint.'
    }
  ];

  const handleLaunch = async (scenario) => {
    setLastExecuted(scenario.name);
    
    // Add simulation output feed
    const logEntry = `[${new Date().toLocaleTimeString()}] INITIATING SIMULATION: ${scenario.name} targeting ${selectedTarget} from ${attackerIp}...`;
    setSimLogStream(prev => [logEntry, ...prev]);

    await onTriggerAttack(scenario.id, selectedTarget, attackerIp);

    const successEntry = `[${new Date().toLocaleTimeString()}] SUCCESS: Telemetry logs & SIEM alert generated for ${scenario.mitre}.`;
    setSimLogStream(prev => [successEntry, ...prev]);
  };

  return (
    <div class="space-y-6">
      {/* Header Banner */}
      <div class="cyber-card p-6 bg-gradient-to-r from-red-950/40 via-cyber-panel to-cyber-panel border-l-4 border-l-red-500">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center space-x-2 text-red-400 font-mono text-xs font-bold uppercase tracking-wider mb-1">
              <Flame class="w-4 h-4 animate-pulse" />
              <span>Red Team Adversary Simulation Ground</span>
            </div>
            <h2 class="text-xl font-bold text-slate-100">Lab Attack Scenario Generator</h2>
            <p class="text-xs text-slate-400 mt-1 max-w-2xl">
              Safely emulate real-world cyber attack techniques inside the lab environment to test SIEM log telemetry ingestion, trigger Sigma detection rules, and validate SOAR automated response playbooks.
            </p>
          </div>

          {/* Config options */}
          <div class="flex items-center space-x-3 bg-cyber-bg p-3 rounded-lg border border-cyber-border">
            <div>
              <label class="block text-[10px] font-mono text-slate-400 uppercase">Target Host</label>
              <select 
                value={selectedTarget} 
                onChange={(e) => setSelectedTarget(e.target.value)}
                class="bg-cyber-panel text-xs text-slate-200 border border-cyber-border rounded px-2 py-1 focus:outline-none focus:border-cyan-500"
              >
                <option value="FIN-SERVER-02">FIN-SERVER-02 (Finance DB)</option>
                <option value="DC-01">DC-01 (Domain Controller)</option>
                <option value="WORKSTATION-88">WORKSTATION-88 (Exec PC)</option>
                <option value="WEB-APP-01">WEB-APP-01 (Public Web)</option>
              </select>
            </div>

            <div>
              <label class="block text-[10px] font-mono text-slate-400 uppercase">Attacker IP</label>
              <input 
                type="text" 
                value={attackerIp} 
                onChange={(e) => setAttackerIp(e.target.value)}
                class="bg-cyber-panel text-xs text-slate-200 border border-cyber-border rounded px-2 py-1 font-mono w-32 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Attack Scenario Cards Grid */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {attackScenarios.map((scenario) => {
          const Icon = scenario.icon;
          return (
            <div 
              key={scenario.id} 
              class="cyber-card p-5 flex flex-col justify-between hover:border-red-500/50 hover:shadow-glow-red group transition-all"
            >
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div class={`p-3 rounded-xl bg-gradient-to-br ${scenario.color} text-white shadow-lg`}>
                    <Icon class="w-6 h-6" />
                  </div>
                  <span class={`cyber-badge ${
                    scenario.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {scenario.severity}
                  </span>
                </div>

                <div>
                  <h3 class="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {scenario.name}
                  </h3>
                  <span class="font-mono text-xs text-cyan-400 font-semibold">{scenario.mitre}</span>
                </div>

                <p class="text-xs text-slate-400 leading-relaxed">
                  {scenario.description}
                </p>
              </div>

              <div class="mt-5 pt-3 border-t border-cyber-border flex items-center justify-between">
                <span class="text-[11px] font-mono text-slate-500">Target: {selectedTarget}</span>
                <button
                  onClick={() => handleLaunch(scenario)}
                  disabled={isSimulating}
                  class="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-lg text-xs font-bold shadow-glow-red transition flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Play class="w-3.5 h-3.5 fill-current" />
                  <span>Launch Attack</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time Attack Terminal Output Log */}
      <div class="cyber-card p-5">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-2">
            <Terminal class="w-5 h-5 text-cyan-400" />
            <h3 class="text-sm font-bold text-slate-100 font-mono">Live Attack Simulation Execution Console</h3>
          </div>
          <span class="text-xs text-slate-500 font-mono">Console Stream: Idle / Active</span>
        </div>

        <div class="h-44 rounded-lg border border-cyber-border bg-[#05080f] p-4 font-mono text-xs text-slate-300 overflow-y-auto space-y-2">
          {simLogStream.length === 0 ? (
            <div class="text-slate-600 text-center pt-12 italic">
              Ready for attack execution. Select an adversary scenario above and click "Launch Attack".
            </div>
          ) : (
            simLogStream.map((log, i) => (
              <div key={i} class="flex items-start space-x-2">
                <span class="text-cyan-400">❯</span>
                <span class={log.includes('SUCCESS') ? 'text-emerald-400 font-semibold' : 'text-slate-300'}>
                  {log}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
