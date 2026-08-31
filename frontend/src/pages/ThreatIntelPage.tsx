import React, { useState, useEffect } from 'react';
import { Database, Search, ShieldAlert, Globe, Hash, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { ThreatIntel } from '../types';

export const ThreatIntelPage: React.FC = () => {
  const [intel, setIntel] = useState<ThreatIntel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const loadIntel = async () => {
    try {
      setLoading(true);
      const data = await api.getThreatIntel({
        indicator_type: typeFilter === 'ALL' ? undefined : typeFilter,
        search: search || undefined
      });
      setIntel(data);
    } catch (err) {
      console.error('Failed to load threat intel:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntel();
  }, [typeFilter, search]);

  const getReputationBadge = (rep: string) => {
    switch (rep.toUpperCase()) {
      case 'MALICIOUS': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'SUSPICIOUS': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white font-mono">THREAT INTELLIGENCE IOC FEED</h1>
        <p className="text-xs text-gray-400 font-mono">Simulated Indicator of Compromise (IOC) reputation database</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search IP, Domain, Hash, or Threat Category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1F2937] border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-gray-400">INDICATOR TYPE:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#1F2937] border border-gray-700 text-gray-200 rounded px-3 py-2 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="IP">IP Address</option>
            <option value="Domain">Domain Name</option>
            <option value="Hash">File Hash</option>
            <option value="URL">URL</option>
          </select>
        </div>
      </div>

      {/* Threat Intel Table */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#1F2937] text-gray-400 uppercase">
              <tr>
                <th className="px-4 py-3">INDICATOR</th>
                <th className="px-4 py-3">TYPE</th>
                <th className="px-4 py-3">REPUTATION</th>
                <th className="px-4 py-3">CONFIDENCE</th>
                <th className="px-4 py-3">THREAT CATEGORY</th>
                <th className="px-4 py-3">DESCRIPTION</th>
                <th className="px-4 py-3">LAST SEEN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {intel.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No matching threat intelligence records found.
                  </td>
                </tr>
              ) : (
                intel.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-800/40">
                    <td className="px-4 py-3.5 font-bold text-blue-400 max-w-xs truncate">{item.indicator}</td>
                    <td className="px-4 py-3.5">
                      <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-[10px] border border-gray-700">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${getReputationBadge(item.reputation)}`}>
                        {item.reputation}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-gray-200">{item.confidence}%</td>
                    <td className="px-4 py-3.5 text-gray-300">{item.category}</td>
                    <td className="px-4 py-3.5 text-gray-400 max-w-xs truncate">{item.description}</td>
                    <td className="px-4 py-3.5 text-gray-400">{new Date(item.last_seen).toLocaleDateString()}</td>
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
