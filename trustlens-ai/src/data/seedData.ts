import {
  Company, User, Brand, OfficialAsset, FraudReport, BlocklistItem,
  BlockAnchor, ZkProof, LoginAttempt, SecurityAlert, FederatedRound, AuditLog, ThreatAssessment
} from '../types';

export const SEED_COMPANIES: Company[] = [
  {
    id: 'comp-novapay',
    name: 'NovaPay',
    industry: 'Fintech',
    official_domain: 'novapay.com',
    security_head_user_id: 'usr-np-head',
    created_at: '2026-01-10T08:00:00Z',
  },
  {
    id: 'comp-finsecure',
    name: 'FinSecure Bank',
    industry: 'Banking',
    official_domain: 'finsecurebank.com',
    security_head_user_id: 'usr-fs-head',
    created_at: '2026-01-12T09:30:00Z',
  },
  {
    id: 'comp-shopshield',
    name: 'ShopShield',
    industry: 'E-commerce',
    official_domain: 'shopshield.com',
    security_head_user_id: 'usr-ss-head',
    created_at: '2026-01-15T11:00:00Z',
  },
  {
    id: 'comp-meditrust',
    name: 'MediTrust',
    industry: 'Healthcare',
    official_domain: 'meditrust.com',
    security_head_user_id: 'usr-mt-head',
    created_at: '2026-01-18T14:15:00Z',
  },
  {
    id: 'comp-edusafe',
    name: 'EduSafe',
    industry: 'EdTech',
    official_domain: 'edusafe.com',
    security_head_user_id: 'usr-es-head',
    created_at: '2026-01-20T10:00:00Z',
  },
];

export const SEED_BRANDS: Brand[] = [
  {
    id: 'brand-np',
    company_id: 'comp-novapay',
    brand_name: 'NovaPay',
    alternate_spellings: ['Nova Pay', 'Nova-Pay', 'NovaPay Global', 'NovaWallet'],
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    created_at: '2026-01-10T08:00:00Z',
  },
  {
    id: 'brand-fs',
    company_id: 'comp-finsecure',
    brand_name: 'FinSecure Bank',
    alternate_spellings: ['FinSecure', 'Fin-Secure Bank', 'FinSecure Online'],
    logo_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=80',
    created_at: '2026-01-12T09:30:00Z',
  },
  {
    id: 'brand-ss',
    company_id: 'comp-shopshield',
    brand_name: 'ShopShield',
    alternate_spellings: ['Shop Shield', 'Shop-Shield Retail'],
    logo_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&auto=format&fit=crop&q=80',
    created_at: '2026-01-15T11:00:00Z',
  },
  {
    id: 'brand-mt',
    company_id: 'comp-meditrust',
    brand_name: 'MediTrust',
    alternate_spellings: ['Medi Trust', 'Medi-Trust Health'],
    logo_url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=100&auto=format&fit=crop&q=80',
    created_at: '2026-01-18T14:15:00Z',
  },
  {
    id: 'brand-es',
    company_id: 'comp-edusafe',
    brand_name: 'EduSafe',
    alternate_spellings: ['Edu Safe', 'Edu-Safe Learning'],
    logo_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=100&auto=format&fit=crop&q=80',
    created_at: '2026-01-20T10:00:00Z',
  },
];

export const SEED_OFFICIAL_ASSETS: OfficialAsset[] = [
  // NovaPay
  { id: 'ast-np-1', company_id: 'comp-novapay', asset_type: 'domain', asset_value: 'novapay.com', is_allowlisted: true, notes: 'Primary corporate portal', created_at: '2026-01-10T08:00:00Z' },
  { id: 'ast-np-2', company_id: 'comp-novapay', asset_type: 'domain', asset_value: 'app.novapay.com', is_allowlisted: true, notes: 'Web application interface', created_at: '2026-01-10T08:00:00Z' },
  { id: 'ast-np-3', company_id: 'comp-novapay', asset_type: 'email_domain', asset_value: 'novapay.com', is_allowlisted: true, notes: 'Corporate email gateway with DKIM/DMARC', created_at: '2026-01-10T08:00:00Z' },
  { id: 'ast-np-4', company_id: 'comp-novapay', asset_type: 'social_handle', asset_value: '@NovaPayOfficial', is_allowlisted: true, notes: 'Verified Twitter/X handle', created_at: '2026-01-10T08:00:00Z' },
  { id: 'ast-np-5', company_id: 'comp-novapay', asset_type: 'app_id', asset_value: 'com.novapay.mobile', is_allowlisted: true, notes: 'Official Google Play / App Store Bundle', created_at: '2026-01-10T08:00:00Z' },
  { id: 'ast-np-6', company_id: 'comp-novapay', asset_type: 'partner_domain', asset_value: 'checkout.stripe.com', is_allowlisted: true, notes: 'Verified payment processor integration', created_at: '2026-01-10T08:00:00Z' },

  // FinSecure Bank
  { id: 'ast-fs-1', company_id: 'comp-finsecure', asset_type: 'domain', asset_value: 'finsecurebank.com', is_allowlisted: true, notes: 'Core banking portal', created_at: '2026-01-12T09:30:00Z' },
  { id: 'ast-fs-2', company_id: 'comp-finsecure', asset_type: 'domain', asset_value: 'ebanking.finsecurebank.com', is_allowlisted: true, notes: 'Retail e-banking portal', created_at: '2026-01-12T09:30:00Z' },
  { id: 'ast-fs-3', company_id: 'comp-finsecure', asset_type: 'email_domain', asset_value: 'finsecurebank.com', is_allowlisted: true, notes: 'Official banking mail domain', created_at: '2026-01-12T09:30:00Z' },
  { id: 'ast-fs-4', company_id: 'comp-finsecure', asset_type: 'app_id', asset_value: 'com.finsecure.ebank', is_allowlisted: true, notes: 'Official mobile banking app', created_at: '2026-01-12T09:30:00Z' },

  // ShopShield
  { id: 'ast-ss-1', company_id: 'comp-shopshield', asset_type: 'domain', asset_value: 'shopshield.com', is_allowlisted: true, notes: 'Marketplace platform', created_at: '2026-01-15T11:00:00Z' },
  { id: 'ast-ss-2', company_id: 'comp-shopshield', asset_type: 'email_domain', asset_value: 'shopshield.com', is_allowlisted: true, notes: 'Customer notices email domain', created_at: '2026-01-15T11:00:00Z' },
  { id: 'ast-ss-3', company_id: 'comp-shopshield', asset_type: 'app_id', asset_value: 'com.shopshield.app', is_allowlisted: true, notes: 'Buyer mobile application', created_at: '2026-01-15T11:00:00Z' },

  // MediTrust
  { id: 'ast-mt-1', company_id: 'comp-meditrust', asset_type: 'domain', asset_value: 'meditrust.com', is_allowlisted: true, notes: 'Patient portal & EHR gateway', created_at: '2026-01-18T14:15:00Z' },
  { id: 'ast-mt-2', company_id: 'comp-meditrust', asset_type: 'email_domain', asset_value: 'meditrust.com', is_allowlisted: true, notes: 'HIPAA compliant staff email domain', created_at: '2026-01-18T14:15:00Z' },

  // EduSafe
  { id: 'ast-es-1', company_id: 'comp-edusafe', asset_type: 'domain', asset_value: 'edusafe.com', is_allowlisted: true, notes: 'Campus LMS & authentication hub', created_at: '2026-01-20T10:00:00Z' },
  { id: 'ast-es-2', company_id: 'comp-edusafe', asset_type: 'email_domain', asset_value: 'edusafe.com', is_allowlisted: true, notes: 'Faculty and student mail', created_at: '2026-01-20T10:00:00Z' },
];

