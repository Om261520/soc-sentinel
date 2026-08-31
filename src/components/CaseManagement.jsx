import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  FileText, 
  Printer, 
  CheckCircle2, 
  ShieldAlert, 
  User, 
  Clock,
  Layers
} from 'lucide-react';

export default function CaseManagement({ cases, onCreateCase }) {
  const [selectedCase, setSelectedCase] = useState(cases[0] || null);
  const [showPrintReport, setShowPrintReport] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div class="space-y-6">
      {/* Header Banner */}
      <div class="cyber-card p-5 border-l-4 border-l-cyan-500">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <Briefcase class="w-5 h-5 text-cyan-400" />
              <span>SOC Incident Case Management & Executive Report Exporter</span>
            </h2>
            <p class="text-xs text-slate-400 mt-1">
              Track active investigations, document analyst root-cause notes, and generate formal Incident Response Reports.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case List */}
        <div class="cyber-card p-5 space-y-3">
          <h3 class="text-xs font-bold uppercase text-slate-400 font-mono tracking-wider">
            Active Incident Cases ({cases.length})
          </h3>

          <div class="space-y-2.5">
            {cases.map((c) => {
              const isSelected = selectedCase?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  class={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-950/30 border-cyan-500/50 text-slate-100 shadow-lg'
                      : 'bg-cyber-bg/60 border-cyber-border hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-mono text-xs font-bold text-cyan-400">{c.id}</span>
                    <span class={`cyber-badge ${
                      c.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {c.severity}
                    </span>
                  </div>

                  <h4 class="text-xs font-bold text-slate-100 leading-tight">{c.title}</h4>
                  <div class="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2 pt-2 border-t border-cyber-border/40">
                    <span>Host: {c.host}</span>
                    <span class="text-cyan-300">{c.assignedTo}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Case Detail & Incident Report Preview */}
        {selectedCase && (
          <div class="lg:col-span-2 cyber-card p-6 flex flex-col justify-between space-y-6">
            <div>
              <div class="flex items-center justify-between pb-4 border-b border-cyber-border">
                <div>
                  <span class="font-mono text-xs text-cyan-400 font-bold">{selectedCase.id}</span>
                  <h3 class="text-lg font-bold text-slate-100">{selectedCase.title}</h3>
                </div>

                <button
                  onClick={handlePrint}
                  class="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-lg text-xs font-bold shadow-glow-cyan transition flex items-center space-x-1.5"
                >
                  <Printer class="w-4 h-4" />
                  <span>Export Incident PDF Report</span>
                </button>
              </div>

              {/* Case Attributes */}
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 p-3 bg-cyber-bg rounded-lg border border-cyber-border text-xs font-mono">
                <div>
                  <span class="text-slate-500 block uppercase text-[10px]">Severity</span>
                  <span class="text-red-400 font-bold">{selectedCase.severity}</span>
                </div>
                <div>
                  <span class="text-slate-500 block uppercase text-[10px]">Assigned Analyst</span>
                  <span class="text-slate-200">{selectedCase.assignedTo}</span>
                </div>
                <div>
                  <span class="text-slate-500 block uppercase text-[10px]">Target Asset</span>
                  <span class="text-cyan-300">{selectedCase.host}</span>
                </div>
                <div>
                  <span class="text-slate-500 block uppercase text-[10px]">MITRE Tactic</span>
                  <span class="text-amber-300">{selectedCase.mitreTechnique}</span>
                </div>
              </div>

              {/* Timeline & Actions Taken */}
              <div class="mt-5 space-y-4">
                <div>
                  <h4 class="text-xs font-bold uppercase text-slate-400 font-mono mb-2">Analyst Investigation Notes</h4>
                  <div class="space-y-2">
                    {selectedCase.notes.map((note, i) => (
                      <div key={i} class="p-3 rounded bg-cyber-bg border border-cyber-border text-xs text-slate-300 font-mono">
                        {note}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 class="text-xs font-bold uppercase text-slate-400 font-mono mb-2">SOAR Actions Executed</h4>
                  <div class="flex flex-wrap gap-2">
                    {selectedCase.actionsTaken.length > 0 ? (
                      selectedCase.actionsTaken.map((act, i) => (
                        <span key={i} class="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-xs font-mono font-bold flex items-center space-x-1">
                          <CheckCircle2 class="w-3.5 h-3.5" />
                          <span>{act}</span>
                        </span>
                      ))
                    ) : (
                      <span class="text-xs text-slate-500 italic">No automated SOAR actions logged for this case yet.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Print Printable Executive Report Document */}
            <div id="printable-report" class="hidden print:block bg-white text-slate-900 p-8 font-sans">
              <div class="border-b-2 border-slate-900 pb-4 mb-4 flex items-center justify-between">
                <div>
                  <h1 class="text-2xl font-black text-slate-900">AegisSOC Cybersecurity Incident Report</h1>
                  <p class="text-xs text-slate-600">CONFIDENTIAL • SOC Security Operations Center Document</p>
                </div>
                <div class="text-right">
                  <div class="text-sm font-bold font-mono text-slate-900">{selectedCase.id}</div>
                  <div class="text-xs text-slate-500">Date: {new Date().toLocaleDateString()}</div>
                </div>
              </div>

              <div class="space-y-4 text-sm">
                <div>
                  <h2 class="font-bold text-base text-slate-800">1. Executive Summary</h2>
                  <p class="text-slate-700 mt-1">{selectedCase.title}. Detected on asset {selectedCase.host}.</p>
                </div>

                <div>
                  <h2 class="font-bold text-base text-slate-800">2. Incident Details & MITRE Mapping</h2>
                  <ul class="list-disc pl-5 text-slate-700 mt-1">
                    <li><strong>Severity Tier:</strong> {selectedCase.severity}</li>
                    <li><strong>Target Host:</strong> {selectedCase.host}</li>
                    <li><strong>MITRE ATT&CK Technique:</strong> {selectedCase.mitreTechnique}</li>
                    <li><strong>Lead Investigator:</strong> {selectedCase.assignedTo}</li>
                  </ul>
                </div>

                <div>
                  <h2 class="font-bold text-base text-slate-800">3. Remediation & Actions Taken</h2>
                  <p class="text-slate-700 mt-1">
                    SOAR Automated Playbooks executed: {selectedCase.actionsTaken.join(', ') || 'Host Isolation & IP Block executed'}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
