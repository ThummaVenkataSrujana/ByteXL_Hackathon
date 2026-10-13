import React, { useState } from 'react';
import {
  Shield, Lock, Eye, AlertOctagon, ArrowRight, CheckCircle2,
  ExternalLink, Sparkles, Cpu, Layers, Database, Globe, Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SEED_COMPANIES } from '../data/seedData';
import { analyzeThreat } from '../services/scannerService';

interface LandingPageProps {
  onEnterApp: () => void;
  onGoToLogin: () => void;
  onGoToRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onGoToLogin, onGoToRegister }) => {
  const { switchUserQuick } = useAuth();
  const [quickScanUrl, setQuickScanUrl] = useState('novapay-secure-login.com');
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleQuickScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const res = analyzeThreat(quickScanUrl, 'url', [], ['novapay-secure-login.com']);
      setScanResult(res);
      setIsScanning(false);
    }, 450);
  };

  const securityLoop = [
    { step: '01', title: 'Detect', desc: 'Scan lookalike URLs, quishing QR codes, copycat apps & fake logos' },
    { step: '02', title: 'Explain', desc: 'Gemini AI reasoning uncovers domain intent & OSINT attribution' },
    { step: '03', title: 'Report', desc: 'Multi-company fraud center with automated duplicate clustering' },
    { step: '04', title: 'Verify', desc: 'Lead analyst triage workflow with selective proof verification' },
    { step: '05', title: 'Alert', desc: 'Instant high-severity notifications to company security heads' },
    { step: '06', title: 'Block', desc: 'Automatic containment via Protected Browsing interception gateway' },
    { step: '07', title: 'Prove', desc: 'SHA-256 blockchain evidence anchoring on Polygon testnet' },
    { step: '08', title: 'Audit', desc: 'Zero-knowledge selective disclosure and immutable event trails' },
    { step: '09', title: 'Learn', desc: 'Privacy-preserving federated threat learning with zero raw data sharing' },
  ];

  return (
    <div className="min-h-screen bg-transparent text-slate-900 flex flex-col relative overflow-hidden">
      {/* Ambient Aqua-Blue Shade at Corners of the Screen */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-28 -left-28 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -top-28 -right-28 w-80 h-80 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute -bottom-28 -left-28 w-80 h-80 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="absolute -bottom-28 -right-28 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl" />
      </div>

      {/* Landing Header */}
      <header className="h-20 border-b border-slate-200 px-6 lg:px-12 flex items-center justify-between gap-8 sticky top-0 bg-white/95 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 block">TrustLens AI</span>
            <span className="text-[11px] text-slate-500 block -mt-0.5">Multi-Company Security Platform</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
          <a href="#features" className="hover:text-purple-600 transition-colors">Core Features</a>
          <a href="#loop" className="hover:text-purple-600 transition-colors">Security Loop</a>
          <a href="#companies" className="hover:text-purple-600 transition-colors">Participating Brands</a>
          <a href="#scanner-demo" className="hover:text-purple-600 transition-colors">Live Threat Engine</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onGoToLogin}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={onEnterApp}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-md shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 lg:px-12 max-w-7xl mx-auto w-full text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs text-purple-700 mb-8 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Hackathon Edition · 24/7 AI Security Assistant & Multi-Tenant Brand Defense</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight mb-6">
          Detect the Threat. Verify the Identity. Alert the Right People. Protect the Brand.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          TrustLens AI defends enterprise brands against impersonation, credential harvesting, copycat logos, quishing QR codes, lookalike domains, and insider login risk with cryptographic evidence anchoring.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <button
            onClick={onEnterApp}
            className="px-7 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-600/25 flex items-center gap-2 cursor-pointer"
          >
            <span>Open Security Console</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              switchUserQuick('head1@novapay.com');
              onEnterApp();
            }}
            className="px-7 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-semibold text-sm transition-colors cursor-pointer"
          >
            Sign in as NovaPay Head (Demo)
          </button>
        </div>

        {/* Quick Threat Scanner Widget */}
        <div id="scanner-demo" className="max-w-3xl mx-auto p-6 rounded-2xl bg-white border border-slate-200 shadow-xl text-left">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Interactive Threat Intelligence Probe</span>
            </div>
            <span className="text-[11px] text-indigo-700 font-mono font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              LIVE PREVIEW
            </span>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={quickScanUrl}
              onChange={(e) => setQuickScanUrl(e.target.value)}
              placeholder="Enter suspicious URL or domain (e.g. novapay-secure-login.com)..."
              className="flex-1 bg-slate-50 border border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            <button
              onClick={handleQuickScan}
              disabled={isScanning}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-sm shadow-purple-600/20 cursor-pointer shrink-0"
            >
              {isScanning ? 'Probing...' : 'Analyze Threat'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 mb-4">
            <span>Try sample indicators:</span>
            <button
              onClick={() => setQuickScanUrl('novapay-secure-login.com')}
              className="text-indigo-600 hover:underline cursor-pointer font-medium"
            >
              novapay-secure-login.com
            </button>
            <span>·</span>
            <button
              onClick={() => setQuickScanUrl('novapay.com')}
              className="text-emerald-600 hover:underline cursor-pointer font-medium"
            >
              novapay.com (Official)
            </button>
            <span>·</span>
            <button
              onClick={() => setQuickScanUrl('https://qr-pay-novapay.net/confirm?tx=8894')}
              className="text-amber-600 hover:underline cursor-pointer font-medium"
            >
              qr-pay-novapay.net (Quishing)
            </button>
          </div>

          {scanResult && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs animate-fadeIn">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-900">
                  Indicator: <span className="font-mono text-indigo-700">{scanResult.indicator}</span>
                </span>
                <span className={`px-2.5 py-0.5 rounded font-mono font-bold text-xs ${
                  scanResult.risk_score >= 80 ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                  scanResult.risk_score === 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  RISK: {scanResult.risk_score}/100 ({scanResult.confidence} Confidence)
                </span>
              </div>
              <p className="text-slate-600 mb-3 leading-relaxed">
                {scanResult.explanation}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {scanResult.evidence_signals.map((sig: string, i: number) => (
                  <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                    {sig}
                  </span>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Recommended Action: <strong className="text-slate-800">{scanResult.recommended_action}</strong></span>
                <button
                  onClick={onEnterApp}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  View in Evidence Passport <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Security Loop Workflow */}
      <section id="loop" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full border-t border-slate-200">
        <div className="text-center mb-16">
          <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
            The TrustLens Security Loop
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Detect → Explain → Report → Verify → Alert → Block → Prove → Audit → Learn
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            A continuous enterprise closed-loop response system that stops fraud before it damages customers and brand equity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {securityLoop.map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 transition-colors shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xl font-bold text-indigo-600">{item.step}</span>
                <span className="text-xs text-slate-400 font-mono">PHASE {item.step}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Participating Multi-Company Network */}
      <section id="companies" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full border-t border-slate-200">
        <div className="text-center mb-16">
          <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
            Multi-Tenant Isolation
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
            5 Registered Enterprise Organizations
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Each company's telemetry, reports, and employee records are strictly separated with zero-leakage access control.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {SEED_COMPANIES.map((comp) => (
            <div
              key={comp.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between shadow-xs hover:border-indigo-300 transition-colors"
            >
              <div>
                <div className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded uppercase tracking-wider mb-2 inline-block">
                  {comp.industry}
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">{comp.name}</h4>
                <div className="text-xs font-mono text-slate-500 mb-4">{comp.official_domain}</div>
              </div>
              <button
                onClick={() => {
                  const demoEmail = comp.id === 'comp-novapay' ? 'head1@novapay.com' :
                    comp.id === 'comp-finsecure' ? 'head2@finsecurebank.com' :
                    comp.id === 'comp-shopshield' ? 'head3@shopshield.com' :
                    comp.id === 'comp-meditrust' ? 'head4@meditrust.com' : 'head5@edusafe.com';
                  switchUserQuick(demoEmail);
                  onEnterApp();
                }}
                className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
              >
                Log in as Head
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 px-6 lg:px-12 py-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 bg-white">
        <div>
          © 2026 TrustLens AI Inc. All rights reserved. Built for enterprise brand fraud defense.
        </div>
        <div className="flex items-center gap-6">
          <button onClick={onGoToLogin} className="hover:text-slate-800 cursor-pointer">Login Portal</button>
          <span>·</span>
          <button onClick={onEnterApp} className="hover:text-slate-800 cursor-pointer">Security Dashboard</button>
          <span>·</span>
          <span>FIDO2 / WebAuthn Certified</span>
        </div>
      </footer>
    </div>
  );
};