// Helper to generate 50 realistic users per company (250 users total)
export function generateUsers(): User[] {
  const users: User[] = [];

  const companyConfigs = [
    { id: 'comp-novapay', code: 'NP', domain: 'novapay.com', headId: 'usr-np-head', headEmail: 'head1@novapay.com', headName: 'Marcus Vance' },
    { id: 'comp-finsecure', code: 'FS', domain: 'finsecurebank.com', headId: 'usr-fs-head', headEmail: 'head2@finsecurebank.com', headName: 'Eleanor Sterling' },
    { id: 'comp-shopshield', code: 'SS', domain: 'shopshield.com', headId: 'usr-ss-head', headEmail: 'head3@shopshield.com', headName: 'David Thorne' },
    { id: 'comp-meditrust', code: 'MT', domain: 'meditrust.com', headId: 'usr-mt-head', headEmail: 'head4@meditrust.com', headName: 'Dr. Sarah Lin' },
    { id: 'comp-edusafe', code: 'ES', domain: 'edusafe.com', headId: 'usr-es-head', headEmail: 'head5@edusafe.com', headName: 'Prof. Julian Brooks' },
  ];

  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle', 'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Melissa', 'George', 'Deborah', 'Edward', 'Stephanie'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

  companyConfigs.forEach((c) => {
    // 1. Company Head
    users.push({
      id: c.headId,
      company_id: c.id,
      full_name: c.headName,
      email: c.headEmail,
      role: 'company_head',
      employee_code: `EMP-${c.code}-001`,
      status: 'active',
      department: 'Executive Security',
      passkey_enrolled: true,
      failed_attempt_count: 0,
      created_at: '2026-01-10T08:00:00Z',
    });

    // 2. Admin
    users.push({
      id: `usr-${c.code.toLowerCase()}-admin`,
      company_id: c.id,
      full_name: `${c.code} System Administrator`,
      email: `admin@${c.domain}`,
      role: 'admin',
      employee_code: `EMP-${c.code}-002`,
      status: 'active',
      department: 'IT Infrastructure',
      passkey_enrolled: true,
      failed_attempt_count: 0,
      created_at: '2026-01-10T08:30:00Z',
    });

    // 3. Analyst 1
    users.push({
      id: `usr-${c.code.toLowerCase()}-analyst1`,
      company_id: c.id,
      full_name: `${c.code === 'NP' ? 'Elena Rostova' : 'Senior Analyst 1'}`,
      email: c.code === 'NP' ? 'analyst1@novapay.com' : `analyst1@${c.domain}`,
      role: 'analyst',
      employee_code: `EMP-${c.code}-003`,
      status: 'active',
      department: 'Fraud Operations',
      passkey_enrolled: true,
      failed_attempt_count: 0,
      created_at: '2026-01-10T09:00:00Z',
    });

    // 4. Analyst 2
    users.push({
      id: `usr-${c.code.toLowerCase()}-analyst2`,
      company_id: c.id,
      full_name: `${c.code === 'NP' ? 'Tariq Al-Mansoor' : 'Threat Intelligence Analyst 2'}`,
      email: `analyst2@${c.domain}`,
      role: 'analyst',
      employee_code: `EMP-${c.code}-004`,
      status: 'active',
      department: 'Threat Intelligence',
      passkey_enrolled: true,
      failed_attempt_count: 0,
      created_at: '2026-01-10T09:15:00Z',
    });

    // 5. Employee 1
    users.push({
      id: `usr-${c.code.toLowerCase()}-emp1`,
      company_id: c.id,
      full_name: `${c.code === 'NP' ? 'Alex Rivera' : 'Staff Employee 1'}`,
      email: c.code === 'NP' ? 'employee1@novapay.com' : `employee1@${c.domain}`,
      role: 'employee',
      employee_code: `EMP-${c.code}-005`,
      status: 'active',
      department: 'Customer Success',
      passkey_enrolled: false,
      failed_attempt_count: 0,
      created_at: '2026-01-10T10:00:00Z',
    });

    // 45 more employees (total 50 per company)
    for (let i = 6; i <= 50; i++) {
      const idx = (i - 6) % firstNames.length;
      const fn = firstNames[idx];
      const ln = lastNames[(idx + 7) % lastNames.length];
      const codeStr = i.toString().padStart(3, '0');
      const email = `${fn.toLowerCase()}.${ln.toLowerCase()}@${c.domain}`;

      // Specifically flag Rahul Sharma and Priya Nair for NovaPay as restricted with 3 failed logins
      let failedAttempts = 0;
      let status: 'active' | 'restricted' = 'active';

      if (c.code === 'NP' && i === 18) {
        // Rahul Sharma EMP-NP-018
        users.push({
          id: `usr-np-emp-18`,
          company_id: c.id,
          full_name: 'Rahul Sharma',
          email: 'rahul.sharma@novapay.com',
          role: 'employee',
          employee_code: 'EMP-NP-018',
          status: 'restricted',
          department: 'Treasury & Settlements',
          passkey_enrolled: false,
          failed_attempt_count: 3,
          created_at: '2026-01-12T11:00:00Z',
        });
        continue;
      }

      if (c.code === 'NP' && i === 24) {
        // Priya Nair EMP-NP-024
        users.push({
          id: `usr-np-emp-24`,
          company_id: c.id,
          full_name: 'Priya Nair',
          email: 'priya.nair@novapay.com',
          role: 'employee',
          employee_code: 'EMP-NP-024',
          status: 'restricted',
          department: 'Merchant Integrations',
          passkey_enrolled: false,
          failed_attempt_count: 3,
          created_at: '2026-01-14T08:30:00Z',
        });
        continue;
      }

      // Seed 1 or 2 failed attempts for specific users across companies
      if (i === 12) {
        failedAttempts = 2; // Warning threshold
      } else if (i === 29) {
        failedAttempts = 1;
      } else if (i === 35 && c.code === 'FS') {
        failedAttempts = 2;
      }

      users.push({
        id: `usr-${c.code.toLowerCase()}-emp-${codeStr}`,
        company_id: c.id,
        full_name: `${fn} ${ln}`,
        email: email,
        role: 'employee',
        employee_code: `EMP-${c.code}-${codeStr}`,
        status: status,
        department: i % 3 === 0 ? 'Engineering' : i % 3 === 1 ? 'Operations' : 'Finance',
        passkey_enrolled: i % 2 === 0,
        failed_attempt_count: failedAttempts,
        created_at: '2026-01-15T10:00:00Z',
      });
    }
  });

  return users;
}

export const SEED_USERS: User[] = generateUsers();

