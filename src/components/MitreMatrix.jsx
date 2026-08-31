import React, { useState } from 'react';
import { 
  Grid, 
  ShieldAlert, 
  Info, 
  ExternalLink, 
  Layers, 
  Target,
  CheckCircle2
} from 'lucide-react';

export default function MitreMatrix() {
  const [selectedTechnique, setSelectedTechnique] = useState({
    id: 'T1490',
    name: 'Inhibit System Recovery',
    tactic: 'Impact',
    description: 'Adversaries may delete or alter system backups (such as Windows Volume Shadow Copies) to prevent restoration after encrypting files with ransomware.',
    adversaries: ['FIN7', 'Wizard Spider (Conti)', 'LockBit 3.0'],
    mitigation: 'Restrict privilege elevation, enforce VSS backup immutable permissions, maintain offsite backups.'
  });

  const matrixData = [
    {
      tactic: 'Initial Access',
      techniques: [
        { id: 'T1190', name: 'Exploit Public Application', active: true },
        { id: 'T1566', name: 'Phishing: Spearphishing Link', active: true },
        { id: 'T1078', name: 'Valid Accounts', active: false },
      ]
    },
    {
      tactic: 'Execution',
      techniques: [
        { id: 'T1059.001', name: 'Command & Scripting Interpreter: PowerShell', active: true },
        { id: 'T1204', name: 'User Execution: Malicious File', active: false },
      ]
    },
    {
      tactic: 'Persistence',
      techniques: [
        { id: 'T1547.001', name: 'Registry Run Keys / Startup Folder', active: false },
        { id: 'T1053.005', name: 'Scheduled Task', active: true },
      ]
    },
    {
      tactic: 'Credential Access',
      techniques: [
        { id: 'T1003.001', name: 'OS Credential Dumping: LSASS Memory', active: true },
        { id: 'T1110.001', name: 'Brute Force: Password Guessing', active: true },
      ]
    },
    {
      tactic: 'Command & Control',
      techniques: [
        { id: 'T1071.004', name: 'Application Layer Protocol: DNS', active: true },
        { id: 'T1573', name: 'Encrypted Channel', active: false },
      ]
    },
    {
      tactic: 'Impact',
      techniques: [
        { id: 'T1490', name: 'Inhibit System Recovery (vssadmin)', active: true },
        { id: 'T1486', name: 'Data Encrypted for Impact', active: true },
      ]
    }
  ];

  return (
    <div class="space-y-6">
      {/* Header Banner */}
      <div class="cyber-card p-5 border-l-4 border-l-cyan-500">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <Grid class="w-5 h-5 text-cyan-400" />
              <span>MITRE ATT&CK® Enterprise Matrix & Threat Mapping</span>
            </h2>
            <p class="text-xs text-slate-400 mt-1">
              Globally accessible knowledge base of adversary tactics and techniques based on real-world security operations.
            </p>
          </div>

          <div class="flex items-center space-x-4 text-xs font-mono">
            <span class="flex items-center space-x-1.5">
              <span class="w-2.5 h-2.5 rounded bg-red-500 shadow-glow-red"></span>
              <span class="text-slate-300">Active Lab Trigger</span>
            </span>
            <span class="flex items-center space-x-1.5">
              <span class="w-2.5 h-2.5 rounded bg-cyber-border"></span>
              <span class="text-slate-500">Standard Framework</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Matrix View & Technique Inspector */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Matrix Grid */}
        <div class="lg:col-span-2 cyber-card p-5 overflow-x-auto">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 min-w-[700px]">
            {matrixData.map((col) => (
              <div key={col.tactic} class="space-y-2">
                <div class="p-2 rounded bg-cyber-panel border border-cyber-border text-center">
                  <h4 class="text-[11px] font-bold text-slate-200 uppercase font-mono tracking-wider">
                    {col.tactic}
                  </h4>
                </div>

                <div class="space-y-2">
                  {col.techniques.map((tech) => {
                    const isSelected = selectedTechnique?.id === tech.id;
                    return (
                      <div
                        key={tech.id}
                        onClick={() => setSelectedTechnique({
                          id: tech.id,
                          name: tech.name,
                          tactic: col.tactic,
                          description: `Adversary technique ${tech.name} (${tech.id}) mapped under ${col.tactic} tactic.`,
                          adversaries: ['APT29 (Cozy Bear)', 'Lazarus Group', 'FIN7'],
                          mitigation: 'Implement strict execution policies, EDR telemetry monitoring, and access controls.'
                        })}
                        class={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                          tech.active
                            ? isSelected
                              ? 'bg-red-500/30 border-red-400 text-slate-100 shadow-glow-red ring-1 ring-red-400'
                              : 'bg-red-950/30 border-red-500/40 text-red-300 hover:bg-red-950/50'
                            : 'bg-cyber-bg/50 border-cyber-border text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div class="text-[10px] font-mono text-cyan-400 font-bold mb-1">{tech.id}</div>
                        <div class="text-xs font-semibold leading-tight line-clamp-2">{tech.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technique Detail Inspector */}
        <div class="cyber-card p-5 flex flex-col justify-between">
          <div>
            <div class="flex items-center space-x-2 pb-3 border-b border-cyber-border">
              <Target class="w-5 h-5 text-red-500" />
              <h3 class="text-sm font-bold text-slate-100 font-mono">MITRE Technique Inspector</h3>
            </div>

            {selectedTechnique ? (
              <div class="mt-4 space-y-4 text-xs font-mono">
                <div>
                  <span class="text-cyan-400 text-xs font-bold">{selectedTechnique.id}</span>
                  <h4 class="text-base font-bold text-slate-100 font-sans">{selectedTechnique.name}</h4>
                  <span class="cyber-badge bg-blue-500/20 text-blue-400 border border-blue-500/30 mt-1">
                    Tactic: {selectedTechnique.tactic}
                  </span>
                </div>

                <div>
                  <span class="text-slate-500 block uppercase text-[10px]">Technique Description</span>
                  <p class="text-slate-300 font-sans leading-relaxed mt-1">
                    {selectedTechnique.description}
                  </p>
                </div>

                <div>
                  <span class="text-slate-500 block uppercase text-[10px]">Known Threat Groups (APT)</span>
                  <div class="flex flex-wrap gap-1.5 mt-1">
                    {selectedTechnique.adversaries.map((apt, i) => (
                      <span key={i} class="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px]">
                        {apt}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span class="text-slate-500 block uppercase text-[10px]">Recommended Mitigation</span>
                  <p class="text-slate-300 font-sans leading-relaxed mt-1 bg-cyber-bg p-2.5 rounded border border-cyber-border">
                    {selectedTechnique.mitigation}
                  </p>
                </div>
              </div>
            ) : (
              <div class="text-center text-slate-500 py-12">
                Click any technique box in the matrix to view adversary intelligence and mitigation controls.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
