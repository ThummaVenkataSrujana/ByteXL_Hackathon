import React, { useState } from 'react';
import {
  Ban, Search, Plus, Trash2, ExternalLink, ShieldAlert,
  CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface BlocklistPageProps {
  onNavigate: (view: string) => void;
  onOpenProtectedUrl: (url: string) => void;
}

export const BlocklistPage: React.FC<BlocklistPageProps> = ({ onNavigate, onOpenProtectedUrl }) => {
  const { currentCompany, currentUser } = useAuth();
  const { blocklist, addToBlocklist, removeFromBlocklist } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newType, setNewType] = useState<'url' | 'logo' | 'phone' | 'email'>('url');

  // Scoped to current company
  const companyBlocklist = blocklist.filter(b => b.company_id === currentCompany?.id);

  const filteredBlocklist = companyBlocklist.filter(item =>
    item.indicator_value.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim() || !currentCompany) return;

    await addToBlocklist({
      company_id: currentCompany.id,
      indicator_value: newUrl.trim(),
      indicator_type: newType,
      risk_score: 95,
      reason: newReason.trim() || 'Manual corporate block enforced by security lead.',
      threat_category: newType === 'phone' ? 'Fake Support / Vishing' : newType === 'email' ? 'Executive Impersonation' : newType === 'logo' ? 'Brand Impersonation / Phishing' : 'Credential Harvesting',
      status: 'active',
      expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
      blocked_by: currentUser?.full_name || 'Security Lead',
    });

    setNewUrl('');
    setNewReason('');
    setShowAddModal(false);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto bg-transparent min-h-full text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-indigo-600">Interception Gateway</span>
            <span>·</span>
            <span>{currentCompany?.name} Perimeter</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-2xs">
              <Ban className="w-5 h-5" />
            </div>
            <span>Enterprise Blocklist</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Active high-threat indicators blocked across TrustLens Protected Browsing. Automatically blocks indicators with risk scores ≥ 85 and anchors block evidence cryptographically.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all shadow-md shadow-rose-600/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Block</span>
        </button>
      </div>

      {/* Search and Summary */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search active blocklist indicators or reasons..."
            className="w-full bg-slate-50 border border-slate-250 focus:border-indigo-500 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="text-xs text-slate-500 font-mono whitespace-nowrap font-medium">
          {companyBlocklist.length} Blocked Targets · 100% Policy Enforced
        </div>
      </div>

      {/* Blocklist Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] bg-slate-50">
                <th className="py-3 px-4">Blocked Indicator</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Risk Score</th>
                <th className="py-3 px-4">Blocking Authority</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4 text-right">Protected Gateway</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filteredBlocklist.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-500">
                    No active blocked items match your search.
                  </td>
                </tr>
              ) : (
                filteredBlocklist.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-700">
                      {item.indicator_value}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.indicator_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 text-[11px]">
                      {item.threat_category}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600 tabular-nums">
                      {item.risk_score}/100
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                      {item.blocked_by}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px] max-w-xs truncate">
                      {item.reason}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {item.indicator_type === 'url' ? (
                        <button
                          onClick={() => onOpenProtectedUrl(item.indicator_value)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 border border-indigo-200"
                        >
                          <span>Test Gate</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Enforced</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => removeFromBlocklist(item.id)}
                        title="Unblock threat"
                        className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Block Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fadeIn">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Add Target to Enterprise Blocklist
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Force interception across perimeter gateways for {currentCompany?.name}.
            </p>

            <form onSubmit={handleAddBlock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Indicator Vector
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                >
                  <option value="url">URL / Domain</option>
                  <option value="logo">Counterfeit Logo Trademark</option>
                  <option value="phone">Vishing Phone Number</option>
                  <option value="email">Phishing Email Address</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Indicator Value
                </label>
                <input
                  type="text"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="e.g. rogue-phishing-login.com or +1-800-555-0199"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Blocking Justification
                </label>
                <input
                  type="text"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="e.g. Stolen brand graphics detected in email lure"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors shadow-md shadow-rose-600/20 cursor-pointer"
                >
                  Block & Anchor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
