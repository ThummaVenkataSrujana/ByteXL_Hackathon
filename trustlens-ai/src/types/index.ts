export type UserRole = 'owner' | 'company_head' | 'admin' | 'analyst' | 'employee';
export type UserStatus = 'active' | 'restricted' | 'disabled';
export type IndicatorType = 'url' | 'email' | 'phone' | 'social' | 'app' | 'qr' | 'logo';
export type ReportStatus = 'pending' | 'under_review' | 'confirmed' | 'rejected' | 'blocked' | 'unblocked';
export type ThreatCategory =
  | 'Brand Impersonation / Phishing'
  | 'Credential Harvesting'
  | 'Malicious QR (Quishing)'
  | 'Copycat Mobile Application'
  | 'Executive Impersonation'
  | 'Fake Support / Vishing'
  | 'Counterfeit E-Commerce'
  | 'Domain Typo-Squatting';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved';

export interface Company {
  id: string;
  name: string;
  industry: string;
  official_domain: string;
  security_head_user_id: string;
  logo_url?: string;
  created_at: string;
}

export interface User {
  id: string;
  company_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  employee_code: string;
  status: UserStatus;
  department?: string;
  passkey_enrolled?: boolean;
  failed_attempt_count: number;
  created_at: string;
}

export interface Brand {
  id: string;
  company_id: string;
  brand_name: string;
  alternate_spellings: string[];
  logo_url: string;
  created_at: string;
}

export interface OfficialAsset {
  id: string;
  company_id: string;
  brand_id?: string;
  asset_type: 'domain' | 'email_domain' | 'social_handle' | 'app_id' | 'partner_domain';
  asset_value: string;
  is_allowlisted: boolean;
  notes?: string;
  created_at: string;
}

export interface EvidenceItem {
  id: string;
  report_id: string;
  company_id: string;
  evidence_type: string;
  evidence_value: string;
  file_url?: string;
  notes?: string;
  created_at: string;
}

export interface ThreatAssessment {
  id: string;
  report_id: string;
  company_id: string;
  risk_score: number;
  confidence: 'Low' | 'Medium' | 'High';
  threat_category: ThreatCategory;
  rule_results: {
    rule: string;
    matched: boolean;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    detail: string;
  }[];
  osint_results: {
    domain_age_days: number;
    registrar: string;
    dns_record_type: string;
    mx_record_found: boolean;
    ssl_issuer: string;
    geo_location: string;
    ip_address: string;
  };
  gemini_summary: string;
  recommended_action: string;
  created_at: string;
}

export interface FraudReport {
  id: string;
  company_id: string;
  reporter_id: string;
  reporter_name?: string;
  reporter_email?: string;
  indicator_type: IndicatorType;
  indicator_value: string;
  description: string;
  status: ReportStatus;
  risk_score: number;
  confidence: 'Low' | 'Medium' | 'High';
  threat_category: ThreatCategory;
  target_brand?: string;
  evidence_signals?: string[];
  osint_data?: any;
  created_at: string;
  updated_at?: string;
}

export interface BlocklistItem {
  id: string;
  company_id: string;
  report_id?: string;
  indicator_value: string;
  indicator_type: IndicatorType;
  risk_score: number;
  reason: string;
  threat_category: ThreatCategory;
  status: 'active' | 'expired' | 'unblocked';
  expires_at: string;
  blocked_by: string;
  created_at: string;
}

export interface BlockAnchor {
  id: string;
  company_id: string;
  blocklist_id?: string;
  report_id: string;
  record_hash: string;
  blockchain_tx_hash: string;
  blockchain_network: 'Polygon Amoy Testnet' | 'Local Hash Chain';
  anchor_status: 'anchored' | 'local_hash_chain' | 'failed';
  block_number?: number;
  anchored_at: string;
}

export interface ZkProof {
  id: string;
  company_id: string;
  report_id: string;
  merkle_root: string;
  proof_metadata: {
    company_registered: boolean;
    evidence_signals_count: number;
    risk_score_met: boolean;
    analyst_verified: boolean;
    tamper_proof_hash: string;
  };
  claims: string[];
  verification_status: 'PASSED' | 'PENDING' | 'FAILED';
  created_at: string;
}

export interface LoginAttempt {
  id: string;
  company_id: string;
  user_id?: string;
  attempted_email: string;
  status: 'success' | 'failed';
  ip_address: string;
  device: string;
  browser: string;
  location?: string;
  failed_attempt_count: number;
  created_at: string;
}

export interface SecurityAlert {
  id: string;
  company_id: string;
  user_id?: string;
  alert_type: 'failed_login_threshold' | 'new_high_threat' | 'url_blocked' | 'impersonation_spike';
  severity: AlertSeverity;
  title: string;
  message: string;
  metadata: {
    employee_id?: string;
    employee_name?: string;
    attempted_email?: string;
    failed_attempts?: number;
    time_window?: string;
    ip_address?: string;
    device?: string;
    recommended_action?: string;
    indicator_value?: string;
    risk_score?: number;
  };
  status: AlertStatus;
  delivery_status: 'delivered' | 'pending' | 'failed';
  created_at: string;
}

export interface ChatMessage {
  id: string;
  company_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  message: string;
  sources?: string[];
  recommended_action?: string;
  evidence_data?: any;
  action_proposal?: {
    type: 'send_alert' | 'block_url' | 'restrict_user';
    title: string;
    details: string;
    payload: any;
  };
  created_at: string;
}

export interface FederatedRound {
  id: string;
  round_number: number;
  company_id: string;
  company_name: string;
  local_accuracy: number;
  global_accuracy: number;
  model_update_hash: string;
  raw_records_shared: number;
  model_updates_shared: number;
  threats_analyzed: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  company_id: string;
  user_id?: string;
  user_email?: string;
  action:
    | 'login_success'
    | 'login_failure'
    | 'account_restricted'
    | 'account_unrestricted'
    | 'report_created'
    | 'report_verified'
    | 'threat_blocked'
    | 'threat_unblocked'
    | 'alert_created'
    | 'alert_acknowledged'
    | 'alert_resolved'
    | 'chatbot_alert_dispatched'
    | 'blockchain_anchored'
    | 'zk_proof_generated'
    | 'federated_round_completed'
    | 'official_asset_added';
  target_type: string;
  target_id: string;
  ip_address: string;
  device: string;
  metadata?: Record<string, any>;
  created_at: string;
}
