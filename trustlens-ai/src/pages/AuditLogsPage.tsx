import React, { useState } from 'react';
import {
  History, Search, Filter, Download, ShieldCheck,
  Clock, Hash, Key, Ban, UserCheck, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export const AuditLogsPage: React.FC = () => {
  const { currentCompany } = useAuth();
  const { auditLogs } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  // Scoped to current company
  const companyLogs = auditLogs.filter(l => l.company_id === currentCompany?.id);
  const filteredLogs = companyLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (log.user_email && log.user_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          log.target_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TrustLens_Audit_Trail_${currentCompany?.name}_${Date.now()}.json`;
    a.click();
  };

  const actionsList = [
    'all',
    'login_success',
    'login_failure',
    'account_restricted',
    'report_created',
    'threat_blocked',
    'blockchain_anchored',
    'zk_proof_generated',
    'chatbot_alert_dispatched',
    'federated_round_completed'
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto bg-transparent min-h-full text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-indigo-600">Compliance & Accountability</span>
            <span>·</span>
            <span>{currentCompany?.name} Ledgers</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs">
              <History className="w-5 h-5" />
            </div>
            <span>Immutable Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Append-only record of security interventions, authentication decisions, automated threat blocking, blockchain anchors, and chatbot actions.
          </p>
        </div>

        <button
          onClick={handleExportJson}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Log (JSON)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, user email, ID, or target..."
            className="w-full bg-slate-50 border border-slate-250 focus:border-indigo-500 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar">
          {actionsList.slice(0, 5).map((act) => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors cursor-pointer ${
                actionFilter === act
                  ? 'bg-purple-600 text-white shadow-xs font-semibold'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {act.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] bg-slate-50">
                <th className="py-3 px-4 font-mono">Timestamp</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Actor Identity</th>
                <th className="py-3 px-4 font-mono">Target ID</th>
                <th className="py-3 px-4 font-mono">IP & Origin</th>
                <th className="py-3 px-4">Metadata Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-500 font-sans">
                    No audit records match your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors font-sans">
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        log.action.includes('blocked') || log.action.includes('restricted')
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : log.action.includes('blockchain') || log.action.includes('zk')
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : log.action.includes('login')
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-medium">
                      {log.user_email || 'System Daemon'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {log.target_id}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 text-xs">
                      {log.ip_address} ({log.device.split(' ')[0]})
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[10px] max-w-xs truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
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
