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
  Layers
} from 'lucide-react';

export default function LogExplorer({ logs }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);
  const [copied, setCopied] = useState(false);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.eventCode.toString().includes(searchTerm);

    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  const handleCopyRaw = (payload) => {
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div class="space-y-6">
      {/* Header & Filter Controls */}
      <div class="cyber-card p-5">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <Terminal class="w-5 h-5 text-cyan-400" />
              <span>SIEM Telemetry Log Explorer & Query Engine</span>
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">
              Inspect Windows Event Logs, Sysmon, EDR Telemetry, Firewall dropped connections, and Web WAF logs.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div class="relative min-w-[240px]">
              <Search class="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search host, IP, event ID, payload..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                class="w-full bg-cyber-bg text-xs text-slate-200 border border-cyber-border rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Severity Filter */}
            <div class="flex items-center space-x-1.5 bg-cyber-bg p-1 rounded-lg border border-cyber-border text-xs">
              <Filter class="w-3.5 h-3.5 text-slate-400 ml-1" />
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  class={`px-2.5 py-1 rounded text-[11px] font-bold ${
                    severityFilter === sev
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Log Table & Inspector Panel */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Log Table */}
        <div class={`${selectedLog ? 'lg:col-span-2' : 'lg:col-span-3'} cyber-card p-5 overflow-hidden`}>
          <div class="flex items-center justify-between mb-3 text-xs text-slate-400 font-mono">
            <span>Showing <strong class="text-cyan-400">{filteredLogs.length}</strong> Telemetry Events</span>
            <span>Sort: Timestamp (Desc)</span>
          </div>

          <div class="overflow-x-auto rounded-lg border border-cyber-border bg-[#060a12]">
            <table class="w-full text-left text-xs font-mono">
              <thead class="bg-cyber-panel text-slate-400 uppercase text-[10px] border-b border-cyber-border">
                <tr>
                  <th class="p-3">Timestamp</th>
                  <th class="p-3">Host / IP</th>
                  <th class="p-3">Service / Audit</th>
                  <th class="p-3">Event Code</th>
                  <th class="p-3">Severity</th>
                  <th class="p-3">Summary</th>
                  <th class="p-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-cyber-border/40 text-slate-300">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} class="p-6 text-center text-slate-500">
                      No telemetry events matching query filter.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const isSelected = selectedLog?.id === log.id;
                    return (
                      <tr 
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        class={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-cyan-500/10 border-l-2 border-l-cyan-400' : 'hover:bg-cyber-hover/60'
                        }`}
                      >
                        <td class="p-3 text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td class="p-3 font-semibold text-slate-200 whitespace-nowrap">
                          <div>{log.host}</div>
                          <div class="text-[10px] text-slate-500">{log.ip}</div>
                        </td>
                        <td class="p-3 text-slate-400 whitespace-nowrap">{log.service}</td>
                        <td class="p-3 text-cyan-400 font-bold whitespace-nowrap">{log.eventCode}</td>
                        <td class="p-3 whitespace-nowrap">
                          <span class={`cyber-badge ${
                            log.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            log.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            log.severity === 'MEDIUM' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {log.severity}
                          </span>
                        </td>
                        <td class="p-3 text-slate-300 max-w-xs truncate">{log.summary}</td>
                        <td class="p-3 text-right">
                          <button class="p-1 rounded bg-cyber-panel text-slate-400 hover:text-cyan-300 hover:bg-cyber-hover">
                            <Eye class="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Log JSON Payload Deep Inspector Drawer */}
        {selectedLog && (
          <div class="cyber-card p-5 flex flex-col justify-between space-y-4">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-cyber-border">
                <div class="flex items-center space-x-2">
                  <FileText class="w-5 h-5 text-cyan-400" />
                  <h3 class="text-sm font-bold text-slate-100 font-mono">Raw Log Inspector</h3>
                </div>
                <button 
                  onClick={() => setSelectedLog(null)}
                  class="text-xs text-slate-500 hover:text-slate-300"
                >
                  ✕ Close
                </button>
              </div>

              <div class="space-y-3 mt-4 text-xs font-mono">
                <div>
                  <span class="text-slate-500 block uppercase text-[10px]">Log Event ID</span>
                  <span class="text-slate-100 font-bold">{selectedLog.id}</span>
                </div>
                <div>
                  <span class="text-slate-500 block uppercase text-[10px]">Source Machine</span>
                  <span class="text-cyan-300">{selectedLog.host} ({selectedLog.ip})</span>
                </div>
                <div>
                  <span class="text-slate-500 block uppercase text-[10px]">Audit Subsystem</span>
                  <span class="text-slate-300">{selectedLog.service}</span>
                </div>
                <div>
                  <span class="text-slate-500 block uppercase text-[10px]">Summary Message</span>
                  <p class="text-slate-300 bg-cyber-bg p-2 rounded border border-cyber-border mt-1">
                    {selectedLog.summary}
                  </p>
                </div>
              </div>

              {/* Formatted JSON Payload */}
              <div class="mt-4">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-[10px] uppercase font-mono text-slate-400">Structured Payload (JSON)</span>
                  <button 
                    onClick={() => handleCopyRaw(selectedLog.rawPayload)}
                    class="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                  >
                    {copied ? <Check class="w-3 h-3 text-emerald-400" /> : <Copy class="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre class="h-48 rounded bg-[#04070d] border border-cyber-border p-3 text-[11px] text-cyan-300 font-mono overflow-auto leading-relaxed">
                  {JSON.stringify(JSON.parse(selectedLog.rawPayload || '{}'), null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
