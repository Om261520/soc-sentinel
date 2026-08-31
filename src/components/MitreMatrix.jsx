import React, { useState } from 'react';
import { 
  Grid, 
  ShieldAlert, 
  Info, 
  ExternalLink, 
  Layers, 
  Target,
  CheckCircle2,
  Zap,
  Flame,
  Key,
  Database,
  Lock,
  Globe
} from 'lucide-react';
import { playCyberClick } from '../utils/audio';

export default function MitreMatrix() {
  const [selectedTechnique, setSelectedTechnique] = useState({
    id: 'T1490',
    name: 'Inhibit System Recovery',
    tactic: 'Impact',
    subtechnique: 'T1490.001',
    description: 'Adversaries may delete or alter system backups (such as Windows Volume Shadow Copies via vssadmin.exe) to prevent restoration after encrypting files with ransomware.',
    adversaries: ['FIN7', 'Wizard Spider (Conti)', 'LockBit 3.0', 'BlackCat / ALPHV'],
    mitigation: 'Restrict privilege elevation, enforce VSS backup immutable permissions, and maintain air-gapped offsite backups.',
    sigmaRule: 'RULE-002: Volume Shadow Copy Deletion (Vssadmin)',
    labTested: true
  });

  const matrixData = [
    {
      tactic: 'Initial Access',
      techniques: [
        { id: 'T1190', name: 'Exploit Public App', active: true, desc: 'SQL Injection / RCE against internet-facing web endpoints.' },
        { id: 'T1566', name: 'Phishing: Link', active: true, desc: 'Spearphishing email with malicious credential harvester domain.' },
        { id: 'T1078', name: 'Valid Accounts', active: false, desc: 'Compromised admin credentials used for illegitimate access.' },
      ]
    },
    {
      tactic: 'Execution',
      techniques: [
        { id: 'T1059.001', name: 'PowerShell Interpreter', active: true, desc: 'Obfuscated PowerShell scripts executing in-memory payload.' },
        { id: 'T1204', name: 'User Execution', active: false, desc: 'User opening malicious macro or executable payload.' },
        { id: 'T1047', name: 'WMI Execution', active: false, desc: 'Windows Management Instrumentation used for lateral tasks.' }
      ]
    },
    {
      tactic: 'Persistence',
      techniques: [
        { id: 'T1053.005', name: 'Scheduled Task', active: true, desc: 'Recurring scheduled tasks established for persistence.' },
        { id: 'T1547.001', name: 'Registry Run Keys', active: false, desc: 'Modifying CurrentVersion\\Run registry key.' },
      ]
    },
    {
      tactic: 'Privilege Escalation',
      techniques: [
        { id: 'T1055', name: 'Process Injection', active: true, desc: 'Injecting shellcode into legitimate system processes.' },
        { id: 'T1558.003', name: 'Kerberoasting', active: true, desc: 'Requesting SPN tickets to crack Kerberos hashes offline.' },
      ]
    },
    {
      tactic: 'Credential Access',
      techniques: [
        { id: 'T1003.001', name: 'LSASS Memory Dump', active: true, desc: 'Mimikatz memory dump of Local Security Authority.' },
        { id: 'T1110.001', name: 'Password Guessing', active: true, desc: 'High-frequency brute force on SSH and RDP.' },
      ]
    },
    {
      tactic: 'Command & Control',
      techniques: [
        { id: 'T1071.004', name: 'DNS Tunneling', active: true, desc: 'Adversary heartbeat beaconing via TXT queries to evil.ru.' },
        { id: 'T1573', name: 'Encrypted Channel', active: false, desc: 'Custom TLS or SSH tunnel obfuscating C2 traffic.' },
      ]
    },
    {
      tactic: 'Impact',
      techniques: [
        { id: 'T1490', name: 'Inhibit Recovery', active: true, desc: 'VSSadmin shadow copy deletion preventing restoration.' },
        { id: 'T1486', name: 'Data Encrypted', active: true, desc: 'Ransomware file extension modification to .locked.' },
      ]
    }
  ];

  const handleSelectTechnique = (tech, tactic) => {
    playCyberClick();
    setSelectedTechnique({
      id: tech.id,
      name: tech.name,
      tactic: tactic,
      subtechnique: `${tech.id}.001`,
      description: tech.desc || `Adversary technique ${tech.name} mapped under MITRE ${tactic} tactic.`,
      adversaries: ['APT29 (Cozy Bear)', 'Lazarus Group', 'FIN7', 'TA505'],
      mitigation: 'Implement strict access controls, EDR behavioral heuristic blocking, and immutable audit logs.',
      sigmaRule: `RULE-${tech.id}: Detection for ${tech.name}`,
      labTested: tech.active
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="cyber-card p-5 border-l-4 border-l-cyan-500 shadow-glow-cyan/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2 font-mono">
              <Grid className="w-5 h-5 text-cyan-400" />
              <span>MITRE ATT&CK® Enterprise Matrix & Threat Mapping</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Interactive cyber threat tactics, techniques, adversary group attribution, and active detection rules.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-red-500 shadow-glow-red animate-pulse"></span>
              <span className="text-red-300 font-bold">Active Lab Detection Rule</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-slate-700"></span>
              <span className="text-slate-400">Framework Reference</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Matrix View & Technique Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Matrix Columns */}
        <div className="lg:col-span-8 cyber-card p-5 overflow-x-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2.5 min-w-[850px]">
            {matrixData.map((col) => (
              <div key={col.tactic} className="space-y-2">
                <div className="p-2 rounded bg-cyber-panel border border-cyber-border text-center">
                  <h4 className="text-[10px] font-bold text-cyan-400 uppercase font-mono tracking-wider">
                    {col.tactic}
                  </h4>
                </div>

                <div className="space-y-2">
                  {col.techniques.map((tech) => {
                    const isSelected = selectedTechnique?.id === tech.id;
                    return (
                      <div
                        key={tech.id}
                        onClick={() => handleSelectTechnique(tech, col.tactic)}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                          tech.active
                            ? isSelected
                              ? 'bg-red-500/30 border-red-400 text-slate-100 shadow-glow-red ring-1 ring-red-400'
                              : 'bg-red-950/25 border-red-500/40 text-red-300 hover:bg-red-950/50'
                            : 'bg-cyber-bg/60 border-cyber-border text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div className="text-[10px] font-mono text-cyan-400 font-bold mb-1">{tech.id}</div>
                        <div className="text-[11px] font-semibold leading-snug line-clamp-2">{tech.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technique Detail Inspector */}
        <div className="lg:col-span-4 cyber-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-cyber-border">
              <Target className="w-5 h-5 text-red-500" />
              <h3 className="text-sm font-bold text-slate-100 font-mono">MITRE Technique Inspector</h3>
            </div>

            {selectedTechnique ? (
              <div className="mt-4 space-y-4 text-xs font-mono">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 text-xs font-bold">{selectedTechnique.id}</span>
                    {selectedTechnique.labTested && (
                      <span className="cyber-badge bg-red-500/20 text-red-400 border border-red-500/30 text-[10px]">
                        LAB SIMULATED
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-slate-100 font-sans mt-0.5">{selectedTechnique.name}</h4>
                  <span className="cyber-badge bg-blue-500/20 text-blue-400 border border-blue-500/30 mt-1">
                    Tactic: {selectedTechnique.tactic}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block uppercase text-[10px]">Technique Mechanism</span>
                  <p className="text-slate-300 font-sans leading-relaxed mt-1 bg-[#05080f] p-3 rounded-lg border border-cyber-border">
                    {selectedTechnique.description}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 block uppercase text-[10px]">Attributed Adversary Groups</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {selectedTechnique.adversaries.map((apt, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px]">
                        {apt}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block uppercase text-[10px]">Associated Sigma Rule</span>
                  <div className="p-2.5 rounded-lg bg-cyber-bg border border-cyber-border text-cyan-300 text-[11px] mt-1">
                    {selectedTechnique.sigmaRule}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block uppercase text-[10px]">Recommended Mitigation Policy</span>
                  <p className="text-slate-300 font-sans leading-relaxed mt-1 bg-cyber-bg p-2.5 rounded border border-cyber-border text-[11px]">
                    {selectedTechnique.mitigation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-12">
                Click any technique box in the matrix to view adversary intelligence and mitigation controls.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
