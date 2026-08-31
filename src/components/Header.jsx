import React, { useState, useEffect } from 'react';
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
  Cpu,
  Volume2,
  VolumeX,
  Clock
} from 'lucide-react';
import { playCyberClick, toggleMute, getMuteStatus } from '../utils/audio';

export default function Header({ activeTab, setActiveTab, metrics, isLiveSimulating }) {
  const [isMuted, setIsMuted] = useState(getMuteStatus());
  const [utcTime, setUtcTime] = useState(new Date().toUTCString().slice(17, 25));

  useEffect(() => {
    const timer = setInterval(() => {
      setUtcTime(new Date().toUTCString().slice(17, 25));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTabClick = (id) => {
    playCyberClick();
    setActiveTab(id);
  };

  const handleToggleAudio = () => {
    const muted = toggleMute();
    setIsMuted(muted);
    if (!muted) playCyberClick();
  };

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

  // Calculate DEFCON status dynamically
  const defconLevel = metrics.criticalAlerts > 0 ? 1 : (metrics.highAlerts > 0 ? 2 : 3);
  const defconColor = defconLevel === 1 
    ? 'text-red-400 bg-red-950/60 border-red-500 shadow-glow-red animate-pulse' 
    : (defconLevel === 2 ? 'text-amber-400 bg-amber-950/60 border-amber-500' : 'text-cyan-400 bg-cyan-950/60 border-cyan-500/50');

  return (
    <header className="border-b border-cyber-border bg-[#0a101d]/95 backdrop-blur-md sticky top-0 z-50">
      {/* Top Telemetry & Global Status Bar */}
      <div className="px-4 py-2 border-b border-cyber-border/40 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className={`px-2.5 py-0.5 rounded border text-[11px] font-bold tracking-wider flex items-center space-x-1.5 ${defconColor}`}>
            <Radio className={`w-3 h-3 ${isLiveSimulating || defconLevel === 1 ? 'animate-ping text-red-400' : 'animate-pulse'}`} />
            <span>DEFCON {defconLevel} — {defconLevel === 1 ? 'CRITICAL INCIDENT' : (defconLevel === 2 ? 'ELEVATED ALERT' : 'NORMAL OPS')}</span>
          </div>

          <span className="text-slate-600 hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center space-x-2">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>SIEM ENGINE: <span className="text-emerald-400 font-semibold">ACTIVE (100%)</span></span>
          </div>

          <span className="text-slate-600 hidden md:inline">|</span>
          <div className="hidden md:flex items-center space-x-2">
            <span>ISOLATED HOSTS: <span className="text-amber-400 font-bold">{metrics.isolatedHostsCount || 0}</span></span>
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* UTC Clock */}
          <div className="hidden lg:flex items-center space-x-1.5 text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>UTC <span className="text-cyan-300 font-semibold">{utcTime}</span></span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleAudio}
            className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-cyber-panel border border-cyber-border hover:border-cyan-500/50 text-slate-300 transition text-[11px]"
            title={isMuted ? 'Unmute Cyber SFX' : 'Mute Cyber SFX'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="hidden sm:inline">{isMuted ? 'SFX OFF' : 'SFX ON'}</span>
          </button>

          {/* Active Alerts Pill */}
          <div 
            onClick={() => handleTabClick('dashboard')}
            className="bg-red-500/10 border border-red-500/30 text-red-400 px-2.5 py-0.5 rounded flex items-center space-x-1.5 font-bold cursor-pointer hover:bg-red-500/20 transition"
          >
            <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
            <span>{metrics.activeAlerts || 0} ALERTS</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleTabClick('dashboard')}>
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-glow-cyan text-slate-950 font-black">
              <ShieldAlert className="w-6 h-6 text-slate-950" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a101d] animate-pulse"></span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-wider text-slate-100 uppercase font-mono">
                SOC <span className="text-cyan-400">SENTINEL</span>
              </h1>
              <span className="cyber-badge bg-cyan-950 text-cyan-400 border border-cyan-500/30 text-[10px]">
                LIVE WORKBENCH
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Threat Detection, Incident Analysis & SOAR Defense Platform</p>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="hidden lg:flex items-center space-x-1 bg-cyber-panel/90 p-1.5 rounded-xl border border-cyber-border">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/50 shadow-glow-cyan font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-cyber-hover'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile / Tablet Horizontal Scroll Menu */}
      <div className="flex lg:hidden overflow-x-auto px-4 py-2 space-x-2 border-t border-cyber-border/40 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                  : 'bg-cyber-panel text-slate-400 border border-cyber-border'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
