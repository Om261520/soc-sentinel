import React from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Terminal, 
  Grid, 
  FileCode, 
  Zap, 
  Search, 
  Briefcase, 
  Radio,
  Lock,
  Cpu
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab, metrics, isLiveSimulating }) {
  const tabs = [
    { id: 'dashboard', label: 'SIEM Overview', icon: Activity },
    { id: 'simulator', label: 'Attack Simulator', icon: Zap },
    { id: 'logs', label: 'Log Explorer', icon: Terminal },
    { id: 'mitre', label: 'MITRE ATT&CK', icon: Grid },
    { id: 'rules', label: 'Sigma Rules', icon: FileCode },
    { id: 'soar', label: 'SOAR Playbooks', icon: Lock },
    { id: 'intel', label: 'Threat Intel', icon: Search },
    { id: 'cases', label: 'Case Management', icon: Briefcase },
  ];

  return (
    <header class="border-b border-cyber-border bg-[#0a101d]/90 backdrop-blur-md sticky top-0 z-50">
      {/* Top Telemetry & Status Bar */}
      <div class="px-4 py-2 border-b border-cyber-border/40 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400">
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2 text-cyan-400">
            <Radio class={`w-3.5 h-3.5 ${isLiveSimulating ? 'animate-ping text-red-500' : 'animate-pulse'}`} />
            <span class="font-bold tracking-wider">DEFCON 3 - SOC LAB ACTIVE</span>
          </div>
          <span class="text-slate-600">|</span>
          <div class="flex items-center space-x-2">
            <Cpu class="w-3.5 h-3.5 text-slate-400" />
            <span>SIEM ENGINE: <span class="text-emerald-400">ONLINE</span></span>
          </div>
          <span class="text-slate-600 hidden md:inline">|</span>
          <div class="hidden md:flex items-center space-x-2">
            <span>ISOLATED HOSTS: <span class="text-amber-400 font-bold">{metrics.isolatedHostsCount || 0}</span></span>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <div class="bg-red-500/10 border border-red-500/30 text-red-400 px-2.5 py-0.5 rounded flex items-center space-x-1.5 font-bold">
            <ShieldAlert class="w-3.5 h-3.5 animate-pulse" />
            <span>{metrics.activeAlerts || 0} ACTIVE ALERTS</span>
          </div>
          <div class="text-slate-400 hidden sm:block">
            <span>MTTD: <span class="text-cyan-300 font-semibold">{metrics.mttd || '2.4m'}</span></span>
          </div>
        </div>
      </div>

      {/* Navigation Main Header */}
      <div class="px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div class="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div class="relative">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-glow-cyan text-slate-950 font-black">
              <ShieldAlert class="w-6 h-6 text-slate-950" />
            </div>
            <span class="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a101d]"></span>
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <h1 class="text-lg font-bold tracking-wider text-slate-100 uppercase font-mono">
                Aegis<span class="text-cyan-400">SOC</span>
              </h1>
              <span class="cyber-badge bg-cyan-950 text-cyan-400 border border-cyan-500/30">LAB v2.4</span>
            </div>
            <p class="text-xs text-slate-400">Threat Detection & Defense Simulation Workbench</p>
          </div>
        </div>

        {/* Tab Links */}
        <nav class="hidden lg:flex items-center space-x-1 bg-cyber-panel/80 p-1 rounded-xl border border-cyber-border">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                class={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-cyber-hover'
                }`}
              >
                <Icon class={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Tab Dropdown Nav */}
      <div class="flex lg:hidden overflow-x-auto px-4 py-2 space-x-2 border-t border-cyber-border/40 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              class={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-cyber-panel text-slate-400 border border-cyber-border'
              }`}
            >
              <Icon class="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
