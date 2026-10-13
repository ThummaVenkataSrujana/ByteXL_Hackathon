import { OfficialAsset, ThreatCategory } from '../types';

export interface ScanResult {
  indicator: string;
  indicator_type: 'url' | 'email' | 'phone' | 'social' | 'app' | 'qr' | 'logo';
  risk_score: number;
  confidence: 'Low' | 'Medium' | 'High';
  threat_category: ThreatCategory;
  is_official: boolean;
  is_blocked: boolean;
  target_brand?: string;
  evidence_signals: string[];
  osint_data: {
    domain_age_days: number;
    registrar: string;
    dns_record_type: string;
    mx_record_found: boolean;
    ssl_issuer: string;
    geo_location: string;
    ip_address: string;
  };
  breakdown: {
    rule: string;
    score_impact: number;
    description: string;
  }[];
  explanation: string;
  recommended_action: string;
}

const SUSPICIOUS_TLDS = ['.xyz', '.top', '.live', '.club', '.biz', '.online', '.cc', '.info', '.work', '.click', '.fit', '.stream', '.cfd', '.quest'];
const SENSITIVE_KEYWORDS = ['login', 'signin', 'verify', 'secure', 'update', 'kyc', 'payment', 'refund', 'dispute', 'account', 'wallet', 'sso', 'auth', 'otp', 'billing', 'portal', 'claim', 'bonus', 'ebank', 'support', 'token'];

// Homoglyph maps (Cyrillic, Greek, lookalikes)
const HOMOGLYPH_MAP: Record<string, string> = {
  'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y', 'х': 'x',
  'і': 'i', 'ј': 'j', 'ѕ': 's', 'ԁ': 'd', 'ԛ': 'q', 'ԝ': 'w',
  '0': 'o', '1': 'l', '3': 'e', '5': 's', '8': 'b',
};

export function cleanDomain(input: string): string {
  let clean = input.trim().toLowerCase();
  clean = clean.replace(/^(https?:\/\/)?(www\.)?/, '');
  clean = clean.split('/')[0];
  clean = clean.split('?')[0];
  clean = clean.split(':')[0];
  return clean;
}

export function detectHomoglyphs(domain: string): { hasHomoglyphs: boolean; normalized: string; details: string[] } {
  let normalized = '';
  const details: string[] = [];
  let found = false;

  for (const char of domain) {
    if (HOMOGLYPH_MAP[char]) {
      found = true;
      details.push(`Lookalike/Cyrillic glyph '${char}' substituting for Latin '${HOMOGLYPH_MAP[char]}'`);
      normalized += HOMOGLYPH_MAP[char];
    } else {
      normalized += char;
    }
  }

  return { hasHomoglyphs: found, normalized, details };
}

export function stringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.85;

  // Simple bigram Dice coefficient
  const getBigrams = (str: string) => {
    const bigrams = new Set<string>();
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.add(str.substring(i, i + 2));
    }
    return bigrams;
  };

  const bg1 = getBigrams(s1);
  const bg2 = getBigrams(s2);
  if (bg1.size === 0 || bg2.size === 0) return 0;

  let intersection = 0;
  bg1.forEach(b => {
    if (bg2.has(b)) intersection++;
  });

  return (2 * intersection) / (bg1.size + bg2.size);
}

