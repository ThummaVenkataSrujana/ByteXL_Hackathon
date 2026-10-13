import React, { useState, useRef } from 'react';
import {
  ShieldAlert, Globe, Mail, Phone, AtSign, Smartphone, QrCode,
  Image as ImageIcon, ArrowRight, CheckCircle2, AlertTriangle,
  Ban, Flag, FileCheck2, Cpu, ExternalLink, RefreshCw, Sparkles,
  Upload, Eye, Palette, Hash, Layers, ShieldCheck, XCircle, Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { analyzeThreat, ScanResult } from '../services/scannerService';
import {
  BRAND_REGISTRY_DATABASE,
  LogoAnalysisResult,
  analyzeLogoAsset,
  OfficialRegistryAsset
} from '../services/intelligenceService';

interface ThreatScannerPageProps {
  onNavigate: (view: string) => void;
  onSelectReportForPassport?: (reportId: string) => void;
}

export const ThreatScannerPage: React.FC<ThreatScannerPageProps> = ({ onNavigate, onSelectReportForPassport }) => {
  const { currentCompany } = useAuth();
  const { officialAssets, blocklist, addToBlocklist, addFraudReport } = useData();

  // Active indicator type
  const [indicatorType, setIndicatorType] = useState<ScanResult['indicator_type']>('url');
  const [indicatorInput, setIndicatorInput] = useState('novapay-secure-login.com');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(() => {
    return analyzeThreat(
      'novapay-secure-login.com',
      'url',
      officialAssets,
      blocklist.map(b => b.indicator_value)
    );
  });
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // =========================================================================
  // IMAGE-ANALYSIS SIMULATION STATE (Brand Trust Registry Cross-Reference)
  // =========================================================================
  const [targetBrand, setTargetBrand] = useState<string>(currentCompany?.name || 'NovaPay');
  const [uploadedLogoName, setUploadedLogoName] = useState<string>('novapay_clone_phishing_logo.png');
  const [uploadedLogoPreview, setUploadedLogoPreview] = useState<string | null>(
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=240&auto=format&fit=crop&q=80'
  );
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isAnalyzingLogo, setIsAnalyzingLogo] = useState(false);
  const [logoAnalysisResult, setLogoAnalysisResult] = useState<LogoAnalysisResult | null>(() =>
    analyzeLogoAsset('novapay_clone_phishing_logo.png', currentCompany?.name || 'NovaPay', undefined, 'file_upload')
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeBlockedValues = blocklist.map(b => b.indicator_value);

  // =========================================================================
  // STANDARD THREAT SCAN (URL, QR, Email, App, Phone, Social)
  // =========================================================================
  const handleScan = (indicatorToScan?: string, typeToScan?: ScanResult['indicator_type']) => {
    const val = indicatorToScan !== undefined ? indicatorToScan : indicatorInput;
    const type = typeToScan !== undefined ? typeToScan : indicatorType;
    if (!val.trim()) return;

    setIsScanning(true);
    setActionNotice(null);

    setTimeout(() => {
      const res = analyzeThreat(val, type, officialAssets, activeBlockedValues);
      setScanResult(res);
      setIsScanning(false);
    }, 400);
  };

  const handleBlockThreat = async () => {
    if (!scanResult || !currentCompany) return;

    const blockedItem = await addToBlocklist({
      company_id: currentCompany.id,
      indicator_value: scanResult.indicator,
      indicator_type: scanResult.indicator_type,
      risk_score: scanResult.risk_score,
      reason: `Blocked via AI Threat Scanner: ${scanResult.threat_category} (Score: ${scanResult.risk_score})`,
      threat_category: scanResult.threat_category,
      status: 'active',
      expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
      blocked_by: 'Threat Scanner Operator',
    });

    setActionNotice(`Threat blocked successfully! Anchored to Polygon Amoy Testnet with ID ${blockedItem.id}.`);
    setScanResult({ ...scanResult, is_blocked: true });
  };

  const handleCreateReport = async () => {
    if (!scanResult || !currentCompany) return;

    const newReport = await addFraudReport({
      company_id: currentCompany.id,
      reporter_id: 'usr-analyst-direct',
      reporter_name: 'Threat Scanner Operator',
      indicator_type: scanResult.indicator_type,
      indicator_value: scanResult.indicator,
      description: scanResult.explanation,
      status: scanResult.risk_score >= 85 ? 'blocked' : 'confirmed',
      risk_score: scanResult.risk_score,
      confidence: scanResult.confidence,
      threat_category: scanResult.threat_category,
      target_brand: scanResult.target_brand || currentCompany.name,
      evidence_signals: scanResult.evidence_signals,
      osint_data: scanResult.osint_data,
    });

    setActionNotice(`Report ${newReport.id} logged in Reporting Center!`);
    if (onSelectReportForPassport) {
      onSelectReportForPassport(newReport.id);
    }
  };

  // =========================================================================
  // IMAGE-ANALYSIS SIMULATION HANDLERS
  // =========================================================================
  const runLogoAnalysisSimulation = (filename: string, previewUrl?: string, brandOverride?: string) => {
    const brand = brandOverride || targetBrand;
    setIsAnalyzingLogo(true);
    setActionNotice(null);

    setTimeout(() => {
      const res = analyzeLogoAsset(filename, brand, previewUrl, 'file_upload');
      setLogoAnalysisResult(res);
      setIsAnalyzingLogo(false);
    }, 500);
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedLogoName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setUploadedLogoPreview(dataUrl);
      runLogoAnalysisSimulation(file.name, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setUploadedLogoName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setUploadedLogoPreview(dataUrl);
      runLogoAnalysisSimulation(file.name, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleBlockLogoThreat = async () => {
    if (!logoAnalysisResult || !currentCompany) return;

    const blockedItem = await addToBlocklist({
      company_id: currentCompany.id,
      indicator_value: uploadedLogoName,
      indicator_type: 'logo',
      risk_score: logoAnalysisResult.verdict === 'SAFE' ? 0 : Math.round(logoAnalysisResult.similarity_score),
      reason: `Blocked via Logo Trademark Similarity: ${logoAnalysisResult.safety_assessment} (${logoAnalysisResult.similarity_score}% match against ${logoAnalysisResult.matched_brand})`,
      threat_category: 'Brand Impersonation / Phishing',
      status: 'active',
      expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
      blocked_by: 'Threat Scanner Logo Vision',
    });

    setActionNotice(`Trademark vector blocked! Anchored to Polygon Amoy Testnet with ID ${blockedItem.id}.`);
  };

  const handleReportLogoThreat = async () => {
    if (!logoAnalysisResult || !currentCompany) return;

    const newReport = await addFraudReport({
      company_id: currentCompany.id,
      reporter_id: 'usr-analyst-direct',
      reporter_name: 'Threat Scanner Logo Vision',
      indicator_type: 'logo',
      indicator_value: uploadedLogoName,
      description: `${logoAnalysisResult.title} - ${logoAnalysisResult.explanation}`,
      status: logoAnalysisResult.verdict === 'UNSAFE' ? 'blocked' : 'confirmed',
      risk_score: logoAnalysisResult.verdict === 'SAFE' ? 5 : Math.round(logoAnalysisResult.similarity_score),
      confidence: 'High',
      threat_category: 'Brand Impersonation / Phishing',
      target_brand: logoAnalysisResult.matched_brand,
      evidence_signals: [
        `Perceptual Hash: ${logoAnalysisResult.signature_hash}`,
        `Brand Trust Registry Similarity Collision: ${logoAnalysisResult.similarity_score}%`,
        ...logoAnalysisResult.anomalies_detected,
      ],
      osint_data: {
        domain_age_days: 3,
        registrar: 'Cloudflare Registrar',
        ip_address: '104.21.72.19',
        dns_record_type: 'A',
        mx_record_found: false,
        geo_location: 'Frankfurt, Germany',
        ssl_issuer: "Let's Encrypt Authority X3",
      },
    });

    setActionNotice(`Logo fraud incident report ${newReport.id} logged in Reporting Center!`);
    if (onSelectReportForPassport) {
      onSelectReportForPassport(newReport.id);
    }
  };

  // Sample logo presets for testing simulation
  const logoSamplePresets = [
    {
      title: 'NovaPay Phishing Clone (Spoof)',
      file: 'novapay_clone_phishing_logo.png',
      brand: 'NovaPay',
      preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=240&auto=format&fit=crop&q=80',
      expectedScore: '94.6% Collision',
      type: 'spoof' as const,
    },
    {
      title: 'NovaPay Official Emblem (Genuine)',
      file: 'novapay_official_registered_crest.png',
      brand: 'NovaPay',
      preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=240&auto=format&fit=crop&q=80',
      expectedScore: '99.8% Match',
      type: 'authentic' as const,
    },
    {
      title: 'FinSecure Bank Impersonator (Spoof)',
      file: 'finsecure_phish_copycat_logo.png',
      brand: 'FinSecure Bank',
      preview: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=240&auto=format&fit=crop&q=80',
      expectedScore: '91.2% Collision',
      type: 'spoof' as const,
    },
    {
      title: 'ShopShield Verified Emblem (Genuine)',
      file: 'shopshield_official_verified_crest.png',
      brand: 'ShopShield',
      preview: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=240&auto=format&fit=crop&q=80',
      expectedScore: '99.8% Match',
      type: 'authentic' as const,
    },
    {
      title: 'Generic Unrelated Mark (No Conflict)',
      file: 'unrelated_generic_emblem.png',
      brand: 'NovaPay',
      preview: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=240&auto=format&fit=crop&q=80',
      expectedScore: '14.2% Generic',
      type: 'generic' as const,
    },
  ];

  const standardPresets = [
    { label: 'novapay-secure-login.com', type: 'url' as const, val: 'novapay-secure-login.com' },
    { label: 'novapay.com (Official)', type: 'url' as const, val: 'novapay.com' },
    { label: 'Malicious QR Lure', type: 'qr' as const, val: 'https://qr-pay-novapay.net/confirm?tx=8894' },
    { label: 'finsecure-ebank-login.info', type: 'url' as const, val: 'finsecure-ebank-login.info' },
    { label: 'com.novapay.fastcash.loan', type: 'app' as const, val: 'com.novapay.fastcash.loan' },
    { label: 'novapay-kyc-update.org', type: 'url' as const, val: 'novapay-kyc-update.org' },
  ];

  const officialTargetRegistry: OfficialRegistryAsset =
    BRAND_REGISTRY_DATABASE[targetBrand] || BRAND_REGISTRY_DATABASE['NovaPay'];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto bg-transparent min-h-full text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>AI Detection Suite</span>
            <span>·</span>
            <span className="text-purple-700 font-semibold">{currentCompany?.name} Protection Command</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-2xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span>AI Threat Scanner & Signal Intelligence</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Multi-modal deterministic risk engine and perceptual visual analysis. Detect lookalike domains, homoglyphs, quishing QR destinations, rogue apps, and <strong>image trademark spoofs cross-referenced against the Brand Trust Registry</strong>.
          </p>
        </div>

        {/* Quick Mode Toggle Badge */}
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs border border-purple-200 p-1.5 rounded-xl shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setIndicatorType('url')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              indicatorType !== 'logo'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Digital Vectors
          </button>
          <button
            onClick={() => {
              setIndicatorType('logo');
              if (!logoAnalysisResult) {
                runLogoAnalysisSimulation(uploadedLogoName, uploadedLogoPreview || undefined);
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              indicatorType === 'logo'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-700 hover:text-purple-900 hover:bg-purple-50'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Image Analysis Simulation</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between shadow-xs animate-fadeIn font-medium">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => onNavigate('passport')}
            className="text-xs text-purple-700 hover:text-purple-900 font-semibold underline cursor-pointer"
          >
            Open Evidence Passport
          </button>
        </div>
      )}

      {/* Vector Selector Tabs */}
      <div className="p-6 rounded-2xl bg-white/95 backdrop-blur-xs border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200">
          <span className="text-xs font-semibold text-slate-500 mr-2">Indicator Vector:</span>
          {[
            { id: 'url', label: 'URL / Domain', icon: Globe },
            { id: 'qr', label: 'QR Destination', icon: QrCode },
            { id: 'email', label: 'Email Address', icon: Mail },
            { id: 'app', label: 'Mobile App ID', icon: Smartphone },
            { id: 'phone', label: 'Phone / Vishing', icon: Phone },
            { id: 'social', label: 'Social Profile', icon: AtSign },
            { id: 'logo', label: 'Logo Trademark (Image Simulation)', icon: ImageIcon },
          ].map((v) => {
            const Icon = v.icon;
            const isSel = indicatorType === v.id;
            return (
              <button
                key={v.id}
                onClick={() => {
                  setIndicatorType(v.id as any);
                  if (v.id === 'qr') setIndicatorInput('https://qr-pay-novapay.net/confirm?tx=8894');
                  else if (v.id === 'app') setIndicatorInput('com.novapay.fastcash.loan');
                  else if (v.id === 'email') setIndicatorInput('security-alert@novapay-support.net');
                  else if (v.id === 'phone') setIndicatorInput('+1-800-555-0199');
                  else if (v.id === 'social') setIndicatorInput('https://twitter.com/NovaPay_HelpDesk_247');
                  else if (v.id === 'logo') {
                    setIndicatorInput('novapay_clone_phishing_logo.png');
                    if (!logoAnalysisResult) {
                      runLogoAnalysisSimulation(uploadedLogoName, uploadedLogoPreview || undefined);
                    }
                  } else {
                    setIndicatorInput('novapay-secure-login.com');
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isSel
                    ? 'bg-purple-600 text-white shadow-2xs font-semibold'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{v.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================================================================= */}
        {/* LOGO TRADEMARK: IMAGE-ANALYSIS SIMULATION UI                      */}
        {/* ================================================================= */}
        {indicatorType === 'logo' ? (
          <div className="space-y-6 pt-2">
            {/* Top Toolbar: Brand Trust Registry Target Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-purple-50/70 border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-950 uppercase tracking-wide">
                      Brand Trust Registry Target
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full">
                      VERIFIED REPOSITORY
                    </span>
                  </div>
                  <div className="text-[11px] text-purple-800">
                    Comparing visual similarity and vector tolerances against registered trademarks for {targetBrand}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-purple-900 whitespace-nowrap">Target Registry:</span>
                <select
                  value={targetBrand}
                  onChange={(e) => {
                    const newBrand = e.target.value;
                    setTargetBrand(newBrand);
                    runLogoAnalysisSimulation(uploadedLogoName, uploadedLogoPreview || undefined, newBrand);
                  }}
                  className="bg-white border border-purple-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-600 shadow-2xs cursor-pointer"
                >
                  {Object.keys(BRAND_REGISTRY_DATABASE).map(b => (
                    <option key={b} value={b}>{b} Registry</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Drag & Drop File Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all text-center relative ${
                isDraggingOver
                  ? 'border-purple-600 bg-purple-50/80 scale-[1.01]'
                  : 'border-slate-300 bg-slate-50/60 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoFileChange}
                className="hidden"
              />

              <div className="max-w-xl mx-auto space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200 text-purple-600 flex items-center justify-center shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-xs">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isDraggingOver ? 'Drop Image to Calculate Similarity Scores' : 'Upload or Drag & Drop Brand Logo Image'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Accepts PNG, JPG, JPEG, SVG, WebP files. Simulates perceptual hash extraction (pHash) and calculates geometric similarity scores against the <strong>Brand Trust Registry</strong>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Logo File</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => runLogoAnalysisSimulation(uploadedLogoName, uploadedLogoPreview || undefined)}
                    disabled={isAnalyzingLogo}
                    className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
                  >
                    {isAnalyzingLogo ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                        <span>Calculating Similarity Scores...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 text-purple-600" />
                        <span>Re-evaluate Similarity</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Test Simulation Presets Bar */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Simulation Preset Test Cases (Click to Test):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {logoSamplePresets.map((preset, idx) => {
                  const isCurrent = uploadedLogoName === preset.file;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setUploadedLogoName(preset.file);
                        setUploadedLogoPreview(preset.preview);
                        setTargetBrand(preset.brand);
                        runLogoAnalysisSimulation(preset.file, preset.preview, preset.brand);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-purple-50/90 border-purple-400 ring-2 ring-purple-500/20 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={preset.preview}
                          alt={preset.title}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {preset.title}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 truncate">
                            {preset.file}
                          </div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        preset.type === 'authentic'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : preset.type === 'spoof'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}>
                        {preset.expectedScore}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ================================================================= */
          /* STANDARD INPUT ROW FOR URL / QR / APP / EMAIL / PHONE             */
          /* ================================================================= */
          <div className="space-y-4 pt-1">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={indicatorInput}
                onChange={(e) => setIndicatorInput(e.target.value)}
                placeholder="Enter indicator (e.g., novapay-secure-login.com or full URL)..."
                className="flex-1 bg-slate-50 border border-slate-300 focus:border-purple-600 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none transition-colors shadow-2xs"
              />
              <button
                onClick={() => handleScan()}
                disabled={isScanning || !indicatorInput.trim()}
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Probing Target...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    <span>Analyze Threat</span>
                  </>
                )}
              </button>
            </div>

            {/* Demo presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-500 font-medium text-[11px]">Demo Presets:</span>
              {standardPresets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIndicatorInput(p.val);
                    setIndicatorType(p.type);
                    handleScan(p.val, p.type);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-mono text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* SECTION 1: LOGO IMAGE-ANALYSIS SIMULATION SAFETY VERDICT CARD         */}
      {/* ===================================================================== */}
      {indicatorType === 'logo' && logoAnalysisResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main Safety Verdict Card Header */}
          <div className={`p-6 lg:p-8 rounded-2xl border ${
            logoAnalysisResult.verdict === 'SAFE'
              ? 'bg-emerald-50/90 border-emerald-300 shadow-emerald-950/5'
              : logoAnalysisResult.verdict === 'UNSAFE'
              ? 'bg-rose-50/90 border-rose-300 shadow-rose-950/5'
              : 'bg-amber-50/90 border-amber-300 shadow-amber-950/5'
          } shadow-sm space-y-6`}>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    Image Similarity Verdict:
                  </span>

                  {/* Verdict Badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5 ${
                    logoAnalysisResult.verdict === 'SAFE'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : logoAnalysisResult.verdict === 'UNSAFE'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-700 text-white'
                  }`}>
                    {logoAnalysisResult.verdict === 'SAFE' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : logoAnalysisResult.verdict === 'UNSAFE' ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <Info className="w-3.5 h-3.5" />
                    )}
                    <span>Safety Verdict: {logoAnalysisResult.safety_assessment}</span>
                  </span>

                  <span className="font-mono text-xs text-slate-500 px-2 py-0.5 rounded bg-white/80 border border-slate-200">
                    Target Brand: <strong>{targetBrand}</strong>
                  </span>
                </div>

                <h2 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                  {logoAnalysisResult.title}
                </h2>

                <p className="text-xs text-slate-700 max-w-3xl mt-1.5 leading-relaxed font-medium">
                  {logoAnalysisResult.explanation}
                </p>
              </div>

              {/* Similarity Score Radial Metric */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center min-w-[150px] shadow-sm">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 font-mono">
                    SIMILARITY SCORE
                  </div>
                  <div className={`font-mono text-3xl font-black tabular-nums ${
                    logoAnalysisResult.verdict === 'SAFE'
                      ? 'text-emerald-600'
                      : logoAnalysisResult.similarity_score >= 80
                      ? 'text-rose-600'
                      : 'text-amber-600'
                  }`}>
                    {logoAnalysisResult.similarity_score}%
                  </div>
                  <div className="text-[11px] text-slate-600 font-semibold mt-0.5">
                    {logoAnalysisResult.trademark_status}
                  </div>
                </div>

                {/* Operations */}
                <div className="flex flex-col gap-2 shrink-0">
                  {logoAnalysisResult.verdict === 'UNSAFE' && (
                    <button
                      onClick={handleBlockLogoThreat}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Block Trademark Asset</span>
                    </button>
                  )}

                  <button
                    onClick={handleReportLogoThreat}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/20"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Log Incident in Registry</span>
                  </button>

                  <button
                    onClick={() => onNavigate('passport')}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Audit Cryptographic Hash</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Side-by-Side Visual Comparison & Vector Discrepancy Display */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 border-t border-slate-200/80">
              {/* Left Column: Uploaded Candidate Logo */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-150">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Submitted Image Artifact
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 truncate max-w-[200px]">
                    {uploadedLogoName}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                  <div className="w-36 h-36 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative shrink-0 shadow-inner group">
                    {uploadedLogoPreview ? (
                      <img
                        src={uploadedLogoPreview}
                        alt="Submitted Logo"
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-slate-400" />
                    )}

                    <div className="absolute top-1.5 left-1.5 bg-black/70 text-white font-mono text-[9px] px-1.5 py-0.5 rounded backdrop-blur-xs">
                      Candidate Scan
                    </div>

                    {logoAnalysisResult.verdict === 'UNSAFE' && (
                      <div className="absolute inset-0 border-2 border-dashed border-rose-500/80 rounded-xl pointer-events-none" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2 text-xs w-full">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-mono block">PERCEPTUAL pHash SIGNATURE</span>
                      <span className="font-mono text-[11px] font-bold text-purple-700 break-all">
                        {logoAnalysisResult.signature_hash}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Kerning Skew</span>
                        <span className="font-mono font-bold text-slate-900">
                          {logoAnalysisResult.vector_integrity.kerning_skew_percent}%
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Path Variance</span>
                        <span className="font-mono font-bold text-slate-900">
                          {logoAnalysisResult.vector_integrity.path_deviation_percent}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Registered Brand Trust Registry Trademark */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-150">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Official Brand Trust Registry Standard
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ALLOWLIST VERIFIED
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                  <div className="w-36 h-36 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center relative shrink-0 shadow-inner">
                    <img
                      src={officialTargetRegistry.official_logo_url}
                      alt={officialTargetRegistry.brand_name}
                      className="w-full h-full object-contain p-2"
                    />
                    <div className="absolute top-1.5 left-1.5 bg-emerald-700 text-white font-mono text-[9px] px-1.5 py-0.5 rounded">
                      Official Allowlist
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 text-xs w-full">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-mono block">VERIFIED DOMAIN & HOLDER</span>
                      <span className="font-mono text-[11px] font-bold text-indigo-700">
                        {officialTargetRegistry.official_domain} ({officialTargetRegistry.brand_name})
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[10px] mb-1">Registered Pantone Palette</span>
                      <div className="flex items-center gap-2">
                        {officialTargetRegistry.verified_hex_codes.map((hex, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <span className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: hex }} />
                            <span className="font-mono text-[10px] text-slate-600">{hex}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Anomalies & Detailed Verification Checklist */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-purple-600" />
                <span>Perceptual Anomalies & Registry Discrepancy Findings ({logoAnalysisResult.anomalies_detected.length})</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {logoAnalysisResult.anomalies_detected.map((anomaly, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                      logoAnalysisResult.verdict === 'SAFE'
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50/70 border-rose-200 text-rose-900'
                    }`}
                  >
                    {logoAnalysisResult.verdict === 'SAFE' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span className="font-medium leading-relaxed">{anomaly}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-150 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Cryptographic SVG Signature:</span>
                  <span className="font-mono text-[11px] text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {officialTargetRegistry.crypto_svg_signature}
                  </span>
                </div>
                <div className="text-purple-700 font-semibold">
                  Recommended Action: {logoAnalysisResult.recommended_action}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 2: STANDARD THREAT SCANNER RESULTS (URLs, QR, Apps, etc.)     */}
      {/* ===================================================================== */}
      {indicatorType !== 'logo' && scanResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Score Banner */}
          <div className={`p-6 rounded-2xl border ${
            scanResult.is_official
              ? 'bg-emerald-50 border-emerald-200'
              : scanResult.risk_score >= 80
              ? 'bg-rose-50 border-rose-200'
              : 'bg-amber-50 border-amber-200'
          } flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs`}>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Target Indicator:
                </span>
                <span className="font-mono text-sm font-bold text-slate-900">
                  {scanResult.indicator}
                </span>
                {scanResult.is_official && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    OFFICIAL ASSET
                  </span>
                )}
                {scanResult.is_blocked && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-300">
                    BLOCKED
                  </span>
                )}
              </div>

              <div className="text-lg font-bold text-slate-900 mb-1">
                {scanResult.threat_category}
              </div>
              <p className="text-xs text-slate-700 max-w-2xl leading-relaxed">
                {scanResult.explanation}
              </p>
            </div>

            {/* Score Radial Badge */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-center min-w-[130px] shadow-xs">
                <div className={`font-mono text-3xl font-extrabold tabular-nums ${
                  scanResult.risk_score >= 80 ? 'text-rose-600' :
                  scanResult.risk_score === 0 ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {scanResult.risk_score}/100
                </div>
                <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                  Risk Level · {scanResult.confidence}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {!scanResult.is_official && !scanResult.is_blocked && (
                  <button
                    onClick={handleBlockThreat}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Block in Protected Browsing</span>
                  </button>
                )}

                {!scanResult.is_official && (
                  <button
                    onClick={handleCreateReport}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/20"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Log Fraud Report</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Evidence Chips */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Verifiable Evidence Signals ({scanResult.evidence_signals.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {scanResult.evidence_signals.map((sig, i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-center gap-2"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{sig}</span>
                </div>
              ))}
            </div>
          </div>

          {/* OSINT Enrichment & Rule Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rule Scoring Breakdown */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Deterministic Rule Evaluation
              </h3>
              <div className="space-y-3">
                {scanResult.breakdown.map((rule, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">{rule.rule}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{rule.description}</div>
                    </div>
                    <span className="font-mono text-xs font-bold text-rose-600 tabular-nums shrink-0">
                      +{rule.score_impact} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* OSINT Enrichment Data */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Simulated OSINT Telemetry
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 text-[11px] font-sans mb-0.5">Domain Age</div>
                  <div className="font-semibold text-slate-900">
                    {scanResult.osint_data.domain_age_days} days old
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 text-[11px] font-sans mb-0.5">Corporate MX Record</div>
                  <div className={`font-semibold ${
                    scanResult.osint_data.mx_record_found ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {scanResult.osint_data.mx_record_found ? 'CONFIGURED' : 'NOT FOUND'}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 text-[11px] font-sans mb-0.5">Host IP Address</div>
                  <div className="font-semibold text-slate-900">
                    {scanResult.osint_data.ip_address}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 text-[11px] font-sans mb-0.5">TLS Certificate Issuer</div>
                  <div className="font-semibold text-slate-900 truncate">
                    {scanResult.osint_data.ssl_issuer}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 col-span-2">
                  <div className="text-slate-500 text-[11px] font-sans mb-0.5">Registrar / Autonomous System</div>
                  <div className="font-semibold text-slate-900">
                    {scanResult.osint_data.registrar}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600">Geo Location: <strong className="text-slate-900">{scanResult.osint_data.geo_location}</strong></span>
                <span className="text-slate-500 font-mono">DNS: {scanResult.osint_data.dns_record_type}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
