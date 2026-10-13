import React, { useState } from 'react';
import {
  UserX, AlertTriangle, ShieldAlert, CheckCircle2,
  Search, RefreshCw, RotateCcw, Clock, ShieldCheck, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface LoginRiskPageProps {
  onNavigate: (view: string) => void;
}

export const LoginRiskPage: React.FC<LoginRiskPageProps> = ({ onNavigate }) => {
  const { currentCompany, allUsers, unrestrictUser, submitCredentials } = useAuth();
  const { loginAttempts } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'failed' | 'success'>('all');
  const [isSimulatingLockout, setIsSimulatingLockout] = useState(false);
  const [simulatedFeedback, setSimulatedFeedback] = useState<string | null>(null);

  // Scoped to current company
  const companyUsers = allUsers.filter(u => u.company_id === currentCompany?.id);
  const restrictedUsers = companyUsers.filter(u => u.status === 'restricted' || (u.failed_attempt_count && u.failed_attempt_count >= 3));

  const companyAttempts = loginAttempts.filter(l => l.company_id === currentCompany?.id);
  const filteredAttempts = companyAttempts.filter(a => {
    const matchesSearch = a.attempted_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.ip_address.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Action button to simulate 3 failed login attempts and demonstrate restriction alert
  const handleSimulateLockout = async () => {
    if (!currentCompany) return;
    setIsSimulatingLockout(true);

    const targetEmail = `priya.nair@${currentCompany.official_domain}`;
    await submitCredentials(targetEmail, 'WrongPassword1');
    await submitCredentials(targetEmail, 'WrongPassword2');
    await submitCredentials(targetEmail, 'WrongPassword3');

    setIsSimulatingLockout(false);
    setSimulatedFeedback(`3 failed login attempts executed for ${targetEmail}. User account RESTRICTED and Security Alert dispatched to ${currentCompany?.name} Head!`);
    setTimeout(() => setSimulatedFeedback(null), 6000);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto bg-transparent min-h-full text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-indigo-600">Identity & Access Intelligence</span>
            <span>·</span>
            <span>{currentCompany?.name} IAM</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-2xs">
              <UserX className="w-5 h-5" />
            </div>
            <span>Login Risk & IAM Monitor</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Real-time failed login monitoring, rate-limiting enforcement, and automatic 3-strike account restrictions with high-priority head alerting.
          </p>
        </div>

        {/* Demo Simulation Action Button */}
        <button
          onClick={handleSimulateLockout}
          disabled={isSimulatingLockout}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-md shadow-rose-600/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          {isSimulatingLockout ? <RefreshCw className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
          <span>Simulate 3 Failed Logins (Trigger Alert)</span>
        </button>
      </div>

      {simulatedFeedback && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-3 animate-fadeIn shadow-xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="leading-relaxed font-medium">{simulatedFeedback}</span>
        </div>
      )}

      {/* Restricted Accounts Banner Tile */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Restricted Accounts ({restrictedUsers.length})</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                ACTION REQUIRED
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Employees with 3 consecutive authentication failures temporarily locked to protect against brute-force attacks.
            </p>
          </div>

          <div className="text-xs text-slate-500 font-mono font-semibold">
            THRESHOLD: 3 FAILURES
          </div>
        </div>

        {restrictedUsers.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
            No accounts currently restricted in {currentCompany?.name}.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restrictedUsers.map((u) => (
              <div
                key={u.id}
                className="p-4 rounded-xl bg-slate-50 border border-rose-200 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs">{u.full_name}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                      RESTRICTED
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mb-2">{u.email}</div>
                  <div className="text-xs text-slate-600 space-y-1 mb-4">
                    <div className="flex justify-between text-[11px]">
                      <span>Employee ID:</span>
                      <strong className="text-slate-900 font-mono">{u.employee_code}</strong>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Failed Attempts:</span>
                      <strong className="text-rose-600 font-mono tabular-nums">{u.failed_attempt_count || 3} attempts</strong>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Department:</span>
                      <span className="text-slate-700 font-medium">{u.department || 'Operations'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500">Security Head Notified</span>
                  <button
                    onClick={() => unrestrictUser(u.id)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Unrestrict User</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real-time Login Attempts Audit Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-0.5">Authentication Attempt Telemetry</h3>
            <p className="text-xs text-slate-500">Log of all sign-in verifications across IP addresses and browsers</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search email or IP..."
                className="bg-slate-50 border border-slate-250 focus:border-indigo-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-[11px]">
              {(['all', 'failed', 'success'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-2.5 py-1 rounded-md capitalize font-medium cursor-pointer transition-colors ${
                    filterStatus === s ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] bg-slate-50">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Attempted Identity</th>
                <th className="py-2.5 px-3">Result</th>
                <th className="py-2.5 px-3 font-mono">IP Address</th>
                <th className="py-2.5 px-3">Browser / Device</th>
                <th className="py-2.5 px-3 text-right">Attempt #</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 font-mono text-[11px]">
              {filteredAttempts.slice(0, 15).map((att) => (
                <tr key={att.id} className="hover:bg-slate-50 transition-colors font-sans">
                  <td className="py-3 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                    {new Date(att.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-900 font-medium">
                    {att.attempted_email}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      att.status === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {att.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700">
                    {att.ip_address}
                  </td>
                  <td className="py-3 px-3 text-slate-500 text-xs truncate max-w-xs">
                    {att.browser}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold">
                    <span className={att.failed_attempt_count >= 3 ? 'text-rose-600' : 'text-slate-600'}>
                      {att.failed_attempt_count > 0 ? `#${att.failed_attempt_count}` : '1'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
