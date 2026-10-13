import React from 'react';
import {
  ShieldAlert, Flag, Ban, AlertTriangle, UserX,
  FileCheck2, Network, ArrowUpRight, TrendingUp,
  CheckCircle2, AlertOctagon, ExternalLink, RefreshCw, Eye
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, BarChart, Bar, CartesianGrid
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface DashboardPageProps {
  onNavigate: (view: string) => void;
  onSelectReportForPassport?: (reportId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onSelectReportForPassport }) => {
  const { currentCompany, currentUser, allUsers } = useAuth();
  const { reports, blocklist, alerts, loginAttempts, anchors, federatedRounds, acknowledgeAlert } = useData();

  // Company scoped metrics
  const companyReports = reports.filter(r => r.company_id === currentCompany?.id);
  const pendingReports = companyReports.filter(r => r.status === 'pending' || r.status === 'under_review');
  const confirmedThreats = companyReports.filter(r => r.status === 'confirmed' || r.status === 'blocked');
  const companyBlocklist = blocklist.filter(b => b.company_id === currentCompany?.id);
  const companyAlerts = alerts.filter(a => a.company_id === currentCompany?.id);
  const openAlerts = companyAlerts.filter(a => a.status === 'open');
  const companyAttempts = loginAttempts.filter(l => l.company_id === currentCompany?.id);
  const failedAttempts = companyAttempts.filter(l => l.status === 'failed');

  const companyUsers = allUsers.filter(u => u.company_id === currentCompany?.id);
  const restrictedUsers = companyUsers.filter(u => u.status === 'restricted' || u.failed_attempt_count >= 3);

  const companyAnchors = anchors.filter(a => a.company_id === currentCompany?.id);
  const globalFedAccuracy = federatedRounds.length > 0
    ? federatedRounds[federatedRounds.length - 1].global_accuracy
    : 91;

  // Recharts Seeded Trend Data
  const trendData = [
    { date: 'Mon', threats: 12, blocked: 4, reports: 18 },
    { date: 'Tue', threats: 15, blocked: 7, reports: 22 },
    { date: 'Wed', threats: 9, blocked: 5, reports: 14 },
    { date: 'Thu', threats: 24, blocked: 11, reports: 31 },
    { date: 'Fri', threats: 19, blocked: 8, reports: 26 },
    { date: 'Sat', threats: 14, blocked: 6, reports: 19 },
    { date: 'Today', threats: companyReports.length, blocked: companyBlocklist.length, reports: companyReports.length + 5 },
  ];

  const riskDistData = [
    { range: '0-20 (Safe)', count: 6 },
    { range: '21-50 (Low)', count: 4 },
    { range: '51-75 (Medium)', count: 8 },
    { range: '76-89 (High)', count: companyReports.filter(r => r.risk_score >= 76 && r.risk_score < 90).length || 5 },
    { range: '90-100 (Critical)', count: companyReports.filter(r => r.risk_score >= 90).length || 7 },
  ];

  const kpis = [
    { label: 'Total Reports', value: companyReports.length, change: '+14% this week', icon: Flag, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Pending Triage', value: pendingReports.length, change: 'Needs analyst review', icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Confirmed Threats', value: confirmedThreats.length, change: '100% verified', icon: AlertOctagon, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Blocked URLs', value: companyBlocklist.length, change: 'Protected Browsing', icon: Ban, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Security Alerts', value: companyAlerts.length, change: `${openAlerts.length} open action items`, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Failed Logins (24h)', value: failedAttempts.length, change: `${restrictedUsers.length} locked accounts`, icon: UserX, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Anchored Proofs', value: companyAnchors.length, change: 'Polygon Amoy Verified', icon: FileCheck2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Federated Accuracy', value: `${globalFedAccuracy}%`, change: '0 raw customer records shared', icon: Network, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto bg-transparent min-h-full text-slate-900">
      {/* Title & Organization Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Security Workspace</span>
            <span>·</span>
            <span className="text-indigo-600 font-semibold">{currentCompany?.name}</span>
            <span>·</span>
            <span className="font-mono text-slate-400">{currentCompany?.official_domain}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Security Intelligence Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('scanner')}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors shadow-md shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Launch Threat Scanner</span>
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            Submit Fraud Report
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">{kpi.label}</span>
                <div className={`w-7 h-7 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight tabular-nums mb-1">
                {kpi.value}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {kpi.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Urgent Security Alerts Banner if any open */}
      {openAlerts.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                High-Priority Security Action Required ({openAlerts.length})
              </span>
            </div>
            <button
              onClick={() => onNavigate('risk')}
              className="text-xs text-rose-700 hover:text-rose-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              Inspect Restricted Accounts <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {openAlerts.slice(0, 2).map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-lg bg-white border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900 mb-0.5">
                    {alert.title}
                  </div>
                  <div className="text-slate-500 text-[11px] line-clamp-1">
                    {alert.message.split('\n')[0]}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                  >
                    Acknowledge
                  </button>
                  <button
                    onClick={() => onNavigate('risk')}
                    className="px-3 py-1 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    Investigate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visualization Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Trend Area Chart */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-0.5">7-Day Threat & Ingestion Activity</h3>
              <p className="text-xs text-slate-500">Total reports vs. confirmed active blocks</p>
            </div>
            <span className="text-xs font-mono text-indigo-600 tabular-nums font-bold">
              LIVE TELEMETRY
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="threatGradLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="blockGradLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="reports" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#threatGradLight)" name="Reports" />
                <Area type="monotone" dataKey="blocked" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#blockGradLight)" name="Blocked" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Score Distribution */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-0.5">Threat Risk Score Distribution</h3>
              <p className="text-xs text-slate-500">Deterministic scoring classifier cohorts</p>
            </div>
            <span className="text-xs text-slate-500 font-mono">SCORES 0–100</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="range" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Detected Indicators" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Threats Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-0.5">Latest Flagged Threat Indicators</h3>
            <p className="text-xs text-slate-500">Scoped to {currentCompany?.name} brand assets</p>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            <span>View All Reports</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] bg-slate-50">
                <th className="py-2.5 px-3">Report ID</th>
                <th className="py-2.5 px-3">Threat Indicator</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Risk Score</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {companyReports.slice(0, 6).map((report) => (
                <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                    {report.id}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900 font-mono">
                      {report.indicator_value}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      {report.description}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-700 text-[11px]">
                    {report.threat_category}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold">
                    <span className={`tabular-nums ${
                      report.risk_score >= 85 ? 'text-rose-600' :
                      report.risk_score >= 60 ? 'text-amber-600' : 'text-slate-700'
                    }`}>
                      {report.risk_score}/100
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      report.status === 'blocked' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      report.status === 'confirmed' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                      report.status === 'under_review' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {report.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => {
                        if (onSelectReportForPassport) {
                          onSelectReportForPassport(report.id);
                        }
                        onNavigate('passport');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-indigo-600" />
                      <span>Passport</span>
                    </button>
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
