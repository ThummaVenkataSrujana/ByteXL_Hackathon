import React, { useState } from 'react';
import {
  Network, Cpu, ShieldCheck, RefreshCw, CheckCircle2,
  ArrowUpRight, Lock, Database, Shield, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export const FederatedLearningPage: React.FC = () => {
  const { currentCompany } = useAuth();
  const { federatedRounds, runFederatedRound } = useData();

  const [isTraining, setIsTraining] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const latestRoundNumber = federatedRounds.length > 0
    ? Math.max(...federatedRounds.map(r => r.round_number))
    : 14;

  const globalAccuracy = federatedRounds.length > 0
    ? federatedRounds[federatedRounds.length - 1].global_accuracy
    : 92.4;

  const handleRunRound = async () => {
    setIsTraining(true);
    try {
      const newRound = await runFederatedRound();
      setSuccessToast(`Federated Round #${newRound.round_number} converged! Model weights aggregated with 0 raw data shared. Global Accuracy: ${newRound.global_accuracy}%`);
      setTimeout(() => setSuccessToast(null), 5000);
    } finally {
      setIsTraining(false);
    }
  };

  const clientNodes = [
    { name: 'NovaPay Node', industry: 'Fintech', status: 'Online', localAcc: 94.2, threats: 142 },
    { name: 'FinSecure Node', industry: 'Banking', status: 'Online', localAcc: 91.8, threats: 98 },
    { name: 'ShopShield Node', industry: 'E-Commerce', status: 'Online', localAcc: 93.5, threats: 85 },
    { name: 'MediTrust Node', industry: 'Healthcare', status: 'Online', localAcc: 89.4, threats: 41 },
    { name: 'EduSafe Node', industry: 'Education', status: 'Online', localAcc: 90.1, threats: 32 },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto bg-transparent min-h-full text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-indigo-600">Collaborative Intelligence</span>
            <span>·</span>
            <span>Privacy-Preserving Consensus</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Network className="w-5 h-5" />
            </div>
            <span>Federated Threat Learning</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Decentralized threat intelligence training across 5 independent enterprise nodes. Companies share encrypted gradient model weights—never raw customer logs, transaction values, or credentials.
          </p>
        </div>

        <button
          onClick={handleRunRound}
          disabled={isTraining}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          {isTraining ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Aggregating Gradients...</span>
            </>
          ) : (
            <>
              <Cpu className="w-4 h-4" />
              <span>Execute Round #{latestRoundNumber + 1}</span>
            </>
          )}
        </button>
      </div>

      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5 animate-fadeIn shadow-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Mandatory Prototype Disclaimer Callout */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-3 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
        <div className="leading-relaxed">
          <strong className="text-slate-900">Differential Privacy Guarantee: </strong>
          “Simulated federated learning for hackathon prototype. Raw company data remains local.”
        </div>
      </div>

      {/* Global Model Performance Banner */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 mb-1 font-mono">
            <span>AGGREGATED MODEL STATE</span>
            <span>·</span>
            <span>ROUND #{latestRoundNumber}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
            Global Phishing & Impersonation Model
          </h2>
          <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
            Combined multi-industry defense capability trained over banking homoglyphs, fintech quishing lures, healthcare credential scrapers, and e-commerce counterfeit stores.
          </p>
        </div>

        <div className="flex items-center gap-4 text-center shrink-0">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 min-w-[140px]">
            <div className="font-mono text-4xl font-extrabold text-emerald-600 tabular-nums">
              {globalAccuracy}%
            </div>
            <div className="text-[11px] text-slate-600 font-semibold mt-1">Global Accuracy</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 min-w-[140px]">
            <div className="font-mono text-4xl font-extrabold text-indigo-600 tabular-nums">
              0
            </div>
            <div className="text-[11px] text-slate-600 font-semibold mt-1">Raw Records Shared</div>
          </div>
        </div>
      </div>

      {/* 5 Participating Enterprise Nodes */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          Participating Client Nodes ({clientNodes.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {clientNodes.map((client, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-white border transition-colors flex flex-col justify-between shadow-xs ${
                currentCompany?.name.includes(client.name)
                  ? 'border-indigo-400 ring-2 ring-indigo-50'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    {client.industry}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold font-mono">
                    {client.status}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">{client.name}</h4>
                <div className="text-xs text-slate-500 mb-4">
                  {client.threats} local samples trained
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">Local Accuracy</span>
                <span className="font-mono font-bold text-indigo-700 text-sm tabular-nums">
                  {client.localAcc}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Federated Training Rounds History Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          Federated Epoch Training Log
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] bg-slate-50">
                <th className="py-2.5 px-3">Round #</th>
                <th className="py-2.5 px-3">Aggregated Node</th>
                <th className="py-2.5 px-3 font-mono">Model Weights Hash</th>
                <th className="py-2.5 px-3 text-right">Local Accuracy</th>
                <th className="py-2.5 px-3 text-right">Global Consensus</th>
                <th className="py-2.5 px-3 text-center">Raw Records Shared</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 font-mono text-[11px]">
              {federatedRounds.slice(0, 10).map((rnd) => (
                <tr key={rnd.id} className="hover:bg-slate-50 transition-colors font-sans">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-600">
                    Round #{rnd.round_number}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {rnd.company_name}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500 text-xs">
                    {rnd.model_update_hash}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700 tabular-nums">
                    {rnd.local_accuracy}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 tabular-nums">
                    {rnd.global_accuracy}%
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-500">
                    0 (Zero Leakage)
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