// Seeded Fraud Reports (At least 30 across companies, labeled with Demo Threat Data)
export const SEED_FRAUD_REPORTS: FraudReport[] = [
  {
    id: 'REP-2026-00101',
    company_id: 'comp-novapay',
    reporter_id: 'usr-np-emp1',
    reporter_name: 'Alex Rivera',
    reporter_email: 'employee1@novapay.com',
    indicator_type: 'url',
    indicator_value: 'novapay-secure-login.com',
    description: '[Demo Threat Data] Fake login clone harvesting merchant credentials. High brand similarity, urgent OTP verification prompt detected.',
    status: 'blocked',
    risk_score: 94,
    confidence: 'High',
    threat_category: 'Brand Impersonation / Phishing',
    target_brand: 'NovaPay',
    evidence_signals: [
      'Brand similarity score 91%',
      'Domain registered 2 days ago via privacy proxy',
      'Harvesting form pointing to foreign IP 185.220.101.5',
      'No corporate MX record found',
      'Identical CSS and stolen SVG logo'
    ],
    created_at: '2026-10-11T14:22:00Z',
  },
  {
    id: 'REP-2026-00102',
    company_id: 'comp-novapay',
    reporter_id: 'usr-np-analyst1',
    reporter_name: 'Elena Rostova',
    reporter_email: 'analyst1@novapay.com',
    indicator_type: 'qr',
    indicator_value: 'https://qr-pay-novapay.net/confirm?tx=8894',
    description: '[Demo Threat Data] QR code sticker found on partner merchant payment terminal redirecting to unauthorized collection account.',
    status: 'blocked',
    risk_score: 91,
    confidence: 'High',
    threat_category: 'Malicious QR (Quishing)',
    target_brand: 'NovaPay',
    evidence_signals: [
      'QR encoded destination domain differs from novapay.com',
      'Domain registered 14 hours ago in Seychelles',
      'Zero TLS certificate history / self-signed'
    ],
    created_at: '2026-10-11T16:40:00Z',
  },
  {
    id: 'REP-2026-00103',
    company_id: 'comp-novapay',
    reporter_id: 'usr-np-emp-007',
    indicator_type: 'url',
    indicator_value: 'novapay-kyc-update.org',
    description: '[Demo Threat Data] SMS phishing lure demanding immediate biometric facial photo upload for account unfreeze.',
    status: 'blocked',
    risk_score: 88,
    confidence: 'High',
    threat_category: 'Credential Harvesting',
    target_brand: 'NovaPay',
    evidence_signals: [
      'Contains brand name in sub-domain structure',
      'Newly provisioned Cloudflare free tier domain',
      'Aggressive timer countdown urgency mechanism'
    ],
    created_at: '2026-10-12T02:15:00Z',
  },
  {
    id: 'REP-2026-00104',
    company_id: 'comp-novapay',
    reporter_id: 'usr-np-emp1',
    indicator_type: 'email',
    indicator_value: 'billing-alert@nova-pay-support.net',
    description: '[Demo Threat Data] Spoofed executive email requesting wire transfer reversal using lookalike domain.',
    status: 'confirmed',
    risk_score: 85,
    confidence: 'High',
    threat_category: 'Executive Impersonation',
    target_brand: 'NovaPay',
    evidence_signals: [
      'Failed SPF and DMARC alignment test',
      'Typo-squatted domain registered 3 days ago',
      'Display name spoofing Marcus Vance (Company Head)'
    ],
    created_at: '2026-10-12T06:10:00Z',
  },
  {
    id: 'REP-2026-00105',
    company_id: 'comp-novapay',
    reporter_id: 'usr-np-analyst2',
    indicator_type: 'app',
    indicator_value: 'com.novapay.fastcash.loan',
    description: '[Demo Threat Data] Rogue APK hosted on third-party Android store using NovaPay brand graphics and demanding invasive contacts permissions.',
    status: 'blocked',
    risk_score: 96,
    confidence: 'High',
    threat_category: 'Copycat Mobile Application',
    target_brand: 'NovaPay',
    evidence_signals: [
      'Package ID not in NovaPay official registry',
      'Decompiled asset contains NovaPay SVG trademark',
      'Known spyware signature embedded in DEX payload'
    ],
    created_at: '2026-10-12T07:45:00Z',
  },
  {
    id: 'REP-2026-00106',
    company_id: 'comp-novapay',
    reporter_id: 'usr-np-emp-010',
    indicator_type: 'social',
    indicator_value: 'https://twitter.com/NovaPay_HelpDesk_247',
    description: '[Demo Threat Data] Fake Twitter/X customer support bot responding to real complaints with phishing links.',
    status: 'under_review',
    risk_score: 74,
    confidence: 'Medium',
    threat_category: 'Fake Support / Vishing',
    target_brand: 'NovaPay',
    evidence_signals: [
      'Created current month',
      'Direct messaging users with shortened bit.ly phishing links',
      'Not verified official handle'
    ],
    created_at: '2026-10-12T09:20:00Z',
  },
  {
    id: 'REP-2026-00107',
    company_id: 'comp-novapay',
    reporter_id: 'usr-np-emp-018',
    indicator_type: 'url',
    indicator_value: 'novapay-corporate-portal.biz',
    description: '[Demo Threat Data] Employee SSO portal lookalike targeting corporate Google Workspace tokens.',
    status: 'blocked',
    risk_score: 92,
    confidence: 'High',
    threat_category: 'Credential Harvesting',
    target_brand: 'NovaPay',
    evidence_signals: [
      'Reverse proxy targeting Okta/SSO login flows',
      'Host IP located in bulletproof bulletproof AS60117',
      'Domain registered 48 hours ago'
    ],
    created_at: '2026-10-12T10:11:00Z',
  },
  {
    id: 'REP-2026-00108',
    company_id: 'comp-novapay',
    reporter_id: 'usr-np-analyst1',
    indicator_type: 'phone',
    indicator_value: '+1-800-555-0199',
    description: '[Demo Threat Data] Robocall campaign claiming NovaPay customer debit cards were frozen, requesting full card details.',
    status: 'confirmed',
    risk_score: 83,
    confidence: 'High',
    threat_category: 'Fake Support / Vishing',
    target_brand: 'NovaPay',
    evidence_signals: [
      'VoIP number registered to spoofing service',
      'Over 40 customer spam reports logged in 6 hours'
    ],
    created_at: '2026-10-12T11:05:00Z',
  },
  {
    id: 'REP-2026-00109',
    company_id: 'comp-novapay',
    reporter_id: 'usr-np-emp1',
    indicator_type: 'url',
    indicator_value: 'nova-pay-rewards-claim.xyz',
    description: '[Demo Threat Data] Fake seasonal cashback reward program lure.',
    status: 'pending',
    risk_score: 68,
    confidence: 'Medium',
    threat_category: 'Brand Impersonation / Phishing',
    target_brand: 'NovaPay',
    evidence_signals: [
      'Suspicious .xyz TLD',
      'Unregistered domain owner',
      'Generic affiliate redirect structure'
    ],
    created_at: '2026-10-12T11:50:00Z',
  },

  // FinSecure Bank Reports
  {
    id: 'REP-2026-00201',
    company_id: 'comp-finsecure',
    reporter_id: 'usr-fs-head',
    indicator_type: 'url',
    indicator_value: 'finsecure-ebank-login.info',
    description: '[Demo Threat Data] Exact pixel-for-pixel replica of FinSecure retail online banking login.',
    status: 'blocked',
    risk_score: 97,
    confidence: 'High',
    threat_category: 'Brand Impersonation / Phishing',
    target_brand: 'FinSecure Bank',
    evidence_signals: [
      'Homoglyph attack against finsecurebank.com',
      'Real-time OTP intercept engine present',
      'Hosted on rogue VPS in St. Petersburg'
    ],
    created_at: '2026-10-11T11:30:00Z',
  },
  {
    id: 'REP-2026-00202',
    company_id: 'comp-finsecure',
    reporter_id: 'usr-fs-analyst1',
    indicator_type: 'email',
    indicator_value: 'security-notify@finsecure-alert-center.com',
    description: '[Demo Threat Data] Fake fraud department notification instructing high net worth clients to move deposits to safety vaults.',
    status: 'blocked',
    risk_score: 90,
    confidence: 'High',
    threat_category: 'Brand Impersonation / Phishing',
    target_brand: 'FinSecure Bank',
    evidence_signals: [
      'DKIM fail against FinSecure bank SPF',
      'Urgency language with 2-hour deadline'
    ],
    created_at: '2026-10-11T18:00:00Z',
  },
  {
    id: 'REP-2026-00203',
    company_id: 'comp-finsecure',
    reporter_id: 'usr-fs-emp1',
    indicator_type: 'url',
    indicator_value: 'finsecurebank-verify-mfa.top',
    description: '[Demo Threat Data] Credential harvesting page targeting banking wire approval credentials.',
    status: 'blocked',
    risk_score: 93,
    confidence: 'High',
    threat_category: 'Credential Harvesting',
    target_brand: 'FinSecure Bank',
    evidence_signals: [
      'Domain age: 1 day',
      'TLD .top frequently abused for malware',
      'High similarity to legitimate banking portal'
    ],
    created_at: '2026-10-12T01:10:00Z',
  },
  {
    id: 'REP-2026-00204',
    company_id: 'comp-finsecure',
    reporter_id: 'usr-fs-emp-012',
    indicator_type: 'phone',
    indicator_value: '+1-888-901-4421',
    description: '[Demo Threat Data] Outbound caller ID spoofing FinSecure fraud operations desk.',
    status: 'under_review',
    risk_score: 76,
    confidence: 'Medium',
    threat_category: 'Fake Support / Vishing',
    target_brand: 'FinSecure Bank',
    evidence_signals: ['Reported by multiple private wealth advisors'],
    created_at: '2026-10-12T08:00:00Z',
  },
  {
    id: 'REP-2026-00205',
    company_id: 'comp-finsecure',
    reporter_id: 'usr-fs-analyst2',
    indicator_type: 'url',
    indicator_value: 'finsecure-wealth-management.cc',
    description: '[Demo Threat Data] Fraudulent investment portal offering 40% guaranteed monthly yields.',
    status: 'confirmed',
    risk_score: 87,
    confidence: 'High',
    threat_category: 'Brand Impersonation / Phishing',
    target_brand: 'FinSecure Bank',
    evidence_signals: ['Unregistered broker identity', 'Stolen FinSecure trade dress'],
    created_at: '2026-10-12T09:40:00Z',
  },

  // ShopShield Reports
  {
    id: 'REP-2026-00301',
    company_id: 'comp-shopshield',
    reporter_id: 'usr-ss-head',
    indicator_type: 'url',
    indicator_value: 'shopshield-flash-sale.live',
    description: '[Demo Threat Data] Counterfeit e-commerce storefront collecting credit cards without shipping goods.',
    status: 'blocked',
    risk_score: 95,
    confidence: 'High',
    threat_category: 'Counterfeit E-Commerce',
    target_brand: 'ShopShield',
    evidence_signals: [
      'Scraped entire product catalogue from shopshield.com',
      'Unsecured credit card form storing raw CVV',
      'Stolen trademark and SSL mismatch'
    ],
    created_at: '2026-10-11T13:00:00Z',
  },
  {
    id: 'REP-2026-00302',
    company_id: 'comp-shopshield',
    reporter_id: 'usr-ss-emp1',
    indicator_type: 'url',
    indicator_value: 'shopshield-order-tracking.co',
    description: '[Demo Threat Data] Malicious tracking link in fake delivery SMS asking for fee payment.',
    status: 'blocked',
    risk_score: 89,
    confidence: 'High',
    threat_category: 'Brand Impersonation / Phishing',
    target_brand: 'ShopShield',
    evidence_signals: [
      'Smishing delivery scam kit',
      'Requests credit card for $1.85 redelivery charge'
    ],
    created_at: '2026-10-11T20:15:00Z',
  },
  {
    id: 'REP-2026-00303',
    company_id: 'comp-shopshield',
    reporter_id: 'usr-ss-emp-008',
    indicator_type: 'logo',
    indicator_value: 'https://cdn-untrusted.com/assets/shopshield_fake_logo.png',
    description: '[Demo Threat Data] Exact clone of ShopShield buyer guarantee badge used on unauthorized dropshipping websites.',
    status: 'confirmed',
    risk_score: 82,
    confidence: 'High',
    threat_category: 'Brand Impersonation / Phishing',
    target_brand: 'ShopShield',
    evidence_signals: ['99.4% perceptual hash match with official brand badge'],
    created_at: '2026-10-12T03:30:00Z',
  },
  {
    id: 'REP-2026-00304',
    company_id: 'comp-shopshield',
    reporter_id: 'usr-ss-emp-015',
    indicator_type: 'url',
    indicator_value: 'shopshield-merchant-onboarding.net',
    description: '[Demo Threat Data] Phishing lure aimed at third-party sellers to steal seller store logins.',
    status: 'under_review',
    risk_score: 78,
    confidence: 'Medium',
    threat_category: 'Credential Harvesting',
    target_brand: 'ShopShield',
    evidence_signals: ['Hosted in Latvia', 'Domain registered yesterday'],
    created_at: '2026-10-12T07:15:00Z',
  },
  {
    id: 'REP-2026-00305',
    company_id: 'comp-shopshield',
    reporter_id: 'usr-ss-emp-022',
    indicator_type: 'social',
    indicator_value: 'https://instagram.com/shopshield_giveaways_official',
    description: '[Demo Threat Data] Fake Instagram giveaway asking followers to click malicious bio link.',
    status: 'pending',
    risk_score: 65,
    confidence: 'Medium',
    threat_category: 'Brand Impersonation / Phishing',
    target_brand: 'ShopShield',
    evidence_signals: ['0 verified status', 'Purchased followers'],
    created_at: '2026-10-12T10:00:00Z',
  },

  // MediTrust Reports
  {
    id: 'REP-2026-00401',
    company_id: 'comp-meditrust',
    reporter_id: 'usr-mt-head',
    indicator_type: 'url',
    indicator_value: 'meditrust-patient-portal.online',
    description: '[Demo Threat Data] Fake healthcare records portal attempting to siphon patient medical records and social security numbers.',
    status: 'blocked',
    risk_score: 96,
    confidence: 'High',
    threat_category: 'Credential Harvesting',
    target_brand: 'MediTrust',
    evidence_signals: [
      'Harvester for HIPAA protected health identifiers',
      'Hosted on offshore Russian hosting AS58224',
      'No HIPAA compliance disclosures'
    ],
    created_at: '2026-10-11T12:00:00Z',
  },
  {
    id: 'REP-2026-00402',
    company_id: 'comp-meditrust',
    reporter_id: 'usr-mt-emp1',
    indicator_type: 'email',
    indicator_value: 'prescription-refill@meditrust-rx.com',
    description: '[Demo Threat Data] Spam prescription refill scam claiming sudden cancellation of critical medication.',
    status: 'blocked',
    risk_score: 91,
    confidence: 'High',
    threat_category: 'Brand Impersonation / Phishing',
    target_brand: 'MediTrust',
    evidence_signals: [
      'Direct link to unregulated Canadian pharmacy affiliate',
      'Spoofed sender name Dr. Robert Lin'
    ],
    created_at: '2026-10-11T22:30:00Z',
  },
  {
    id: 'REP-2026-00403',
    company_id: 'comp-meditrust',
    reporter_id: 'usr-mt-emp-009',
    indicator_type: 'qr',
    indicator_value: 'https://meditrust-checkin-desk.io/ehr',
    description: '[Demo Threat Data] Fake QR check-in flyers placed in clinical waiting rooms.',
    status: 'confirmed',
    risk_score: 84,
    confidence: 'High',
    threat_category: 'Malicious QR (Quishing)',
    target_brand: 'MediTrust',
    evidence_signals: ['Physical distribution incident', 'Redirects to malware download'],
    created_at: '2026-10-12T05:45:00Z',
  },
  {
    id: 'REP-2026-00404',
    company_id: 'comp-meditrust',
    reporter_id: 'usr-mt-emp-014',
    indicator_type: 'phone',
    indicator_value: '+1-800-432-8819',
    description: '[Demo Threat Data] Vishing calls targeting oncology patients for Medicare co-pays.',
    status: 'under_review',
    risk_score: 79,
    confidence: 'Medium',
    threat_category: 'Fake Support / Vishing',
    target_brand: 'MediTrust',
    evidence_signals: ['Multiple complaints logged by clinic receptionists'],
    created_at: '2026-10-12T08:50:00Z',
  },
  {
    id: 'REP-2026-00405',
    company_id: 'comp-meditrust',
    reporter_id: 'usr-mt-emp-020',
    indicator_type: 'url',
    indicator_value: 'meditrust-telehealth-zoom.com',
    description: '[Demo Threat Data] Drive-by download simulating telehealth waiting room with trojan installer.',
    status: 'blocked',
    risk_score: 93,
    confidence: 'High',
    threat_category: 'Brand Impersonation / Phishing',
    target_brand: 'MediTrust',
    evidence_signals: ['Malware executable disguised as Telehealth_Meeting_Client.exe'],
    created_at: '2026-10-12T09:10:00Z',
  },

  // EduSafe Reports
  {
    id: 'REP-2026-00501',
    company_id: 'comp-edusafe',
    reporter_id: 'usr-es-head',
    indicator_type: 'url',
    indicator_value: 'edusafe-canvas-lms.club',
    description: '[Demo Threat Data] University LMS clone harvesting faculty and student authentication tokens.',
    status: 'blocked',
    risk_score: 94,
    confidence: 'High',
    threat_category: 'Credential Harvesting',
    target_brand: 'EduSafe',
    evidence_signals: [
      'Cloned EduSafe login form with Shibboleth/SAML harvester',
      'Domain created 3 days ago',
      'Hosted on DigitalOcean droplet AS14061'
    ],
    created_at: '2026-10-11T15:10:00Z',
  },
  {
    id: 'REP-2026-00502',
    company_id: 'comp-edusafe',
    reporter_id: 'usr-es-emp1',
    indicator_type: 'email',
    indicator_value: 'dean-office@edusafe-financial-aid.org',
    description: '[Demo Threat Data] Grant payout phishing lure targeting graduating students for tax filings.',
    status: 'blocked',
    risk_score: 87,
    confidence: 'High',
    threat_category: 'Brand Impersonation / Phishing',
    target_brand: 'EduSafe',
    evidence_signals: [
      'Impersonating financial aid director',
      'Demands student direct deposit account routing numbers'
    ],
    created_at: '2026-10-12T04:20:00Z',
  },
  {
    id: 'REP-2026-00503',
    company_id: 'comp-edusafe',
    reporter_id: 'usr-es-emp-011',
    indicator_type: 'app',
    indicator_value: 'org.edusafe.grades.companion',
    description: '[Demo Threat Data] Fake grade calculator app on sideloading forum stealing university credentials.',
    status: 'confirmed',
    risk_score: 85,
    confidence: 'High',
    threat_category: 'Copycat Mobile Application',
    target_brand: 'EduSafe',
    evidence_signals: ['Unauthorized APK using EduSafe crest logo', 'Embedded keylogger'],
    created_at: '2026-10-12T07:30:00Z',
  },
  {
    id: 'REP-2026-00504',
    company_id: 'comp-edusafe',
    reporter_id: 'usr-es-emp-019',
    indicator_type: 'url',
    indicator_value: 'edusafe-exam-proctor.net',
    description: '[Demo Threat Data] Suspicious proctoring browser extension demanding full screen record permissions.',
    status: 'under_review',
    risk_score: 72,
    confidence: 'Medium',
    threat_category: 'Brand Impersonation / Phishing',
    target_brand: 'EduSafe',
    evidence_signals: ['Extension not signed by Google Chrome Web Store'],
    created_at: '2026-10-12T08:15:00Z',
  },
  {
    id: 'REP-2026-00505',
    company_id: 'comp-edusafe',
    reporter_id: 'usr-es-emp-025',
    indicator_type: 'url',
    indicator_value: 'edusafe-scholarship-apply.xyz',
    description: '[Demo Threat Data] Bogus scholarship portal asking for upfront processing payment.',
    status: 'pending',
    risk_score: 66,
    confidence: 'Medium',
    threat_category: 'Counterfeit E-Commerce',
    target_brand: 'EduSafe',
    evidence_signals: ['Payment gateway points to unverified crypto wallet'],
    created_at: '2026-10-12T11:00:00Z',
  },

  // Additional cross-company reports to satisfy requirements (> 30 reports)
  {
    id: 'REP-2026-00110',
    company_id: 'comp-novapay',
    reporter_id: 'usr-np-emp1',
    indicator_type: 'url',
    indicator_value: 'novapay-statement-download.cc',
    description: '[Demo Threat Data] Malicious PDF delivery URL disguised as monthly tax statement.',
    status: 'under_review',
    risk_score: 75,
    confidence: 'Medium',
    threat_category: 'Brand Impersonation / Phishing',
    target_brand: 'NovaPay',
    evidence_signals: ['Macro-enabled document download triggered'],
    created_at: '2026-10-12T12:05:00Z',
  },
  {
    id: 'REP-2026-00111',
    company_id: 'comp-novapay',
    reporter_id: 'usr-np-analyst1',
    indicator_type: 'url',
    indicator_value: 'novapay-partner-portal.io',
    description: '[Demo Threat Data] Lookalike partner domain scanning for API keys and secrets.',
    status: 'confirmed',
    risk_score: 86,
    confidence: 'High',
    threat_category: 'Credential Harvesting',
    target_brand: 'NovaPay',
    evidence_signals: ['Reverse proxy harvesting authorization headers'],
    created_at: '2026-10-12T12:30:00Z',
  },
  {
    id: 'REP-2026-00206',
    company_id: 'comp-finsecure',
    reporter_id: 'usr-fs-emp1',
    indicator_type: 'url',
    indicator_value: 'finsecure-swift-transfer.net',
    description: '[Demo Threat Data] Fake wire transfer validation page sending spoofed SWIFT slips.',
    status: 'confirmed',
    risk_score: 89,
    confidence: 'High',
    threat_category: 'Brand Impersonation / Phishing',
    target_brand: 'FinSecure Bank',
    evidence_signals: ['Fraudulent banking documents generated on client side'],
    created_at: '2026-10-12T12:45:00Z',
  },
  {
    id: 'REP-2026-00306',
    company_id: 'comp-shopshield',
    reporter_id: 'usr-ss-emp1',
    indicator_type: 'url',
    indicator_value: 'shopshield-dispute-resolution.org',
    description: '[Demo Threat Data] Fake buyer protection claim page demanding credit card details.',
    status: 'confirmed',
    risk_score: 84,
    confidence: 'High',
    threat_category: 'Credential Harvesting',
    target_brand: 'ShopShield',
    evidence_signals: ['Phishing template matching PayPal/ShopShield dispute pages'],
    created_at: '2026-10-12T13:00:00Z',
  },
  {
    id: 'REP-2026-00406',
    company_id: 'comp-meditrust',
    reporter_id: 'usr-mt-emp1',
    indicator_type: 'url',
    indicator_value: 'meditrust-billing-support.co',
    description: '[Demo Threat Data] Healthcare billing phishing page targeting elderly patients.',
    status: 'under_review',
    risk_score: 77,
    confidence: 'Medium',
    threat_category: 'Brand Impersonation / Phishing',
    target_brand: 'MediTrust',
    evidence_signals: ['Domain registered via Epik Inc 4 days ago'],
    created_at: '2026-10-12T13:15:00Z',
  },
  {
    id: 'REP-2026-00506',
    company_id: 'comp-edusafe',
    reporter_id: 'usr-es-emp1',
    indicator_type: 'url',
    indicator_value: 'edusafe-campus-wifi-login.net',
    description: '[Demo Threat Data] Captive portal rogue Wi-Fi evil twin harvesting 802.1X RADIUS credentials.',
    status: 'confirmed',
    risk_score: 91,
    confidence: 'High',
    threat_category: 'Credential Harvesting',
    target_brand: 'EduSafe',
    evidence_signals: ['Evil twin rogue AP detected on campus perimeter'],
    created_at: '2026-10-12T13:30:00Z',
  },
];

