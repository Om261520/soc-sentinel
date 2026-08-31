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
  Sliders
} from 'lucide-react';

export default function RulesStudio({ rules, onAddRule }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(rules[0] || null);

  // Form State
  const [name, setName] = useState('');
  const [severity, setSeverity] = useState('HIGH');
  const [mitreId, setMitreId] = useState('T1059');
  const [condition, setCondition] = useState('process.name == "cmd.exe" AND process.cmd CONTAINS "whoami"');
  const [description, setDescription] = useState('Detects execution of reconnaissance whoami command.');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddRule({
      name,
      severity,
      mitreId,
      condition,
      description,
      author: 'SOC Threat Hunter'
    });
    setShowAddModal(false);
    setName('');
  };

  return (
    <div class="space-y-6">
      {/* Header Banner */}
      <div class="cyber-card p-5 border-l-4 border-l-purple-500">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <FileCode class="w-5 h-5 text-purple-400" />
              <span>Sigma Detection Rules Studio & Rule Builder</span>
            </h2>
            <p class="text-xs text-slate-400 mt-1">
              Generic open-source detection rule format for SIEM, EDR, and log management platforms.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            class="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-glow-cyan transition flex items-center space-x-1.5 self-start md:self-auto"
          >
            <Plus class="w-4 h-4" />
            <span>Create New Sigma Rule</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Rules List & Rule Code Viewer */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules List */}
        <div class="cyber-card p-5 space-y-3">
          <h3 class="text-xs font-bold uppercase text-slate-400 font-mono tracking-wider">
            Active Rule Inventory ({rules.length})
          </h3>

          <div class="space-y-2.5">
            {rules.map((rule) => {
              const isSelected = selectedRule?.id === rule.id;
              return (
                <div
                  key={rule.id}
                  onClick={() => setSelectedRule(rule)}
                  class={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-950/30 border-purple-500/50 text-slate-100 shadow-lg'
                      : 'bg-cyber-bg/60 border-cyber-border hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-mono text-xs font-bold text-cyan-400">{rule.id}</span>
                    <span class={`cyber-badge ${
                      rule.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      rule.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {rule.severity}
                    </span>
                  </div>

                  <h4 class="text-xs font-bold text-slate-100 leading-tight">{rule.name}</h4>
                  <span class="text-[11px] font-mono text-slate-400 mt-1 block">MITRE: {rule.mitreId}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rule Editor / YAML Viewer */}
        {selectedRule && (
          <div class="lg:col-span-2 cyber-card p-5 flex flex-col justify-between space-y-4">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-cyber-border">
                <div class="flex items-center space-x-2">
                  <Code class="w-5 h-5 text-cyan-400" />
                  <h3 class="text-sm font-bold text-slate-100 font-mono">Sigma Rule Specifications (YAML)</h3>
                </div>

                <div class="flex items-center space-x-2">
                  <span class="cyber-badge bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    STATUS: ACTIVE
                  </span>
                </div>
              </div>

              {/* YAML Code Display */}
              <div class="mt-4">
                <pre class="rounded-lg bg-[#04070d] border border-cyber-border p-4 text-xs font-mono text-purple-300 leading-relaxed overflow-x-auto">
{`title: ${selectedRule.name}
id: ${selectedRule.id}
status: experimental
description: ${selectedRule.description}
author: ${selectedRule.author}
date: 2026/08/25
tags:
  - attack.${selectedRule.mitreId.toLowerCase()}
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    Condition: "${selectedRule.condition}"
  condition: selection
falsepositives:
  - Administrative maintenance script
level: ${selectedRule.severity.toLowerCase()}`}
                </pre>
              </div>

              <div class="mt-4 p-3 bg-cyber-bg rounded border border-cyber-border space-y-2 text-xs font-mono">
                <div class="text-slate-400">Rule Logic Evaluation:</div>
                <div class="text-cyan-300 font-bold bg-cyber-panel p-2 rounded border border-cyber-border/60">
                  {selectedRule.condition}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add New Rule Modal */}
      {showAddModal && (
        <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="cyber-card w-full max-w-lg p-6 space-y-4 relative">
            <h3 class="text-lg font-bold text-slate-100 font-mono flex items-center space-x-2">
              <Plus class="w-5 h-5 text-purple-400" />
              <span>Create New Sigma Rule</span>
            </h3>

            <form onSubmit={handleSubmit} class="space-y-4 text-xs">
              <div>
                <label class="block text-slate-400 font-mono mb-1">Rule Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PowerShell Encoded Command Execution"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  class="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-slate-400 font-mono mb-1">Severity Tier</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    class="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div>
                  <label class="block text-slate-400 font-mono mb-1">MITRE Technique ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. T1059.001"
                    value={mitreId}
                    onChange={(e) => setMitreId(e.target.value)}
                    class="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label class="block text-slate-400 font-mono mb-1">Rule Detection Logic Expression</label>
                <textarea
                  rows={3}
                  required
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  class="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-2 font-mono text-cyan-300 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label class="block text-slate-400 font-mono mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  class="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div class="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  class="px-4 py-2 bg-cyber-panel text-slate-400 hover:text-slate-200 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold shadow-glow-cyan"
                >
                  Save Sigma Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
