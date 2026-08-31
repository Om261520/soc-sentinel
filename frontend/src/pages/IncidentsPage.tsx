import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, PlusCircle, ExternalLink, Search, RefreshCw, X } from 'lucide-react';
import { api } from '../services/api';
import { Incident } from '../types';

export const IncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New incident state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSeverity, setNewSeverity] = useState('HIGH');
  const [newAssignee, setNewAssignee] = useState('analyst');

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const data = await api.getIncidents({
        status_filter: statusFilter === 'ALL' ? undefined : statusFilter,
        severity: severityFilter === 'ALL' ? undefined : severityFilter,
      });
      setIncidents(data);
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [statusFilter, severityFilter]);

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createIncident({
        title: newTitle,
        description: newDesc,
        severity: newSeverity,
        assigned_to: newAssignee,
      });
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      loadIncidents();
    } catch (err: any) {
      alert(err.message || 'Failed to create incident');
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'Open': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'Investigating': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'Contained': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Resolved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default: return 'bg-gray-700 text-gray-400 border-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-mono">SOC INCIDENT MANAGEMENT WORKSTATION</h1>
          <p className="text-xs text-gray-400 font-mono font-semibold">Track, investigate, contain, and remediate cybersecurity security incidents</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold rounded-lg transition-colors shadow-md shadow-blue-900/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>CREATE INCIDENT</span>
          </button>
          <button
            onClick={loadIncidents}
            className="p-1.5 bg-[#1F2937] hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">STATUS:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#1F2937] border border-gray-700 text-gray-200 rounded px-2.5 py-1 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Investigating">Investigating</option>
              <option value="Contained">Contained</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-400">SEVERITY:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[#1F2937] border border-gray-700 text-gray-200 rounded px-2.5 py-1 focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#1F2937] text-gray-400 uppercase">
              <tr>
                <th className="px-4 py-3">INCIDENT ID</th>
                <th className="px-4 py-3">SEVERITY</th>
                <th className="px-4 py-3">TITLE / SUMMARY</th>
                <th className="px-4 py-3">STATUS</th>
                <th className="px-4 py-3">ASSIGNED ANALYST</th>
                <th className="px-4 py-3">ATTACHED ALERTS</th>
                <th className="px-4 py-3">CREATED AT</th>
                <th className="px-4 py-3 text-right">MANAGE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    No matching incidents found.
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3.5 text-blue-400 font-bold">{inc.incident_id}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${
                        inc.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                        inc.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                      }`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 max-w-sm">
                      <div className="font-bold text-gray-100 truncate">{inc.title}</div>
                      <div className="text-[10px] text-gray-400 truncate">{inc.description}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] border font-bold ${getStatusBadge(inc.status)}`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-300 font-semibold">{inc.assigned_to || 'Unassigned'}</td>
                    <td className="px-4 py-3.5 text-gray-400">{inc.alerts ? inc.alerts.length : 0} alerts</td>
                    <td className="px-4 py-3.5 text-gray-400">{new Date(inc.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        to={`/incidents/${inc.incident_id}`}
                        className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-bold bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded"
                      >
                        <span>Open Case</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Incident Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h2 className="text-sm font-bold text-white font-mono uppercase flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span>CREATE NEW SECURITY INCIDENT CASE</span>
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-gray-400 mb-1">INCIDENT TITLE</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Unauthorized Lateral Movement via SSH"
                  className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">INCIDENT DESCRIPTION</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Summary of threat scope, affected assets, and initial indicators..."
                  rows={3}
                  className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">SEVERITY</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">ASSIGNED ANALYST</label>
                  <input
                    type="text"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-md shadow-blue-900/40"
                >
                  Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