// Seeded Blocklist Items (At least 10 blocked URLs across companies)
export const SEED_BLOCKLIST: BlocklistItem[] = [
  {
    id: 'blk-np-01',
    company_id: 'comp-novapay',
    report_id: 'REP-2026-00101',
    indicator_value: 'novapay-secure-login.com',
    indicator_type: 'url',
    risk_score: 94,
    reason: 'Active credential harvesting kit impersonating NovaPay merchant login',
    threat_category: 'Brand Impersonation / Phishing',
    status: 'active',
    expires_at: '2026-11-10T00:00:00Z',
    blocked_by: 'Auto-Sentinel Rule (Score >= 85)',
    created_at: '2026-10-11T14:25:00Z',
  },
  {
    id: 'blk-np-02',
    company_id: 'comp-novapay',
    report_id: 'REP-2026-00102',
    indicator_value: 'https://qr-pay-novapay.net/confirm?tx=8894',
    indicator_type: 'qr',
    risk_score: 91,
    reason: 'Rogue QR destination diverting payment gateway settlement',
    threat_category: 'Malicious QR (Quishing)',
    status: 'active',
    expires_at: '2026-11-10T00:00:00Z',
    blocked_by: 'Elena Rostova (Lead Analyst)',
    created_at: '2026-10-11T16:45:00Z',
  },
  {
    id: 'blk-np-03',
    company_id: 'comp-novapay',
    report_id: 'REP-2026-00103',
    indicator_value: 'novapay-kyc-update.org',
    indicator_type: 'url',
    risk_score: 88,
    reason: 'SMS phishing landing page harvesting biometric scans',
    threat_category: 'Credential Harvesting',
    status: 'active',
    expires_at: '2026-11-10T00:00:00Z',
    blocked_by: 'Auto-Sentinel Rule (Score >= 85)',
    created_at: '2026-10-12T02:20:00Z',
  },
  {
    id: 'blk-np-04',
    company_id: 'comp-novapay',
    report_id: 'REP-2026-00107',
    indicator_value: 'novapay-corporate-portal.biz',
    indicator_type: 'url',
    risk_score: 92,
    reason: 'Corporate SSO lookalike phishing targeting employees',
    threat_category: 'Credential Harvesting',
    status: 'active',
    expires_at: '2026-11-10T00:00:00Z',
    blocked_by: 'Marcus Vance (Security Head)',
    created_at: '2026-10-12T10:15:00Z',
  },
  {
    id: 'blk-fs-01',
    company_id: 'comp-finsecure',
    report_id: 'REP-2026-00201',
    indicator_value: 'finsecure-ebank-login.info',
    indicator_type: 'url',
    risk_score: 97,
    reason: 'Banking OTP intercept portal targeting retail depositors',
    threat_category: 'Brand Impersonation / Phishing',
    status: 'active',
    expires_at: '2026-11-10T00:00:00Z',
    blocked_by: 'Eleanor Sterling (Security Head)',
    created_at: '2026-10-11T11:35:00Z',
  },
  {
    id: 'blk-fs-02',
    company_id: 'comp-finsecure',
    report_id: 'REP-2026-00203',
    indicator_value: 'finsecurebank-verify-mfa.top',
    indicator_type: 'url',
    risk_score: 93,
    reason: 'Rogue MFA proxy harvesting wire authorization codes',
    threat_category: 'Credential Harvesting',
    status: 'active',
    expires_at: '2026-11-10T00:00:00Z',
    blocked_by: 'Auto-Sentinel Rule (Score >= 85)',
    created_at: '2026-10-12T01:15:00Z',
  },
  {
    id: 'blk-ss-01',
    company_id: 'comp-shopshield',
    report_id: 'REP-2026-00301',
    indicator_value: 'shopshield-flash-sale.live',
    indicator_type: 'url',
    risk_score: 95,
    reason: 'Counterfeit shopping portal stealing unencrypted credit cards',
    threat_category: 'Counterfeit E-Commerce',
    status: 'active',
    expires_at: '2026-11-10T00:00:00Z',
    blocked_by: 'David Thorne (Security Head)',
    created_at: '2026-10-11T13:05:00Z',
  },
  {
    id: 'blk-ss-02',
    company_id: 'comp-shopshield',
    report_id: 'REP-2026-00302',
    indicator_value: 'shopshield-order-tracking.co',
    indicator_type: 'url',
    risk_score: 89,
    reason: 'Package delivery fee smishing scam',
    threat_category: 'Brand Impersonation / Phishing',
    status: 'active',
    expires_at: '2026-11-10T00:00:00Z',
    blocked_by: 'Auto-Sentinel Rule (Score >= 85)',
    created_at: '2026-10-11T20:20:00Z',
  },
  {
    id: 'blk-mt-01',
    company_id: 'comp-meditrust',
    report_id: 'REP-2026-00401',
    indicator_value: 'meditrust-patient-portal.online',
    indicator_type: 'url',
    risk_score: 96,
    reason: 'Fake EHR patient portal stealing health records & SSNs',
    threat_category: 'Credential Harvesting',
    status: 'active',
    expires_at: '2026-11-10T00:00:00Z',
    blocked_by: 'Dr. Sarah Lin (Security Head)',
    created_at: '2026-10-11T12:05:00Z',
  },
  {
    id: 'blk-mt-02',
    company_id: 'comp-meditrust',
    report_id: 'REP-2026-00405',
    indicator_value: 'meditrust-telehealth-zoom.com',
    indicator_type: 'url',
    risk_score: 93,
    reason: 'Drive-by malware distribution disguised as telehealth client',
    threat_category: 'Brand Impersonation / Phishing',
    status: 'active',
    expires_at: '2026-11-10T00:00:00Z',
    blocked_by: 'Auto-Sentinel Rule (Score >= 85)',
    created_at: '2026-10-12T09:15:00Z',
  },
  {
    id: 'blk-es-01',
    company_id: 'comp-edusafe',
    report_id: 'REP-2026-00501',
    indicator_value: 'edusafe-canvas-lms.club',
    indicator_type: 'url',
    risk_score: 94,
    reason: 'Faculty & student SSO token harvesting clone',
    threat_category: 'Credential Harvesting',
    status: 'active',
    expires_at: '2026-11-10T00:00:00Z',
    blocked_by: 'Prof. Julian Brooks (Security Head)',
    created_at: '2026-10-11T15:15:00Z',
  },
];

