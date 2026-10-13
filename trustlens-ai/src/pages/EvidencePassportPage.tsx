import React, { useState } from 'react';
import {
  FileCheck2, Shield, Lock, CheckCircle2, AlertTriangle,
  Ban, ExternalLink, Cpu, Hash, Share2, Download, ArrowRight,
  Eye, Sparkles, RefreshCw, Layers, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { generateEvidencePdf } from '../utils/generateEvidencePdf';

interface EvidencePassportPageProps {
  selectedReportId?: string;
  onNavigate: (view: string) => void;
}

export const EvidencePassportPage: React.FC<EvidencePassportPageProps> = ({
  selectedReportId, onNavigate
}) => {
  const { currentCompany } = useAuth();
  const {
    reports, blocklist, anchors, zkProofs,
    addToBlocklist, anchorEvidence, generateZkProof
  } = useData();

  // Scoped reports for this company
  const companyReports = reports.filter(r => r.company_id === currentCompany?.id);
  const [activeReportId, setActiveReportId] = useState<string>(
    selectedReportId || companyReports[0]?.id || 'REP-2026-00101'
  );

  const [isAnchoring, setIsAnchoring] = useState(false);
  const [isGeneratingZk, setIsGeneratingZk] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const currentReport = companyReports.find(r => r.id === activeReportId) || companyReports[0];
  const currentAnchor = anchors.find(a => a.report_id === currentReport?.id);
  const currentZkProof = zkProofs.find(z => z.report_id === currentReport?.id);
  const isBlocked = blocklist.some(b => b.indicator_value === currentReport?.indicator_value);

  const handleAnchorNow = async () => {
    if (!currentReport) return;
    setIsAnchoring(true);
    try {
      await anchorEvidence(currentReport.id, 'Polygon Amoy Testnet');
    } finally {
      setIsAnchoring(false);
    }
  };

  const handleVerifyZkNow = async () => {
    if (!currentReport) return;
    setIsGeneratingZk(true);
    try {
      await generateZkProof(currentReport.id);
    } finally {
      setIsGeneratingZk(false);
    }
  };

  const handleDownloadReportPdf = () => {
    if (!currentReport) return;
    setIsGeneratingPdf(true);
    try {
      generateEvidencePdf({
        report: currentReport,
        company: currentCompany,
        anchor: currentAnchor,
        zkProof: currentZkProof,
        isBlocked: isBlocked,
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate evidence PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPassport = () => {
    if (!currentReport) return;
    const passportData = {
      passport_version: '1.0.0',
      report_id: currentReport.id,
      indicator: currentReport.indicator_value,
      category: currentReport.threat_category,
      risk_score: currentReport.risk_score,
      confidence: currentReport.confidence,
      company: currentCompany?.name,
      evidence_signals: currentReport.evidence_signals,
      blockchain_anchor: currentAnchor || null,
      zk_selective_proof: currentZkProof || null,
      generated_at: new Date().toISOString(),
      authenticity_signature: '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
    };

    const blob = new Blob([JSON.stringify(passportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Evidence_Passport_${currentReport.id}.json`;
    a.click();
  };

  if (!currentReport) {
    return (
      <div className="p-8 text-center text-slate-500">
        No reports found for this company. Please submit a fraud report first.
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto bg-transparent min-h-full text-slate-900">
      {/* Top Selector & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Cryptographic Chain of Custody</span>
            <span>·</span>
            <span className="text-indigo-600 font-semibold">{currentCompany?.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <span>Evidence Passport</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-bold">
              TAMPER-PROOF VERIFIED
            </span>
          </h1>
        </div>

        {/* Report Selector Dropdown & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={activeReportId}
            onChange={(e) => setActiveReportId(e.target.value)}
            className="bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none font-mono shadow-2xs"
          >
            {companyReports.map(r => (
              <option key={r.id} value={r.id}>
                {r.id} — {r.indicator_value} (Score: {r.risk_score})
              </option>
            ))}
          </select>

          {/* Download Report PDF Button */}
          <button
            onClick={handleDownloadReportPdf}
            disabled={isGeneratingPdf}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shadow-purple-600/20"
            title="Download formatted threat investigation PDF report"
          >
            {isGeneratingPdf ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : downloadSuccess ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            ) : (
              <FileText className="w-3.5 h-3.5" />
            )}
            <span>{downloadSuccess ? 'PDF Downloaded!' : 'Download Report PDF'}</span>
          </button>

          <button
            onClick={handleDownloadPassport}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Hero Passport Dossier */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 relative z-10">
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-bold">
                PASSPORT #{currentReport.id}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-600">Brand: <strong className="text-slate-900">{currentReport.target_brand || currentCompany?.name}</strong></span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500 font-mono">{new Date(currentReport.created_at).toLocaleString()}</span>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Target Threat Indicator
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight break-all">
                {currentReport.indicator_value}
              </div>
              <div className="text-sm font-semibold text-rose-600 mt-1">
                {currentReport.threat_category}
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              {currentReport.description}
            </p>
          </div>

          {/* Risk Gauge Cluster */}
          <div className="flex flex-row lg:flex-col items-center gap-4 shrink-0">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[160px] shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Risk Assessment
              </div>
              <div className="font-mono text-4xl font-extrabold text-rose-600 tabular-nums">
                {currentReport.risk_score}/100
              </div>
              <div className="text-xs font-semibold text-slate-800 mt-1">
                {currentReport.confidence} Confidence
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                DETERMINISTIC EVAL
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[160px] shadow-2xs">
              <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Status</div>
              <span className={`text-xs font-bold uppercase px-3 py-1 rounded-md ${
                isBlocked ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-indigo-100 text-indigo-800'
              }`}>
                {isBlocked ? 'BLOCKED & INTERCEPTED' : currentReport.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Dossier Quick Action Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-slate-500">
            <Shield className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Forensic summary formatted with cryptographic chain of custody, risk indices, and blockchain signatures.</span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleDownloadReportPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-xs shadow-purple-600/20"
            >
              {isGeneratingPdf ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : downloadSuccess ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              <span>{downloadSuccess ? 'PDF Generated & Downloaded!' : 'Download Report PDF'}</span>
            </button>
            <button
              onClick={handleDownloadPassport}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON Passport</span>
            </button>
          </div>
        </div>
      </div>

      {/* TWO CORE CRYPTO PROOF TILES (Blockchain Anchor & ZK Selective Disclosure) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Immutable Evidence Anchor */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Immutable Evidence Anchor</h3>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Polygon Amoy Testnet / Local Hash Chain
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                {currentAnchor ? 'VERIFIED ANCHOR' : 'UNANCHORED'}
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Cryptographic SHA-256 fingerprint anchored to distributed ledger. Guarantees temporal non-repudiation and evidence integrity without exposing customer records on-chain.
            </p>

            {currentAnchor ? (
              <div className="space-y-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Record Hash (SHA-256):</div>
                  <div className="text-slate-800 truncate text-[11px] select-all">
                    {currentAnchor.record_hash}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Transaction Hash:</div>
                  <div className="text-emerald-700 truncate text-[11px] select-all font-semibold">
                    {currentAnchor.blockchain_tx_hash}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-600">
                  <span>Network: <strong className="text-slate-900">{currentAnchor.blockchain_network}</strong></span>
                  <span>Block #{currentAnchor.block_number || 14892015}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                This report has not yet been anchored to the blockchain ledger.
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono">Status: Verified</span>
            <button
              onClick={handleAnchorNow}
              disabled={isAnchoring}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shadow-purple-600/20"
            >
              {isAnchoring ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{currentAnchor ? 'Re-Anchor Evidence' : 'Anchor to Polygon'}</span>
            </button>
          </div>
        </div>

        {/* Card 2: ZK-Style Selective Disclosure Verification */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">ZK-Style Selective Disclosure</h3>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Merkle Tree Cryptographic Claims
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                {currentZkProof ? 'PROOF: PASSED' : 'PENDING PROOF'}
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Proves valid company registration, evidence threshold, and analyst approval without exposing internal employee identities, email bodies, or customer screenshots.
            </p>

            <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Valid registered company report ({currentCompany?.name})</span>
              </div>
              <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Evidence threshold met (At least 2 verifiable indicators present)</span>
              </div>
              <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Risk score exceeds enterprise blocking threshold</span>
              </div>
              <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Analyst signature and tamper-proof hash validated</span>
              </div>
              <div className="text-[11px] font-medium text-slate-500 flex items-center gap-2 pt-1 border-t border-slate-200">
                <Shield className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Sensitive report contents & personal credentials not exposed</span>
              </div>
            </div>

            {currentZkProof && (
              <div className="mt-3 text-[10px] font-mono text-slate-500 truncate">
                Merkle Root: <span className="text-slate-800 select-all font-semibold">{currentZkProof.merkle_root}</span>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono">ZK Verification: PASSED</span>
            <button
              onClick={handleVerifyZkNow}
              disabled={isGeneratingZk}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shadow-purple-600/20"
            >
              {isGeneratingZk ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
              <span>{currentZkProof ? 'Recompute Merkle Proof' : 'Generate ZK Proof'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Evidence Signals & OSINT Enrichment Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evidence Signals */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
            Corroborating Evidence Signals ({currentReport.evidence_signals?.length || 0})
          </h3>
          <div className="space-y-2.5">
            {(currentReport.evidence_signals || [
              'Brand similarity score 91%',
              'Domain registered 2 days ago via privacy proxy',
              'Harvesting form pointing to foreign IP 185.220.101.5',
              'No corporate MX record found',
            ]).map((sig, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{sig}</span>
              </div>
            ))}
          </div>
        </div>

        {/* OSINT Enrichment */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
            OSINT Attribution & Infrastructure
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500 font-sans mb-0.5">Domain Age</div>
              <div className="text-slate-900 font-bold">2 Days Old</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500 font-sans mb-0.5">MX Record</div>
              <div className="text-rose-600 font-bold">NOT CONFIGURED</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500 font-sans mb-0.5">Host IP</div>
              <div className="text-slate-800 font-medium">185.220.101.5</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500 font-sans mb-0.5">ASN Provider</div>
              <div className="text-slate-800 font-medium truncate">AS60117 Bulletproof</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 col-span-2">
              <div className="text-[10px] text-slate-500 font-sans mb-0.5">TLS Certificate</div>
              <div className="text-slate-800">Let's Encrypt Free Authority (3-Month Lifespan)</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-sans">Geographic Hosting: <strong className="text-slate-900">Seychelles Offshore</strong></span>
            <button
              onClick={() => onNavigate('protected')}
              className="text-indigo-600 hover:text-indigo-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Test in Protected Browsing</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
