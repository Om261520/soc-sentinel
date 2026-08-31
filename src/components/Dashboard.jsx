import React, { useEffect, useRef } from 'react';
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
  FileSpreadsheet
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

  // Mock chart dataset
  const timeData = [
    { time: '12:00', totalLogs: 420, attacks: 2 },
    { time: '12:05', totalLogs: 580, attacks: 5 },
    { time: '12:10', totalLogs: 890, attacks: 12 },
    { time: '12:15', totalLogs: 640, attacks: 4 },
    { time: '12:20', totalLogs: 1100, attacks: 18 },
    { time: '12:25', totalLogs: 1450, attacks: 25 },
    { time: '12:30', totalLogs: 920, attacks: 8 },
  ];

  const severityPieData = [
    { name: 'Critical', value: alerts.filter(a => a.severity === 'CRITICAL').length || 1, color: '#ff0055' },
    { name: 'High', value: alerts.filter(a => a.severity === 'HIGH').length || 2, color: '#ffb700' },
    { name: 'Medium', value: alerts.filter(a => a.severity === 'MEDIUM').length || 4, color: '#1d89ff' },
    { name: 'Low', value: alerts.filter(a => a.severity === 'LOW').length || 6, color: '#00ff9d' },
  ];

  // Draw interactive threat map on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      step += 0.03;

      // Draw background grid lines
      ctx.strokeStyle = 'rgba(27, 42, 74, 0.3)';
      ctx.lineWidth = 1;
      const gridSize = 30;
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

      // Map Nodes Coordinates
      const nodeCoords = {
        'GW-01': { x: 80, y: 150, label: 'Edge Firewall (GW-01)', ip: '10.0.0.1', type: 'gw' },
        'DC-01': { x: 260, y: 80, label: 'Domain Controller', ip: '192.168.1.10', type: 'srv' },
        'FIN-SERVER-02': { x: 260, y: 220, label: 'Finance DB', ip: '192.168.1.45', type: 'db' },
        'WORKSTATION-88': { x: 460, y: 80, label: 'Executive PC', ip: '192.168.1.105', type: 'pc' },
        'WEB-APP-01': { x: 460, y: 220, label: 'Public Web App', ip: '10.0.0.88', type: 'web' },
      };

      // Connections
      const links = [
        ['GW-01', 'DC-01'],
        ['GW-01', 'FIN-SERVER-02'],
        ['GW-01', 'WEB-APP-01'],
        ['DC-01', 'WORKSTATION-88'],
        ['FIN-SERVER-02', 'WORKSTATION-88'],
      ];

      // Draw Connection lines
      links.forEach(([from, to]) => {
        const start = nodeCoords[from];
        const end = nodeCoords[to];
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw animated data packet
        const progress = (Math.sin(step + (start.x + end.y) * 0.01) + 1) / 2;
        const px = start.x + (end.x - start.x) * progress;
        const py = start.y + (end.y - start.y) * progress;

        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw attack pulse to active alerts
      if (alerts.length > 0) {
        const topAlert = alerts[0];
        const targetNode = Object.values(nodeCoords).find(n => topAlert.targetHost && topAlert.targetHost.includes(n.ip) || topAlert.targetHost.includes(n.label));
        if (targetNode) {
          ctx.beginPath();
          const pulseRadius = 15 + Math.sin(step * 4) * 8;
          ctx.arc(targetNode.x, targetNode.y, pulseRadius, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 0, 85, 0.8)';
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      }

      // Draw Nodes
      Object.entries(nodeCoords).forEach(([key, node]) => {
        const isIsolated = nodes.some(n => n.ip === node.ip && n.status === 'ISOLATED');

        ctx.beginPath();
        ctx.arc(node.x, node.y, 16, 0, Math.PI * 2);
        ctx.fillStyle = isIsolated ? '#ffb700' : '#0e1726';
        ctx.strokeStyle = isIsolated ? '#ffb700' : '#00f0ff';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        // Node Label
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + 32);

        ctx.fillStyle = isIsolated ? '#ffb700' : '#64748b';
        ctx.font = '10px Fira Code, monospace';
        ctx.fillText(isIsolated ? '[ISOLATED]' : node.ip, node.x, node.y + 45);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [alerts, nodes]);

  return (
    <div class="space-y-6">
      {/* Top Metric Cards */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div class="cyber-card p-4 flex items-center justify-between border-l-4 border-l-cyan-500">
          <div>
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Logs Analyzed</p>
            <h3 class="text-2xl font-bold text-slate-100 font-mono mt-1">
              {(metrics.totalLogs || 1450).toLocaleString()}
            </h3>
            <span class="text-[10px] text-cyan-400 flex items-center space-x-1 mt-1">
              <Activity class="w-3 h-3 animate-pulse" />
              <span>Real-time Ingestion Stream</span>
            </span>
          </div>
          <div class="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Activity class="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div class="cyber-card p-4 flex items-center justify-between border-l-4 border-l-red-500">
          <div>
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Security Alerts</p>
            <h3 class="text-2xl font-bold text-red-400 font-mono mt-1">
              {metrics.activeAlerts || 0}
            </h3>
            <span class="text-[10px] text-red-400 flex items-center space-x-1 mt-1">
              <ShieldAlert class="w-3 h-3 animate-pulse" />
              <span>{metrics.criticalAlerts || 0} Critical Severity</span>
            </span>
          </div>
          <div class="p-3 rounded-lg bg-red-500/10 text-red-400">
            <ShieldAlert class="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div class="cyber-card p-4 flex items-center justify-between border-l-4 border-l-amber-500">
          <div>
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">Isolated Hosts</p>
            <h3 class="text-2xl font-bold text-amber-400 font-mono mt-1">
              {metrics.isolatedHostsCount || 0}
            </h3>
            <span class="text-[10px] text-amber-400 flex items-center space-x-1 mt-1">
              <Lock class="w-3 h-3" />
              <span>Network Isolation Active</span>
            </span>
          </div>
          <div class="p-3 rounded-lg bg-amber-500/10 text-amber-400">
            <Server class="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div class="cyber-card p-4 flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">MTTD / MTTR Metrics</p>
            <h3 class="text-xl font-bold text-emerald-400 font-mono mt-1">
              {metrics.mttd || '2.4m'} / {metrics.mttr || '4.1m'}
            </h3>
            <span class="text-[10px] text-emerald-400 flex items-center space-x-1 mt-1">
              <CheckCircle2 class="w-3 h-3" />
              <span>Automated SOAR Optimization</span>
            </span>
          </div>
          <div class="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Zap class="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Threat Map & Ingestion Charts */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Threat Topology Canvas Map */}
        <div class="lg:col-span-2 cyber-card p-5 flex flex-col justify-between">
          <div class="flex items-center justify-between mb-3">
            <div>
              <h2 class="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Radio class="w-5 h-5 text-cyan-400 animate-pulse" />
                <span>Live Network Telemetry & Attack Topology Map</span>
              </h2>
              <p class="text-xs text-slate-400">Real-time node telemetry and active adversary vector pulses</p>
            </div>
            <div class="flex items-center space-x-2">
              <button 
                onClick={() => onTriggerAttack('BRUTE_FORCE')}
                class="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 rounded text-xs font-bold transition flex items-center space-x-1"
              >
                <Zap class="w-3.5 h-3.5" />
                <span>Simulate Attack</span>
              </button>
            </div>
          </div>

          <div class="relative w-full overflow-hidden rounded-lg border border-cyber-border bg-[#060a12] p-2 flex justify-center">
            <canvas 
              ref={canvasRef} 
              width={580} 
              height={300}
              class="w-full max-w-[580px] h-[300px] block"
            />
          </div>

          <div class="mt-4 pt-3 border-t border-cyber-border flex items-center justify-between text-xs text-slate-400">
            <div class="flex items-center space-x-4">
              <span class="flex items-center space-x-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <span>Active Link</span>
              </span>
              <span class="flex items-center space-x-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                <span>Attack Target Pulse</span>
              </span>
              <span class="flex items-center space-x-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span>Host Isolated</span>
              </span>
            </div>
            <span class="font-mono text-[11px] text-cyan-400">SIEM STREAM: 100% ONLINE</span>
          </div>
        </div>

        {/* Attack Severity Breakdown & Telemetry Chart */}
        <div class="cyber-card p-5 flex flex-col justify-between space-y-4">
          <div>
            <h2 class="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Layers class="w-5 h-5 text-cyan-400" />
              <span>Incident Severity Breakdown</span>
            </h2>
            <p class="text-xs text-slate-400">Alert distribution across severity tiers</p>
          </div>

          {/* Pie Chart */}
          <div class="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0e1726', borderColor: '#1b2a4a', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span class="text-2xl font-bold font-mono text-slate-100">{alerts.length}</span>
              <span class="text-[10px] text-slate-400 uppercase">Alerts</span>
            </div>
          </div>

          {/* Severity Legend */}
          <div class="grid grid-cols-2 gap-2 pt-2 border-t border-cyber-border text-xs font-mono">
            <div class="flex items-center justify-between p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400">
              <span>CRITICAL</span>
              <span class="font-bold">{alerts.filter(a => a.severity === 'CRITICAL').length}</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <span>HIGH</span>
              <span class="font-bold">{alerts.filter(a => a.severity === 'HIGH').length}</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <span>MEDIUM</span>
              <span class="font-bold">{alerts.filter(a => a.severity === 'MEDIUM').length}</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <span>LOW</span>
              <span class="font-bold">{alerts.filter(a => a.severity === 'LOW').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Triage Alert Feed */}
      <div class="cyber-card p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-base font-bold text-slate-100 flex items-center space-x-2">
              <ShieldAlert class="w-5 h-5 text-red-500 animate-pulse" />
              <span>Active Security Incidents & Triggered SIEM Alerts</span>
            </h2>
            <p class="text-xs text-slate-400">Real-time alerts triggered by detection rules requiring analyst triage</p>
          </div>
          <button 
            onClick={() => onTabChange('simulator')}
            class="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-semibold"
          >
            <span>Launch Attack Ground</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </button>
        </div>

        {alerts.length === 0 ? (
          <div class="p-8 text-center border border-dashed border-cyber-border rounded-lg text-slate-400">
            <CheckCircle2 class="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <p class="font-semibold text-slate-200">No Active Threats Detected</p>
            <p class="text-xs mt-1">System monitoring clean. Trigger an attack scenario in the simulator tab to test detection.</p>
          </div>
        ) : (
          <div class="space-y-3">
            {alerts.slice(0, 5).map((alert) => {
              const isRemediated = alert.status === 'REMEDIATED';
              const isCritical = alert.severity === 'CRITICAL';
              return (
                <div 
                  key={alert.id}
                  class={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isRemediated
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : isCritical
                      ? 'bg-red-950/30 border-red-500/50 shadow-glow-red'
                      : 'bg-cyber-panel border-cyber-border hover:border-cyan-500/40'
                  }`}
                >
                  <div class="space-y-1">
                    <div class="flex items-center space-x-2">
                      <span class={`cyber-badge ${
                        alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                        alert.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      }`}>
                        {alert.severity}
                      </span>
                      <span class="font-mono text-xs text-cyan-400 font-semibold">{alert.mitreId}</span>
                      <span class="text-xs text-slate-500">• {new Date(alert.timestamp).toLocaleTimeString()}</span>
                    </div>

                    <h4 class="text-sm font-bold text-slate-100">{alert.title}</h4>
                    <p class="text-xs text-slate-400">{alert.description}</p>

                    <div class="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-slate-400">
                      <span>Target: <strong class="text-slate-200">{alert.targetHost}</strong></span>
                      <span>Attacker IP: <strong class="text-red-400">{alert.attackerIp}</strong></span>
                      <span>Rule: <strong class="text-cyan-400">{alert.ruleId}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div class="flex items-center space-x-2 self-end md:self-center">
                    {isRemediated ? (
                      <span class="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded text-xs font-bold flex items-center space-x-1">
                        <CheckCircle2 class="w-3.5 h-3.5" />
                        <span>REMEDIATED</span>
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => onExecutePlaybook('ISOLATE_HOST', alert.targetHost, alert.id)}
                          class="px-3 py-1.5 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/40 rounded text-xs font-bold transition flex items-center space-x-1"
                        >
                          <Lock class="w-3.5 h-3.5" />
                          <span>Isolate Host</span>
                        </button>
                        <button
                          onClick={() => onExecutePlaybook('BLOCK_IP', alert.attackerIp, alert.id)}
                          class="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40 rounded text-xs font-bold transition flex items-center space-x-1"
                        >
                          <ShieldAlert class="w-3.5 h-3.5" />
                          <span>Block IP</span>
                        </button>
                        <button
                          onClick={() => onCreateCase(alert)}
                          class="px-3 py-1.5 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 rounded text-xs font-bold transition flex items-center space-x-1"
                        >
                          <FileSpreadsheet class="w-3.5 h-3.5" />
                          <span>Create Case</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
