import React, { useState } from 'react';
import { 
  Search, 
  ShieldAlert, 
  Globe, 
  Key, 
  ExternalLink, 
  AlertOctagon, 
  CheckCircle2,
  FileCheck,
  Zap,
  Activity
} from 'lucide-react';
import { playAiChime, playCyberClick } from '../utils/audio';

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

  const threatIntelDb = {
    hashes: {
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855': {
        verdict: 'MALICIOUS',
        threatName: 'WannaCry.Ransomware.Gen',
        threatType: 'Ransomware',
        reputationScore: 98,
        firstSeen: '2025-11-12',
        mitre: ['T1486', 'T1490'],
        communityRating: '89/92 Antivirus Engines Detected'
      },
      '4a8a08f09d37b737956490386cfb819661a3375f': {
        verdict: 'MALICIOUS',
        threatName: 'Mimikatz.PassTheHash.Tool',
        threatType: 'Credential Stealer',
        reputationScore: 95,
        firstSeen: '2025-09-04',
        mitre: ['T1003.001'],
        communityRating: '85/90 Antivirus Engines Detected'
      }
    },
    ips: {
      '185.220.101.5': {
        verdict: 'MALICIOUS',
        country: 'Russia (RU)',
        asn: 'AS44050 CyberGhost',
        threatActor: 'APT29 (Cozy Bear)',
        associatedMalware: ['Cobalt Strike Beacon', 'Tor Exit Node'],
        abuseScore: 94
      },
      '194.26.29.112': {
        verdict: 'SUSPICIOUS',
        country: 'Netherlands (NL)',
        asn: 'AS208046 Hostinger',
        threatActor: 'Unknown Scanner',
        associatedMalware: ['Masscan Botnet'],
        abuseScore: 78
      }
    },
    domains: {
      'c2-server-x9.evil.ru': {
        verdict: 'MALICIOUS',
        category: 'Command & Control',
        ip: '185.220.101.5',
        registrar: 'Reg.ru LLC',
        dnsStatus: 'Active Sinkhole',
        reputationScore: 99
      },
      'login-security-update.com': {
        verdict: 'MALICIOUS',
        category: 'Credential Harvesting Phishing',
        ip: '194.26.29.112',
        registrar: 'NameCheap Inc',
        dnsStatus: 'Flagged by SafeBrowsing',
        reputationScore: 92
      }
    }
  };

  const handleLookup = async (e, customQuery) => {
    if (e) e.preventDefault();
    playAiChime();
    const cleanQuery = (customQuery || query || '').trim();
    try {
      const res = await fetch('/api/threat-intel/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: cleanQuery })
      });
      if (res.ok) {
        const data = await res.json();
        setIntelResult(data);
        return;
      }
    } catch (err) {
      // Fallback
    }

    // Client-side local lookup
    if (threatIntelDb.hashes[cleanQuery.toLowerCase()]) {
      setIntelResult({ type: 'HASH', query: cleanQuery, result: threatIntelDb.hashes[cleanQuery.toLowerCase()] });
    } else if (threatIntelDb.ips[cleanQuery]) {
      setIntelResult({ type: 'IP', query: cleanQuery, result: threatIntelDb.ips[cleanQuery] });
    } else if (threatIntelDb.domains[cleanQuery]) {
      setIntelResult({ type: 'DOMAIN', query: cleanQuery, result: threatIntelDb.domains[cleanQuery] });
    } else {
      setIntelResult({
        type: cleanQuery.includes('.') && isNaN(cleanQuery.split('.')[0]) ? 'DOMAIN' : (cleanQuery.includes('.') ? 'IP' : 'HASH'),
        query: cleanQuery,
        result: {
          verdict: 'CLEAN / UNKNOWN',
          threatScore: 0,
          notes: 'No malicious indicators or blacklist records matched in Threat Intelligence feeds.'
        }
      });
    }
  };

  const setAndSearch = (sample) => {
    setQuery(sample);
    handleLookup(null, sample);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="cyber-card p-5 border-l-4 border-l-cyan-500 shadow-glow-cyan/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2 font-mono">
              <Search className="w-5 h-5 text-cyan-400" />
              <span>Threat Intelligence Sandbox & IOC Reputation Engine</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Query Indicators of Compromise (IP addresses, malware hashes, C2 domain names) against global intelligence feeds.
            </p>
          </div>
        </div>
      </div>

      {/* Query Search Form */}
      <div className="cyber-card p-5">
        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter IP (185.220.101.5), Hash (e3b0c442...), or Domain (c2-server-x9.evil.ru)..."
              className="w-full bg-cyber-bg text-xs text-slate-100 border border-cyber-border rounded-lg pl-9 pr-3 py-2.5 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-lg text-xs font-bold shadow-glow-cyan transition flex items-center justify-center space-x-1.5"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Lookup IOC</span>
          </button>
        </form>

        {/* Quick Example Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-cyber-border/40 text-xs font-mono">
          <span className="text-slate-500 text-[11px]">Sample IOCs:</span>
          <button onClick={() => setAndSearch('185.220.101.5')} className="px-2 py-0.5 rounded bg-cyber-bg hover:bg-cyber-hover text-red-300 border border-cyber-border text-[11px]">185.220.101.5 (APT29 IP)</button>
          <button onClick={() => setAndSearch('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')} className="px-2 py-0.5 rounded bg-cyber-bg hover:bg-cyber-hover text-purple-300 border border-cyber-border text-[11px]">WannaCry Hash</button>
          <button onClick={() => setAndSearch('4a8a08f09d37b737956490386cfb819661a3375f')} className="px-2 py-0.5 rounded bg-cyber-bg hover:bg-cyber-hover text-purple-300 border border-cyber-border text-[11px]">Mimikatz Hash</button>
          <button onClick={() => setAndSearch('c2-server-x9.evil.ru')} className="px-2 py-0.5 rounded bg-cyber-bg hover:bg-cyber-hover text-amber-300 border border-cyber-border text-[11px]">c2-server-x9.evil.ru</button>
        </div>
      </div>

      {/* Result Card */}
      {intelResult && (
        <div className="cyber-card p-6 border border-cyber-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-cyber-border gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500">Indicator Identifier</span>
              <h3 className="text-xl font-bold font-mono text-cyan-300">{intelResult.query}</h3>
            </div>

            <div className="flex items-center space-x-3">
              <span className={`cyber-badge px-3.5 py-1.5 text-xs font-mono font-bold ${
                intelResult.result?.verdict === 'MALICIOUS' ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-glow-red' :
                intelResult.result?.verdict === 'SUSPICIOUS' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                VERDICT: {intelResult.result?.verdict || 'UNKNOWN'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5 text-xs font-mono">
            <div className="space-y-3">
              {intelResult.result?.country && (
                <div>
                  <span className="text-slate-500 block uppercase text-[10px]">Geographic Origin</span>
                  <span className="text-slate-200 font-bold">{intelResult.result.country}</span>
                </div>
              )}
              {intelResult.result?.asn && (
                <div>
                  <span className="text-slate-500 block uppercase text-[10px]">Autonomous System (ASN)</span>
                  <span className="text-slate-200">{intelResult.result.asn}</span>
                </div>
              )}
              {intelResult.result?.threatActor && (
                <div>
                  <span className="text-slate-500 block uppercase text-[10px]">Attributed Threat Actor (APT)</span>
                  <span className="text-purple-400 font-bold">{intelResult.result.threatActor}</span>
                </div>
              )}
              {intelResult.result?.threatType && (
                <div>
                  <span className="text-slate-500 block uppercase text-[10px]">Malware Classification</span>
                  <span className="text-red-400 font-bold">{intelResult.result.threatType}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {intelResult.result?.abuseScore !== undefined && (
                <div>
                  <span className="text-slate-500 block uppercase text-[10px]">Abuse Confidence Score</span>
                  <div className="w-full bg-cyber-bg h-3 rounded-full overflow-hidden mt-1 border border-cyber-border">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-red-600 h-full rounded-full"
                      style={{ width: `${intelResult.result.abuseScore}%` }}
                    ></div>
                  </div>
                  <span className="text-red-400 font-bold mt-1 block">{intelResult.result.abuseScore} / 100</span>
                </div>
              )}
              {intelResult.result?.associatedMalware && (
                <div>
                  <span className="text-slate-500 block uppercase text-[10px]">Associated Malware Payloads</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {intelResult.result.associatedMalware.map((m, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/30 text-[11px]">
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
