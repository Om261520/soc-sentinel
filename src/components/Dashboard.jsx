import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Server, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Zap, 
  ArrowRight, 
  Eye, 
  Layers,
  Radio,
  FileSpreadsheet,
  Bot,
  Sparkles,
  X,
  ExternalLink,
  ShieldCheck,
  Ban,
  Cpu
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { playCyberClick, playThreatAlarm, playContainmentSound, playAiChime } from '../utils/audio';

export default function Dashboard({ 
  metrics, 
  alerts, 
  nodes, 
  onTriggerAttack, 
  onExecutePlaybook, 
  onTabChange,
  onCreateCase
}) {
  const canvasRef = useRef(null);
  const [selectedAlertForAI, setSelectedAlertForAI] = useState(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  // Realistic Ingestion Telemetry Data Stream
  const timeData = [
    { time: '10:00', totalLogs: 540, threats: 3 },
    { time: '10:10', totalLogs: 720, threats: 8 },
    { time: '10:20', totalLogs: 1150, threats: 19 },
    { time: '10:30', totalLogs: 980, threats: 7 },
    { time: '10:40', totalLogs: 1420, threats: 24 },
    { time: '10:50', totalLogs: 1890, threats: 32 },
    { time: '11:00', totalLogs: 1650, threats: 14 },
  ];

  const severityPieData = [
    { name: 'Critical', value: alerts.filter(a => a.severity === 'CRITICAL').length || 1, color: '#ff0055' },
    { name: 'High', value: alerts.filter(a => a.severity === 'HIGH').length || 2, color: '#ffb700' },
    { name: 'Medium', value: alerts.filter(a => a.severity === 'MEDIUM').length || 4, color: '#1d89ff' },
    { name: 'Low', value: 3, color: '#00ff9d' },
  ];

  // Draw Animated Canvas Cyber Threat Topology Map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      step += 0.03;

      // Draw Grid Matrix Background
      ctx.strokeStyle = 'rgba(27, 42, 74, 0.35)';
      ctx.lineWidth = 1;
      const gridSize = 25;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Host Coordinates on Topology
      const nodeCoords = {
        'GW-01': { x: 70, y: 130, label: 'Edge Firewall (GW-01)', ip: '10.0.0.1', type: 'gw' },
        'DC-01': { x: 230, y: 70, label: 'Domain Controller', ip: '192.168.1.10', type: 'srv' },
        'FIN-SERVER-02': { x: 230, y: 190, label: 'Finance DB (FIN-02)', ip: '192.168.1.45', type: 'db' },
        'WORKSTATION-88': { x: 420, y: 70, label: 'Exec PC (WS-88)', ip: '192.168.1.105', type: 'pc' },
        'WEB-APP-01': { x: 420, y: 190, label: 'Public Web (WEB-01)', ip: '10.0.0.88', type: 'web' },
      };

      const links = [
        ['GW-01', 'DC-01'],
        ['GW-01', 'FIN-SERVER-02'],
        ['GW-01', 'WEB-APP-01'],
        ['DC-01', 'WORKSTATION-88'],
        ['FIN-SERVER-02', 'WORKSTATION-88'],
      ];

      // Draw Connection Lines with Animated Data Packets
      links.forEach(([from, to], index) => {
        const p1 = nodeCoords[from];
        const p2 = nodeCoords[to];
        if (!p1 || !p2) return;

        ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Animated Traveling Packet
        const progress = (step * 0.7 + index * 0.3) % 1;
        const packetX = p1.x + (p2.x - p1.x) * progress;
        const packetY = p1.y + (p2.y - p1.y) * progress;

        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(packetX, packetY, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Host Nodes
      nodes.forEach((n) => {
        const coord = nodeCoords[n.id];
        if (!coord) return;

        const isIsolated = n.status === 'ISOLATED';
        const isWarning = n.status === 'WARNING';

        let nodeColor = '#00ff9d'; // Normal
        let shadowColor = '#00ff9d';
        if (isIsolated) {
          nodeColor = '#ffb700'; // Isolated
          shadowColor = '#ffb700';
        } else if (isWarning) {
          nodeColor = '#ff0055'; // Attacked / Warning
          shadowColor = '#ff0055';
        }

        // Pulse Ring
        ctx.strokeStyle = nodeColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(coord.x, coord.y, 16 + Math.sin(step * 3) * 3, 0, Math.PI * 2);
        ctx.stroke();

        // Node Center Core
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.arc(coord.x, coord.y, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = nodeColor;
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(coord.x, coord.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '10px "Fira Code", monospace';
        ctx.fillText(coord.label, coord.x - 45, coord.y + 26);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [nodes]);

  // AI Security Analyst Investigation Handler
  const handleOpenAiAnalysis = (alert) => {
    playAiChime();
    setSelectedAlertForAI(alert);
    setIsAiAnalyzing(true);
    setAiAnalysisResult(null);

    // Simulate Deep AI Reasoning Engine
    setTimeout(() => {
      setIsAiAnalyzing(false);
      setAiAnalysisResult({
        summary: `The threat detection engine identified an anomalous activity sequence indicative of ${alert.title}. The payload characteristics correlate with MITRE Technique ${alert.mitreId || 'T1490'}.`,
        threatActorAttribution: alert.attackerIp?.startsWith('185') ? 'APT29 (Cozy Bear) / Midnight Blizzard' : 'Uncategorized Threat Group / Red Team Operator',
        confidenceScore: 98,
        compromisedArtifacts: [
          `Target Host: ${alert.targetHost || 'FIN-SERVER-02'}`,
          `Attacker IP: ${alert.attackerIp || '185.220.101.5'}`,
          `Detection Rule: ${alert.ruleId || 'RULE-002'}`,
          `Telemetry Vector: Sysmon Process Creation & Network Socket`
        ],
        remediationSteps: [
          `Step 1: Execute Host Isolation playbook on ${alert.targetHost} to contain lateral movement.`,
          `Step 2: Add ${alert.attackerIp} to Perimeter Firewall Drop list.`,
          `Step 3: Collect forensic memory triage artifact via EDR agent.`,
          `Step 4: Rotate all local administrator passwords and verify immutable VSS shadow backups.`
        ]
      });
    }, 800);
  };

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Top Threat KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cyber-card p-4 flex items-center justify-between border-l-4 border-l-cyan-500 shadow-glow-cyan/20">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Total Ingested Logs</span>
            <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
              {(metrics.totalLogs || 1450).toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">● Ingestion Rate: ~120 EPS</span>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="cyber-card p-4 flex items-center justify-between border-l-4 border-l-red-500 shadow-glow-red/20">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Active Threats</span>
            <div className="text-2xl font-bold font-mono text-red-400 mt-1">
              {metrics.activeAlerts || 0}
            </div>
            <span className="text-[10px] text-red-400 font-mono">
              ● {metrics.criticalAlerts || 0} Critical / {metrics.highAlerts || 0} High
            </span>
          </div>
          <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="cyber-card p-4 flex items-center justify-between border-l-4 border-l-amber-500 shadow-glow-amber/20">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Contained Hosts</span>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
              {metrics.isolatedHostsCount || 0}
            </div>
            <span className="text-[10px] text-amber-300 font-mono">● Network Isolation Active</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Lock className="w-6 h-6" />
          </div>
        </div>

        <div className="cyber-card p-4 flex items-center justify-between border-l-4 border-l-purple-500">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Mean Response Time</span>
            <div className="text-2xl font-bold font-mono text-purple-300 mt-1">
              {metrics.mttr || '4.1 mins'}
            </div>
            <span className="text-[10px] text-purple-400 font-mono">● MTTD: {metrics.mttd || '2.4 mins'}</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Zap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Grid: Topology Map & Velocity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Network Infrastructure Topology Radar */}
        <div className="lg:col-span-7 cyber-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
                Network Perimeter & Subnet Topology
              </h2>
            </div>
            <span className="cyber-badge bg-emerald-950 text-emerald-400 border border-emerald-500/30">
              RADAR ACTIVE
            </span>
          </div>

          <div className="my-3 relative bg-[#060a12] rounded-xl border border-cyber-border/70 overflow-hidden flex items-center justify-center">
            <canvas ref={canvasRef} width={500} height={260} className="w-full h-[260px]" />
            <div className="absolute top-2 right-3 flex items-center space-x-3 text-[10px] font-mono">
              <span className="flex items-center space-x-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400"></span><span>Healthy</span></span>
              <span className="flex items-center space-x-1 text-red-400"><span className="w-2 h-2 rounded-full bg-red-400"></span><span>Alerted</span></span>
              <span className="flex items-center space-x-1 text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-400"></span><span>Isolated</span></span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-cyber-border/40 gap-2">
            <span>SUBNETS: 10.0.0.0/24 (DMZ), 192.168.1.0/24 (CORP)</span>
            <button 
              onClick={() => onTabChange('simulator')}
              className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-bold"
            >
              <span>Test Host Resilience</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Telemetry Ingestion Velocity Chart */}
        <div className="lg:col-span-5 cyber-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <h2 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
                Telemetry Log Ingestion
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">Live Window</span>
          </div>

          <div className="h-[240px] w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeData}>
                <defs>
                  <linearGradient id="cyberCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="cyberRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff0055" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ff0055" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1b2a4a" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0e1726', borderColor: '#1b2a4a', borderRadius: '8px', color: '#e2e8f0', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="totalLogs" stroke="#00f0ff" strokeWidth={2} fillOpacity={1} fill="url(#cyberCyan)" name="Logs/min" />
                <Area type="monotone" dataKey="threats" stroke="#ff0055" strokeWidth={2} fillOpacity={1} fill="url(#cyberRed)" name="Adversary Events" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-cyber-border/40">
            <span className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-cyan-400 rounded"></span>
              <span>Total Logs</span>
              <span className="w-2.5 h-2.5 bg-red-500 rounded ml-2"></span>
              <span>Threat Detections</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Active Alerts Feed & Instant Containment */}
      <div className="cyber-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyber-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono">Active Security Threat & Incident Stream</h2>
              <p className="text-xs text-slate-400">Live triage, root-cause forensic correlation, and rapid automated containment.</p>
            </div>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-slate-400">Filter:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
              <button
                key={sev}
                onClick={() => { playCyberClick(); setFilterSeverity(sev); }}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition ${
                  filterSeverity === sev 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-glow-cyan' 
                    : 'bg-cyber-panel text-slate-400 border border-cyber-border hover:border-slate-500'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts Cards List */}
        <div className="space-y-3 mt-4">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-10 text-slate-500 font-mono text-xs">
              No active security incidents matching the selected filter.
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div 
                key={alert.id}
                className={`p-4 rounded-xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  alert.status === 'RESOLVED' 
                    ? 'bg-emerald-950/10 border-emerald-500/30 opacity-70'
                    : (alert.severity === 'CRITICAL' 
                      ? 'bg-red-950/20 border-red-500/50 hover:border-red-400' 
                      : 'bg-cyber-panel border-cyber-border hover:border-cyan-500/50')
                }`}
              >
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                    <span className="text-cyan-400 font-bold">{alert.id}</span>
                    <span className={`cyber-badge ${
                      alert.severity === 'CRITICAL' 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                        : (alert.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-blue-500/20 text-blue-400 border border-blue-500/40')
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-slate-400 font-semibold">{alert.mitreId}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100">{alert.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{alert.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 pt-1">
                    <span>Host: <strong className="text-slate-200">{alert.targetHost || 'FIN-SERVER-02'}</strong></span>
                    <span>•</span>
                    <span>Attacker IP: <strong className="text-red-400">{alert.attackerIp || '185.220.101.5'}</strong></span>
                  </div>
                </div>

                {/* Quick Response Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-cyber-border">
                  {/* AI Triage Button */}
                  <button
                    onClick={() => handleOpenAiAnalysis(alert)}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 text-purple-300 border border-purple-500/40 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition"
                  >
                    <Bot className="w-3.5 h-3.5 text-purple-400" />
                    <span>AI Copilot</span>
                  </button>

                  {/* Isolate Host */}
                  <button
                    onClick={() => {
                      playContainmentSound();
                      onExecutePlaybook('ISOLATE_HOST', alert.targetHost || 'FIN-SERVER-02', alert.id);
                    }}
                    className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Isolate</span>
                  </button>

                  {/* Block IP */}
                  <button
                    onClick={() => {
                      playContainmentSound();
                      onExecutePlaybook('BLOCK_IP', alert.attackerIp || '185.220.101.5', alert.id);
                    }}
                    className="px-3 py-1.5 bg-red-500/15 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition"
                  >
                    <Ban className="w-3.5 h-3.5 text-red-400" />
                    <span>Block IP</span>
                  </button>

                  {/* Create Case */}
                  <button
                    onClick={() => {
                      playCyberClick();
                      onCreateCase(alert);
                    }}
                    className="px-3 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Case</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Threat Investigation Assistant Modal Drawer */}
      {selectedAlertForAI && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="cyber-card max-w-2xl w-full bg-[#0a101d] border border-cyan-500/50 shadow-glow-cyan p-6 relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-cyber-border">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/40">
                  <Bot className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                    <span>AI SOC Analyst Copilot</span>
                    <span className="cyber-badge bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px]">
                      GENAI THREAT ASSISTANT
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Automated triage, ATT&CK mapping, and mitigation recommendations.</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAlertForAI(null)}
                className="p-1 rounded bg-cyber-panel text-slate-400 hover:text-slate-200 border border-cyber-border"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Analysis Content */}
            <div className="mt-4 space-y-4">
              <div className="bg-cyber-panel/80 p-3 rounded-lg border border-cyber-border text-xs font-mono">
                <span className="text-slate-400">Target Incident: </span>
                <strong className="text-cyan-400">{selectedAlertForAI.id}</strong> — <span className="text-slate-200">{selectedAlertForAI.title}</span>
              </div>

              {isAiAnalyzing ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <Cpu className="w-8 h-8 text-cyan-400 animate-spin" />
                  <p className="text-xs font-mono text-slate-400 animate-pulse">
                    Running Deep Threat Reasoning & MITRE ATT&CK Correlation Engine...
                  </p>
                </div>
              ) : aiAnalysisResult ? (
                <div className="space-y-4 text-xs">
                  {/* Executive Summary */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase">Incident Executive Summary</span>
                    <p className="text-slate-300 leading-relaxed bg-[#05080f] p-3 rounded-lg border border-cyber-border">
                      {aiAnalysisResult.summary}
                    </p>
                  </div>

                  {/* Threat Attribution & Score */}
                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div className="p-3 rounded-lg bg-cyber-bg border border-cyber-border">
                      <span className="text-slate-500 text-[10px] block">THREAT ATTRIBUTION</span>
                      <strong className="text-purple-400 text-xs">{aiAnalysisResult.threatActorAttribution}</strong>
                    </div>
                    <div className="p-3 rounded-lg bg-cyber-bg border border-cyber-border">
                      <span className="text-slate-500 text-[10px] block">ANALYSIS CONFIDENCE</span>
                      <strong className="text-emerald-400 text-xs">{aiAnalysisResult.confidenceScore}% (High Certainty)</strong>
                    </div>
                  </div>

                  {/* Compromised Artifacts */}
                  <div className="space-y-1 font-mono">
                    <span className="text-[11px] text-red-400 font-bold uppercase">Compromised Telemetry Indicators</span>
                    <ul className="space-y-1 bg-[#05080f] p-3 rounded-lg border border-cyber-border">
                      {aiAnalysisResult.compromisedArtifacts.map((art, i) => (
                        <li key={i} className="text-slate-300 flex items-center space-x-2">
                          <span className="text-red-500">●</span>
                          <span>{art}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Remediation Playbook Actions */}
                  <div className="space-y-1 font-mono">
                    <span className="text-[11px] text-emerald-400 font-bold uppercase">Automated Remediation Steps</span>
                    <div className="space-y-2 bg-[#05080f] p-3 rounded-lg border border-cyber-border">
                      {aiAnalysisResult.remediationSteps.map((step, i) => (
                        <div key={i} className="text-slate-300 flex items-start space-x-2">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar inside Modal */}
                  <div className="pt-3 border-t border-cyber-border flex items-center justify-end space-x-3">
                    <button
                      onClick={() => {
                        playContainmentSound();
                        onExecutePlaybook('ISOLATE_HOST', selectedAlertForAI.targetHost, selectedAlertForAI.id);
                        setSelectedAlertForAI(null);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold rounded-lg text-xs transition"
                    >
                      Execute Auto-Containment
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
