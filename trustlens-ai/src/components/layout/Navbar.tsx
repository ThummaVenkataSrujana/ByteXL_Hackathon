import React, { useState } from 'react';
import {
  Shield, Bell, User as UserIcon, LogOut, ChevronDown, Check,
  AlertTriangle, Key, ExternalLink, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { SEED_COMPANIES } from '../../data/seedData';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenChat: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenChat }) => {
  const { currentUser, currentCompany, logout, switchUserQuick } = useAuth();
  const { alerts, acknowledgeAlert } = useData();

  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Scoped open alerts for current company
  const companyAlerts = alerts.filter(a => a.company_id === currentCompany?.id);
  const openAlerts = companyAlerts.filter(a => a.status === 'open');

  const demoAccounts = [
    { label: 'NovaPay — Head', email: 'head1@novapay.com', role: 'Company Head' },
    { label: 'NovaPay — Analyst', email: 'analyst1@novapay.com', role: 'Analyst' },
    { label: 'NovaPay — Staff', email: 'employee1@novapay.com', role: 'Employee' },
    { label: 'FinSecure Bank — Head', email: 'head2@finsecurebank.com', role: 'Company Head' },
    { label: 'ShopShield — Head', email: 'head3@shopshield.com', role: 'Company Head' },
    { label: 'MediTrust — Head', email: 'head4@meditrust.com', role: 'Company Head' },
    { label: 'EduSafe — Head', email: 'head5@edusafe.com', role: 'Company Head' },
  ];

  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 flex items-center justify-between gap-8 sticky top-0 z-40 shadow-2xs">
      {/* Zone 1: Single Brand Wordmark & Domain */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors">
            <Shield className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap block">
              TrustLens AI
            </span>
            <span className="text-[11px] text-slate-500 font-medium block -mt-0.5">
              Enterprise Brand Defense
            </span>
          </div>
        </button>

        <span className="text-slate-300 hidden sm:inline" aria-hidden="true">|</span>

        {/* Company Badge / Switcher */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 transition-colors cursor-pointer"
          >
            <span className="font-semibold text-slate-900">{currentCompany?.name || 'NovaPay'}</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">{currentCompany?.industry}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {showCompanyDropdown && (
            <div className="absolute left-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-50 animate-fadeIn">
              <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Company Workspace
              </div>
              {SEED_COMPANIES.map(comp => (
                <button
                  key={comp.id}
                  onClick={() => {
                    const headUser = demoAccounts.find(d => d.email.includes(comp.official_domain.split('.')[0]));
                    if (headUser) switchUserQuick(headUser.email);
                    setShowCompanyDropdown(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                    currentCompany?.id === comp.id ? 'text-indigo-600 bg-indigo-50/50 font-semibold' : 'text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-900">{comp.name}</div>
                    <div className="text-[11px] text-slate-500">{comp.official_domain} · {comp.industry}</div>
                  </div>
                  {currentCompany?.id === comp.id && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zone 2: Navigation Links (Breadcrumb / Status context) */}
      <nav className="hidden lg:flex items-center gap-6 text-xs text-slate-500">
        <span className="text-slate-400">Workspace /</span>
        <span className="text-slate-900 font-semibold capitalize">
          {currentView.replace('-', ' ')}
        </span>
        <span className="text-slate-300" aria-hidden="true">·</span>
        <span className="text-slate-600">
          User: <span className="text-slate-900 font-medium">{currentUser?.full_name}</span>
        </span>
        <span className="text-slate-300" aria-hidden="true">·</span>
        <span className="text-slate-600 capitalize">
          Role: <span className="text-indigo-600 font-semibold">{currentUser?.role.replace('_', ' ')}</span>
        </span>
      </nav>

      {/* Zone 3: Actions (Gateway Proxy Status, Chat Trigger, Alerts, User Profile) */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Gateway Proxy Status Indicator */}
        <button
          onClick={() => onNavigate('protected')}
          title="Active Gateway Proxy (Click to inspect perimeter rules)"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-mono font-medium transition-colors cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>Gateway: ACTIVE</span>
        </button>

        {/* Quick Chat AI Trigger - Blue & White Combo */}
        <button
          onClick={onOpenChat}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 text-xs font-bold transition-all shadow-2xs cursor-pointer group"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600 group-hover:text-white transition-colors" />
          <span className="hidden sm:inline">Ask Sentinel AI</span>
        </button>

        {/* Security Alerts Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className="w-9 h-9 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors relative cursor-pointer"
            aria-label="Security Alerts"
          >
            <Bell className="w-4 h-4" />
            {openAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-slate-200 shadow-2xl py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-slate-150 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">
                  Security Alerts ({companyAlerts.length})
                </span>
                <span className="text-[11px] text-slate-500">
                  {openAlerts.length} Active
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {companyAlerts.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-500">
                    No active security alerts for {currentCompany?.name}.
                  </div>
                ) : (
                  companyAlerts.slice(0, 5).map(alert => (
                    <div key={alert.id} className="p-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${
                            alert.severity === 'critical' ? 'text-rose-600' : 'text-amber-600'
                          }`} />
                          <span className="text-xs font-semibold text-slate-900 line-clamp-1">
                            {alert.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mb-2">
                        {alert.message.split('\n')[0]}
                      </p>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono text-slate-400 text-[10px]">{alert.id}</span>
                        {alert.status === 'open' ? (
                          <button
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                          >
                            Acknowledge
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[10px] uppercase font-medium">
                            {alert.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    onNavigate('dashboard');
                    setShowAlertsDropdown(false);
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-500 font-semibold cursor-pointer"
                >
                  View All Alerts on Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-md bg-indigo-50 border border-indigo-200 flex items-center justify-center text-xs font-semibold text-indigo-700">
              {currentUser?.full_name.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <span className="text-xs font-medium text-slate-900 block line-clamp-1">
                {currentUser?.full_name}
              </span>
              <span className="text-[10px] text-slate-500 block -mt-0.5 font-mono">
                {currentUser?.employee_code}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-2xl py-2 z-50 animate-fadeIn">
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="font-semibold text-xs text-slate-900">{currentUser?.full_name}</div>
                <div className="text-[11px] text-slate-500 truncate">{currentUser?.email}</div>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-600">
                  <span>Role: <strong className="text-indigo-600 capitalize">{currentUser?.role.replace('_', ' ')}</strong></span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <Key className="w-3 h-3" /> FIDO2 Passkey
                  </span>
                </div>
              </div>

              {/* Demo Account Switcher */}
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Quick Demo Account Switch
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {demoAccounts.map(d => (
                    <button
                      key={d.email}
                      onClick={() => {
                        switchUserQuick(d.email);
                        setShowProfileDropdown(false);
                      }}
                      className={`w-full px-2 py-1 rounded text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                        currentUser?.email === d.email ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'text-slate-600'
                      }`}
                    >
                      <span className="truncate">{d.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{d.role}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => {
                    onNavigate('settings');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  Account & Passkey Settings
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowProfileDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