// Seeded Blockchain Anchors
export const SEED_BLOCK_ANCHORS: BlockAnchor[] = [
  {
    id: 'anc-np-01',
    company_id: 'comp-novapay',
    blocklist_id: 'blk-np-01',
    report_id: 'REP-2026-00101',
    record_hash: '0x8f4c2b9a1e7394c8e1a3b5c7d9f2e4a6c8b0d2e4f6a8c0e2b4d6f8a0c2e4b6d8',
    blockchain_tx_hash: '0x3a7e58f0d92384a275b4819d29ef11a6873bc0912f45812e947c92bda4501ec9',
    blockchain_network: 'Polygon Amoy Testnet',
    anchor_status: 'anchored',
    block_number: 14892015,
    anchored_at: '2026-10-11T14:26:00Z',
  },
  {
    id: 'anc-np-02',
    company_id: 'comp-novapay',
    blocklist_id: 'blk-np-02',
    report_id: 'REP-2026-00102',
    record_hash: '0x1d4e7f9a2b5c8e0a3f6b9c2e5a8d1f4b7e0a3c6f9b2e5a8d1f4b7e0a3c6f9b2e',
    blockchain_tx_hash: '0x99248b61ef0a3c2419409bdcba176435c2b0129f12348a7391da40129bcaf781',
    blockchain_network: 'Polygon Amoy Testnet',
    anchor_status: 'anchored',
    block_number: 14892180,
    anchored_at: '2026-10-11T16:47:00Z',
  },
  {
    id: 'anc-fs-01',
    company_id: 'comp-finsecure',
    blocklist_id: 'blk-fs-01',
    report_id: 'REP-2026-00201',
    record_hash: '0x7c9e1a3f5b7d9f1a3b5c7d9f1a3b5c7d9f1a3b5c7d9f1a3b5c7d9f1a3b5c7d9f',
    blockchain_tx_hash: '0x4f128ab9301923efac84192039ba716295cd801481927361abdf91024bc6a120',
    blockchain_network: 'Polygon Amoy Testnet',
    anchor_status: 'anchored',
    block_number: 14891900,
    anchored_at: '2026-10-11T11:36:00Z',
  },
  {
    id: 'anc-ss-01',
    company_id: 'comp-shopshield',
    blocklist_id: 'blk-ss-01',
    report_id: 'REP-2026-00301',
    record_hash: '0x5b7d9f1a3b5c7d9f1a3b5c7d9f1a3b5c7d9f1a3b5c7d9f1a3b5c7d9f1a3b5c7d',
    blockchain_tx_hash: '0x77192ab3c4019284fa9102938471bcae812904812f849102abde819230bcda11',
    blockchain_network: 'Polygon Amoy Testnet',
    anchor_status: 'anchored',
    block_number: 14892090,
    anchored_at: '2026-10-11T13:06:00Z',
  },
];