export function analyzeThreat(
  rawIndicator: string,
  indicatorType: 'url' | 'email' | 'phone' | 'social' | 'app' | 'qr' | 'logo',
  officialAssets: OfficialAsset[],
  activeBlocklistValues: string[] = []
): ScanResult {
  const indicator = rawIndicator.trim();
  const domain = cleanDomain(indicator);
  const evidence_signals: string[] = [];
  const breakdown: { rule: string; score_impact: number; description: string }[] = [];
  let baseScore = 5;

  // 1. Check Allowlist Exact Match
  const isAllowlisted = officialAssets.some(a => {
    if (!a.is_allowlisted) return false;
    const officialClean = cleanDomain(a.asset_value);
    return domain === officialClean || indicator.toLowerCase().includes(a.asset_value.toLowerCase());
  });

  if (isAllowlisted) {
    return {
      indicator,
      indicator_type: indicatorType,
      risk_score: 0,
      confidence: 'High',
      threat_category: 'Brand Impersonation / Phishing',
      is_official: true,
      is_blocked: false,
      evidence_signals: ['Matched verified brand asset registry', 'Allowlisted domain certificate'],
      osint_data: {
        domain_age_days: 2840,
        registrar: 'Corporate Registrar Services LLC',
        dns_record_type: 'A / AAAA / CAA Verified',
        mx_record_found: true,
        ssl_issuer: 'DigiCert High Assurance EV TLS CA',
        geo_location: 'United States (Corporate Anycast)',
        ip_address: '104.18.24.12',
      },
      breakdown: [{ rule: 'Official Allowlist Match', score_impact: 0, description: 'Domain is in official trusted company registry.' }],
      explanation: `${indicator} is an authenticated, official brand asset in your company registry. Safe to navigate.`,
      recommended_action: 'Allow access. No threat detected.',
    };
  }

  // 2. Check if already on active blocklist
  const isAlreadyBlocked = activeBlocklistValues.some(b => cleanDomain(b) === domain || b.toLowerCase() === indicator.toLowerCase());
  if (isAlreadyBlocked) {
    baseScore += 65;
    evidence_signals.push('Indicator currently listed on active enterprise blocklist');
    breakdown.push({ rule: 'Active Blocklist Match', score_impact: 65, description: 'Direct match with active high-threat blocklist' });
  }

  // 3. Brand Target Detection
  const brands = [
    { name: 'NovaPay', slug: 'novapay', official: 'novapay.com' },
    { name: 'FinSecure Bank', slug: 'finsecure', official: 'finsecurebank.com' },
    { name: 'ShopShield', slug: 'shopshield', official: 'shopshield.com' },
    { name: 'MediTrust', slug: 'meditrust', official: 'meditrust.com' },
    { name: 'EduSafe', slug: 'edusafe', official: 'edusafe.com' },
  ];

  let matchedBrand: { name: string; slug: string; official: string } | undefined;
  for (const b of brands) {
    if (domain.includes(b.slug) || indicator.toLowerCase().includes(b.slug)) {
      matchedBrand = b;
      break;
    }
  }

  // 4. IP-based URL
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipPattern.test(domain)) {
    baseScore += 35;
    evidence_signals.push(`Host is raw numeric IP address (${domain}) rather than hostname`);
    breakdown.push({ rule: 'Raw IP Hostname', score_impact: 35, description: 'Legitimate brands rarely serve consumer web portals directly on bare IPs' });
  }

  // 5. Homoglyphs
  const homoglyphRes = detectHomoglyphs(domain);
  if (homoglyphRes.hasHomoglyphs) {
    baseScore += 35;
    evidence_signals.push(...homoglyphRes.details);
    breakdown.push({ rule: 'Homoglyph / Punycode Substitution', score_impact: 35, description: 'Visual spoofing using foreign characters or numeric swaps' });
  }

  // 6. Suspicious TLD
  const hasSuspiciousTld = SUSPICIOUS_TLDS.some(tld => domain.endsWith(tld));
  if (hasSuspiciousTld) {
    baseScore += 20;
    const tld = domain.substring(domain.lastIndexOf('.'));
    evidence_signals.push(`High-abuse Top Level Domain (${tld}) detected`);
    breakdown.push({ rule: 'High-Abuse TLD', score_impact: 20, description: `The TLD ${tld} has elevated correlation with phishing campaigns` });
  }

  // 7. Excessive subdomains
  const subdomains = domain.split('.');
  if (subdomains.length > 3) {
    baseScore += 15;
    evidence_signals.push(`Excessive subdomain hierarchy (${subdomains.length} labels)`);
    breakdown.push({ rule: 'Subdomain Camouflage', score_impact: 15, description: 'Attackers nest brand names in subdomains to trick mobile viewports' });
  }

  // 8. Sensitive Keywords (Login, OTP, KYC, etc.)
  const foundKeywords = SENSITIVE_KEYWORDS.filter(kw => indicator.toLowerCase().includes(kw));
  if (foundKeywords.length > 0) {
    const impact = Math.min(foundKeywords.length * 10, 25);
    baseScore += impact;
    evidence_signals.push(`Credential/financial keywords detected: ${foundKeywords.slice(0, 4).join(', ')}`);
    breakdown.push({ rule: 'Targeted Urgency Keywords', score_impact: impact, description: `Contains high-risk action words: ${foundKeywords.join(', ')}` });
  }

  // 9. Official Domain Mismatch & Typo-squatting
  if (matchedBrand) {
    if (domain !== matchedBrand.official && !domain.endsWith('.' + matchedBrand.official)) {
      const similarity = Math.round(stringSimilarity(domain, matchedBrand.official) * 100);
      baseScore += 30;
      evidence_signals.push(`Brand similarity with ${matchedBrand.name}: ${similarity}% (Official domain mismatch)`);
      breakdown.push({ rule: 'Brand Impersonation Signal', score_impact: 30, description: `Targets ${matchedBrand.name} while hosted on unauthorized domain ${domain}` });
    }
  }

  // 10. Specific checks by indicator type
  let threatCategory: ThreatCategory = 'Brand Impersonation / Phishing';

  if (indicatorType === 'qr') {
    threatCategory = 'Malicious QR (Quishing)';
    baseScore += 15;
    evidence_signals.push('QR vector detected: Physical redirect obscures destination endpoint');
    breakdown.push({ rule: 'QR Vector Obfuscation', score_impact: 15, description: 'Quishing attack vector bypassing standard email filters' });
  } else if (indicatorType === 'app') {
    threatCategory = 'Copycat Mobile Application';
    baseScore += 20;
    evidence_signals.push('Unsigned third-party application package signature');
    breakdown.push({ rule: 'Rogue Application Package', score_impact: 20, description: 'Package not listed in official Apple/Google Play enterprise store' });
  } else if (indicatorType === 'phone') {
    threatCategory = 'Fake Support / Vishing';
    baseScore += 15;
    evidence_signals.push('Unregistered VoIP carrier routing customer support lure');
  } else if (foundKeywords.some(k => ['login', 'signin', 'otp', 'auth', 'sso'].includes(k))) {
    threatCategory = 'Credential Harvesting';
  }

  // Simulated OSINT signals
  const isSuspicious = baseScore >= 50;
  const domainAgeDays = isSuspicious ? Math.floor(Math.random() * 6) + 1 : 1240;
  const mxRecordFound = !isSuspicious;

  if (isSuspicious) {
    baseScore += 15;
    evidence_signals.push(`Domain registered ${domainAgeDays} days ago via offshore privacy registrar`);
    breakdown.push({ rule: 'Newly Registered Domain (NRD)', score_impact: 15, description: `Domain age is ${domainAgeDays} days old (under 30-day baseline)` });

    if (!mxRecordFound) {
      baseScore += 10;
      evidence_signals.push('No corporate MX record found (unusable for legitimate mail)');
      breakdown.push({ rule: 'Missing Mail Exchange Record', score_impact: 10, description: 'No valid MX records configured on host' });
    }
  }

  // Cap score between 0 and 100
  const finalScore = Math.min(Math.max(baseScore, 10), 99);
  const confidence: 'Low' | 'Medium' | 'High' = finalScore >= 75 ? 'High' : finalScore >= 45 ? 'Medium' : 'Low';

  let recommendedAction = 'Monitor indicator for further threat activity.';
  if (finalScore >= 85) {
    recommendedAction = `Immediate containment: Block ${domain} across protected browsing, alert security team, and anchor immutable evidence.`;
  } else if (finalScore >= 60) {
    recommendedAction = `Require analyst review and inspect web server headers before permitting traffic.`;
  }

  const explanation = `${indicator} exhibits a risk score of ${finalScore}/100 with ${confidence} confidence. Analysis detected ${evidence_signals.length} threat indicators, including ${evidence_signals.slice(0, 2).join(' and ')}. ${matchedBrand ? `It targets the brand identity of ${matchedBrand.name} without enterprise authorization.` : ''}`;

  return {
    indicator,
    indicator_type: indicatorType,
    risk_score: finalScore,
    confidence,
    threat_category: threatCategory,
    is_official: false,
    is_blocked: isAlreadyBlocked || finalScore >= 85,
    target_brand: matchedBrand?.name,
    evidence_signals,
    osint_data: {
      domain_age_days: domainAgeDays,
      registrar: isSuspicious ? 'NameCheap / Privacy Guardian AS58224' : 'MarkMonitor Corporate Inc.',
      dns_record_type: 'A (Hostinger Cloud VPS)',
      mx_record_found: mxRecordFound,
      ssl_issuer: isSuspicious ? "Let's Encrypt Free Authority" : 'DigiCert High Assurance EV TLS CA',
      geo_location: isSuspicious ? 'Seychelles / Bulletproof Hosting' : 'United States (Anycast Edge)',
      ip_address: isSuspicious ? '185.220.101.5' : '104.21.32.99',
    },
    breakdown,
    explanation,
    recommended_action: recommendedAction,
  };
}
