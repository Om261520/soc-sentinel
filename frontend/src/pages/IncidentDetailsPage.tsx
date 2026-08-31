import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, User, Clock, CheckCircle2, MessageSquare, Plus, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { Incident } from '../types';

export const IncidentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  const loadIncident = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await api.getIncidentById(id);
      setIncident(data);
    } catch (err) {
      console.error('Failed to load incident:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncident();
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!id || !incident) return;
    try {
      const updated = await api.updateIncident(incident.incident_id, { status: newStatus });
      setIncident(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to update incident status');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newNote.trim()) return;
    try {
      setSubmittingNote(true);
      await api.addIncidentNote(incident!.incident_id, newNote);
      setNewNote('');
      loadIncident();
    } catch (err: any) {
      alert(err.message || 'Failed to add note');
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-400 font-mono">Loading Incident Case File...</div>;
  }

  if (!incident) {
    return (
      <div className="p-12 text-center text-red-400 font-mono space-y-4">
        <p>Incident {id} not found.</p>
        <Link to="/incidents" className="text-blue-400 hover:underline">Back to Incident Manager</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link to="/incidents" className="inline-flex items-center space-x-2 text-xs font-mono text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO INCIDENTS WORKSTATION</span>
        </Link>

        {/* Status Workflow Selector */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="text-gray-400">STATUS WORKFLOW:</span>
          {['Open', 'Investigating', 'Contained', 'Resolved', 'Closed'].map((st) => (
            <button
              key={st}
              onClick={() => handleUpdateStatus(st)}
              className={`px-3 py-1 rounded border transition-colors ${
                incident.status === st
                  ? 'bg-blue-600 border-blue-500 text-white font-bold'
                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
        {/* Left 2 Columns: Summary, Attached Alerts & Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 text-xs text-blue-400 font-bold mb-1">
                  <span>{incident.incident_id}</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-400">{new Date(incident.created_at).toLocaleString()}</span>
                </div>
                <h1 className="text-xl font-bold text-white">{incident.title}</h1>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">{incident.description}</p>
              </div>

              <span className={`px-3 py-1 rounded text-xs border font-bold ${
                incident.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                incident.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
              }`}>
                {incident.severity}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800 text-xs">
              <div>
                <span className="text-gray-500 block text-[10px]">CASE ASSIGNEE</span>
                <span className="text-gray-200 font-bold">{incident.assigned_to || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">CURRENT STATUS</span>
                <span className="text-emerald-400 font-bold">{incident.status}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">RESOLVED AT</span>
                <span className="text-gray-400">{incident.resolved_at ? new Date(incident.resolved_at).toLocaleString() : 'Active Investigation'}</span>
              </div>
            </div>
          </div>

          {/* Associated Threat Alerts */}
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-gray-200 uppercase flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-orange-400" />
              <span>LINKED THREAT ALERTS ({incident.alerts ? incident.alerts.length : 0})</span>
            </h2>

            <div className="space-y-2 text-xs">
              {incident.alerts && incident.alerts.length > 0 ? (
                incident.alerts.map((alt) => (
                  <div key={alt.id} className="bg-[#1F2937] p-3 rounded-lg border border-gray-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gray-200">{alt.title}</div>
                      <div className="text-[10px] text-gray-400">Rule: {alt.rule_name} | IP: {alt.source_ip || 'N/A'}</div>
                    </div>
                    <Link
                      to={`/alerts/${alt.alert_id}`}
                      className="text-blue-400 hover:underline font-bold text-[11px]"
                    >
                      View Alert
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-xs py-4 text-center">No alerts attached to this incident case file yet.</div>
              )}
            </div>
          </div>

          {/* Investigation Notes & Timeline */}
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-gray-200 uppercase flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>ANALYST INVESTIGATION LOG & NOTES</span>
            </h2>

            {/* Note Editor */}
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add investigation findings, containment steps, or forensic evidence summary..."
                rows={3}
                className="w-full bg-[#1F2937] border border-gray-700 rounded-lg p-3 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingNote}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{submittingNote ? 'Adding...' : 'Add Case Note'}</span>
                </button>
              </div>
            </form>

            {/* Historical Notes */}
            <div className="space-y-3 pt-3 border-t border-gray-800">
              {incident.notes && incident.notes.length > 0 ? (
                incident.notes.map((note) => (
                  <div key={note.id} className="bg-[#1F2937]/70 p-3.5 rounded-lg border border-gray-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-gray-400 text-[10px]">
                      <span className="font-bold text-blue-400">{note.author}</span>
                      <span>{new Date(note.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-200 leading-relaxed font-sans">{note.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-xs py-4 text-center">No notes added to this incident case yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: MITRE Mapping & Remediation Guide */}
        <div className="space-y-6">
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-3 text-xs">
            <h2 className="font-bold text-gray-200 uppercase border-b border-gray-800 pb-2">RECOMMENDED CONTAINMENT STEPS</h2>
            <ul className="space-y-2 text-gray-300 list-disc list-inside">
              <li>1. Isolate compromised workstation host from local subnet.</li>
              <li>2. Revoke active OAuth & JWT tokens for affected user account.</li>
              <li>3. Block malicious external IP addresses on edge firewalls.</li>
              <li>4. Collect memory dumps & EDR logs for forensic analysis.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
