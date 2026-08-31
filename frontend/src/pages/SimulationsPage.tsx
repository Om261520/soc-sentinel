import React, { useState } from 'react';
import { PlayCircle, ShieldAlert, CheckCircle2, ArrowRight, Zap, RefreshCw, Terminal, Layers } from 'lucide-react';
import { api } from '../services/api';

export const SimulationsPage: React.FC = () => {
  const [running, setRunning] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [logsOutput, setLogsOutput] = useState<string[]>([]);

  const attackScenarios = [
    {
      id: 'brute_force',
      title: 'Brute Force Login Attack',
      description: 'Generates 6 failed SSH authentication logs from external source IP (185.220.101.5) targeting admin account.',
      category: 'Credential Access',
      severity: 'HIGH',
      mitre: 'T1110'
    },
    {
      id: 'password_spray',
      title: 'Password Spray Campaign',
      description: 'Generates single authentication failures across 6 distinct executive user accounts from single source IP.',
      category: 'Credential Access',
      severity: 'HIGH',
      mitre: 'T1110.003'
    },
    {
      id: 'port_scan',
      title: 'Network Port Scan Probe',
      description: 'Probes 12 distinct TCP ports (22, 80, 443, 3389, 1433...) from external scanning infrastructure.',
      category: 'Discovery',
      severity: 'MEDIUM',
      mitre: 'T1046'
    },
    {
      id: 'sqli',
      title: 'SQL Injection Web Attack',
      description: 'Sends HTTP web payload containing SQL injection signature (\' UNION SELECT username, password_hash FROM users--).',
      category: 'Initial Access',
      severity: 'HIGH',
      mitre: 'T1190'
    },
    {
      id: 'powershell',
      title: 'Suspicious Encoded PowerShell',
      description: 'Generates endpoint process launch event with base64 encoded download string payload (IEX DownloadString...).',
      category: 'Execution',
      severity: 'HIGH',
      mitre: 'T1059.001'
    },
    {
      id: 'priv_esc',
      title: 'Privilege Escalation Event',
      description: 'Simulates local account elevation command executing net localgroup Administrators /add.',
      category: 'Privilege Escalation',
      severity: 'HIGH',
      mitre: 'T1068'
    },
    {
      id: 'malware',
      title: 'Ransomware Binary Execution',
      description: 'Triggers endpoint EDR agent detection log for Ransomware.WannaCry.Variant in C:\\Users\\Public\\Downloads.',
      category: 'Execution',
      severity: 'CRITICAL',
      mitre: 'T1204'
    },
    {
      id: 'impossible_travel',
      title: 'Impossible Travel Geo Login',
      description: 'Generates 2 successful logins for user admin from London (UK) and Tokyo (JP) within 2 minutes.',
      category: 'Credential Access',
      severity: 'HIGH',
      mitre: 'T1078'
    }
  ];

  const handleRunSimulation = async (scenario: typeof attackScenarios[0]) => {
    setRunning(scenario.id);
    setResult(null);
    setLogsOutput([
      `[1/4] Initializing attack simulation pipeline for scenario '${scenario.title}'...`,
      `[2/4] Generating synthetic security telemetry payload...`,
      `[3/4] Ingesting logs into Detection Engine & evaluating active rules...`
    ]);

    try {
      const res: any = await api.triggerSimulation({ attack_type: scenario.id });
      setResult(res);
      setLogsOutput((prev) => [
        ...prev,
        `[4/4] SUCCESS: Ingested ${res.logs_generated} log(s) -> Triggered ${res.alerts_triggered} alert(s)!`,
        `Alert IDs Generated: ${res.alerts.map((a: any) => a.alert_id).join(', ')}`
      ]);
    } catch (err: any) {
      setLogsOutput((prev) => [...prev, `[ERROR] Simulation failed: ${err.message}`]);
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white font-mono">ATTACK SCENARIO SIMULATOR</h1>
        <p className="text-xs text-gray-400 font-mono">
          Safely simulate synthetic attack logs to test Detection Engine rule evaluation and alert generation
        </p>
      </div>

      {/* Visual Execution Workflow Indicator */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 font-mono text-xs">
        <h2 className="text-gray-400 uppercase text-[11px] font-bold mb-3">AUTOMATED SOC DETECTION WORKFLOW PIPELINE</h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center">
          <div className="flex-1 bg-[#1F2937] p-3 rounded-lg border border-gray-800">
            <div className="text-blue-400 font-bold mb-1">1. GENERATE ATTACK</div>
            <div className="text-[10px] text-gray-400">Click scenario button</div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-600 shrink-0 hidden md:block" />
          <div className="flex-1 bg-[#1F2937] p-3 rounded-lg border border-gray-800">
            <div className="text-blue-400 font-bold mb-1">2. LOG INGESTION</div>
            <div className="text-[10px] text-gray-400">POST /api/logs</div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-600 shrink-0 hidden md:block" />
          <div className="flex-1 bg-[#1F2937] p-3 rounded-lg border border-gray-800">
            <div className="text-cyan-400 font-bold mb-1">3. DETECTION ENGINE</div>
            <div className="text-[10px] text-gray-400">Evaluate 8 active rules</div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-600 shrink-0 hidden md:block" />
          <div className="flex-1 bg-[#1F2937] p-3 rounded-lg border border-gray-800">
            <div className="text-red-400 font-bold mb-1">4. RISK & ALERT</div>
            <div className="text-[10px] text-gray-400">Assign 0-100 Risk Score</div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-600 shrink-0 hidden md:block" />
          <div className="flex-1 bg-[#1F2937] p-3 rounded-lg border border-emerald-500/30">
            <div className="text-emerald-400 font-bold mb-1">5. DASHBOARD UPDATE</div>
            <div className="text-[10px] text-gray-400">Real-time alert feed</div>
          </div>
        </div>
      </div>

      {/* Simulation Output Terminal */}
      {logsOutput.length > 0 && (
        <div className="bg-[#0B0F17] border border-gray-800 rounded-xl p-4 font-mono text-xs space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold border-b border-gray-800 pb-2">
            <Terminal className="w-4 h-4" />
            <span>SIMULATION PIPELINE EXECUTION TERMINAL</span>
          </div>
          <div className="space-y-1 text-gray-300">
            {logsOutput.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        </div>
      )}

      {/* Attack Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {attackScenarios.map((sc) => (
          <div key={sc.id} className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${
                  sc.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                  sc.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                }`}>
                  {sc.severity}
                </span>
                <span className="text-[10px] text-blue-400">{sc.mitre}</span>
              </div>

              <h2 className="text-sm font-bold text-white">{sc.title}</h2>
              <p className="text-xs text-gray-400 font-sans leading-relaxed">{sc.description}</p>
            </div>

            <button
              onClick={() => handleRunSimulation(sc)}
              disabled={running === sc.id}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded text-xs flex items-center justify-center space-x-2 transition-colors shadow-md shadow-blue-900/30"
            >
              <PlayCircle className="w-4 h-4" />
              <span>{running === sc.id ? 'Simulating...' : 'Simulate Attack'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
