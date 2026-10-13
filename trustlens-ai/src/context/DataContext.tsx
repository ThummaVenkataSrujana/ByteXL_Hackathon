import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  FraudReport, BlocklistItem, OfficialAsset, SecurityAlert,
  BlockAnchor, ZkProof, LoginAttempt, FederatedRound, AuditLog, ChatMessage
} from '../types';
import {
  SEED_FRAUD_REPORTS, SEED_BLOCKLIST, SEED_OFFICIAL_ASSETS,
  SEED_SECURITY_ALERTS, SEED_BLOCK_ANCHORS, SEED_ZK_PROOFS,
  SEED_LOGIN_ATTEMPTS, SEED_FEDERATED_ROUNDS, SEED_AUDIT_LOGS
} from '../data/seedData';
import { useAuth } from './AuthContext';
import { sha256, buildMerkleTree, generateRandomHex } from '../services/cryptoService';

interface DataContextType {
  reports: FraudReport[];
  blocklist: BlocklistItem[];
  officialAssets: OfficialAsset[];
  alerts: SecurityAlert[];
  anchors: BlockAnchor[];
  zkProofs: ZkProof[];
  loginAttempts: LoginAttempt[];
  federatedRounds: FederatedRound[];
  auditLogs: AuditLog[];
  chatHistory: ChatMessage[];
  addFraudReport: (report: Omit<FraudReport, 'id' | 'created_at'>) => Promise<FraudReport>;
  updateReportStatus: (reportId: string, status: FraudReport['status']) => void;
  addToBlocklist: (item: Omit<BlocklistItem, 'id' | 'created_at'>) => Promise<BlocklistItem>;
  removeFromBlocklist: (id: string) => void;
  anchorEvidence: (reportId: string, network?: 'Polygon Amoy Testnet' | 'Local Hash Chain') => Promise<BlockAnchor>;
  generateZkProof: (reportId: string) => Promise<ZkProof>;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  dispatchHeadAlert: (title: string, message: string, metadata?: any) => Promise<SecurityAlert>;
  runFederatedRound: () => Promise<FederatedRound>;
  addOfficialAsset: (asset: Omit<OfficialAsset, 'id' | 'created_at'>) => void;
  saveChatMessage: (msg: Omit<ChatMessage, 'id' | 'created_at'>) => void;
  clearChatHistory: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, currentCompany } = useAuth();

  const [reports, setReports] = useState<FraudReport[]>(() => {
    try {
      const s = localStorage.getItem('trustlens_reports');
      return s ? JSON.parse(s) : SEED_FRAUD_REPORTS;
    } catch { return SEED_FRAUD_REPORTS; }
  });

  const [blocklist, setBlocklist] = useState<BlocklistItem[]>(() => {
    try {
      const s = localStorage.getItem('trustlens_blocklist');
      return s ? JSON.parse(s) : SEED_BLOCKLIST;
    } catch { return SEED_BLOCKLIST; }
  });

  const [officialAssets, setOfficialAssets] = useState<OfficialAsset[]>(() => {
    try {
      const s = localStorage.getItem('trustlens_assets');
      return s ? JSON.parse(s) : SEED_OFFICIAL_ASSETS;
    } catch { return SEED_OFFICIAL_ASSETS; }
  });

  const [alerts, setAlerts] = useState<SecurityAlert[]>(() => {
    try {
      const s = localStorage.getItem('trustlens_alerts');
      return s ? JSON.parse(s) : SEED_SECURITY_ALERTS;
    } catch { return SEED_SECURITY_ALERTS; }
  });

  const [anchors, setAnchors] = useState<BlockAnchor[]>(() => {
    try {
      const s = localStorage.getItem('trustlens_anchors');
      return s ? JSON.parse(s) : SEED_BLOCK_ANCHORS;
    } catch { return SEED_BLOCK_ANCHORS; }
  });

  const [zkProofs, setZkProofs] = useState<ZkProof[]>(() => {
    try {
      const s = localStorage.getItem('trustlens_zk_proofs');
      return s ? JSON.parse(s) : SEED_ZK_PROOFS;
    } catch { return SEED_ZK_PROOFS; }
  });

  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>(() => {
    try {
      const s = localStorage.getItem('trustlens_login_attempts');
      return s ? JSON.parse(s) : SEED_LOGIN_ATTEMPTS;
    } catch { return SEED_LOGIN_ATTEMPTS; }
  });

  const [federatedRounds, setFederatedRounds] = useState<FederatedRound[]>(() => {
    try {
      const s = localStorage.getItem('trustlens_federated');
      return s ? JSON.parse(s) : SEED_FEDERATED_ROUNDS;
    } catch { return SEED_FEDERATED_ROUNDS; }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const s = localStorage.getItem('trustlens_audit');
      return s ? JSON.parse(s) : SEED_AUDIT_LOGS;
    } catch { return SEED_AUDIT_LOGS; }
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    try {
      const s = localStorage.getItem('trustlens_chat');
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });

  // Sync to local storage
  useEffect(() => { localStorage.setItem('trustlens_reports', JSON.stringify(reports)); }, [reports]);
  useEffect(() => { localStorage.setItem('trustlens_blocklist', JSON.stringify(blocklist)); }, [blocklist]);
  useEffect(() => { localStorage.setItem('trustlens_assets', JSON.stringify(officialAssets)); }, [officialAssets]);
  useEffect(() => { localStorage.setItem('trustlens_alerts', JSON.stringify(alerts)); }, [alerts]);
  useEffect(() => { localStorage.setItem('trustlens_anchors', JSON.stringify(anchors)); }, [anchors]);
  useEffect(() => { localStorage.setItem('trustlens_zk_proofs', JSON.stringify(zkProofs)); }, [zkProofs]);
  useEffect(() => { localStorage.setItem('trustlens_login_attempts', JSON.stringify(loginAttempts)); }, [loginAttempts]);
  useEffect(() => { localStorage.setItem('trustlens_federated', JSON.stringify(federatedRounds)); }, [federatedRounds]);
  useEffect(() => { localStorage.setItem('trustlens_audit', JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem('trustlens_chat', JSON.stringify(chatHistory)); }, [chatHistory]);

  // Listen for login events to log attempts and trigger alerts
  useEffect(() => {
    const handleLoginFailed = (e: any) => {
      const { user, attemptCount, restricted } = e.detail;
      const compId = user.company_id;
      const now = new Date().toISOString();

      const newAttempt: LoginAttempt = {
        id: `att-${Date.now()}`,
        company_id: compId,
        user_id: user.id,
        attempted_email: user.email,
        status: 'failed',
        ip_address: '103.21.58.14',
        device: 'Chrome on Windows',
        browser: 'Chrome 128.0.0.0',
        failed_attempt_count: attemptCount,
        created_at: now,
      };

      setLoginAttempts(prev => [newAttempt, ...prev]);

      // Add audit log
      const newAudit: AuditLog = {
        id: `aud-${Date.now()}`,
        company_id: compId,
        user_id: user.id,
        user_email: user.email,
        action: restricted ? 'account_restricted' : 'login_failure',
        target_type: 'user',
        target_id: user.id,
        ip_address: '103.21.58.14',
        device: 'Chrome on Windows',
        metadata: { failed_attempt_count: attemptCount, restricted },
        created_at: now,
      };
      setAuditLogs(prev => [newAudit, ...prev]);

      // If restricted (3 failed attempts), auto-create alert for company head!
      if (restricted) {
        const alertId = `ALT-2026-${Math.floor(100000 + Math.random() * 900000)}`;
        const companyName = currentCompany?.name || 'NovaPay';
        const newAlert: SecurityAlert = {
          id: alertId,
          company_id: compId,
          user_id: user.id,
          alert_type: 'failed_login_threshold',
          severity: 'critical',
          title: `Repeated Failed Logins — ${user.full_name} Restricted`,
          message: `🚨 TrustLens Security Alert — ${companyName}\n\nRepeated failed login attempts detected.\n\nEmployee ID: ${user.employee_code}\nAttempted email: ${user.email}\nCompany: ${companyName}\nFailed attempts: 3\nTime window: Just now\nIP address: 103.21.58.14\nDevice/browser: Chrome on Windows\n\nAction taken:\n- Login attempts temporarily restricted\n- Security alert created\n- Incident added to audit log\n\nRecommended action:\n- Verify whether this was the employee\n- Require password reset and passkey re-registration\n- Review recent account activity\n\nAlert ID: ${alertId}`,
          metadata: {
            employee_id: user.employee_code,
            employee_name: user.full_name,
            attempted_email: user.email,
            failed_attempts: 3,
            time_window: 'Just now',
            ip_address: '103.21.58.14',
            device: 'Chrome on Windows',
            recommended_action: 'Verify employee identity and enforce password reset.',
          },
          status: 'open',
          delivery_status: 'delivered',
          created_at: now,
        };

        setAlerts(prev => [newAlert, ...prev]);
      }
    };

    const handleLoginSuccess = (e: any) => {
      const { user, method } = e.detail;
      const now = new Date().toISOString();

      const newAttempt: LoginAttempt = {
        id: `att-${Date.now()}`,
        company_id: user.company_id,
        user_id: user.id,
        attempted_email: user.email,
        status: 'success',
        ip_address: '103.21.58.10',
        device: 'Authorized Workstation',
        browser: 'Browser Session',
        failed_attempt_count: 0,
        created_at: now,
      };
      setLoginAttempts(prev => [newAttempt, ...prev]);

      const newAudit: AuditLog = {
        id: `aud-${Date.now()}`,
        company_id: user.company_id,
        user_id: user.id,
        user_email: user.email,
        action: 'login_success',
        target_type: 'user',
        target_id: user.id,
        ip_address: '103.21.58.10',
        device: 'Authorized Workstation',
        metadata: { method },
        created_at: now,
      };
      setAuditLogs(prev => [newAudit, ...prev]);
    };

    const handleUnrestricted = (e: any) => {
      const { userId } = e.detail;
      const now = new Date().toISOString();
      const newAudit: AuditLog = {
        id: `aud-${Date.now()}`,
        company_id: currentUser?.company_id || 'comp-novapay',
        user_id: currentUser?.id,
        user_email: currentUser?.email,
        action: 'account_unrestricted',
        target_type: 'user',
        target_id: userId,
        ip_address: '127.0.0.1',
        device: 'Security Admin Console',
        created_at: now,
      };
      setAuditLogs(prev => [newAudit, ...prev]);
    };

    window.addEventListener('trustlens:login_failed', handleLoginFailed);
    window.addEventListener('trustlens:login_success', handleLoginSuccess);
    window.addEventListener('trustlens:user_unrestricted', handleUnrestricted);

    return () => {
      window.removeEventListener('trustlens:login_failed', handleLoginFailed);
      window.removeEventListener('trustlens:login_success', handleLoginSuccess);
      window.removeEventListener('trustlens:user_unrestricted', handleUnrestricted);
    };
  }, [currentUser, currentCompany]);

  const addFraudReport = async (reportData: Omit<FraudReport, 'id' | 'created_at'>): Promise<FraudReport> => {
    const reportId = `REP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();

    const newReport: FraudReport = {
      ...reportData,
      id: reportId,
      created_at: now,
    };

    setReports(prev => [newReport, ...prev]);

    // Log to audit
    const newAudit: AuditLog = {
      id: `aud-${Date.now()}`,
      company_id: reportData.company_id,
      user_id: reportData.reporter_id,
      user_email: reportData.reporter_email,
      action: 'report_created',
      target_type: 'fraud_report',
      target_id: reportId,
      ip_address: '103.21.58.10',
      device: 'TrustLens Reporter',
      metadata: { indicator: reportData.indicator_value, risk_score: reportData.risk_score },
      created_at: now,
    };
    setAuditLogs(prev => [newAudit, ...prev]);

    // Auto-block if score >= 85 and >= 2 signals
    if (newReport.risk_score >= 85 && (newReport.evidence_signals?.length || 0) >= 2) {
      await addToBlocklist({
        company_id: newReport.company_id,
        report_id: reportId,
        indicator_value: newReport.indicator_value,
        indicator_type: newReport.indicator_type,
        risk_score: newReport.risk_score,
        reason: `Automated Sentinel Block: Risk score ${newReport.risk_score}/100 exceeds critical threshold`,
        threat_category: newReport.threat_category,
        status: 'active',
        expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
        blocked_by: 'Auto-Sentinel Rule',
      });
    }

    return newReport;
  };

  const updateReportStatus = (reportId: string, status: FraudReport['status']) => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status, updated_at: new Date().toISOString() } : r));

    const now = new Date().toISOString();
    const newAudit: AuditLog = {
      id: `aud-${Date.now()}`,
      company_id: currentUser?.company_id || 'comp-novapay',
      user_id: currentUser?.id,
      action: 'report_verified',
      target_type: 'fraud_report',
      target_id: reportId,
      ip_address: '103.21.58.10',
      device: 'Analyst Workstation',
      metadata: { status },
      created_at: now,
    };
    setAuditLogs(prev => [newAudit, ...prev]);
  };

  const addToBlocklist = async (itemData: Omit<BlocklistItem, 'id' | 'created_at'>): Promise<BlocklistItem> => {
    const blockId = `blk-${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    const newItem: BlocklistItem = {
      ...itemData,
      id: blockId,
      created_at: now,
    };

    setBlocklist(prev => [newItem, ...prev]);

    // Add audit log
    const newAudit: AuditLog = {
      id: `aud-${Date.now()}`,
      company_id: itemData.company_id,
      user_id: currentUser?.id,
      action: 'threat_blocked',
      target_type: 'blocklist',
      target_id: blockId,
      ip_address: '103.21.58.10',
      device: 'Enterprise Security Engine',
      metadata: { indicator: itemData.indicator_value, risk_score: itemData.risk_score },
      created_at: now,
    };
    setAuditLogs(prev => [newAudit, ...prev]);

    // If report_id present, auto anchor evidence and generate ZK proof
    if (itemData.report_id) {
      await anchorEvidence(itemData.report_id);
      await generateZkProof(itemData.report_id);
    }

    return newItem;
  };

  const removeFromBlocklist = (id: string) => {
    setBlocklist(prev => prev.filter(b => b.id !== id));
    const now = new Date().toISOString();
    const newAudit: AuditLog = {
      id: `aud-${Date.now()}`,
      company_id: currentUser?.company_id || 'comp-novapay',
      user_id: currentUser?.id,
      action: 'threat_unblocked',
      target_type: 'blocklist',
      target_id: id,
      ip_address: '103.21.58.10',
      device: 'Security Head Override',
      created_at: now,
    };
    setAuditLogs(prev => [newAudit, ...prev]);
  };

  const anchorEvidence = async (reportId: string, network: 'Polygon Amoy Testnet' | 'Local Hash Chain' = 'Polygon Amoy Testnet'): Promise<BlockAnchor> => {
    const report = reports.find(r => r.id === reportId);
    const now = new Date().toISOString();

    const payloadString = JSON.stringify({
      reportId,
      indicator: report?.indicator_value || 'unknown',
      risk_score: report?.risk_score || 90,
      decision: 'BLOCKED',
      analyst: currentUser?.full_name || 'Sentinel Auto Engine',
      timestamp: now,
    });

    const recordHash = await sha256(payloadString);
    const txHash = generateRandomHex(64);

    const newAnchor: BlockAnchor = {
      id: `anc-${Math.random().toString(36).substring(2, 9)}`,
      company_id: report?.company_id || currentUser?.company_id || 'comp-novapay',
      report_id: reportId,
      record_hash: recordHash,
      blockchain_tx_hash: txHash,
      blockchain_network: network,
      anchor_status: 'anchored',
      block_number: 14892000 + Math.floor(Math.random() * 5000),
      anchored_at: now,
    };

    setAnchors(prev => [newAnchor, ...prev.filter(a => a.report_id !== reportId)]);

    const newAudit: AuditLog = {
      id: `aud-${Date.now()}`,
      company_id: newAnchor.company_id,
      user_id: currentUser?.id,
      action: 'blockchain_anchored',
      target_type: 'block_anchor',
      target_id: newAnchor.id,
      ip_address: '103.21.58.10',
      device: 'Security Node Worker',
      metadata: { record_hash: recordHash, tx_hash: txHash, network },
      created_at: now,
    };
    setAuditLogs(prev => [newAudit, ...prev]);

    return newAnchor;
  };

  const generateZkProof = async (reportId: string): Promise<ZkProof> => {
    const report = reports.find(r => r.id === reportId);
    const now = new Date().toISOString();

    const claims = [
      `Belongs to registered company (${currentCompany?.name || 'NovaPay'})`,
      `Evidence signals count >= 2 (${report?.evidence_signals?.length || 3} verified signals)`,
      `Risk score exceeds blocking threshold (${report?.risk_score || 90} >= 85)`,
      `Analyst cryptographic verification signature present`,
      `Zero-knowledge payload integrity verified (no sensitive customer records exposed)`,
    ];

    const { root } = await buildMerkleTree(claims);
    const payloadHash = await sha256(JSON.stringify(report || {}));

    const newProof: ZkProof = {
      id: `zk-${Math.random().toString(36).substring(2, 9)}`,
      company_id: report?.company_id || currentUser?.company_id || 'comp-novapay',
      report_id: reportId,
      merkle_root: root,
      proof_metadata: {
        company_registered: true,
        evidence_signals_count: report?.evidence_signals?.length || 3,
        risk_score_met: (report?.risk_score || 90) >= 85,
        analyst_verified: true,
        tamper_proof_hash: payloadHash,
      },
      claims,
      verification_status: 'PASSED',
      created_at: now,
    };

    setZkProofs(prev => [newProof, ...prev.filter(z => z.report_id !== reportId)]);

    const newAudit: AuditLog = {
      id: `aud-${Date.now()}`,
      company_id: newProof.company_id,
      user_id: currentUser?.id,
      action: 'zk_proof_generated',
      target_type: 'zk_proof',
      target_id: newProof.id,
      ip_address: '103.21.58.10',
      device: 'ZK Cryptographic Prover',
      metadata: { merkle_root: root, claims_count: claims.length },
      created_at: now,
    };
    setAuditLogs(prev => [newAudit, ...prev]);

    return newProof;
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'acknowledged' } : a));
    const now = new Date().toISOString();
    setAuditLogs(prev => [
      {
        id: `aud-${Date.now()}`,
        company_id: currentUser?.company_id || 'comp-novapay',
        user_id: currentUser?.id,
        action: 'alert_acknowledged',
        target_type: 'alert',
        target_id: alertId,
        ip_address: '103.21.58.10',
        device: 'Alert Monitor',
        created_at: now,
      },
      ...prev,
    ]);
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'resolved' } : a));
    const now = new Date().toISOString();
    setAuditLogs(prev => [
      {
        id: `aud-${Date.now()}`,
        company_id: currentUser?.company_id || 'comp-novapay',
        user_id: currentUser?.id,
        action: 'alert_resolved',
        target_type: 'alert',
        target_id: alertId,
        ip_address: '103.21.58.10',
        device: 'Alert Monitor',
        created_at: now,
      },
      ...prev,
    ]);
  };

  const dispatchHeadAlert = async (title: string, message: string, metadata: any = {}): Promise<SecurityAlert> => {
    const alertId = `ALT-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();
    const newAlert: SecurityAlert = {
      id: alertId,
      company_id: currentUser?.company_id || 'comp-novapay',
      user_id: currentUser?.id,
      alert_type: 'failed_login_threshold',
      severity: 'critical',
      title,
      message,
      metadata,
      status: 'open',
      delivery_status: 'delivered',
      created_at: now,
    };

    setAlerts(prev => [newAlert, ...prev]);

    const newAudit: AuditLog = {
      id: `aud-${Date.now()}`,
      company_id: currentUser?.company_id || 'comp-novapay',
      user_id: currentUser?.id,
      action: 'chatbot_alert_dispatched',
      target_type: 'alert',
      target_id: alertId,
      ip_address: '103.21.58.10',
      device: 'TrustLens Sentinel Chatbot',
      metadata: { alert_id: alertId, title },
      created_at: now,
    };
    setAuditLogs(prev => [newAudit, ...prev]);

    return newAlert;
  };

  const runFederatedRound = async (): Promise<FederatedRound> => {
    const latestRoundNum = federatedRounds.length > 0
      ? Math.max(...federatedRounds.map(r => r.round_number))
      : 3;
    const nextRound = latestRoundNum + 1;
    const now = new Date().toISOString();
    const compName = currentCompany?.name || 'NovaPay';
    const compId = currentCompany?.id || 'comp-novapay';

    const newRound: FederatedRound = {
      id: `fed-${nextRound}-${Math.random().toString(36).substring(2, 6)}`,
      round_number: nextRound,
      company_id: compId,
      company_name: compName,
      local_accuracy: Math.min(84 + Math.floor(Math.random() * 4), 95),
      global_accuracy: Math.min(91 + Math.floor(Math.random() * 3), 96),
      model_update_hash: generateRandomHex(16),
      raw_records_shared: 0,
      model_updates_shared: nextRound,
      threats_analyzed: 700 + nextRound * 40,
      created_at: now,
    };

    setFederatedRounds(prev => [newRound, ...prev]);

    const newAudit: AuditLog = {
      id: `aud-${Date.now()}`,
      company_id: compId,
      user_id: currentUser?.id,
      action: 'federated_round_completed',
      target_type: 'federated_round',
      target_id: newRound.id,
      ip_address: '127.0.0.1',
      device: 'Federated Coordinator',
      metadata: { round: nextRound, global_accuracy: newRound.global_accuracy, records_shared: 0 },
      created_at: now,
    };
    setAuditLogs(prev => [newAudit, ...prev]);

    return newRound;
  };

  const addOfficialAsset = (assetData: Omit<OfficialAsset, 'id' | 'created_at'>) => {
    const assetId = `ast-${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();
    const newAsset: OfficialAsset = {
      ...assetData,
      id: assetId,
      created_at: now,
    };
    setOfficialAssets(prev => [newAsset, ...prev]);

    const newAudit: AuditLog = {
      id: `aud-${Date.now()}`,
      company_id: assetData.company_id,
      user_id: currentUser?.id,
      action: 'official_asset_added',
      target_type: 'official_asset',
      target_id: assetId,
      ip_address: '103.21.58.10',
      device: 'Registry Console',
      metadata: { asset_value: assetData.asset_value, asset_type: assetData.asset_type },
      created_at: now,
    };
    setAuditLogs(prev => [newAudit, ...prev]);
  };

  const saveChatMessage = (msgData: Omit<ChatMessage, 'id' | 'created_at'>) => {
    const msg: ChatMessage = {
      ...msgData,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    setChatHistory(prev => [...prev, msg]);
  };

  const clearChatHistory = () => {
    setChatHistory([]);
    localStorage.removeItem('trustlens_chat');
  };

  return (
    <DataContext.Provider
      value={{
        reports,
        blocklist,
        officialAssets,
        alerts,
        anchors,
        zkProofs,
        loginAttempts,
        federatedRounds,
        auditLogs,
        chatHistory,
        addFraudReport,
        updateReportStatus,
        addToBlocklist,
        removeFromBlocklist,
        anchorEvidence,
        generateZkProof,
        acknowledgeAlert,
        resolveAlert,
        dispatchHeadAlert,
        runFederatedRound,
        addOfficialAsset,
        saveChatMessage,
        clearChatHistory,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
