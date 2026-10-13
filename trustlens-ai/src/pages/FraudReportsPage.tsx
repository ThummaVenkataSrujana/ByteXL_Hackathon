import React, { useState, useRef, useEffect } from 'react';
import {
  Flag, Search, Filter, Plus, ArrowUpRight, CheckCircle2,
  AlertTriangle, Ban, FileCheck2, Clock, Globe, Shield, RefreshCw,
  Upload, Image as ImageIcon, Phone, Mail, Hash, ShieldCheck,
  AlertOctagon, ExternalLink, Sparkles, Check, ChevronRight,
  Download, Eye, Layers, Copy, HelpCircle, FileText, Camera,
  SwitchCamera, X, Video, Scan, CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { FraudReport, IndicatorType, ReportStatus, ThreatCategory } from '../types';
import {
  analyzeLogoAsset,
  queryIndicatorFraudIntelligence,
  batchAnalyzeContacts,
  BRAND_REGISTRY_DATABASE,
  LogoAnalysisResult,
  IndicatorFraudCorrelation
} from '../services/intelligenceService';

interface FraudReportsPageProps {
  onNavigate: (view: string) => void;
  onSelectReportForPassport: (reportId: string) => void;
}

export const FraudReportsPage: React.FC<FraudReportsPageProps> = ({
  onNavigate, onSelectReportForPassport
}) => {
  const { currentCompany, currentUser } = useAuth();
  const { reports, addFraudReport, updateReportStatus, addToBlocklist } = useData();

  // Active investigation mode tabs
  const [activeTab, setActiveTab] = useState<'logo_analysis' | 'contact_intel' | 'all_reports' | 'batch_scan'>('logo_analysis');

  // Search & filter for incident queue
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vectorFilter, setVectorFilter] = useState<string>('all');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Selected Brand for Cross-Referencing in Brand Trust Registry
  const [targetBrand, setTargetBrand] = useState<string>(currentCompany?.name || 'NovaPay');

  // =========================================================================
  // LOGO RECOGNITION & DRAG-AND-DROP STATE
  // =========================================================================
  const [uploadedLogoPreview, setUploadedLogoPreview] = useState<string | null>(
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=240&auto=format&fit=crop&q=80'
  );
  const [uploadedLogoName, setUploadedLogoName] = useState<string>('novapay_clone_phishing_logo.png');
  const [logoInputSource, setLogoInputSource] = useState<'drag_and_drop' | 'camera_capture' | 'preset_test' | 'file_upload'>('file_upload');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [logoAnalysis, setLogoAnalysis] = useState<LogoAnalysisResult>(() =>
    analyzeLogoAsset('novapay_clone_phishing_logo.png', currentCompany?.name || 'NovaPay', undefined, 'file_upload')
  );
  const [isAnalyzingLogo, setIsAnalyzingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // =========================================================================
  // CAMERA CAPTURE STATE
  // =========================================================================
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // =========================================================================
  // PHONE & EMAIL INTEL STATE
  // =========================================================================
  const [contactQuery, setContactQuery] = useState('+1-800-555-0199');
  const [contactIntel, setContactIntel] = useState<IndicatorFraudCorrelation>(() =>
    queryIndicatorFraudIntelligence('+1-800-555-0199', reports)
  );
  const [isSearchingContact, setIsSearchingContact] = useState(false);

  // =========================================================================
  // BATCH SCAN STATE
  // =========================================================================
  const [batchInputText, setBatchInputText] = useState(
    `+1-800-555-0199\nbilling-alert@nova-pay-support.net\n+1-888-901-4421\nsupport@novapay.com\nsecurity-verify@finsecure-alerts.com`
  );
  const [batchResults, setBatchResults] = useState<IndicatorFraudCorrelation[]>(() =>
    batchAnalyzeContacts([
      '+1-800-555-0199',
      'billing-alert@nova-pay-support.net',
      '+1-888-901-4421',
      'support@novapay.com',
      'security-verify@finsecure-alerts.com'
    ], reports)
  );

  // =========================================================================
  // SUBMIT FORM MODAL STATE
  // =========================================================================
  const [indicatorType, setIndicatorType] = useState<IndicatorType>('url');
  const [indicatorValue, setIndicatorValue] = useState('');
  const [description, setDescription] = useState('');
  const [modalLogoPreview, setModalLogoPreview] = useState<string | null>(null);
  const [modalLogoAnalysis, setModalLogoAnalysis] = useState<LogoAnalysisResult | null>(null);
  const [modalContactIntel, setModalContactIntel] = useState<IndicatorFraudCorrelation | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<FraudReport | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Company scoped reports
  const companyReports = reports.filter(r => r.company_id === currentCompany?.id);

  // Filtered reports
  const filteredReports = companyReports.filter(r => {
    const matchesSearch = r.indicator_value.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesVector = vectorFilter === 'all' || r.indicator_type === vectorFilter;
    return matchesSearch && matchesStatus && matchesVector;
  });

  // Re-run analysis when target brand selector changes
  useEffect(() => {
    if (uploadedLogoName) {
      runLogoAnalysis(uploadedLogoName, uploadedLogoPreview || undefined, logoInputSource);
    }
  }, [targetBrand]);

  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Start live camera stream
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access API is not supported on this browser or environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacingMode,
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError(err.message || 'Unable to access webcam. Please check browser permissions or select a sample.');
    }
  };

  // Switch between front/rear camera
  const switchCamera = async () => {
    const nextMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextMode);
    stopCameraStream();
    setTimeout(() => {
      startCamera();
    }, 150);
  };

  // Capture snapshot from camera
  const captureCameraSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 640;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        const filename = `camera_captured_logo_${Date.now()}.png`;

        setUploadedLogoPreview(dataUrl);
        setUploadedLogoName(filename);
        setLogoInputSource('camera_capture');
        stopCameraStream();
        runLogoAnalysis(filename, dataUrl, 'camera_capture');

        setActionNotice('Logo captured successfully via camera! Cross-referencing against Brand Trust Registry...');
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (err) {
      console.error('Snapshot capture error:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  // Simulate snapshot if real webcam is not available in iframe sandbox
  const handleSimulateCameraCapture = () => {
    const simulatedPhishPhoto = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=240&auto=format&fit=crop&q=80';
    const filename = `camera_retail_terminal_sticker_${Date.now()}.png`;
    setUploadedLogoPreview(simulatedPhishPhoto);
    setUploadedLogoName(filename);
    setLogoInputSource('camera_capture');
    stopCameraStream();
    runLogoAnalysis(filename, simulatedPhishPhoto, 'camera_capture');
    setActionNotice('Simulated retail photo frame captured and cross-referenced with Brand Registry!');
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Handle Drag-and-Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        setActionNotice('Please drop an image file (PNG, JPG, SVG, WebP).');
        setTimeout(() => setActionNotice(null), 3000);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setUploadedLogoPreview(dataUrl);
        setUploadedLogoName(file.name);
        setLogoInputSource('drag_and_drop');
        runLogoAnalysis(file.name, dataUrl, 'drag_and_drop');
        setActionNotice(`Dropped logo ${file.name} received! Cross-referencing against Brand Trust Registry...`);
        setTimeout(() => setActionNotice(null), 4000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Logo File Upload from Browse button
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setUploadedLogoPreview(dataUrl);
      setUploadedLogoName(file.name);
      setLogoInputSource('file_upload');
      runLogoAnalysis(file.name, dataUrl, 'file_upload');
    };
    reader.readAsDataURL(file);
  };

  const runLogoAnalysis = (
    filename: string,
    dataUrl?: string,
    source: 'drag_and_drop' | 'camera_capture' | 'preset_test' | 'file_upload' = 'file_upload'
  ) => {
    setIsAnalyzingLogo(true);
    setTimeout(() => {
      const res = analyzeLogoAsset(filename, targetBrand, dataUrl, source);
      setLogoAnalysis(res);
      setIsAnalyzingLogo(false);
    }, 350);
  };

  // Handle Contact Intel Query
  const handleQueryContact = (queryOverride?: string) => {
    const val = queryOverride !== undefined ? queryOverride : contactQuery;
    if (!val.trim()) return;
    setIsSearchingContact(true);
    setTimeout(() => {
      const res = queryIndicatorFraudIntelligence(val, reports);
      setContactIntel(res);
      setIsSearchingContact(false);
    }, 250);
  };

  // Handle Batch Contacts Execution
  const handleRunBatchScan = () => {
    const lines = batchInputText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return;
    const res = batchAnalyzeContacts(lines, reports);
    setBatchResults(res);
    setActionNotice(`Batch audit complete: Scanned ${res.length} indicators.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Live Check in Submission Modal as User Types
  const handleIndicatorChange = (val: string) => {
    setIndicatorValue(val);
    const clean = val.trim().toLowerCase();

    // Duplicate report check
    if (clean.length > 3) {
      const existing = companyReports.find(r => r.indicator_value.toLowerCase() === clean);
      setDuplicateWarning(existing || null);
    } else {
      setDuplicateWarning(null);
    }

    // Live phone/email fraud intelligence check in modal
    if (indicatorType === 'phone' || indicatorType === 'email') {
      if (clean.length >= 6) {
        const intel = queryIndicatorFraudIntelligence(val, reports);
        setModalContactIntel(intel);
      } else {
        setModalContactIntel(null);
      }
    }
  };

  // Handle Modal Logo Upload
  const handleModalLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setModalLogoPreview(dataUrl);
      setIndicatorValue(file.name);
      const res = analyzeLogoAsset(file.name, targetBrand, dataUrl, 'file_upload');
      setModalLogoAnalysis(res);
    };
    reader.readAsDataURL(file);
  };

  // Submit Report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!indicatorValue.trim() || !currentCompany) return;

    let cat: ThreatCategory = 'Brand Impersonation / Phishing';
    if (indicatorType === 'qr') cat = 'Malicious QR (Quishing)';
    else if (indicatorType === 'app') cat = 'Copycat Mobile Application';
    else if (indicatorType === 'phone') cat = 'Fake Support / Vishing';
    else if (indicatorType === 'email') cat = 'Executive Impersonation';
    else if (indicatorType === 'logo') cat = 'Brand Impersonation / Phishing';

    const calculatedRisk = duplicateWarning ? Math.max(duplicateWarning.risk_score + 5, 95) : 88;

    const newRep = await addFraudReport({
      company_id: currentCompany.id,
      reporter_id: currentUser?.id || 'usr-analyst-direct',
      reporter_name: currentUser?.full_name || 'Fraud Analyst',
      reporter_email: currentUser?.email || 'analyst@novapay.com',
      indicator_type: indicatorType,
      indicator_value: indicatorValue.trim(),
      description: duplicateWarning
        ? `[Grouped Duplicate Incident] ${description} (Corroborates existing incident ${duplicateWarning.id})`
        : description || 'Reported suspicious indicator targeting corporate identity.',
      status: 'pending',
      risk_score: calculatedRisk,
      confidence: 'High',
      threat_category: cat,
      target_brand: targetBrand,
      evidence_signals: [
        `Logged by ${currentUser?.full_name || 'Analyst'}`,
        'Correlated in enterprise fraud telemetry',
        'Registered in evidence passport database',
        indicatorType === 'logo' && modalLogoAnalysis ? `Brand Registry Assessment: ${modalLogoAnalysis.safety_assessment}` : '',
        modalContactIntel && modalContactIntel.total_frauds_detected > 0 ? `Correlated with ${modalContactIntel.total_frauds_detected} prior frauds` : '',
      ].filter(Boolean) as string[],
    });

    setIndicatorValue('');
    setDescription('');
    setDuplicateWarning(null);
    setModalLogoPreview(null);
    setModalLogoAnalysis(null);
    setModalContactIntel(null);
    setShowSubmitModal(false);
    setActionNotice(`Incident ${newRep.id} successfully lodged into reporting center!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Block Logo Directly from Analysis Session
  const handleBlockLogoDirectly = async () => {
    if (!currentCompany || !logoAnalysis) return;
    await addToBlocklist({
      company_id: currentCompany.id,
      indicator_value: uploadedLogoName,
      indicator_type: 'logo',
      risk_score: 95,
      reason: `Blocked Counterfeit Trademark: ${logoAnalysis.title} (${logoAnalysis.safety_assessment})`,
      threat_category: 'Brand Impersonation / Phishing',
      status: 'active',
      expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
      blocked_by: currentUser?.full_name || 'Brand Protection Lead',
    });
    setActionNotice(`Counterfeit logo signature added to active blocklist and anchored to Polygon Amoy testnet!`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Block Contact Directly from Intel Session
  const handleBlockContactDirectly = async () => {
    if (!currentCompany || !contactIntel) return;
    await addToBlocklist({
      company_id: currentCompany.id,
      indicator_value: contactIntel.indicator,
      indicator_type: contactIntel.type,
      risk_score: contactIntel.risk_score,
      reason: `Blocked malicious contact with ${contactIntel.total_frauds_detected} confirmed fraud incidents`,
      threat_category: contactIntel.type === 'phone' ? 'Fake Support / Vishing' : 'Executive Impersonation',
      status: 'active',
      expires_at: new Date(Date.now() + 60 * 86400000).toISOString(),
      blocked_by: currentUser?.full_name || 'Fraud Response Lead',
    });
    setActionNotice(`Blocked ${contactIntel.indicator} across corporate messaging and telecom firewalls!`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  const officialReg = BRAND_REGISTRY_DATABASE[targetBrand] || BRAND_REGISTRY_DATABASE['NovaPay'];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto bg-transparent min-h-full text-slate-900">
      {/* Hidden Canvas for Camera Frame Processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Header Command Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-purple-700">Enterprise Defense Command</span>
            <span>·</span>
            <span>{currentCompany?.name} Fraud Intelligence Suite</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-2xs">
              <Flag className="w-5 h-5" />
            </div>
            <span>Fraud Reporting & Intelligence Center</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Multi-vector threat intake: Drag-and-drop or capture logos via camera to cross-reference against the Brand Trust Registry for safety assessments ('Likely Authentic' or 'Suspected Impersonation'), and lookup phone numbers or emails to view correlated fraud incident counts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('protected')}
            title="Gateway Proxy Perimeter Intercept Active"
            className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-mono font-medium transition-colors flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>Gateway Proxy: ACTIVE</span>
          </button>

          <button
            onClick={() => {
              setIndicatorType('url');
              setShowSubmitModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Fraud Incident</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5 shadow-xs animate-fadeIn font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* QUICK IDENTIFIER LOOKUP BAR FOR EMAIL ADDRESSES & PHONE NUMBERS */}
      <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-xs border border-purple-200 shadow-sm shadow-purple-900/5 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
              Phone & Email Fraud Records Lookup
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              · Live Database Query & Threat Correlation
            </span>
          </div>
          <span className="text-[11px] font-mono text-purple-700 font-semibold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
            {reports.length} Reports Indexed
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-purple-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={contactQuery}
              onChange={(e) => setContactQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setActiveTab('contact_intel');
                  handleQueryContact();
                }
              }}
              placeholder="Lookup phone (+1-800-555-0199) or email (billing-alert@nova-pay-support.net) across incident database..."
              className="w-full bg-slate-50 border border-slate-300 focus:border-purple-600 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none transition-colors shadow-2xs"
            />
          </div>
          <button
            onClick={() => {
              setActiveTab('contact_intel');
              handleQueryContact();
            }}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            {isSearchingContact ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Query Database</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-0.5">
          <span className="font-semibold text-[11px] text-slate-600">Sample Lookups:</span>
          <button
            onClick={() => {
              setContactQuery('+1-800-555-0199');
              setActiveTab('contact_intel');
              handleQueryContact('+1-800-555-0199');
            }}
            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-mono text-[11px] transition-colors cursor-pointer"
          >
            +1-800-555-0199 (Vishing · 6 Frauds)
          </button>
          <button
            onClick={() => {
              setContactQuery('billing-alert@nova-pay-support.net');
              setActiveTab('contact_intel');
              handleQueryContact('billing-alert@nova-pay-support.net');
            }}
            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-mono text-[11px] transition-colors cursor-pointer"
          >
            billing-alert@nova-pay-support.net (Phishing · 5 Frauds)
          </button>
          <button
            onClick={() => {
              setContactQuery('support@novapay.com');
              setActiveTab('contact_intel');
              handleQueryContact('support@novapay.com');
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-mono text-[11px] transition-colors cursor-pointer"
          >
            support@novapay.com (Clean · 0 Frauds)
          </button>
        </div>
      </div>

      {/* Main Mode Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 border border-slate-200 rounded-2xl shadow-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('logo_analysis')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'logo_analysis'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/90 bg-white/50 border border-slate-200/60'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Logo Vision & Camera Intake</span>
        </button>

        <button
          onClick={() => setActiveTab('contact_intel')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'contact_intel'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/90 bg-white/50 border border-slate-200/60'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>Phone & Email Fraud Inspector</span>
        </button>

        <button
          onClick={() => setActiveTab('all_reports')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'all_reports'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/90 bg-white/50 border border-slate-200/60'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>All Incident Reports ({companyReports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('batch_scan')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'batch_scan'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/90 bg-white/50 border border-slate-200/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Batch File & Contact Scan</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LOGO IMAGE RECOGNITION (DRAG & DROP, CAMERA, BRAND REGISTRY CROSS-REFERENCE) */}
      {/* ========================================================================= */}
      {activeTab === 'logo_analysis' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Card with Target Brand Trust Registry Selector */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded font-mono">
                  BRAND TRUST REGISTRY CROSS-REFERENCE
                </span>
                <span className="text-xs text-slate-500 font-medium">Vision Recognition & Camera Intake</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Logo Trademark Recognition & Safety Assessment
              </h2>
              <p className="text-xs text-slate-600 max-w-2xl mt-1 leading-relaxed">
                Drag-and-drop or capture a logo via camera. The AI inspects vector geometry, chromatic palettes, and perceptual hashes against official entries in the <strong>Brand Trust Registry</strong> to output a formal safety assessment (<strong>'Likely Authentic'</strong> or <strong>'Suspected Impersonation'</strong>).
              </p>
            </div>

            {/* Target Brand Registry Selector */}
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 shrink-0">
              <span className="text-xs font-semibold text-slate-600 pl-1">Target Registry:</span>
              <select
                value={targetBrand}
                onChange={(e) => setTargetBrand(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                {Object.keys(BRAND_REGISTRY_DATABASE).map(b => (
                  <option key={b} value={b}>{b} Registry</option>
                ))}
              </select>
            </div>
          </div>

          {/* DRAG-AND-DROP & CAMERA CONTROL DOCK */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center relative ${
              isDraggingOver
                ? 'border-indigo-500 bg-indigo-50/70 scale-[1.01]'
                : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <div className="max-w-xl mx-auto space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
                  <Camera className="w-6 h-6" />
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isDraggingOver ? 'Release to Cross-Reference Logo' : 'Drag & Drop Logo Image Here or Capture with Camera'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Supports PNG, JPG, WebP, SVG files. Instant perceptual cross-referencing against the {targetBrand} Brand Trust Registry.
                </p>
              </div>

              {/* Action Buttons for Intake */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span>Browse Logo Files</span>
                </button>

                <button
                  type="button"
                  onClick={startCamera}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Logo via Camera</span>
                </button>
              </div>
            </div>
          </div>

          {/* LIVE CAMERA CAPTURE VIEWFINDER MODAL */}
          {isCameraActive && (
            <div className="p-6 rounded-2xl bg-slate-950 text-white border border-slate-800 shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider font-mono">
                    LIVE CAMERA TRADEMARK VIEWFINDER · ALIGN LOGO INSIDE RETICLE
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={switchCamera}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
                    title="Switch camera"
                  >
                    <SwitchCamera className="w-4 h-4" />
                    <span className="text-[11px] hidden sm:inline">Flip Camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={stopCameraStream}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-white cursor-pointer"
                    title="Close camera"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {cameraError ? (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center mx-auto">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="text-xs text-amber-300 font-semibold max-w-md mx-auto">
                    {cameraError}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    You can test camera recognition instantly using our simulated physical camera photo:
                  </p>
                  <button
                    type="button"
                    onClick={handleSimulateCameraCapture}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    Load Simulated Camera Terminal Photo
                  </button>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-black max-w-lg mx-auto aspect-square flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* High-tech targeting reticle overlay */}
                  <div className="absolute inset-8 border-2 border-dashed border-indigo-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-4">
                    <div className="flex justify-between text-[10px] font-mono text-indigo-300 bg-black/60 px-2 py-0.5 rounded self-start">
                      [TARGETING: {targetBrand.toUpperCase()} TRADEMARK]
                    </div>
                    <div className="text-center text-xs font-semibold text-white/90 bg-black/60 py-1 px-3 rounded-full self-center">
                      Center brand emblem or card within reticle
                    </div>
                  </div>

                  {/* Shutter / Capture Button */}
                  <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4">
                    <button
                      type="button"
                      disabled={isCapturing}
                      onClick={captureCameraSnapshot}
                      className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-900/50 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{isCapturing ? 'Capturing...' : 'Capture Logo Snapshot'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSimulateCameraCapture}
                      className="px-3.5 py-3 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium backdrop-blur-sm cursor-pointer"
                    >
                      Sample Snapshot
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Preset Test Gallery */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Instant Test Presets:</span>
            </span>
            <button
              onClick={() => {
                setUploadedLogoName('novapay_clone_phishing_logo.png');
                setUploadedLogoPreview('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=240&auto=format&fit=crop&q=80');
                setLogoInputSource('preset_test');
                runLogoAnalysis('novapay_clone_phishing_logo.png', undefined, 'preset_test');
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              <span>Phishing Clone (Suspected Impersonation)</span>
            </button>
            <button
              onClick={() => {
                setUploadedLogoName('novapay_official_verified_crest.png');
                setUploadedLogoPreview(officialReg.official_logo_url);
                setLogoInputSource('preset_test');
                runLogoAnalysis('novapay_official_verified_crest.png', officialReg.official_logo_url, 'preset_test');
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official Registered Crest (Likely Authentic)</span>
            </button>
            <button
              onClick={() => {
                setUploadedLogoName('unrelated_generic_company.png');
                setUploadedLogoPreview('https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=240&auto=format&fit=crop&q=80');
                setLogoInputSource('preset_test');
                runLogoAnalysis('unrelated_generic_company.png', undefined, 'preset_test');
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span>Unrelated Generic Mark (No Conflict)</span>
            </button>
          </div>

          {/* SIDE-BY-SIDE BRAND TRUST REGISTRY CROSS-REFERENCE DOSSIER */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Viewport Pair: Captured Asset VS Official Registered Asset */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Investigative Asset Viewport
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    logoInputSource === 'camera_capture' ? 'bg-purple-100 text-purple-800' :
                    logoInputSource === 'drag_and_drop' ? 'bg-blue-100 text-blue-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {logoInputSource === 'camera_capture' ? 'CAMERA CAPTURE' :
                     logoInputSource === 'drag_and_drop' ? 'DRAG & DROP' : 'FILE UPLOAD'}
                  </span>
                </div>

                {/* Captured / Uploaded Image Viewport */}
                <div className="w-full h-44 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden mb-3 p-3 relative group">
                  {uploadedLogoPreview ? (
                    <img
                      src={uploadedLogoPreview}
                      alt="Captured Logo Preview"
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain rounded-lg transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-slate-300" />
                  )}

                  {isAnalyzingLogo && (
                    <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
                      <span className="text-xs font-bold text-slate-900">Comparing with Brand Registry...</span>
                    </div>
                  )}
                </div>

                <div className="font-mono text-xs text-slate-900 font-bold truncate" title={uploadedLogoName}>
                  {uploadedLogoName}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Visual Hash: {logoAnalysis.signature_hash.substring(0, 18)}...
                </div>
              </div>

              {/* Official Brand Trust Registry Entry for comparison */}
              <div className="pt-4 border-t border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Official Registry Standard:</span>
                  <span className="font-mono text-indigo-600 font-bold text-[11px]">{officialReg.official_domain}</span>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <img
                    src={officialReg.official_logo_url}
                    alt={officialReg.brand_name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 object-contain rounded-lg border border-slate-200 bg-white p-1 shrink-0"
                  />
                  <div>
                    <div className="font-bold text-slate-900">{officialReg.brand_name} Official Crest</div>
                    <div className="text-[10px] text-slate-500 font-mono">{officialReg.verified_palette}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* SAFETY ASSESSMENT AND CROSS-REFERENCE VERDICT */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                {/* PROMINENT SAFETY ASSESSMENT BANNER */}
                <div className={`p-5 rounded-2xl border mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  logoAnalysis.safety_assessment === 'Likely Authentic'
                    ? 'bg-emerald-50 border-emerald-300'
                    : logoAnalysis.safety_assessment === 'Suspected Impersonation'
                    ? 'bg-rose-50 border-rose-300'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-3.5">
                    {logoAnalysis.safety_assessment === 'Likely Authentic' ? (
                      <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                    ) : logoAnalysis.safety_assessment === 'Suspected Impersonation' ? (
                      <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/30">
                        <AlertOctagon className="w-8 h-8 animate-pulse" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                        <Shield className="w-8 h-8" />
                      </div>
                    )}

                    <div>
                      <div className="text-[11px] font-bold font-mono tracking-wider uppercase text-slate-500">
                        BRAND TRUST REGISTRY ASSESSMENT:
                      </div>
                      <div className={`text-2xl font-black tracking-tight ${
                        logoAnalysis.safety_assessment === 'Likely Authentic' ? 'text-emerald-800' :
                        logoAnalysis.safety_assessment === 'Suspected Impersonation' ? 'text-rose-800' : 'text-slate-800'
                      }`}>
                        {logoAnalysis.safety_assessment.toUpperCase()}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {logoAnalysis.title}
                      </div>
                    </div>
                  </div>

                  <div className="text-right sm:border-l sm:border-slate-300/80 sm:pl-5 shrink-0">
                    <div className="text-[10px] uppercase font-bold text-slate-500">
                      {logoAnalysis.safety_assessment === 'Likely Authentic' ? 'Fidelity Match' : 'Collision Score'}
                    </div>
                    <div className={`font-mono text-3xl font-black ${
                      logoAnalysis.safety_assessment === 'Suspected Impersonation' ? 'text-rose-600' :
                      logoAnalysis.safety_assessment === 'Likely Authentic' ? 'text-emerald-600' : 'text-slate-700'
                    }`}>
                      {logoAnalysis.similarity_score}%
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed mb-4">
                  {logoAnalysis.explanation}
                </p>

                {/* Perceptual Anomalies List */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4 space-y-2">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                    Brand Registry Cross-Reference Findings & Signals:
                  </span>
                  {logoAnalysis.anomalies_detected.map((anomaly, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{anomaly}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  Recommended Action: <strong className="text-slate-800">{logoAnalysis.recommended_action}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {logoAnalysis.safety_assessment === 'Suspected Impersonation' && (
                    <>
                      <button
                        onClick={handleBlockLogoDirectly}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Block & Anchor Counterfeit Mark</span>
                      </button>
                      <button
                        onClick={() => {
                          handleBlockLogoDirectly();
                          onNavigate('protected');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Globe className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Enforce in Gateway Proxy</span>
                      </button>
                    </>
                  )}
                  {logoAnalysis.safety_assessment === 'Likely Authentic' && (
                    <button
                      onClick={() => onNavigate('registry')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>View in Brand Trust Registry</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIndicatorType('logo');
                      setIndicatorValue(uploadedLogoName);
                      setDescription(`[${logoAnalysis.safety_assessment}] ${logoAnalysis.title}: ${logoAnalysis.explanation}`);
                      setShowSubmitModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-sm shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Lodge Formal Incident</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PHONE & EMAIL FRAUD INTELLIGENCE ("FRAUDS DETECTED: X") */}
      {/* ========================================================================= */}
      {activeTab === 'contact_intel' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Search Header */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded font-mono">
                  TELECOM & EMAIL CORRELATION ENGINE
                </span>
                <span className="text-xs text-slate-500 font-medium">Cross-Platform Incident Database</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Phone Number & Email Fraud Incident Inspector
              </h2>
              <p className="text-xs text-slate-600 max-w-2xl mt-1 leading-relaxed">
                Enter any telephone number or email address. TrustLens cross-references all registered brand campaigns, fraud reports, robocall spam lists, and offshore gateway telemetry to immediately display exactly <strong>how many fraud incidents were detected</strong> under that contact.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={contactQuery}
                onChange={(e) => setContactQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQueryContact()}
                placeholder="Enter phone number (+1-800-555-0199) or email (billing-alert@nova-pay-support.net)..."
                className="flex-1 bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none shadow-2xs"
              />
              <button
                onClick={() => handleQueryContact()}
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                {isSearchingContact ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>Search Fraud Records</span>
              </button>
            </div>

            {/* Quick Test Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Quick Test Contacts:</span>
              </span>
              <button
                onClick={() => {
                  setContactQuery('+1-800-555-0199');
                  handleQueryContact('+1-800-555-0199');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-mono text-[11px] transition-colors cursor-pointer"
              >
                +1-800-555-0199 (Vishing Call Center · 6 Frauds)
              </button>
              <button
                onClick={() => {
                  setContactQuery('billing-alert@nova-pay-support.net');
                  handleQueryContact('billing-alert@nova-pay-support.net');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-mono text-[11px] transition-colors cursor-pointer"
              >
                billing-alert@nova-pay-support.net (Phishing Email · 5 Frauds)
              </button>
              <button
                onClick={() => {
                  setContactQuery('+1-888-901-4421');
                  handleQueryContact('+1-888-901-4421');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-mono text-[11px] transition-colors cursor-pointer"
              >
                +1-888-901-4421 (Robocall Lure · 4 Frauds)
              </button>
              <button
                onClick={() => {
                  setContactQuery('support@novapay.com');
                  handleQueryContact('support@novapay.com');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-mono text-[11px] transition-colors cursor-pointer"
              >
                support@novapay.com (Official Clean · 0 Frauds)
              </button>
            </div>
          </div>

          {/* PRIMARY PROMINENT FRAUD COUNTER DOSSIER */}
          {contactIntel && (
            <div className="space-y-6">
              {/* BIG PROMINENT FRAUD COUNTER CARD */}
              <div className={`p-6 rounded-2xl border ${
                contactIntel.total_frauds_detected > 0
                  ? 'bg-rose-50/80 border-rose-200'
                  : 'bg-emerald-50/80 border-emerald-200'
              } shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                      INVESTIGATIVE TARGET:
                    </span>
                    <span className="font-mono text-base font-extrabold text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                      {contactIntel.indicator}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      {contactIntel.type.toUpperCase()} VECTOR
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 mb-1 flex items-center gap-2">
                    {contactIntel.total_frauds_detected > 0 ? (
                      <>
                        <span className="text-rose-600">{contactIntel.total_frauds_detected} Frauds Detected</span>
                        <span className="text-slate-800">Under This {contactIntel.type === 'phone' ? 'Phone Number' : 'Email Address'}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-emerald-600">0 Frauds Detected</span>
                        <span className="text-slate-800">(Verified Clean Indicator)</span>
                      </>
                    )}
                  </h3>
                  <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                    {contactIntel.explanation}
                  </p>
                </div>

                {/* Big Counter Number Badge */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center min-w-[170px]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      FRAUDS DETECTED
                    </div>
                    <div className={`font-mono text-5xl font-black tabular-nums ${
                      contactIntel.total_frauds_detected > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {contactIntel.total_frauds_detected}
                    </div>
                    <div className={`text-[11px] font-semibold mt-1 ${
                      contactIntel.total_frauds_detected > 0 ? 'text-rose-700' : 'text-emerald-700'
                    }`}>
                      {contactIntel.total_frauds_detected > 0 ? 'Critical Threat Risk' : 'Clean Reputation'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Carrier & Gateway Telemetry */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Telecom Provider / Mail Gateway
                  </span>
                  <div className="font-semibold text-slate-900 font-mono">
                    {contactIntel.carrier_or_gateway}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Telemetry Activity Window
                  </span>
                  <div className="text-slate-800">
                    First seen: <strong>{contactIntel.first_seen}</strong> · Last activity: <strong>{contactIntel.last_reported}</strong>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Associated Scam Campaigns
                  </span>
                  <div className="text-slate-700">
                    {contactIntel.associated_campaigns.join(', ')}
                  </div>
                </div>
              </div>

              {/* Detailed Linked Incident Breakdown List */}
              {contactIntel.linked_reports.length > 0 && (
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Specific Fraud Incidents Under This {contactIntel.type.toUpperCase()} ({contactIntel.linked_reports.length})
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Historical incidents logged across enterprise threat registries referencing this contact.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {contactIntel.total_frauds_detected > 0 && (
                        <>
                          <button
                            onClick={handleBlockContactDirectly}
                            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Block Contact</span>
                          </button>
                          <button
                            onClick={() => {
                              handleBlockContactDirectly();
                              onNavigate('protected');
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Globe className="w-3.5 h-3.5 text-purple-400" />
                            <span>Enforce in Gateway Proxy</span>
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setIndicatorType(contactIntel.type);
                          setIndicatorValue(contactIntel.indicator);
                          setDescription(`[${contactIntel.total_frauds_detected} Frauds Correlated] Identified threat originating from ${contactIntel.indicator} (${contactIntel.carrier_or_gateway})`);
                          setShowSubmitModal(true);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-sm shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Log Incident</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {contactIntel.linked_reports.map((lr, i) => (
                      <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-100/80 transition-colors">
                        <div>
                          <div className="flex items-center gap-2.5 mb-1">
                            <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {lr.id}
                            </span>
                            <span className="font-bold text-slate-900">{lr.company_name}</span>
                            <span>·</span>
                            <span className="text-slate-700 font-semibold">{lr.category}</span>
                            <span>·</span>
                            <span className="text-slate-500 font-mono text-[11px]">{lr.date}</span>
                          </div>
                          <p className="text-slate-600 text-xs">
                            {lr.description}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            onSelectReportForPassport(lr.id);
                            onNavigate('passport');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        >
                          <span>Evidence Passport</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-indigo-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ALL INCIDENT REPORTS TABLE */}
      {/* ========================================================================= */}
      {activeTab === 'all_reports' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Total Reports</span>
              <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{companyReports.length}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Logged incidents</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block mb-1">Under Investigation</span>
              <div className="text-2xl font-bold font-mono text-amber-600 tabular-nums">
                {companyReports.filter(r => r.status === 'pending' || r.status === 'under_review').length}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Analyst review queue</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block mb-1">Confirmed Threats</span>
              <div className="text-2xl font-bold font-mono text-rose-600 tabular-nums">
                {companyReports.filter(r => r.status === 'confirmed' || r.status === 'blocked').length}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Active containment</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block mb-1">Cryptographic Anchors</span>
              <div className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
                {companyReports.filter(r => r.status === 'blocked').length + 3}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Polygon Amoy verified</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by indicator, ID, or description..."
                className="w-full bg-slate-50 border border-slate-250 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
                {['all', 'pending', 'under_review', 'confirmed', 'blocked'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-md font-medium capitalize whitespace-nowrap transition-colors cursor-pointer ${
                      statusFilter === s
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reports Table */}
          <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] bg-slate-50">
                    <th className="py-3 px-4">Report ID</th>
                    <th className="py-3 px-4">Vector</th>
                    <th className="py-3 px-4">Threat Indicator</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Risk Score</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-slate-500">
                        No fraud reports match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-500 text-[11px]">
                          {report.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {report.indicator_type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 font-mono">
                            {report.indicator_value}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {report.description}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 text-[11px]">
                          {report.threat_category}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold">
                          <span className={`tabular-nums ${
                            report.risk_score >= 85 ? 'text-rose-600' :
                            report.risk_score >= 60 ? 'text-amber-600' : 'text-slate-700'
                          }`}>
                            {report.risk_score}/100
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            report.status === 'blocked' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            report.status === 'confirmed' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                            report.status === 'under_review' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {report.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {report.status === 'pending' && (
                              <button
                                onClick={() => updateReportStatus(report.id, 'under_review')}
                                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-medium text-slate-700 cursor-pointer"
                              >
                                Review
                              </button>
                            )}
                            {report.status === 'under_review' && (
                              <button
                                onClick={() => updateReportStatus(report.id, 'confirmed')}
                                className="px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 text-[11px] font-semibold text-purple-700 border border-purple-200 cursor-pointer"
                              >
                                Confirm
                              </button>
                            )}
                            <button
                              onClick={() => {
                                onSelectReportForPassport(report.id);
                                onNavigate('passport');
                              }}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <FileCheck2 className="w-3 h-3 text-indigo-600" />
                              <span>Passport</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: BATCH CONTACT & FILE SCANNER */}
      {/* ========================================================================= */}
      {activeTab === 'batch_scan' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded font-mono">
                  BULK TELEMETRY AUDITOR
                </span>
                <span className="text-xs text-slate-500 font-medium">Multi-Contact Fraud Correlation</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Batch Contact File & Fraud Audit Session
              </h2>
              <p className="text-xs text-slate-600 max-w-2xl mt-1 leading-relaxed">
                Paste or import a list of phone numbers and email addresses (one per line). TrustLens computes the exact number of frauds detected under each indicator simultaneously.
              </p>
            </div>

            <textarea
              rows={5}
              value={batchInputText}
              onChange={(e) => setBatchInputText(e.target.value)}
              placeholder="Enter phone numbers and emails, one per line..."
              className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none"
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {batchInputText.split('\n').filter(l => l.trim().length > 0).length} indicators queued for auditing
              </span>
              <button
                onClick={handleRunBatchScan}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Audit All Queued Contacts</span>
              </button>
            </div>
          </div>

          {/* Batch Results Table */}
          <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Batch Audit Correlation Breakdown ({batchResults.length} Items)
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                {batchResults.filter(r => r.total_frauds_detected > 0).length} Hostile Indicators Identified
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                    <th className="py-3 px-4">Contact Indicator</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-center">Frauds Detected</th>
                    <th className="py-3 px-4">Reputation Status</th>
                    <th className="py-3 px-4">Telecom / Gateway</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {batchResults.map((res, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        {res.indicator}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {res.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`font-mono text-base font-black px-2.5 py-0.5 rounded ${
                          res.total_frauds_detected > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {res.total_frauds_detected} Frauds
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          res.reputation_status === 'CRITICAL_FRAUD' ? 'bg-rose-100 text-rose-800' :
                          res.reputation_status === 'SUSPICIOUS' ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {res.reputation_status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px] truncate max-w-xs">
                        {res.carrier_or_gateway}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setContactQuery(res.indicator);
                            setActiveTab('contact_intel');
                            handleQueryContact(res.indicator);
                          }}
                          className="px-2.5 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Deep Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUBMIT INCIDENT REPORT (WITH LIVE LOGO & CONTACT ANALYSIS) */}
      {/* ========================================================================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Submit Fraud Incident to Reporting Center
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Intake new brand impersonation, copycat logo, fraudulent phone, or phishing incident for {currentCompany?.name}.
            </p>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Threat Vector
                  </label>
                  <select
                    value={indicatorType}
                    onChange={(e) => {
                      const newType = e.target.value as IndicatorType;
                      setIndicatorType(newType);
                      if (newType === 'phone' || newType === 'email') {
                        if (indicatorValue.length >= 6) {
                          setModalContactIntel(queryIndicatorFraudIntelligence(indicatorValue, reports));
                        }
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="url">Malicious URL / Domain</option>
                    <option value="logo">Counterfeit Logo / Trademark</option>
                    <option value="phone">Vishing Phone Number</option>
                    <option value="email">Phishing Email Address</option>
                    <option value="qr">Quishing QR Code</option>
                    <option value="app">Copycat Mobile Application</option>
                    <option value="social">Fake Social Profile</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Target Brand Identity
                  </label>
                  <select
                    value={targetBrand}
                    onChange={(e) => setTargetBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    {Object.keys(BRAND_REGISTRY_DATABASE).map(b => (
                      <option key={b} value={b}>{b} (Brand Trust Registry)</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DYNAMIC LOGO UPLOADER INSIDE MODAL */}
              {indicatorType === 'logo' && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Upload Logo to Cross-Reference ({targetBrand})
                    </label>
                    <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-bold">
                      BRAND TRUST REGISTRY
                    </span>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleModalLogoUpload}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />

                  {modalLogoAnalysis && (
                    <div className={`p-3 rounded-xl border flex items-center justify-between ${
                      modalLogoAnalysis.safety_assessment === 'Likely Authentic'
                        ? 'bg-emerald-50 border-emerald-200'
                        : modalLogoAnalysis.safety_assessment === 'Suspected Impersonation'
                        ? 'bg-rose-50 border-rose-200'
                        : 'bg-slate-100 border-slate-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        {modalLogoAnalysis.safety_assessment === 'Likely Authentic' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <AlertOctagon className="w-5 h-5 text-rose-600" />
                        )}
                        <div>
                          <div className={`text-xs font-bold ${
                            modalLogoAnalysis.safety_assessment === 'Likely Authentic' ? 'text-emerald-800' : 'text-rose-800'
                          }`}>
                            Assessment: {modalLogoAnalysis.safety_assessment.toUpperCase()}
                          </div>
                          <div className="text-[11px] text-slate-600">
                            {modalLogoAnalysis.similarity_score}% collision with {targetBrand} Brand Registry
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* INDICATOR VALUE INPUT */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Indicator Value
                </label>
                <input
                  type="text"
                  required
                  value={indicatorValue}
                  onChange={(e) => handleIndicatorChange(e.target.value)}
                  placeholder={
                    indicatorType === 'phone' ? '+1-800-555-0199' :
                    indicatorType === 'email' ? 'billing-alert@nova-pay-support.net' :
                    indicatorType === 'logo' ? 'novapay_counterfeit_icon.png' :
                    'novapay-secure-login.com'
                  }
                  className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none"
                />
              </div>

              {/* DYNAMIC CONTACT FRAUD COUNTER CALLOUT INSIDE MODAL */}
              {(indicatorType === 'phone' || indicatorType === 'email') && modalContactIntel && (
                <div className={`p-3.5 rounded-xl border flex items-center justify-between animate-fadeIn ${
                  modalContactIntel.total_frauds_detected > 0
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="flex items-center gap-2.5">
                    {modalContactIntel.total_frauds_detected > 0 ? (
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    <div>
                      <strong className="block text-xs font-bold">
                        {modalContactIntel.total_frauds_detected > 0
                          ? `${modalContactIntel.total_frauds_detected} Frauds Detected Under This ${modalContactIntel.type.toUpperCase()}`
                          : `0 Frauds Detected (Clean Reputation)`}
                      </strong>
                      <span className="text-[11px] text-slate-600 block mt-0.5">
                        Gateway: {modalContactIntel.carrier_or_gateway}
                      </span>
                    </div>
                  </div>

                  <span className={`font-mono text-sm font-black px-2 py-0.5 rounded ${
                    modalContactIntel.total_frauds_detected > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {modalContactIntel.total_frauds_detected} INCIDENTS
                  </span>
                </div>
              )}

              {/* DUPLICATE WARNING CALLOUT */}
              {duplicateWarning && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5 animate-fadeIn">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Duplicate Indicator Detected:</strong>
                    <span>
                      Indicator was already reported as <span className="font-mono">{duplicateWarning.id}</span> (Status: {duplicateWarning.status}). Your submission will automatically be grouped into this cluster.
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Incident Description & Findings
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe where this threat was encountered (e.g. SMS lure, camera photo from store, cloned website)..."
                  className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md shadow-purple-600/20 cursor-pointer"
                >
                  Submit Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
