import React, { useState } from 'react';
import { 
  Search, 
  ShieldAlert, 
  Globe, 
  Key, 
  ExternalLink, 
  AlertOctagon, 
  CheckCircle2,
  FileCheck
} from 'lucide-react';

export default function ThreatIntel() {
  const [query, setQuery] = useState('185.220.101.5');
  const [intelResult, setIntelResult] = useState({
    type: 'IP',
    query: '185.220.101.5',
    result: {
      verdict: 'MALICIOUS',
      country: 'Russia (RU)',
      asn: 'AS44050 CyberGhost',
      threatActor: 'APT29 (Cozy Bear)',
      associatedMalware: ['Cobalt Strike Beacon', 'Tor Exit Node'],
      abuseScore: 94
    }
  });

  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await fetch('/api/threat-intel/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      setIntelResult(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div class="space-y-6">
      {/* Header Banner */}
      <div class="cyber-card p-5 border-l-4 border-l-cyan-500">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <Search class="w-5 h-5 text-cyan-400" />
              <span>Threat Intelligence Sandbox & IOC Reputation Engine</span>
            </h2>
            <p class="text-xs text-slate-400 mt-1">
              Query Indicators of Compromise (IP addresses, malware hashes, C2 domain names) against global intelligence feeds.
            </p>
          </div>
        </div>
      </div>

      {/* Query Search Form */}
      <div class="cyber-card p-5">
        <form onSubmit={handleLookup} class="flex items-center space-x-3">
          <div class="relative flex-1">
            <Search class="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter IP (185.220.101.5), Hash (e3b0c442...), or Domain (c2-server-x9.evil.ru)..."
              class="w-full bg-cyber-bg text-xs text-slate-100 border border-cyber-border rounded-lg pl-9 pr-3 py-2.5 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            class="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-lg text-xs font-bold shadow-glow-cyan transition"
          >
            Lookup IOC
          </button>
        </form>

        {/* Quick Example Badges */}
        <div class="flex items-center space-x-2 mt-3 text-xs text-slate-400 font-mono">
          <span class="text-slate-500">Try sample IOCs:</span>
          <button onClick={() => { setQuery('185.220.101.5'); }} class="hover:text-cyan-300 underline">185.220.101.5</button>
          <span>•</span>
          <button onClick={() => { setQuery('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'); }} class="hover:text-cyan-300 underline">WannaCry Hash</button>
          <span>•</span>
          <button onClick={() => { setQuery('c2-server-x9.evil.ru'); }} class="hover:text-cyan-300 underline">c2-server-x9.evil.ru</button>
        </div>
      </div>

      {/* Result Card */}
      {intelResult && (
        <div class="cyber-card p-6 border border-cyber-border">
          <div class="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-cyber-border gap-4">
            <div>
              <span class="text-[10px] font-mono uppercase text-slate-500">Target Indicator</span>
              <h3 class="text-xl font-bold font-mono text-cyan-300">{intelResult.query}</h3>
            </div>

            <div class="flex items-center space-x-3">
              <span class={`cyber-badge px-3 py-1.5 text-sm ${
                intelResult.result?.verdict === 'MALICIOUS' ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-glow-red' :
                intelResult.result?.verdict === 'SUSPICIOUS' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                VERDICT: {intelResult.result?.verdict || 'UNKNOWN'}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5 text-xs font-mono">
            <div class="space-y-3">
              {intelResult.result?.country && (
                <div>
                  <span class="text-slate-500 block uppercase text-[10px]">Geographic Origin</span>
                  <span class="text-slate-200 font-bold">{intelResult.result.country}</span>
                </div>
              )}
              {intelResult.result?.asn && (
                <div>
                  <span class="text-slate-500 block uppercase text-[10px]">Autonomous System (ASN)</span>
                  <span class="text-slate-200">{intelResult.result.asn}</span>
                </div>
              )}
              {intelResult.result?.threatActor && (
                <div>
                  <span class="text-slate-500 block uppercase text-[10px]">Attributed Threat Actor (APT)</span>
                  <span class="text-purple-400 font-bold">{intelResult.result.threatActor}</span>
                </div>
              )}
              {intelResult.result?.threatType && (
                <div>
                  <span class="text-slate-500 block uppercase text-[10px]">Malware Classification</span>
                  <span class="text-red-400 font-bold">{intelResult.result.threatType}</span>
                </div>
              )}
            </div>

            <div class="space-y-3">
              {intelResult.result?.abuseScore !== undefined && (
                <div>
                  <span class="text-slate-500 block uppercase text-[10px]">Abuse Confidence Score</span>
                  <div class="w-full bg-cyber-bg h-3 rounded-full overflow-hidden mt-1 border border-cyber-border">
                    <div 
                      class="bg-gradient-to-r from-amber-500 to-red-600 h-full rounded-full"
                      style={{ width: `${intelResult.result.abuseScore}%` }}
                    ></div>
                  </div>
                  <span class="text-red-400 font-bold mt-1 block">{intelResult.result.abuseScore} / 100</span>
                </div>
              )}
              {intelResult.result?.associatedMalware && (
                <div>
                  <span class="text-slate-500 block uppercase text-[10px]">Associated Malware Payloads</span>
                  <div class="flex flex-wrap gap-1.5 mt-1">
                    {intelResult.result.associatedMalware.map((m, i) => (
                      <span key={i} class="px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/30 text-[11px]">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
