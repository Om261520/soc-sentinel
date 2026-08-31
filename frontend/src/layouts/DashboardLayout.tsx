import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Shield, LayoutDashboard, Bell, FileText, AlertTriangle, 
  Sliders, Database, PlayCircle, Activity, LogOut, User as UserIcon,
  Radio, Zap
} from 'lucide-react';
import { api } from '../services/api';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [user, setUser] = useState<{ username: string; role: string; email: string } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Demo Mode log auto-stream effect
  useEffect(() => {
    let interval: any;
    if (demoMode) {
      interval = setInterval(() => {
        const attackTypes = ['brute_force', 'port_scan', 'sqli', 'powershell', 'malware', 'impossible_travel'];
        const randomType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
        api.triggerSimulation({ attack_type: randomType }).catch(() => {});
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [demoMode]);

  const handleLogout = () => {
    api.logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'SOC Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Alert Feed', path: '/alerts', icon: Bell },
    { name: 'Log Explorer', path: '/logs', icon: FileText },
    { name: 'Incident Manager', path: '/incidents', icon: AlertTriangle },
    { name: 'Detection Rules', path: '/rules', icon: Sliders },
    { name: 'Threat Intelligence', path: '/threat-intelligence', icon: Database },
    { name: 'Attack Simulations', path: '/simulations', icon: PlayCircle },
    { name: 'System Health', path: '/system-health', icon: Activity },
  ];

  return (
    <div className="min-h-screen flex bg-[#0B0F17] text-gray-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#111827] border-r border-gray-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Brand Header */}
          <div className="h-16 flex items-center px-6 border-b border-gray-800 space-x-3">
            <div className="p-2 bg-blue-600/20 rounded-lg border border-blue-500/30 text-blue-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-wide font-mono">SOC SENTINEL</h1>
              <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">THREAT DETECT & ANALYZE</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Demo Mode Toggle & User Info */}
        <div className="p-4 border-t border-gray-800 space-y-3">
          {/* Demo Mode Switcher */}
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono border transition-all ${
              demoMode
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 glow-medium'
                : 'bg-gray-800/40 text-gray-400 border-gray-700/50 hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Radio className={`w-4 h-4 ${demoMode ? 'animate-pulse text-emerald-400' : 'text-gray-500'}`} />
              <span>LIVE DEMO STREAM</span>
            </div>
            <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${demoMode ? 'bg-emerald-500 text-black' : 'bg-gray-700 text-gray-300'}`}>
              {demoMode ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* User Account Info */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-800/60">
            <div className="flex items-center space-x-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold font-mono">
                {user?.username ? user.username.substring(0, 2).toUpperCase() : 'SO'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-gray-200 truncate">{user?.username || 'Analyst'}</p>
                <p className="text-[10px] text-gray-400 font-mono capitalize">{user?.role || 'analyst'} role</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-[#111827] border-b border-gray-800 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-2 bg-blue-500/10 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-500/20 font-mono">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              <span>SOC Operational Status: ACTIVE</span>
            </span>
            {demoMode && (
              <span className="flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded border border-emerald-500/20 font-mono animate-pulse">
                <Zap className="w-3.5 h-3.5" />
                <span>Simulating Live Attacks (5s interval)</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono text-gray-400">
            <div>
              <span className="text-gray-500">UTC TIME: </span>
              <span className="text-gray-200">{new Date().toISOString().substring(11, 19)} UTC</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
