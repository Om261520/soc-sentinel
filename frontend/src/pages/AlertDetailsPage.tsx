import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldAlert, ArrowLeft, Clock, User, Globe, AlertTriangle, 
  CheckCircle2, XCircle, FileText, Sparkles, PlusCircle, HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { Alert, SecurityLog, AIAnalysis } from '../types';

export const AlertDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [alert, setAlert] = useState<Alert | null>(null);
  const [relatedLogs, setRelatedLogs] = useState<SecurityLog[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const loadAlertDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await api.getAlertById(id);
      setAlert(data);

      // Fetch related security logs for this source IP or username
      if (data.source_ip || data.username) {
        const logsData = await api.getLogs({
          source_ip: data.source_ip || undefined,
          limit: 20
        });
        setRelatedLogs(logsData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load alert details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlertDetails();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !alert) return;
    try {
      const updated = await api.updateAlertStatus(alert.alert_id, newStatus);
      setAlert(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to update alert status');
    }
  };

  const handleGenerateAIAnalysis = async () => {
    if (!id || !alert) return;
    try {
      setAnalyzing(true);
      const analysis = await api.analyzeAlert(alert.alert_id);
      setAiAnalysis(analysis);
    } catch (err: any) {
      setError(err.message || 'Failed to run AI triage');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCreateIncident = async () => {
    if (!alert) return;
    try {
      const newInc = await api.createIncident({
        title: `Incident: ${alert.title}`,
        description: alert.description,
        severity: alert.severity,
        assigned_to: 'analyst',
        alert_ids: [alert.id]
      });
      navigate(`/incidents/${newInc.incident_id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create incident');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-400 font-mono">
        Loading alert triage workstation...
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="p-12 text-center text-red-400 font-mono space-y-4">
        <p>Alert {id} not found.</p>
        <Link to="/alerts" className="text-blue-400 hover:underline">Back to Alert Feed</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link to="/alerts" className="inline-flex items-center space-x-2 text-xs font-mono text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO ALERTS FEED</span>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={() => handleStatusChange('Investigating')}
            className={`px-3 py-1.5 rounded border transition-colors ${
              alert.status === 'Investigating' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40 font-bold' : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
            }`}
          >
            Mark Investigating
          </button>
          <button
            onClick={() => handleStatusChange('Resolved')}
            className={`px-3 py-1.5 rounded border transition-colors ${
              alert.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold' : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
            }`}
          >
            Mark Resolved
          </button>
          <button
            onClick={() => handleStatusChange('False Positive')}
            className={`px-3 py-1.5 rounded border transition-colors ${
              alert.status === 'False Positive' ? 'bg-gray-700 text-gray-400 border-gray-600' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
            }`}
          >
            False Positive
          </button>
          <button
            onClick={handleCreateIncident}
            className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center space-x-1.5 shadow-md shadow-blue-900/30"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Promote to Incident</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Alert Summary & Technical Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Summary & Risk Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 font-mono text-xs">
                  <span className="text-blue-400 font-bold">{alert.alert_id}</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-400">{new Date(alert.timestamp).toLocaleString()}</span>
                </div>
                <h1 className="text-lg font-bold text-white">{alert.title}</h1>
                <p className="text-xs text-gray-400">{alert.description}</p>
              </div>

              <span className={`px-3 py-1 rounded text-xs border font-bold font-mono ${
                alert.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                alert.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
                'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
              }`}>
                {alert.severity} SEVERITY
              </span>
            </div>

            {/* MITRE ATT&CK & Detection Rule Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-800 text-xs font-mono">
              <div>
                <span className="text-gray-500 block text-[10px]">DETECTION RULE</span>
                <span className="text-gray-200 font-semibold">{alert.rule_name}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">ATTACK CATEGORY</span>
                <span className="text-gray-200 font-semibold">{alert.category}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">MITRE TECHNIQUE</span>
                <span className="text-blue-400 font-semibold">{alert.mitre_technique || 'T1110'} - {alert.mitre_name || 'Brute Force'}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">ALERT STATUS</span>
                <span className="text-emerald-400 font-semibold">{alert.status}</span>
              </div>
            </div>
          </div>

          {/* Educational SOC Explanation Panel */}
          <div className="bg-[#111827] border border-blue-500/30 rounded-xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-blue-400 font-mono text-sm font-bold">
              <HelpCircle className="w-4 h-4" />
              <span>EDUCATIONAL SOC ANALYSIS — WHY WAS THIS DETECTED?</span>
            </div>
            <div className="text-xs text-gray-300 leading-relaxed font-sans bg-[#1F2937]/60 p-3.5 rounded-lg border border-gray-800">
              <p className="mb-2">
                The SOC Sentinel Detection Engine evaluated incoming security log telemetry against rule configuration <strong>'{alert.rule_name}'</strong>.
              </p>
              <p>
                Behavioral signatures confirmed matching thresholds (e.g. repeated authentication failures or malicious command strings). MITRE ATT&CK technique <strong>{alert.mitre_technique}</strong> indicates threat tactics attempting entry or execution within the environment.
              </p>
            </div>
          </div>

          {/* Risk Score Calculation Meter & Factor Breakdown */}
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-200 font-mono uppercase">DYNAMIC RISK SCORE CALCULATION</h2>
              <span className="text-lg font-bold font-mono text-red-400">{alert.risk_score} / 100</span>
            </div>

            {/* Risk Score Progress Bar */}
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${alert.risk_score >= 80 ? 'bg-red-500' : alert.risk_score >= 60 ? 'bg-orange-500' : 'bg-yellow-500'}`}
                style={{ width: `${alert.risk_score}%` }}
              ></div>
            </div>

            {/* Itemized Factors List */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono text-gray-400 uppercase">Itemized Risk Rationale Factors:</span>
              <div className="space-y-1.5 font-mono text-xs">
                {alert.risk_factors && alert.risk_factors.length > 0 ? (
                  alert.risk_factors.map((factor, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-[#1F2937] px-3 py-2 rounded border border-gray-800">
                      <span className="text-gray-300">{factor.factor}</span>
                      <span className="text-red-400 font-bold">+{factor.points} pts</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-xs italic">Base severity weight applied.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Source Info & AI Analyst Module */}
        <div className="space-y-6">
          {/* Source Target Info Card */}
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-3">
            <h2 className="text-xs font-bold text-gray-400 font-mono uppercase border-b border-gray-800 pb-2">TELEMETRY ATTRIBUTES</h2>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">SOURCE IP:</span>
                <span className="text-blue-400 font-bold">{alert.source_ip || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">DESTINATION IP:</span>
                <span className="text-gray-200">{alert.destination_ip || '10.0.0.10'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">TARGET ACCOUNT:</span>
                <span className="text-gray-200 font-bold">{alert.username || 'System'}</span>
              </div>
            </div>
          </div>

          {/* AI / Automated SOC Analyst Triage */}
          <div className="bg-[#111827] border border-cyan-500/30 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold">
                <Sparkles className="w-4 h-4" />
                <span>AI / AUTOMATED TRIAGE ANALYST</span>
              </div>
              <button
                onClick={handleGenerateAIAnalysis}
                disabled={analyzing}
                className="px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono rounded transition-colors"
              >
                {analyzing ? 'Analyzing...' : 'Run Triage'}
              </button>
            </div>

            {aiAnalysis ? (
              <div className="space-y-3 font-mono text-xs bg-[#1F2937]/80 p-3.5 rounded-lg border border-cyan-500/20">
                <div>
                  <span className="text-cyan-400 font-bold block mb-1">THREAT HYPOTHESIS:</span>
                  <p className="text-gray-300">{aiAnalysis.threat_summary}</p>
                </div>
                <div>
                  <span className="text-cyan-400 font-bold block mb-1">RECOMMENDED INVESTIGATION:</span>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    {aiAnalysis.recommended_steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2 border-t border-gray-700/50">
                  <span className="text-red-400 font-bold block mb-1">CONTAINMENT PLAN:</span>
                  <p className="text-gray-300">{aiAnalysis.containment_recommendation}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 font-mono">
                Click "Run Triage" to generate automated SOC recommendations, containment guidance, and investigative hypotheses.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Raw Security Log Timeline */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-gray-200 font-mono uppercase">CHRONOLOGICAL EVENT LOG TIMELINE</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#1F2937] text-gray-400 uppercase">
              <tr>
                <th className="px-3 py-2">TIMESTAMP</th>
                <th className="px-3 py-2">EVENT TYPE</th>
                <th className="px-3 py-2">SOURCE IP</th>
                <th className="px-3 py-2">ACTION</th>
                <th className="px-3 py-2">STATUS</th>
                <th className="px-3 py-2">MESSAGE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {relatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500">
                    No related telemetry logs ingested for this IP.
                  </td>
                </tr>
              ) : (
                relatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-800/40">
                    <td className="px-3 py-2.5 text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="px-3 py-2.5 text-blue-400 font-bold">{log.event_type}</td>
                    <td className="px-3 py-2.5 text-gray-200">{log.source_ip || 'N/A'}</td>
                    <td className="px-3 py-2.5 text-gray-300">{log.action}</td>
                    <td className="px-3 py-2.5 font-bold">
                      <span className={log.status === 'failed' || log.status === 'suspicious' ? 'text-red-400' : 'text-emerald-400'}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-400 truncate max-w-md">{log.message}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
