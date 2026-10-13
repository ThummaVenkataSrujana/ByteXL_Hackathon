import React from 'react';
import {
  LayoutDashboard, ShieldAlert, Flag, FileCheck2, Ban,
  Globe2, Building2, UserX, Network, History, Settings, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { currentCompany } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Security Dashboard', icon: LayoutDashboard },
    { id: 'registry', label: 'Brand Trust Registry', icon: Building2 },
    { id: 'scanner', label: 'AI Threat Scanner', icon: ShieldAlert },
    { id: 'reports', label: 'Fraud Reporting Center', icon: Flag },
    { id: 'passport', label: 'Evidence Passport', icon: FileCheck2 },
    { id: 'blocklist', label: 'Enterprise Blocklist', icon: Ban },
    { id: 'protected', label: 'Protected Browsing', icon: Globe2 },
    { id: 'risk', label: 'Login Risk Monitor', icon: UserX },
    { id: 'federated', label: 'Federated Learning', icon: Network },
    { id: 'audit', label: 'Audit Trail Logs', icon: History },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 min-h-[calc(100vh-4rem)] shadow-2xs">
      {/* Company Overview Card */}
      <div className="p-4 border-b border-slate-200">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-900">
              {currentCompany?.name}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              {currentCompany?.official_domain}
            </div>
          </div>
          <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
            {currentCompany?.industry}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Security Suite
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                isActive
                  ? 'bg-purple-50 text-purple-700 border border-purple-200 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Protected Browsing Gateway Quick Test */}
      <div className="p-3 border-t border-slate-200">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
          <div className="text-slate-800 font-semibold mb-1 flex items-center justify-between">
            <span>Gateway Proxy</span>
            <span className="text-[10px] text-emerald-600 font-bold font-mono">ACTIVE</span>
          </div>
          <p className="text-slate-500 mb-2 leading-relaxed">
            Intercepts typosquats & malicious URLs automatically.
          </p>
          <button
            onClick={() => onNavigate('protected')}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer shadow-xs"
          >
            <span>Open Protected Gate</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </button>
        </div>
      </div>
    </aside>
  );
};
