import React, { useState, useEffect } from 'react';
import { Sliders, CheckCircle, XCircle, Shield, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { DetectionRule } from '../types';

export const RulesPage: React.FC = () => {
  const [rules, setRules] = useState<DetectionRule[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRules = async () => {
    try {
      setLoading(true);
      const data = await api.getRules();
      setRules(data);
    } catch (err) {
      console.error('Failed to load detection rules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleToggleRule = async (rule: DetectionRule) => {
    try {
      const updated = await api.updateRule(rule.rule_id, { enabled: !rule.enabled });
      setRules(rules.map((r) => (r.id === updated.id ? updated : r)));
    } catch (err: any) {
      alert(err.message || 'Failed to update rule');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white font-mono">DETECTION ENGINE RULE MANAGER</h1>
          <p className="text-xs text-gray-400 font-mono">Configure, enable/disable, and tune SOC detection rules</p>
        </div>
        <button
          onClick={loadRules}
          className="flex items-center space-x-2 px-3 py-1.5 bg-[#1F2937] hover:bg-gray-700 text-gray-300 text-xs font-mono rounded-lg border border-gray-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>REFRESH RULES</span>
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`bg-[#111827] border rounded-xl p-5 space-y-4 transition-all ${
              rule.enabled ? 'border-gray-800' : 'border-gray-800/50 opacity-65'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-blue-400 font-bold">{rule.rule_id}</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-400">{rule.category}</span>
                </div>
                <h2 className="text-sm font-bold text-white">{rule.name}</h2>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => handleToggleRule(rule)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                  rule.enabled
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-gray-800 text-gray-500 border-gray-700'
                }`}
              >
                <span>{rule.enabled ? 'ENABLED' : 'DISABLED'}</span>
              </button>
            </div>

            <p className="text-xs text-gray-400 font-sans leading-relaxed">{rule.description}</p>

            {/* Rule Parameters Grid */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-800 text-xs">
              <div className="bg-[#1F2937] p-2 rounded text-center">
                <span className="text-gray-500 block text-[10px]">SEVERITY</span>
                <span className={`font-bold ${
                  rule.severity === 'CRITICAL' ? 'text-red-400' : rule.severity === 'HIGH' ? 'text-orange-400' : 'text-yellow-400'
                }`}>{rule.severity}</span>
              </div>

              <div className="bg-[#1F2937] p-2 rounded text-center">
                <span className="text-gray-500 block text-[10px]">THRESHOLD</span>
                <span className="text-gray-200 font-bold">{rule.threshold} events</span>
              </div>

              <div className="bg-[#1F2937] p-2 rounded text-center">
                <span className="text-gray-500 block text-[10px]">TIME WINDOW</span>
                <span className="text-gray-200 font-bold">{rule.time_window}s</span>
              </div>
            </div>

            {/* MITRE ATT&CK Mapping */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-gray-500 text-[10px]">MITRE ATT&CK MAPPING:</span>
              <span className="bg-gray-800 text-blue-400 px-2 py-0.5 rounded text-[11px] font-bold border border-gray-700">
                {rule.mitre_technique || 'T1110'} - {rule.mitre_name || 'Brute Force'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
