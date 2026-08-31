import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, Search, Filter, Eye, X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { SecurityLog } from '../types';

export const LogsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSourceIp = searchParams.get('source_ip') || '';

  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eventType, setEventType] = useState('ALL');
  const [severity, setSeverity] = useState('ALL');
  const [sourceIp, setSourceIp] = useState(initialSourceIp);
  const [selectedLog, setSelectedLog] = useState<SecurityLog | null>(null);
  const [page, setPage] = useState(0);
  const limit = 50;

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getLogs({
        skip: page * limit,
        limit,
        search: search || undefined,
        event_type: eventType === 'ALL' ? undefined : eventType,
        severity: severity === 'ALL' ? undefined : severity,
        source_ip: sourceIp || undefined
      });
      setLogs(data);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, eventType, severity, sourceIp, search]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-mono">SECURITY LOG EXPLORER</h1>
          <p className="text-xs text-gray-400 font-mono">Search, filter, and inspect normalized security log events</p>
        </div>
        <button
          onClick={loadLogs}
          className="flex items-center space-x-2 px-3 py-1.5 bg-[#1F2937] hover:bg-gray-700 text-gray-300 text-xs font-mono rounded-lg border border-gray-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>REFRESH LOGS</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Free Text Search */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search message, raw log, action..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1F2937] border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* Source IP Filter */}
          <div>
            <input
              type="text"
              placeholder="Filter Source IP..."
              value={sourceIp}
              onChange={(e) => setSourceIp(e.target.value)}
              className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* Event Type Dropdown */}
          <div>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full bg-[#1F2937] border border-gray-700 text-xs text-gray-200 rounded-lg px-3 py-2 font-mono focus:outline-none"
            >
              <option value="ALL">All Event Types</option>
              <option value="authentication">Authentication</option>
              <option value="firewall">Firewall</option>
              <option value="web">Web Application</option>
              <option value="endpoint">Endpoint EDR</option>
              <option value="network">Network Traffic</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#1F2937] text-gray-400 uppercase">
              <tr>
                <th className="px-4 py-3">TIMESTAMP</th>
                <th className="px-4 py-3">EVENT TYPE</th>
                <th className="px-4 py-3">SOURCE IP</th>
                <th className="px-4 py-3">DEST PORT</th>
                <th className="px-4 py-3">USER / HOST</th>
                <th className="px-4 py-3">ACTION</th>
                <th className="px-4 py-3">STATUS</th>
                <th className="px-4 py-3 text-right">INSPECT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    No matching security logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-bold">
                        {log.event_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-200 font-bold">{log.source_ip || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-400">{log.destination_port || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-300">{log.username || log.hostname || 'System'}</td>
                    <td className="px-4 py-3 text-gray-300">{log.action}</td>
                    <td className="px-4 py-3 font-bold">
                      <span className={log.status === 'failed' || log.status === 'suspicious' || log.status === 'blocked' ? 'text-red-400' : 'text-emerald-400'}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-blue-400 hover:text-blue-300 font-bold bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20"
                      >
                        Inspect Raw
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-gray-800 flex items-center justify-between font-mono text-xs text-gray-400">
          <div>Showing Page {page + 1} ({logs.length} logs on page)</div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded disabled:opacity-50 flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={logs.length < limit}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded disabled:opacity-50 flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Raw JSON Log Modal Viewer */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-4">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 font-mono text-xs">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-white">NORMALIZED & RAW SECURITY LOG ENTRY #{selectedLog.id}</span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 font-mono text-xs overflow-y-auto max-h-[70vh]">
              {/* Normalized Fields Grid */}
              <div className="grid grid-cols-2 gap-3 bg-[#1F2937] p-3.5 rounded-lg border border-gray-800">
                <div><span className="text-gray-500">Timestamp:</span> <span className="text-gray-200">{selectedLog.timestamp}</span></div>
                <div><span className="text-gray-500">Event Type:</span> <span className="text-blue-400 font-bold">{selectedLog.event_type}</span></div>
                <div><span className="text-gray-500">Source IP:</span> <span className="text-gray-200">{selectedLog.source_ip || 'N/A'}</span></div>
                <div><span className="text-gray-500">Destination IP:</span> <span className="text-gray-200">{selectedLog.destination_ip || 'N/A'}</span></div>
                <div><span className="text-gray-500">User:</span> <span className="text-gray-200">{selectedLog.username || 'N/A'}</span></div>
                <div><span className="text-gray-500">Host:</span> <span className="text-gray-200">{selectedLog.hostname || 'N/A'}</span></div>
                <div><span className="text-gray-500">Action:</span> <span className="text-gray-200">{selectedLog.action}</span></div>
                <div><span className="text-gray-500">Status:</span> <span className="text-emerald-400 font-bold">{selectedLog.status}</span></div>
              </div>

              {/* Raw JSON */}
              <div className="space-y-1">
                <span className="text-gray-400 font-bold uppercase text-[11px]">Raw Syslog Payload:</span>
                <pre className="bg-[#0B0F17] p-3.5 rounded-lg border border-gray-800 text-gray-300 text-[11px] overflow-x-auto">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-gray-800 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded text-xs font-mono"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