// Seeded ZK Proofs
export const SEED_ZK_PROOFS: ZkProof[] = [
  {
    id: 'zk-np-01',
    company_id: 'comp-novapay',
    report_id: 'REP-2026-00101',
    merkle_root: '0x4a9b2c8e1f5d7a3c0e2b4f6a8d0c2e4b6a8d0c2e4b6a8d0c2e4b6a8d0c2e4b6a',
    proof_metadata: {
      company_registered: true,
      evidence_signals_count: 5,
      risk_score_met: true,
      analyst_verified: true,
      tamper_proof_hash: '0x9e1a3b5c7d9f2e4a6c8b0d2e4f6a8c0e2b4d6f8a0c2e4b6d8a0c2e4b6d8a0c2e',
    },
    claims: [
      'Belongs to authorized registry company (NovaPay)',
      'Evidence signal count >= 2 (Found 5 verifiable indicators)',
      'Risk score >= blocking threshold (Score 94 >= 85)',
      'Lead Analyst verification signature attached',
      'Evidence payload hash integrity confirmed'
    ],
    verification_status: 'PASSED',
    created_at: '2026-10-11T14:27:00Z',
  },
  {
    id: 'zk-fs-01',
    company_id: 'comp-finsecure',
    report_id: 'REP-2026-00201',
    merkle_root: '0x7b1c3d5e9f1a3b5c7d9f1a3b5c7d9f1a3b5c7d9f1a3b5c7d9f1a3b5c7d9f1a3b',
    proof_metadata: {
      company_registered: true,
      evidence_signals_count: 3,
      risk_score_met: true,
      analyst_verified: true,
      tamper_proof_hash: '0x2c4e6a8d0b2d4f6a8c0e2b4d6f8a0c2e4b6d8a0c2e4b6d8a0c2e4b6d8a0c2e4b',
    },
    claims: [
      'Belongs to authorized registry company (FinSecure Bank)',
      'Evidence signal count >= 2 (Found 3 verifiable indicators)',
      'Risk score >= blocking threshold (Score 97 >= 85)',
      'Executive Security verification verified',
      'Zero-knowledge selective disclosure integrity confirmed'
    ],
    verification_status: 'PASSED',
    created_at: '2026-10-11T11:37:00Z',
  },
];

// Helper to generate realistic login attempts (>= 750 attempts)
export function generateLoginAttempts(): LoginAttempt[] {
  const attempts: LoginAttempt[] = [];
  const companies = ['comp-novapay', 'comp-finsecure', 'comp-shopshield', 'comp-meditrust', 'comp-edusafe'];
  const ips = ['103.21.58.14', '198.51.100.42', '203.0.113.88', '172.56.21.99', '185.191.171.3', '45.33.32.156', '82.102.23.4'];
  const devices = ['Chrome on Windows', 'Safari on macOS', 'Edge on Windows', 'Firefox on Linux', 'Mobile Safari on iOS', 'Chrome on Android'];

  // Seeded failed attempts for Rahul Sharma (NovaPay - exactly 3 failed attempts)
  attempts.push(
    {
      id: 'att-np-rs-1',
      company_id: 'comp-novapay',
      user_id: 'usr-np-emp-18',
      attempted_email: 'rahul.sharma@novapay.com',
      status: 'failed',
      ip_address: '103.21.58.14',
      device: 'Windows 11',
      browser: 'Chrome on Windows',
      location: 'Mumbai, IN',
      failed_attempt_count: 1,
      created_at: '2026-10-12T12:41:10Z',
    },
    {
      id: 'att-np-rs-2',
      company_id: 'comp-novapay',
      user_id: 'usr-np-emp-18',
      attempted_email: 'rahul.sharma@novapay.com',
      status: 'failed',
      ip_address: '103.21.58.14',
      device: 'Windows 11',
      browser: 'Chrome on Windows',
      location: 'Mumbai, IN',
      failed_attempt_count: 2,
      created_at: '2026-10-12T12:42:30Z',
    },
    {
      id: 'att-np-rs-3',
      company_id: 'comp-novapay',
      user_id: 'usr-np-emp-18',
      attempted_email: 'rahul.sharma@novapay.com',
      status: 'failed',
      ip_address: '103.21.58.14',
      device: 'Windows 11',
      browser: 'Chrome on Windows',
      location: 'Mumbai, IN',
      failed_attempt_count: 3,
      created_at: '2026-10-12T12:44:00Z',
    }
  );

  // Seeded failed attempts for Priya Nair (NovaPay - exactly 3 failed attempts)
  attempts.push(
    {
      id: 'att-np-pn-1',
      company_id: 'comp-novapay',
      user_id: 'usr-np-emp-24',
      attempted_email: 'priya.nair@novapay.com',
      status: 'failed',
      ip_address: '185.191.171.3',
      device: 'macOS Monterey',
      browser: 'Safari on macOS',
      location: 'Bucharest, RO (Proxy)',
      failed_attempt_count: 1,
      created_at: '2026-10-12T09:10:00Z',
    },
    {
      id: 'att-np-pn-2',
      company_id: 'comp-novapay',
      user_id: 'usr-np-emp-24',
      attempted_email: 'priya.nair@novapay.com',
      status: 'failed',
      ip_address: '185.191.171.3',
      device: 'macOS Monterey',
      browser: 'Safari on macOS',
      location: 'Bucharest, RO (Proxy)',
      failed_attempt_count: 2,
      created_at: '2026-10-12T09:12:15Z',
    },
    {
      id: 'att-np-pn-3',
      company_id: 'comp-novapay',
      user_id: 'usr-np-emp-24',
      attempted_email: 'priya.nair@novapay.com',
      status: 'failed',
      ip_address: '185.191.171.3',
      device: 'macOS Monterey',
      browser: 'Safari on macOS',
      location: 'Bucharest, RO (Proxy)',
      failed_attempt_count: 3,
      created_at: '2026-10-12T09:14:40Z',
    }
  );

  // Generate 760 realistic background login events across companies
  for (let i = 1; i <= 760; i++) {
    const compId = companies[i % companies.length];
    const isSuccess = i % 14 !== 0; // ~93% success rate
    const attemptCount = isSuccess ? 0 : (i % 3) + 1;
    const ip = ips[i % ips.length];
    const dev = devices[i % devices.length];

    const hourOffset = (i % 72);
    const minuteOffset = (i * 7) % 60;
    const time = new Date(Date.now() - (hourOffset * 3600000 + minuteOffset * 60000)).toISOString();

    attempts.push({
      id: `att-gen-${i.toString().padStart(4, '0')}`,
      company_id: compId,
      user_id: `usr-gen-${i % 250}`,
      attempted_email: `staff.${(i % 50) + 1}@${compId.replace('comp-', '')}.com`,
      status: isSuccess ? 'success' : 'failed',
      ip_address: ip,
      device: dev.split(' on ')[1] || 'Device',
      browser: dev,
      failed_attempt_count: attemptCount,
      created_at: time,
    });
  }

  return attempts;
}

