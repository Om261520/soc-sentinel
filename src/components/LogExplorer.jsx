import React, { useState } from 'react';
import { 
  Terminal, 
  Search, 
  Filter, 
  Eye, 
  Copy, 
  Check, 
  FileText, 
  AlertTriangle,
  Server,
  Layers,
  Download,
  ShieldAlert,
  Play,
  Pause
} from 'lucide-react';
import { playCyberClick } from '../utils/audio';

export default function LogExplorer({ logs }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isLiveStream, setIsLiveStream] = useState(true);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      !term ||
      log.summary.toLowerCase().includes(term) ||
      log.host.toLowerCase().includes(term) ||
      log.ip.toLowerCase().includes(term) ||
      log.service.toLowerCase().includes(term) ||
      String(log.eventCode).includes(term) ||
      (log.eventType && log.eventType.toLowerCase().includes(term));

    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  const handleCopyRaw = (payload) => {
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportLogs = () => {
    playCyberClick();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `soc_sentinel_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const quickFilterPresets = [
    { label: 'All Logs', query: '' },
    { label: 'Sysmon Process (ID 1)', query: 'PROCESS_CREATE' },
    { label: 'Auth Failures (4625)', query: 'AUTH_FAIL' },
    { label: 'Ransomware VSS', query: 'vssadmin' },
    { label: 'SQL Injection', query: 'WEB_EXPLOIT' },
    { label: 'Finance Server', query: 'FIN-SERVER-02' }
  ];

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="cyber-card p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2 font-mono">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <span>SIEM Telemetry Log Explorer & Query Engine</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect Windows Security Events (EventID 4624/4625), Sysmon Process Ingestion, EDR File Watcher, and Firewall Drop logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search IP, Host, EventID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-cyber-bg border border-cyber-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => { playCyberClick(); setSeverityFilter(e.target.value); }}
              className="bg-cyber-bg border border-cyber-border rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {/* Export JSON Button */}
            <button
              onClick={handleExportLogs}
              className="px-3 py-1.5 bg-cyber-bg hover:bg-cyber-hover border border-cyber-border rounded-lg text-xs font-mono text-cyan-400 flex items-center space-x-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Presets Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-cyber-border/40 text-xs font-mono">
          <span className="text-slate-500 text-[11px]">Quick Queries:</span>
          {quickFilterPresets.map((preset, i) => (
            <button
              key={i}
              onClick={() => { playCyberClick(); setSearchTerm(preset.query); }}
              className={`px-2.5 py-1 rounded-md text-[11px] transition ${
                searchTerm === preset.query 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-glow-cyan' 
                  : 'bg-cyber-bg text-slate-400 border border-cyber-border hover:text-slate-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Logs Table & Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Logs Table */}
        <div className="lg:col-span-8 cyber-card p-4 overflow-x-auto">
          <div className="flex items-center justify-between pb-3 border-b border-cyber-border text-xs font-mono">
            <span className="text-slate-400">
              Showing <strong className="text-cyan-400">{filteredLogs.length}</strong> matching log events
            </span>
            <span className="text-slate-500">Live Buffer: Last 100 Logs</span>
          </div>

          <div className="mt-3 space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-16 text-slate-500 font-mono text-xs">
                No telemetry logs matching the search criteria.
              </div>
            ) : (
              filteredLogs.slice().reverse().map((log) => {
                const isSelected = selectedLog?.id === log.id;
                const isCritical = log.severity === 'CRITICAL';
                const isHigh = log.severity === 'HIGH';

                return (
                  <div
                    key={log.id}
                    onClick={() => { playCyberClick(); setSelectedLog(log); }}
                    className={`p-3 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 shadow-glow-cyan/20 ring-1 ring-cyan-500'
                        : (isCritical
                          ? 'bg-red-950/20 border-red-500/40 hover:bg-red-950/40'
                          : (isHigh ? 'bg-amber-950/20 border-amber-500/40 hover:bg-amber-950/40' : 'bg-cyber-bg/70 border-cyber-border hover:border-slate-600'))
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-cyan-400 font-bold">{log.id}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-300 font-semibold">{log.host}</span>
                      </div>
                      <span className={`cyber-badge text-[10px] ${
                        isCritical 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                          : (isHigh ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-slate-400 border border-slate-700')
                      }`}>
                        {log.severity || 'LOW'}
                      </span>
                    </div>

                    <p className="text-slate-200 font-sans text-xs line-clamp-1">{log.summary}</p>

                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-1.5">
                      <span>Service: <strong className="text-slate-400">{log.service}</strong></span>
                      <span>•</span>
                      <span>IP: <strong className="text-cyan-400">{log.ip}</strong></span>
                      <span>•</span>
                      <span>EventID: <strong className="text-purple-400">{log.eventCode}</strong></span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Log Inspector */}
        <div className="lg:col-span-4 cyber-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100 font-mono">Raw Telemetry Inspector</h3>
              </div>
            </div>

            {selectedLog ? (
              <div className="mt-4 space-y-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Log ID & Timestamp</span>
                  <span className="text-cyan-400 font-bold">{selectedLog.id}</span> — <span className="text-slate-300">{selectedLog.timestamp}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-cyber-bg p-2 rounded border border-cyber-border">
                    <span className="text-slate-500 text-[10px] block">SOURCE HOST</span>
                    <strong className="text-slate-200">{selectedLog.host}</strong>
                  </div>
                  <div className="bg-cyber-bg p-2 rounded border border-cyber-border">
                    <span className="text-slate-500 text-[10px] block">SOURCE IP</span>
                    <strong className="text-cyan-400">{selectedLog.ip}</strong>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Service / Sensor</span>
                  <p className="text-slate-200 font-semibold mt-0.5">{selectedLog.service}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-500 text-[10px] uppercase block">Raw JSON Payload</span>
                    <button
                      onClick={() => handleCopyRaw(selectedLog.rawPayload || '{}')}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 text-[11px]"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-[#05080f] rounded-lg border border-cyber-border text-emerald-400 overflow-x-auto text-[11px] max-h-52">
                    {selectedLog.rawPayload ? (
                      (() => {
                        try {
                          return JSON.stringify(JSON.parse(selectedLog.rawPayload), null, 2);
                        } catch (e) {
                          return selectedLog.rawPayload;
                        }
                      })()
                    ) : 'No raw payload'}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-500 font-mono text-xs">
                Select any log from the table to inspect full metadata and raw JSON telemetry payload.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
