import React, { useState } from 'react';
import {
  Settings as SettingsIcon, Shield, Key, Bell, Cpu,
  CheckCircle2, RefreshCw, Smartphone, Fingerprint, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { currentCompany, currentUser } = useAuth();

  const [failedThreshold, setFailedThreshold] = useState(3);
  const [autoBlockThreshold, setAutoBlockThreshold] = useState(85);
  const [networkChoice, setNetworkChoice] = useState<'Polygon Amoy Testnet' | 'Local Hash Chain'>('Polygon Amoy Testnet');
  const [passkeyStatus, setPasskeyStatus] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto bg-transparent min-h-full text-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <span className="font-semibold text-indigo-600">Enterprise Policy Control</span>
          <span>·</span>
          <span>{currentCompany?.name} Config</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <span>Security Policy & System Settings</span>
        </h1>
        <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Configure IAM lockout thresholds, automated block score triggers, WebAuthn passkey policies, and cryptographic anchoring networks.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5 animate-fadeIn shadow-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Security policies updated and broadcast to all perimeter gateway nodes!</span>
        </div>
      )}

      {/* Profile & Organization Details */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-600" />
          <span>Enterprise Tenant Profile</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-sans mb-0.5">Company Name</div>
            <div className="text-slate-900 font-bold font-sans">{currentCompany?.name}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-sans mb-0.5">Official Root Domain</div>
            <div className="text-indigo-700 font-bold">{currentCompany?.official_domain}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-sans mb-0.5">Industry Classification</div>
            <div className="text-slate-800 font-bold font-sans">{currentCompany?.industry}</div>
          </div>
        </div>
      </div>

      {/* Passkey Security Setting */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">FIDO2 / WebAuthn Passkey Status</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Hardware-backed cryptographic origin binding (immune to phishing)
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
            ENROLLED & ACTIVE
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Authenticated Operator:</span>
            <span className="text-slate-900 font-semibold">{currentUser?.full_name} ({currentUser?.email})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Credential Type:</span>
            <span className="font-mono text-indigo-700 font-semibold">Public-Key Credential (ES256)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Biometric Template Policy:</span>
            <span className="text-slate-800 font-medium">Local Hardware Enclave (Never leaves device)</span>
          </div>
        </div>
      </div>

      {/* Threshold Policies Form */}
      <form onSubmit={handleSavePolicy} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-600" />
          <span>Automated Defense & Rate-Limiting Thresholds</span>
        </h3>

        <div className="space-y-4 text-xs">
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="font-semibold text-slate-700">
                Failed Login Lockout Strike Threshold
              </label>
              <span className="font-mono font-bold text-rose-600">{failedThreshold} Failed Attempts</span>
            </div>
            <input
              type="range"
              min={2}
              max={5}
              value={failedThreshold}
              onChange={(e) => setFailedThreshold(Number(e.target.value))}
              className="w-full accent-indigo-600 bg-slate-100 rounded-lg cursor-pointer"
            />
            <span className="text-[11px] text-slate-500 block mt-1">
              Employees reaching this threshold are automatically restricted and trigger a security alert to the company head.
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200">
            <div className="flex justify-between mb-1.5">
              <label className="font-semibold text-slate-700">
                Automated URL Block Risk Score Trigger
              </label>
              <span className="font-mono font-bold text-indigo-700">Score ≥ {autoBlockThreshold} / 100</span>
            </div>
            <input
              type="range"
              min={70}
              max={95}
              value={autoBlockThreshold}
              onChange={(e) => setAutoBlockThreshold(Number(e.target.value))}
              className="w-full accent-indigo-600 bg-slate-100 rounded-lg cursor-pointer"
            />
            <span className="text-[11px] text-slate-500 block mt-1">
              Newly triaged indicators scoring at or above this threshold will be automatically pushed to Protected Browsing.
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200">
            <label className="font-semibold text-slate-700 block mb-2">
              Blockchain Anchor Destination
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setNetworkChoice('Polygon Amoy Testnet')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                  networkChoice === 'Polygon Amoy Testnet'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="font-bold text-xs text-slate-900">Polygon Amoy Testnet</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Decentralized EVM Testnet</div>
              </button>

              <button
                type="button"
                onClick={() => setNetworkChoice('Local Hash Chain')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                  networkChoice === 'Local Hash Chain'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="font-bold text-xs text-slate-900">Local Immutable Hash Chain</div>
                <div className="text-[10px] text-slate-500 mt-0.5">High-speed on-premise fallback</div>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md shadow-purple-600/20 cursor-pointer"
          >
            Save Security Policy
          </button>
        </div>
      </form>
    </div>
  );
};
