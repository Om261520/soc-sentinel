import React, { useState } from 'react';
import { 
  Lock, 
  ShieldAlert, 
  Zap, 
  Terminal, 
  CheckCircle2, 
  UserX, 
  Server, 
  Play,
  RotateCcw,
  Ban,
  Activity,
  Workflow,
  CheckCheck,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { playContainmentSound, playCyberClick } from '../utils/audio';

export default function SoarPlaybooks({ onExecutePlaybook, isolatedHosts, blockedIPs }) {
  const [targetHost, setTargetHost] = useState('FIN-SERVER-02');
  const [targetIp, setTargetIp] = useState('185.220.101.5');
  const [targetProcess, setTargetProcess] = useState('mimikatz.exe');
  const [targetUser, setTargetUser] = useState('Administrator');
  const [activeWorkflowStage, setActiveWorkflowStage] = useState(null);
  const [actionOutput, setActionOutput] = useState([
    `[${new Date().toLocaleTimeString()}] SOAR Orchestration & Automated Containment Pipeline ready.`
  ]);

  const handleRunAction = async (action, target) => {
    playContainmentSound();
    
    // Simulate Multi-step workflow visual progression
    setActiveWorkflowStage('TRIGGER');
    setTimeout(() => setActiveWorkflowStage('ENRICH'), 300);
    setTimeout(() => setActiveWorkflowStage('CONTAIN'), 600);
    setTimeout(() => setActiveWorkflowStage('COMPLETE'), 900);

    const res = await onExecutePlaybook(action, target);
    const nowStr = new Date().toLocaleTimeString();

    if (res && res.message) {
      setActionOutput(prev => [
        `[${nowStr}] [+] SOAR SUCCESS: ${res.message}`,
        ...prev
      ]);
    } else {
      setActionOutput(prev => [
        `[${nowStr}] [+] SOAR ACTION [${action}] executed successfully on target ${target}.`,
        ...prev
      ]);
    }
  };

  const playbooks = [
    {
      id: 'ISOLATE_HOST',
      title: 'Automated EDR Host Network Isolation',
      icon: Server,
      color: 'from-amber-500 to-orange-600',
      description: 'Isolates the compromised endpoint at the network adapter level using EDR kernel driver while maintaining security agent telemetry channel.',
      targetLabel: 'Target Machine',
      targetVal: targetHost,
      setTarget: setTargetHost
    },
    {
      id: 'BLOCK_IP',
      title: 'Perimeter Firewall Threat Actor IP Blacklist',
      icon: Ban,
      color: 'from-red-600 to-rose-700',
      description: 'Pushes automated drop policy to perimeter firewalls to block all incoming & outgoing traffic from malicious IP.',
      targetLabel: 'Attacker IP',
      targetVal: targetIp,
      setTarget: setTargetIp
    },
    {
      id: 'KILL_PROCESS',
      title: 'Malicious Process Memory Termination',
      icon: Zap,
      color: 'from-purple-600 to-indigo-700',
      description: 'Sends immediate taskkill / SIGKILL command to terminate malicious payload execution in system RAM.',
      targetLabel: 'Process Name',
      targetVal: targetProcess,
      setTarget: setTargetProcess
    },
    {
      id: 'REVOKE_USER',
      title: 'Active Directory User Session Revocation',
      icon: UserX,
      color: 'from-blue-600 to-cyan-700',
      description: 'Revokes Kerberos TGT tickets, invalidates active JWT refresh tokens, and resets password in domain controller.',
      targetLabel: 'Target Username',
      targetVal: targetUser,
      setTarget: setTargetUser
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="cyber-card p-5 border-l-4 border-l-amber-500 shadow-glow-amber/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2 font-mono">
              <Lock className="w-5 h-5 text-amber-400" />
              <span>SOAR Security Orchestration, Automation & Response</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Automate containment workflows, perimeter firewall updates, host quarantine, and active incident response.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="cyber-badge bg-amber-950 text-amber-400 border border-amber-500/30">
              ORCHESTRATOR ONLINE
            </span>
          </div>
        </div>
      </div>

      {/* Visual Playbook Flowchart */}
      <div className="cyber-card p-5">
        <div className="flex items-center space-x-2 pb-3 border-b border-cyber-border text-xs font-mono">
          <Workflow className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-slate-100 uppercase tracking-wider">Automated Incident Response Pipeline</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 my-4 text-xs font-mono">
          <div className={`p-3 rounded-lg border text-center transition-all ${
            activeWorkflowStage === 'TRIGGER' ? 'bg-red-500/20 border-red-500 text-red-300 shadow-glow-red' : 'bg-cyber-bg border-cyber-border text-slate-400'
          }`}>
            <span className="text-slate-500 text-[10px] block">STAGE 1</span>
            <strong className="text-slate-200 block mt-1">SIEM Threat Trigger</strong>
            <span className="text-[10px] text-slate-500">Sigma Rule Triggered</span>
          </div>

          <div className={`p-3 rounded-lg border text-center transition-all ${
            activeWorkflowStage === 'ENRICH' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-glow-cyan' : 'bg-cyber-bg border-cyber-border text-slate-400'
          }`}>
            <span className="text-slate-500 text-[10px] block">STAGE 2</span>
            <strong className="text-slate-200 block mt-1">IOC Enrichment</strong>
            <span className="text-[10px] text-slate-500">Threat Intel Query</span>
          </div>

          <div className={`p-3 rounded-lg border text-center transition-all ${
            activeWorkflowStage === 'CONTAIN' ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-glow-amber' : 'bg-cyber-bg border-cyber-border text-slate-400'
          }`}>
            <span className="text-slate-500 text-[10px] block">STAGE 3</span>
            <strong className="text-slate-200 block mt-1">Auto-Containment</strong>
            <span className="text-[10px] text-slate-500">Host / IP Drop Action</span>
          </div>

          <div className={`p-3 rounded-lg border text-center transition-all ${
            activeWorkflowStage === 'COMPLETE' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-glow-emerald' : 'bg-cyber-bg border-cyber-border text-slate-400'
          }`}>
            <span className="text-slate-500 text-[10px] block">STAGE 4</span>
            <strong className="text-slate-200 block mt-1">Case Dispatch</strong>
            <span className="text-[10px] text-slate-500">Incident Ticket Filed</span>
          </div>
        </div>
      </div>

      {/* Playbook Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {playbooks.map((pb) => {
          const Icon = pb.icon;
          return (
            <div key={pb.id} className="cyber-card p-5 flex flex-col justify-between hover:border-amber-500/50 transition">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${pb.color} text-white shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 font-mono">{pb.title}</h3>
                    <span className="text-[10px] font-mono text-cyan-400 font-semibold">ACTION ID: {pb.id}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-sans">{pb.description}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-cyber-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">{pb.targetLabel}</label>
                  <input
                    type="text"
                    value={pb.targetVal}
                    onChange={(e) => pb.setTarget(e.target.value)}
                    className="w-full bg-cyber-bg border border-cyber-border rounded px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  onClick={() => handleRunAction(pb.id, pb.targetVal)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow-glow-amber transition flex items-center justify-center space-x-1.5 self-end"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Playbook</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Containments & Terminal Log Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Isolated Hosts & Blocked IPs */}
        <div className="lg:col-span-5 cyber-card p-5 space-y-4">
          <div className="pb-3 border-b border-cyber-border">
            <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Active Containment Enforcement</span>
            </h3>
          </div>

          {/* Isolated Hosts */}
          <div>
            <span className="text-[11px] font-mono text-amber-400 font-bold uppercase block mb-1.5">
              Quarantined Hosts ({isolatedHosts.length})
            </span>
            <div className="space-y-1.5 max-h-28 overflow-y-auto">
              {isolatedHosts.length === 0 ? (
                <div className="text-xs text-slate-500 font-mono italic">No hosts currently isolated.</div>
              ) : (
                isolatedHosts.map((h, i) => (
                  <div key={i} className="p-2 rounded bg-amber-950/30 border border-amber-500/40 text-xs font-mono text-amber-300 flex items-center justify-between">
                    <span>{h}</span>
                    <span className="cyber-badge bg-amber-500/20 text-amber-300 text-[10px]">ISOLATED</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Blocked Perimeter IPs */}
          <div>
            <span className="text-[11px] font-mono text-red-400 font-bold uppercase block mb-1.5">
              Perimeter Blocked IPs ({blockedIPs.length})
            </span>
            <div className="space-y-1.5 max-h-28 overflow-y-auto">
              {blockedIPs.map((ip, i) => (
                <div key={i} className="p-2 rounded bg-red-950/30 border border-red-500/40 text-xs font-mono text-red-300 flex items-center justify-between">
                  <span>{ip}</span>
                  <span className="cyber-badge bg-red-500/20 text-red-300 text-[10px]">DROP RULE</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Execution Output Console */}
        <div className="lg:col-span-7 cyber-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100 font-mono">SOAR Automated Execution Console</h3>
            </div>
            <span className="text-xs font-mono text-slate-500">LIVE FEED</span>
          </div>

          <div className="my-3 h-48 rounded-lg border border-cyber-border bg-[#05080f] p-4 font-mono text-xs text-slate-300 overflow-y-auto space-y-1.5">
            {actionOutput.map((log, i) => (
              <div key={i} className="flex items-start space-x-2">
                <span className="text-cyan-400">❯</span>
                <span className={log.includes('SUCCESS') ? 'text-emerald-400 font-semibold' : 'text-slate-300'}>
                  {log}
                </span>
              </div>
            ))}
          </div>

          <div className="text-xs font-mono text-slate-500">
            SOAR engine executes containment scripts via host EDR agent API and perimeter firewall REST endpoints.
          </div>
        </div>
      </div>
    </div>
  );
}
