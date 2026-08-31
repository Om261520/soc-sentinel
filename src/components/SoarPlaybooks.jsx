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
  RotateCcw
} from 'lucide-react';

export default function SoarPlaybooks({ onExecutePlaybook, isolatedHosts, blockedIPs }) {
  const [targetHost, setTargetHost] = useState('FIN-SERVER-02');
  const [targetIp, setTargetIp] = useState('185.220.101.5');
  const [targetProcess, setTargetProcess] = useState('mimikatz.exe');
  const [targetUser, setTargetUser] = useState('Administrator');
  const [actionOutput, setActionOutput] = useState([]);

  const handleRunAction = async (action, target) => {
    const res = await onExecutePlaybook(action, target);
    if (res && res.message) {
      setActionOutput(prev => [
        `[${new Date().toLocaleTimeString()}] SOAR EXECUTED [${action}]: ${res.message}`,
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
      title: 'Edge Firewall Threat Actor IP Blacklist',
      icon: ShieldAlert,
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
      id: 'RESET_CREDENTIALS',
      title: 'Active Directory User Revocation',
      icon: UserX,
      color: 'from-cyan-600 to-blue-700',
      description: 'Force disables compromised LDAP / AD domain account, revokes active Kerberos ticket-granting tickets (TGT), and forces password reset.',
      targetLabel: 'Target User',
      targetVal: targetUser,
      setTarget: setTargetUser
    }
  ];

  return (
    <div class="space-y-6">
      {/* Header Banner */}
      <div class="cyber-card p-5 border-l-4 border-l-emerald-500">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <Lock class="w-5 h-5 text-emerald-400" />
              <span>SOAR Automated Incident Response & Remediation Playbooks</span>
            </h2>
            <p class="text-xs text-slate-400 mt-1">
              Security Orchestration, Automation, and Response engine for instant threat containment.
            </p>
          </div>

          <div class="flex items-center space-x-3 text-xs font-mono">
            <span class="bg-amber-500/20 text-amber-300 px-3 py-1 rounded border border-amber-500/30">
              Isolated Hosts: {isolatedHosts.length}
            </span>
            <span class="bg-red-500/20 text-red-300 px-3 py-1 rounded border border-red-500/30">
              Blocked IPs: {blockedIPs.length}
            </span>
          </div>
        </div>
      </div>

      {/* Playbook Cards Grid */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        {playbooks.map((pb) => {
          const Icon = pb.icon;
          return (
            <div key={pb.id} class="cyber-card p-5 flex flex-col justify-between space-y-4">
              <div class="space-y-3">
                <div class="flex items-center space-x-3">
                  <div class={`p-3 rounded-xl bg-gradient-to-br ${pb.color} text-white shadow-lg`}>
                    <Icon class="w-6 h-6" />
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-slate-100">{pb.title}</h3>
                    <span class="text-[10px] font-mono text-cyan-400 uppercase">SOAR PLAYBOOK #{pb.id}</span>
                  </div>
                </div>

                <p class="text-xs text-slate-400 leading-relaxed">
                  {pb.description}
                </p>

                <div class="pt-2">
                  <label class="block text-[10px] font-mono text-slate-400 uppercase mb-1">{pb.targetLabel}</label>
                  <input
                    type="text"
                    value={pb.targetVal}
                    onChange={(e) => pb.setTarget(e.target.value)}
                    class="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div class="pt-3 border-t border-cyber-border flex justify-end">
                <button
                  onClick={() => handleRunAction(pb.id, pb.targetVal)}
                  class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-glow-emerald transition flex items-center space-x-1.5"
                >
                  <Play class="w-3.5 h-3.5 fill-current" />
                  <span>Execute Playbook</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time SOAR Action Log Stream */}
      <div class="cyber-card p-5">
        <div class="flex items-center space-x-2 mb-3">
          <Terminal class="w-5 h-5 text-emerald-400" />
          <h3 class="text-sm font-bold text-slate-100 font-mono">SOAR Remediation Action Stream</h3>
        </div>

        <div class="h-40 rounded-lg border border-cyber-border bg-[#05080f] p-4 font-mono text-xs text-emerald-300 overflow-y-auto space-y-2">
          {actionOutput.length === 0 ? (
            <div class="text-slate-600 text-center pt-10 italic">
              No SOAR actions triggered yet. Click "Execute Playbook" on any remediation module above.
            </div>
          ) : (
            actionOutput.map((log, i) => (
              <div key={i} class="flex items-start space-x-2">
                <span class="text-emerald-400">⚡</span>
                <span>{log}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