export const SEED_LOGIN_ATTEMPTS: LoginAttempt[] = generateLoginAttempts();

// Seeded Security Alerts (At least 8 security alerts)
export const SEED_SECURITY_ALERTS: SecurityAlert[] = [
  {
    id: 'ALT-2026-004521',
    company_id: 'comp-novapay',
    user_id: 'usr-np-emp-18',
    alert_type: 'failed_login_threshold',
    severity: 'critical',
    title: 'Repeated Failed Login Attempts — Account Restricted',
    message: '🚨 TrustLens Security Alert — NovaPay\nRepeated failed login attempts detected.\n\nEmployee ID: EMP-NP-018\nAttempted email: rahul.sharma@novapay.com\nCompany: NovaPay\nFailed attempts: 3\nTime window: 12:41 PM – 12:44 PM\nIP address: 103.21.58.14\nDevice/browser: Chrome on Windows\n\nAction taken:\n- Login attempts temporarily restricted\n- Security alert created\n- Incident added to audit log\n\nRecommended action:\n- Verify whether this was the employee\n- Require password reset and passkey re-registration\n- Review recent account activity\n\nAlert ID: ALT-2026-004521',
    metadata: {
      employee_id: 'EMP-NP-018',
      employee_name: 'Rahul Sharma',
      attempted_email: 'rahul.sharma@novapay.com',
      failed_attempts: 3,
      time_window: '12:41 PM – 12:44 PM',
      ip_address: '103.21.58.14',
      device: 'Chrome on Windows',
      recommended_action: 'Verify employee identity, reset credentials, re-enroll passkey.',
    },
    status: 'open',
    delivery_status: 'delivered',
    created_at: '2026-10-12T12:44:05Z',
  },
  {
    id: 'ALT-2026-004520',
    company_id: 'comp-novapay',
    user_id: 'usr-np-emp-24',
    alert_type: 'failed_login_threshold',
    severity: 'critical',
    title: 'Suspicious Foreign IP Login Failures — Account Restricted',
    message: '🚨 TrustLens Security Alert — NovaPay\nMultiple failed logins from foreign VPN proxy.\n\nEmployee ID: EMP-NP-024\nAttempted email: priya.nair@novapay.com\nCompany: NovaPay\nFailed attempts: 3\nTime window: 09:10 AM – 09:14 AM\nIP address: 185.191.171.3 (Bucharest, RO)\nDevice/browser: Safari on macOS\n\nAction taken: User restricted, alert dispatched to Marcus Vance.',
    metadata: {
      employee_id: 'EMP-NP-024',
      employee_name: 'Priya Nair',
      attempted_email: 'priya.nair@novapay.com',
      failed_attempts: 3,
      time_window: '09:10 AM – 09:14 AM',
      ip_address: '185.191.171.3',
      device: 'Safari on macOS',
      recommended_action: 'Revoke active sessions and enforce out-of-band verification.',
    },
    status: 'open',
    delivery_status: 'delivered',
    created_at: '2026-10-12T09:14:45Z',
  },
  {
    id: 'ALT-2026-004518',
    company_id: 'comp-novapay',
    alert_type: 'new_high_threat',
    severity: 'high',
    title: 'Active Phishing Campaign Targeting NovaPay Merchant Portals',
    message: 'Indicator novapay-secure-login.com detected with risk score 94/100. Stolen CSS and SVG trademarks identified. Auto-blocked in protected browsing.',
    metadata: {
      indicator_value: 'novapay-secure-login.com',
      risk_score: 94,
      recommended_action: 'Submit automated domain takedown request to registrar and DNS provider.',
    },
    status: 'acknowledged',
    delivery_status: 'delivered',
    created_at: '2026-10-11T14:23:00Z',
  },
  {
    id: 'ALT-2026-004517',
    company_id: 'comp-novapay',
    alert_type: 'url_blocked',
    severity: 'high',
    title: 'Rogue QR Destination Quishing Lure Blocked',
    message: 'Payment terminal QR override blocked: qr-pay-novapay.net redirecting transactions to unverified offshore wallet.',
    metadata: {
      indicator_value: 'https://qr-pay-novapay.net/confirm?tx=8894',
      risk_score: 91,
      recommended_action: 'Notify field merchant POS inspection agents.',
    },
    status: 'resolved',
    delivery_status: 'delivered',
    created_at: '2026-10-11T16:42:00Z',
  },
  {
    id: 'ALT-2026-004515',
    company_id: 'comp-finsecure',
    alert_type: 'new_high_threat',
    severity: 'critical',
    title: 'Homoglyph Banking Domain Detected (Score 97/100)',
    message: 'finsecure-ebank-login.info matches FinSecure Bank retail portal. Active credential harvester discovered.',
    metadata: {
      indicator_value: 'finsecure-ebank-login.info',
      risk_score: 97,
      recommended_action: 'Issue emergency advisory to banking customer portal.',
    },
    status: 'open',
    delivery_status: 'delivered',
    created_at: '2026-10-11T11:32:00Z',
  },
  {
    id: 'ALT-2026-004512',
    company_id: 'comp-shopshield',
    alert_type: 'new_high_threat',
    severity: 'high',
    title: 'Rogue Counterfeit Storefront shopshield-flash-sale.live Blocked',
    message: 'Counterfeit catalog scam scraping 4,000 product SKUs and storing consumer CVVs in cleartext.',
    metadata: {
      indicator_value: 'shopshield-flash-sale.live',
      risk_score: 95,
      recommended_action: 'Dispatch DMCA brand takedown to Cloudflare & registrar.',
    },
    status: 'open',
    delivery_status: 'delivered',
    created_at: '2026-10-11T13:02:00Z',
  },
  {
    id: 'ALT-2026-004509',
    company_id: 'comp-meditrust',
    alert_type: 'new_high_threat',
    severity: 'critical',
    title: 'HIPAA Health Record Harvester meditrust-patient-portal.online Blocked',
    message: 'Offshore phishing lure attempting to harvest patient medical record numbers and SSNs.',
    metadata: {
      indicator_value: 'meditrust-patient-portal.online',
      risk_score: 96,
      recommended_action: 'Alert compliance office and execute protected DNS sinkhole.',
    },
    status: 'acknowledged',
    delivery_status: 'delivered',
    created_at: '2026-10-11T12:02:00Z',
  },
  {
    id: 'ALT-2026-004505',
    company_id: 'comp-edusafe',
    alert_type: 'new_high_threat',
    severity: 'high',
    title: 'Campus LMS SSO Intercept Domain edusafe-canvas-lms.club Blocked',
    message: 'Fake university portal stealing SAML session tokens from faculty and students.',
    metadata: {
      indicator_value: 'edusafe-canvas-lms.club',
      risk_score: 94,
      recommended_action: 'Block across campus firewalls and eduroam perimeter.',
    },
    status: 'open',
    delivery_status: 'delivered',
    created_at: '2026-10-11T15:12:00Z',
  },
];

