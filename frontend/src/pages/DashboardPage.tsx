import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, AlertTriangle, ShieldAlert, ShieldCheck, Flame, Eye,
  TrendingUp, ArrowUpRight, Search, Filter, ExternalLink, RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { api } from '../services/api';
import { DashboardStats, DashboardCharts, Alert } from '../types';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [sData, cData, aData] = await Promise.all([
        api.getDashboardStats(),
        api.getDashboardCharts(),
        api.getAlerts({ limit: 10, severity: severityFilter === 'ALL' ? undefined : severityFilter, search: search || undefined })
      ]);
      setStats(sData);
      setCharts(cData);
      setAlerts(aData);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10s auto refresh
    return () => clearInterval(interval);
  }, [severityFilter, search]);

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white font-mono">SECURITY OPERATIONS CENTER DASHBOARD</h1>
          <p className="text-xs text-gray-400 font-mono">Real-time Threat Monitoring & Incident Response Overview</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center space-x-2 px-3 py-1.5 bg-[#1F2937] hover:bg-gray-700 text-gray-300 text-xs font-mono rounded-lg border border-gray-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>REFRESH METRICS</span>
        </button>
      </div>

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Events */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-mono uppercase">Total Events</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {stats?.total_events.toLocaleString() || '0'}
          </div>
          <div className="flex items-center text-[10px] text-emerald-400 font-mono">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>+12.4% vs last hour</span>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="bg-[#111827] border border-red-500/30 rounded-xl p-4 space-y-2 glow-critical">
          <div className="flex items-center justify-between text-red-400">
            <span className="text-[11px] font-mono uppercase">Critical Alerts</span>
            <Flame className="w-4 h-4 text-red-400 animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-400">
            {stats?.critical_alerts || '0'}
          </div>
          <div className="text-[10px] text-red-400/80 font-mono">Immediate Triage Needed</div>
        </div>

        {/* High Alerts */}
        <div className="bg-[#111827] border border-orange-500/30 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-orange-400">
            <span className="text-[11px] font-mono uppercase">High Alerts</span>
            <ShieldAlert className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-orange-400">
            {stats?.high_alerts || '0'}
          </div>
          <div className="text-[10px] text-orange-400/80 font-mono">Elevated Threat Level</div>
        </div>

        {/* Open Incidents */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-mono uppercase">Open Incidents</span>
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-yellow-400">
            {stats?.open_incidents || '0'}
          </div>
          <div className="text-[10px] text-gray-400 font-mono">Assigned to SOC Team</div>
        </div>

        {/* Threats Detected */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-mono uppercase">Threats Flagged</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {stats?.threats_detected || '0'}
          </div>
          <div className="text-[10px] text-emerald-400 font-mono">Detection Rules Active</div>
        </div>

        {/* Active Investigations */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-mono uppercase">Active Triage</span>
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {stats?.active_investigations || '0'}
          </div>
          <div className="text-[10px] text-gray-400 font-mono">Under Analyst Review</div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Over Time (Line Chart) */}
        <div className="lg:col-span-2 bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-200 font-mono uppercase">Alert Trend Velocity (Last 24 Hours)</h2>
            <span className="text-[10px] text-gray-400 font-mono">2-Hour Bucket Aggregation</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.alerts_over_time || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="time" stroke="#6B7280" fontSize={11} />
                <YAxis stroke="#6B7280" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', fontSize: '12px', fontFamily: 'monospace' }} />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Line type="monotone" dataKey="Critical" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="High" stroke="#F97316" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Medium" stroke="#EAB308" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Low" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution (Donut Chart) */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-200 font-mono uppercase">Alert Severity Breakdown</h2>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.severity_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts?.severity_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', fontSize: '12px', fontFamily: 'monospace' }} />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Middle Row: Attack Categories & Top Suspicious IPs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attack Categories Bar Chart */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-200 font-mono uppercase">Top Attack Vectors & Categories</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.attack_categories || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis type="number" stroke="#6B7280" fontSize={11} />
                <YAxis dataKey="category" type="category" stroke="#6B7280" fontSize={10} width={120} />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', fontSize: '12px', fontFamily: 'monospace' }} />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Suspicious IPs Table */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-200 font-mono uppercase">Top Threat Source IP Addresses</h2>
            <Link to="/threat-intelligence" className="text-xs text-blue-400 hover:underline flex items-center font-mono">
              <span>Threat Intel</span>
              <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#1F2937] text-gray-400 uppercase">
                <tr>
                  <th className="px-3 py-2 rounded-l">SOURCE IP</th>
                  <th className="px-3 py-2">ALERTS</th>
                  <th className="px-3 py-2">MAX SEVERITY</th>
                  <th className="px-3 py-2 rounded-r text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {charts?.top_source_ips.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-800/40">
                    <td className="px-3 py-2.5 font-bold text-gray-200">{item.ip}</td>
                    <td className="px-3 py-2.5">{item.alerts} alerts</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${getSeverityBadgeClass(item.severity)}`}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Link
                        to={`/logs?source_ip=${item.ip}`}
                        className="text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        Inspect Logs
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Real-Time Live Alert Feed Section */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></div>
            <h2 className="text-sm font-bold text-gray-200 font-mono uppercase">REAL-TIME THREAT ALERT FEED</h2>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#1F2937] border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono w-48"
              />
            </div>

            {/* Severity Filter Chips */}
            <div className="flex items-center space-x-1 font-mono text-[11px]">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded border transition-colors ${
                    severityFilter === sev
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-bold'
                      : 'bg-gray-800/40 border-gray-700 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Alert Feed Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#1F2937] text-gray-400 uppercase">
              <tr>
                <th className="px-3 py-2.5 rounded-l">SEVERITY</th>
                <th className="px-3 py-2.5">ALERT ID</th>
                <th className="px-3 py-2.5">TITLE</th>
                <th className="px-3 py-2.5">SOURCE IP</th>
                <th className="px-3 py-2.5">TARGET USER</th>
                <th className="px-3 py-2.5">RISK SCORE</th>
                <th className="px-3 py-2.5">STATUS</th>
                <th className="px-3 py-2.5 rounded-r text-right">INVESTIGATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No matching alerts found for current criteria.
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${getSeverityBadgeClass(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-blue-400 font-bold">{alert.alert_id}</td>
                    <td className="px-3 py-3 font-semibold text-gray-200 max-w-xs truncate">{alert.title}</td>
                    <td className="px-3 py-3 text-gray-300">{alert.source_ip || 'N/A'}</td>
                    <td className="px-3 py-3 text-gray-400">{alert.username || 'System'}</td>
                    <td className="px-3 py-3 font-bold text-gray-100">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-12 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${alert.risk_score >= 80 ? 'bg-red-500' : alert.risk_score >= 60 ? 'bg-orange-500' : 'bg-yellow-500'}`}
                            style={{ width: `${alert.risk_score}%` }}
                          ></div>
                        </div>
                        <span>{alert.risk_score}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        alert.status === 'New' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                        alert.status === 'Investigating' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Link
                        to={`/alerts/${alert.alert_id}`}
                        className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-bold bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded transition-colors"
                      >
                        <span>Triage</span>
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
    </div>
  );
};
