import React, { useState } from 'react';
import {
  Building2, Globe, Mail, AtSign, Smartphone, Plus,
  CheckCircle2, XCircle, ShieldCheck, AlertCircle, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { OfficialAsset } from '../types';

export const BrandRegistryPage: React.FC = () => {
  const { currentCompany } = useAuth();
  const { officialAssets, addOfficialAsset } = useData();

  const [filterType, setFilterType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newAssetType, setNewAssetType] = useState<OfficialAsset['asset_type']>('domain');
  const [newAssetValue, setNewAssetValue] = useState('');
  const [newAssetNotes, setNewAssetNotes] = useState('');
  const [isAllowlisted, setIsAllowlisted] = useState(true);

  // Scoped to current company
  const companyAssets = officialAssets.filter(a => a.company_id === currentCompany?.id);
  const filteredAssets = filterType === 'all'
    ? companyAssets
    : companyAssets.filter(a => a.asset_type === filterType);

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetValue.trim() || !currentCompany) return;

    addOfficialAsset({
      company_id: currentCompany.id,
      asset_type: newAssetType,
      asset_value: newAssetValue.trim(),
      is_allowlisted: isAllowlisted,
      notes: newAssetNotes.trim(),
    });

    setNewAssetValue('');
    setNewAssetNotes('');
    setShowAddModal(false);
  };

  const getAssetIcon = (type: OfficialAsset['asset_type']) => {
    switch (type) {
      case 'domain': return Globe;
      case 'email_domain': return Mail;
      case 'social_handle': return AtSign;
      case 'app_id': return Smartphone;
      default: return ShieldCheck;
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto bg-transparent min-h-full text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Identity Trust Architecture</span>
            <span>·</span>
            <span className="text-indigo-600 font-semibold">{currentCompany?.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Brand Trust Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Register your official digital assets (domains, social handles, mobile bundle IDs). The threat scanner references this allowlist to eliminate false positives.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register Official Asset</span>
        </button>
      </div>

      {/* Brand Identity Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Registered Enterprise Identity
          </span>
          <div className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>{currentCompany?.name}</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED ORIGIN
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-2">
            <span>Official Domain: <strong className="text-indigo-600 font-mono">{currentCompany?.official_domain}</strong></span>
            <span>·</span>
            <span>Industry Sector: <strong className="text-slate-700">{currentCompany?.industry}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[120px]">
            <div className="font-mono text-xl font-bold text-indigo-600 tabular-nums">
              {companyAssets.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Allowlisted Assets</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[120px]">
            <div className="font-mono text-xl font-bold text-emerald-600 tabular-nums">
              100%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Scanner Trust</div>
          </div>
        </div>
      </div>

      {/* Assets Table Section */}
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg text-xs shadow-2xs">
            {['all', 'domain', 'email_domain', 'social_handle', 'app_id', 'partner_domain'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-md font-medium capitalize transition-colors cursor-pointer ${
                  filterType === t
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 font-mono">
            Showing {filteredAssets.length} of {companyAssets.length} registered assets
          </span>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] bg-slate-50">
                  <th className="py-3 px-4">Asset Type</th>
                  <th className="py-3 px-4">Official Value</th>
                  <th className="py-3 px-4">Allowlist Status</th>
                  <th className="py-3 px-4">Operational Notes</th>
                  <th className="py-3 px-4 text-right">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-500">
                      No assets found for the selected category.
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset) => {
                    const Icon = getAssetIcon(asset.asset_type);
                    return (
                      <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-semibold text-slate-900 capitalize">
                              {asset.asset_type.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                          {asset.asset_value}
                        </td>
                        <td className="py-3.5 px-4">
                          {asset.is_allowlisted ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Allowlisted (0 Risk)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-amber-600 font-semibold">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Monitoring Only</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                          {asset.notes || 'Official corporate asset'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-400 text-[11px]">
                          {new Date(asset.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fadeIn">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Register Official Brand Asset
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Add a trusted domain, social handle, or app ID for {currentCompany?.name}.
            </p>

            <form onSubmit={handleCreateAsset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Asset Category
                </label>
                <select
                  value={newAssetType}
                  onChange={(e) => setNewAssetType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-250 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none"
                >
                  <option value="domain">Official Domain (e.g. pay.novapay.com)</option>
                  <option value="email_domain">Corporate Email Domain (e.g. novapay.com)</option>
                  <option value="social_handle">Verified Social Handle (e.g. @NovaPayOfficial)</option>
                  <option value="app_id">Mobile Bundle ID (e.g. com.novapay.mobile)</option>
                  <option value="partner_domain">Trusted Partner Domain (e.g. checkout.stripe.com)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Asset Value
                </label>
                <input
                  type="text"
                  required
                  value={newAssetValue}
                  onChange={(e) => setNewAssetValue(e.target.value)}
                  placeholder="e.g. auth.novapay.com"
                  className="w-full bg-slate-50 border border-slate-250 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Operational Notes (Optional)
                </label>
                <input
                  type="text"
                  value={newAssetNotes}
                  onChange={(e) => setNewAssetNotes(e.target.value)}
                  placeholder="e.g. Secondary identity provider gateway"
                  className="w-full bg-slate-50 border border-slate-250 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="allowlistCheck"
                  checked={isAllowlisted}
                  onChange={(e) => setIsAllowlisted(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="allowlistCheck" className="text-xs text-slate-700 cursor-pointer">
                  Immediately allowlist (0 risk score in threat scanner)
                </label>
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
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-purple-600/25 cursor-pointer"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