// Seeded Federated Learning Rounds
export const SEED_FEDERATED_ROUNDS: FederatedRound[] = [
  // Round 1
  { id: 'fed-1-np', round_number: 1, company_id: 'comp-novapay', company_name: 'NovaPay', local_accuracy: 74, global_accuracy: 78, model_update_hash: '0x12a4b8...fe19', raw_records_shared: 0, model_updates_shared: 1, threats_analyzed: 450, created_at: '2026-10-09T10:00:00Z' },
  { id: 'fed-1-fs', round_number: 1, company_id: 'comp-finsecure', company_name: 'FinSecure Bank', local_accuracy: 72, global_accuracy: 78, model_update_hash: '0x34c7d9...ba02', raw_records_shared: 0, model_updates_shared: 1, threats_analyzed: 510, created_at: '2026-10-09T10:00:00Z' },
  { id: 'fed-1-ss', round_number: 1, company_id: 'comp-shopshield', company_name: 'ShopShield', local_accuracy: 76, global_accuracy: 78, model_update_hash: '0x56e9f1...dc34', raw_records_shared: 0, model_updates_shared: 1, threats_analyzed: 380, created_at: '2026-10-09T10:00:00Z' },
  { id: 'fed-1-mt', round_number: 1, company_id: 'comp-meditrust', company_name: 'MediTrust', local_accuracy: 71, global_accuracy: 78, model_update_hash: '0x78a1b3...fe56', raw_records_shared: 0, model_updates_shared: 1, threats_analyzed: 290, created_at: '2026-10-09T10:00:00Z' },
  { id: 'fed-1-es', round_number: 1, company_id: 'comp-edusafe', company_name: 'EduSafe', local_accuracy: 73, global_accuracy: 78, model_update_hash: '0x90c3d5...ba78', raw_records_shared: 0, model_updates_shared: 1, threats_analyzed: 320, created_at: '2026-10-09T10:00:00Z' },

  // Round 2
  { id: 'fed-2-np', round_number: 2, company_id: 'comp-novapay', company_name: 'NovaPay', local_accuracy: 79, global_accuracy: 85, model_update_hash: '0xab12c3...45de', raw_records_shared: 0, model_updates_shared: 2, threats_analyzed: 540, created_at: '2026-10-10T14:00:00Z' },
  { id: 'fed-2-fs', round_number: 2, company_id: 'comp-finsecure', company_name: 'FinSecure Bank', local_accuracy: 76, global_accuracy: 85, model_update_hash: '0xcd34e5...67fa', raw_records_shared: 0, model_updates_shared: 2, threats_analyzed: 610, created_at: '2026-10-10T14:00:00Z' },
  { id: 'fed-2-ss', round_number: 2, company_id: 'comp-shopshield', company_name: 'ShopShield', local_accuracy: 81, global_accuracy: 85, model_update_hash: '0xef56a7...89bc', raw_records_shared: 0, model_updates_shared: 2, threats_analyzed: 450, created_at: '2026-10-10T14:00:00Z' },
  { id: 'fed-2-mt', round_number: 2, company_id: 'comp-meditrust', company_name: 'MediTrust', local_accuracy: 78, global_accuracy: 85, model_update_hash: '0x13579b...df02', raw_records_shared: 0, model_updates_shared: 2, threats_analyzed: 340, created_at: '2026-10-10T14:00:00Z' },
  { id: 'fed-2-es', round_number: 2, company_id: 'comp-edusafe', company_name: 'EduSafe', local_accuracy: 77, global_accuracy: 85, model_update_hash: '0x2468ac...e013', raw_records_shared: 0, model_updates_shared: 2, threats_analyzed: 390, created_at: '2026-10-10T14:00:00Z' },

  // Round 3 (Current)
  { id: 'fed-3-np', round_number: 3, company_id: 'comp-novapay', company_name: 'NovaPay', local_accuracy: 82, global_accuracy: 91, model_update_hash: '0x4a8f1e...92bd', raw_records_shared: 0, model_updates_shared: 3, threats_analyzed: 620, created_at: '2026-10-11T18:00:00Z' },
  { id: 'fed-3-fs', round_number: 3, company_id: 'comp-finsecure', company_name: 'FinSecure Bank', local_accuracy: 79, global_accuracy: 91, model_update_hash: '0x6c0a3f...14df', raw_records_shared: 0, model_updates_shared: 3, threats_analyzed: 690, created_at: '2026-10-11T18:00:00Z' },
  { id: 'fed-3-ss', round_number: 3, company_id: 'comp-shopshield', company_name: 'ShopShield', local_accuracy: 84, global_accuracy: 91, model_update_hash: '0x8e2c5a...36fa', raw_records_shared: 0, model_updates_shared: 3, threats_analyzed: 510, created_at: '2026-10-11T18:00:00Z' },
  { id: 'fed-3-mt', round_number: 3, company_id: 'comp-meditrust', company_name: 'MediTrust', local_accuracy: 81, global_accuracy: 91, model_update_hash: '0x0f4e7c...58bc', raw_records_shared: 0, model_updates_shared: 3, threats_analyzed: 390, created_at: '2026-10-11T18:00:00Z' },
  { id: 'fed-3-es', round_number: 3, company_id: 'comp-edusafe', company_name: 'EduSafe', local_accuracy: 80, global_accuracy: 91, model_update_hash: '0x2a609e...70de', raw_records_shared: 0, model_updates_shared: 3, threats_analyzed: 440, created_at: '2026-10-11T18:00:00Z' },
];

// Seeded Audit Logs
export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-001',
    company_id: 'comp-novapay',
    user_id: 'usr-np-head',
    user_email: 'head1@novapay.com',
    action: 'login_success',
    target_type: 'user',
    target_id: 'usr-np-head',
    ip_address: '103.21.58.10',
    device: 'macOS Chrome (Passkey FIDO2)',
    metadata: { method: 'WebAuthn biometric passkey' },
    created_at: '2026-10-12T08:00:00Z',
  },
  {
    id: 'aud-002',
    company_id: 'comp-novapay',
    user_id: 'usr-np-emp-18',
    user_email: 'rahul.sharma@novapay.com',
    action: 'login_failure',
    target_type: 'user',
    target_id: 'usr-np-emp-18',
    ip_address: '103.21.58.14',
    device: 'Chrome on Windows',
    metadata: { failed_attempt_count: 1 },
    created_at: '2026-10-12T12:41:10Z',
  },
  {
    id: 'aud-003',
    company_id: 'comp-novapay',
    user_id: 'usr-np-emp-18',
    user_email: 'rahul.sharma@novapay.com',
    action: 'login_failure',
    target_type: 'user',
    target_id: 'usr-np-emp-18',
    ip_address: '103.21.58.14',
    device: 'Chrome on Windows',
    metadata: { failed_attempt_count: 2 },
    created_at: '2026-10-12T12:42:30Z',
  },
  {
    id: 'aud-004',
    company_id: 'comp-novapay',
    user_id: 'usr-np-emp-18',
    user_email: 'rahul.sharma@novapay.com',
    action: 'account_restricted',
    target_type: 'user',
    target_id: 'usr-np-emp-18',
    ip_address: '103.21.58.14',
    device: 'Chrome on Windows',
    metadata: { reason: 'Exceeded maximum 3 failed login attempts', alert_id: 'ALT-2026-004521' },
    created_at: '2026-10-12T12:44:02Z',
  },
  {
    id: 'aud-005',
    company_id: 'comp-novapay',
    user_id: 'system',
    action: 'alert_created',
    target_type: 'alert',
    target_id: 'ALT-2026-004521',
    ip_address: '127.0.0.1',
    device: 'Security Event Bus',
    metadata: { alert_type: 'failed_login_threshold', user: 'rahul.sharma@novapay.com' },
    created_at: '2026-10-12T12:44:05Z',
  },
  {
    id: 'aud-006',
    company_id: 'comp-novapay',
    user_id: 'usr-np-analyst1',
    user_email: 'analyst1@novapay.com',
    action: 'threat_blocked',
    target_type: 'blocklist',
    target_id: 'blk-np-01',
    ip_address: '103.21.58.10',
    device: 'Chrome on macOS',
    metadata: { indicator: 'novapay-secure-login.com', risk_score: 94 },
    created_at: '2026-10-11T14:25:00Z',
  },
  {
    id: 'aud-007',
    company_id: 'comp-novapay',
    user_id: 'usr-np-analyst1',
    action: 'blockchain_anchored',
    target_type: 'block_anchor',
    target_id: 'anc-np-01',
    ip_address: '103.21.58.10',
    device: 'Security Node Worker',
    metadata: { network: 'Polygon Amoy Testnet', tx_hash: '0x3a7e58f0...1ec9' },
    created_at: '2026-10-11T14:26:00Z',
  },
  {
    id: 'aud-008',
    company_id: 'comp-novapay',
    user_id: 'usr-np-analyst1',
    action: 'zk_proof_generated',
    target_type: 'zk_proof',
    target_id: 'zk-np-01',
    ip_address: '103.21.58.10',
    device: 'ZK Cryptographic Prover',
    metadata: { merkle_root: '0x4a9b2c...4b6a', claims_verified: 5 },
    created_at: '2026-10-11T14:27:00Z',
  },
  {
    id: 'aud-009',
    company_id: 'comp-novapay',
    user_id: 'system',
    action: 'federated_round_completed',
    target_type: 'federated_round',
    target_id: 'fed-3-np',
    ip_address: '127.0.0.1',
    device: 'Federated Coordinator',
    metadata: { round: 3, global_accuracy: 91, records_shared: 0 },
    created_at: '2026-10-11T18:00:00Z',
  },
];
