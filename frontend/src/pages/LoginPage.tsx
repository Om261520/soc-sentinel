import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('analyst');
  const [password, setPassword] = useState('Analyst@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col justify-center items-center p-4">
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-600/20 rounded-xl border border-blue-500/30 text-blue-400 mb-3 shadow-lg shadow-blue-900/20">
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold font-mono text-white tracking-wide">SOC SENTINEL</h1>
          <p className="text-xs text-gray-400 font-mono mt-1">SOC THREAT DETECTION & ANALYSIS PLATFORM</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <h2 className="text-lg font-semibold text-gray-200">Analyst Sign In</h2>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start space-x-2 text-red-400 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1 font-mono">USERNAME OR EMAIL</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#1F2937] border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="analyst"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1 font-mono">PASSWORD</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1F2937] border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg flex items-center justify-center space-x-2 text-sm transition-colors shadow-md shadow-blue-900/40"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo Account Switcher Buttons */}
          <div className="pt-4 border-t border-gray-800 space-y-2">
            <p className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">Quick Demo Login Presets:</p>
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setDemoAccount('admin', 'Admin@123')}
                className={`px-2 py-1.5 rounded border text-left transition-colors ${
                  username === 'admin' ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-gray-800/40 border-gray-700/60 text-gray-400 hover:bg-gray-800'
                }`}
              >
                <div className="font-bold">ADMIN</div>
                <div className="text-[10px] text-gray-400 truncate">Admin@123</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('analyst', 'Analyst@123')}
                className={`px-2 py-1.5 rounded border text-left transition-colors ${
                  username === 'analyst' ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-gray-800/40 border-gray-700/60 text-gray-400 hover:bg-gray-800'
                }`}
              >
                <div className="font-bold">ANALYST</div>
                <div className="text-[10px] text-gray-400 truncate">Analyst@123</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('viewer', 'Viewer@123')}
                className={`px-2 py-1.5 rounded border text-left transition-colors ${
                  username === 'viewer' ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-gray-800/40 border-gray-700/60 text-gray-400 hover:bg-gray-800'
                }`}
              >
                <div className="font-bold">VIEWER</div>
                <div className="text-[10px] text-gray-400 truncate">Viewer@123</div>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 font-mono mt-6">
          SOC Sentinel v1.0.0 — Portfolio Cybersecurity Platform
        </p>
      </div>
    </div>
  );
};
