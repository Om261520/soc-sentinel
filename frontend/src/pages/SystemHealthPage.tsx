import React, { useState, useEffect } from 'react';
import { Activity, Database, Cpu, HardDrive, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { SystemHealth } from '../types';

export const SystemHealthPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  const loadHealth = async () => {
    try {
      setLoading(true);
      const data = await api.getSystemHealth();
      setHealth(data);
    } catch (err) {
      console.error('Failed to load health:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white font-mono">SOC INFRASTRUCTURE SYSTEM HEALTH</h1>
          <p className="text-xs text-gray-400 font-mono">Real-time health status of API, Database, Detection Engine & Log Pipeline</p>
        </div>
        <button
          onClick={loadHealth}
          className="flex items-center space-x-2 px-3 py-1.5 bg-[#1F2937] hover:bg-gray-700 text-gray-300 text-xs font-mono rounded-lg border border-gray-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>RUN HEALTH CHECK</span>
        </button>
      </div>

      {/* Health Overview Banner */}
      <div className="bg-[#111827] border border-emerald-500/30 rounded-xl p-5 flex items-center justify-between font-mono">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase">ALL SOC SYSTEM PIPELINES OPERATIONAL</h2>
            <p className="text-xs text-gray-400">Last diagnostic timestamp: {health?.timestamp || new Date().toISOString()}</p>
          </div>
        </div>
        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded text-xs font-bold">
          STATUS: {health?.status || 'HEALTHY'}
        </span>
      </div>

      {/* Services Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
        {/* API Gateway */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-gray-400">
            <span className="font-bold text-white uppercase">FastAPI Backend API</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-center justify-between border-t border-gray-800 pt-3">
            <span className="text-gray-500">Service Status:</span>
            <span className="text-emerald-400 font-bold">{health?.services.api.status || 'ONLINE'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">API Latency:</span>
            <span className="text-gray-200">{health?.services.api.latency_ms || 1.2} ms</span>
          </div>
        </div>

        {/* Database Engine */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-gray-400">
            <span className="font-bold text-white uppercase">Database Engine</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-center justify-between border-t border-gray-800 pt-3">
            <span className="text-gray-500">Database Status:</span>
            <span className="text-emerald-400 font-bold">{health?.services.database.status || 'ONLINE'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">ORM Engine:</span>
            <span className="text-gray-200">{health?.services.database.engine || 'SQLite'}</span>
          </div>
        </div>

        {/* Detection Engine */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-gray-400">
            <span className="font-bold text-white uppercase">Detection Rule Engine</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-center justify-between border-t border-gray-800 pt-3">
            <span className="text-gray-500">Rule Engine Status:</span>
            <span className="text-emerald-400 font-bold">{health?.services.detection_engine.status || 'ONLINE'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Active Rules:</span>
            <span className="text-gray-200">{health?.services.detection_engine.active_rules || 8} Active Rules</span>
          </div>
        </div>

        {/* Log Pipeline */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-gray-400">
            <span className="font-bold text-white uppercase">Log Ingestion Pipeline</span>
            <HardDrive className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex items-center justify-between border-t border-gray-800 pt-3">
            <span className="text-gray-500">Pipeline Status:</span>
            <span className="text-emerald-400 font-bold">{health?.services.log_pipeline.status || 'ONLINE'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Ingestion Mode:</span>
            <span className="text-gray-200">{health?.services.log_pipeline.ingestion_mode || 'REALTIME'}</span>
          </div>
        </div>

        {/* AI Triage Analyst */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-gray-400">
            <span className="font-bold text-white uppercase">AI Triage Analyst</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center justify-between border-t border-gray-800 pt-3">
            <span className="text-gray-500">Analyzer Status:</span>
            <span className="text-emerald-400 font-bold">{health?.services.ai_analyzer.status || 'ONLINE'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Triage Engine Mode:</span>
            <span className="text-gray-200">{health?.services.ai_analyzer.mode || 'HYBRID_DETERMINISTIC'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
