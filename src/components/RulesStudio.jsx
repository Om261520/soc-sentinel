import React, { useState } from 'react';
import { 
  FileCode, 
  Plus, 
  Play, 
  CheckCircle2, 
  ShieldAlert, 
  Code, 
  Edit3, 
  Trash2,
  Sliders,
  X,
  Copy,
  Check,
  CheckCheck
} from 'lucide-react';
import { playCyberClick } from '../utils/audio';

export default function RulesStudio({ rules, onAddRule }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(rules[0] || null);
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [severity, setSeverity] = useState('HIGH');
  const [mitreId, setMitreId] = useState('T1059.001');
  const [condition, setCondition] = useState('process.name == "powershell.exe" AND process.cmd CONTAINS "-enc"');
  const [description, setDescription] = useState('Detects execution of base64 encoded PowerShell commands.');

  const handleSubmit = (e) => {
    e.preventDefault();
    playCyberClick();
    onAddRule({
      name,
      severity,
      mitreId,
      condition,
      description,
      author: 'Lead SOC Threat Hunter'
    });
    setShowAddModal(false);
    setName('');
  };

  const handleTestRule = (rule) => {
    playCyberClick();
    setTestResult({
      status: 'MATCHED',
      matchedCount: Math.floor(2 + Math.random() * 6),
      sampleMatch: `[MATCH] Host: FIN-SERVER-02 | Sensor: Sysmon | Condition '${rule.condition}' matched event payload.`
    });
  };

  const generateSigmaYaml = (rule) => {
    if (!rule) return '';
    return `title: ${rule.name}
id: ${rule.id}
status: production
description: ${rule.description}
author: ${rule.author || 'SOC Sentinel'}
tags:
  - attack.${rule.mitreId ? rule.mitreId.toLowerCase().replace('.', '_') : 't1000'}
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    Condition: ${rule.condition}
  condition: selection
level: ${rule.severity ? rule.severity.toLowerCase() : 'high'}`;
  };

  const handleCopyYaml = (yaml) => {
    navigator.clipboard.writeText(yaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="cyber-card p-5 border-l-4 border-l-purple-500 shadow-glow-cyan/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2 font-mono">
              <FileCode className="w-5 h-5 text-purple-400" />
              <span>Sigma Detection Rules Studio & Rule Builder</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Generic open-source detection rule engine for SIEM, EDR, and Windows Event Log security telemetry.
            </p>
          </div>

          <button
            onClick={() => { playCyberClick(); setShowAddModal(true); }}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-glow-cyan transition flex items-center space-x-1.5 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Sigma Rule</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rules List */}
        <div className="lg:col-span-5 cyber-card p-4">
          <div className="flex items-center justify-between pb-3 border-b border-cyber-border text-xs font-mono">
            <span className="text-slate-400 font-bold">Active Rule Library ({rules.length})</span>
            <span className="text-emerald-400 font-semibold">● 100% INGESTION ACTIVE</span>
          </div>

          <div className="space-y-2 mt-3 max-h-[520px] overflow-y-auto pr-1">
            {rules.map((rule) => {
              const isSelected = selectedRule?.id === rule.id;
              const isCritical = rule.severity === 'CRITICAL';
              const isHigh = rule.severity === 'HIGH';

              return (
                <div
                  key={rule.id}
                  onClick={() => { playCyberClick(); setSelectedRule(rule); setTestResult(null); }}
                  className={`p-3 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-400 shadow-glow-cyan/20 ring-1 ring-purple-400'
                      : 'bg-cyber-bg/60 border-cyber-border hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-cyan-400 font-bold">{rule.id}</span>
                    <span className={`cyber-badge text-[10px] ${
                      isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/30' : (isHigh ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30')
                    }`}>
                      {rule.severity}
                    </span>
                  </div>

                  <h3 className="text-slate-100 font-sans font-semibold text-xs leading-snug line-clamp-1">{rule.name}</h3>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">{rule.mitreId}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Rule Inspector & YAML Preview */}
        <div className="lg:col-span-7 cyber-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-slate-100 font-mono">Sigma Rule Specification & YAML</h3>
              </div>

              {selectedRule && (
                <button
                  onClick={() => handleCopyYaml(generateSigmaYaml(selectedRule))}
                  className="px-2.5 py-1 rounded bg-cyber-bg hover:bg-cyber-hover border border-cyber-border text-xs font-mono text-cyan-400 flex items-center space-x-1 transition"
                >
                  {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied YAML' : 'Copy YAML'}</span>
                </button>
              )}
            </div>

            {selectedRule ? (
              <div className="mt-4 space-y-4 text-xs font-mono">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-bold">{selectedRule.id}</span>
                    <span className="text-slate-400">Author: {selectedRule.author || 'SOC Team'}</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-100 font-sans mt-0.5">{selectedRule.name}</h4>
                  <p className="text-slate-300 font-sans mt-1 leading-relaxed">{selectedRule.description}</p>
                </div>

                <div>
                  <span className="text-slate-500 uppercase text-[10px] block">Detection Logic Condition</span>
                  <div className="p-3 rounded-lg bg-[#05080f] border border-cyber-border text-emerald-400 font-mono text-xs mt-1">
                    {selectedRule.condition}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 uppercase text-[10px] block">Compiled Sigma YAML Manifest</span>
                  <pre className="p-3 bg-[#05080f] rounded-lg border border-cyber-border text-slate-300 font-mono text-[11px] overflow-x-auto max-h-48 mt-1 leading-relaxed">
                    {generateSigmaYaml(selectedRule)}
                  </pre>
                </div>

                {/* Test Result */}
                {testResult && (
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-xs font-mono text-emerald-300">
                    <strong className="block text-emerald-400">✓ Rule Simulation Successful ({testResult.matchedCount} events matched):</strong>
                    <span className="text-slate-300 text-[11px]">{testResult.sampleMatch}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-500 font-mono text-xs">
                Select a rule from the library to view details and compile YAML.
              </div>
            )}
          </div>

          {selectedRule && (
            <div className="pt-4 border-t border-cyber-border flex items-center justify-between mt-4">
              <span className="text-xs font-mono text-slate-500">Status: Enforced in Live Pipeline</span>
              <button
                onClick={() => handleTestRule(selectedRule)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold rounded-lg text-xs transition flex items-center space-x-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Test Rule Against Telemetry</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="cyber-card max-w-lg w-full bg-[#0a101d] border border-purple-500/50 p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
              <h3 className="text-base font-bold text-slate-100 font-mono flex items-center space-x-2">
                <FileCode className="w-5 h-5 text-purple-400" />
                <span>Create New Sigma Rule</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-400 uppercase text-[10px] mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Encoded PowerShell Payload Execution"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 uppercase text-[10px] mb-1">MITRE ATT&CK ID</label>
                  <input
                    type="text"
                    value={mitreId}
                    onChange={(e) => setMitreId(e.target.value)}
                    className="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase text-[10px] mb-1">Detection Logic Condition</label>
                <input
                  type="text"
                  required
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-2 text-emerald-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase text-[10px] mb-1">Rule Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              <div className="pt-3 border-t border-cyber-border flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded bg-cyber-bg border border-cyber-border text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded shadow-glow-cyan"
                >
                  Save & Enforce Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
