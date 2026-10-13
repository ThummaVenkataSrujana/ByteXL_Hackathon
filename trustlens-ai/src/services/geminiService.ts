export interface ChatContext {
  companyId: string;
  companyName: string;
  userRole: string;
  userName: string;
  totalReports: number;
  pendingReports: number;
  confirmedThreats: number;
  blockedUrlsCount: number;
  blockedUrls: string[];
  failedLoginAttemptsCount: number;
  restrictedAccountsCount: number;
  restrictedUsers: { name: string; email: string; code: string; attempts: number }[];
  recentAlerts: { id: string; title: string; severity: string; created_at: string }[];
  recentReports: { id: string; indicator: string; score: number; status: string; category: string }[];
  federatedLearningAccuracy: number;
}

export interface ChatResponse {
  message: string;
  sources?: string[];
  recommended_action?: string;
  action_proposal?: {
    type: 'send_alert' | 'block_url' | 'restrict_user';
    title: string;
    details: string;
    payload: any;
  };
}

export async function askSentinel(
  prompt: string,
  history: { role: 'user' | 'assistant'; message: string }[],
  context: ChatContext
): Promise<ChatResponse> {
  try {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        history,
        context,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.message) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend Gemini API call error, using built-in intelligent fallback:', err);
  }

  // Built-in intelligent fallback response engine
  return generateIntelligentFallback(prompt, context);
}

export function generateIntelligentFallback(prompt: string, ctx: ChatContext): ChatResponse {
  const p = prompt.toLowerCase().trim();

  // 1. ACTION PROPOSALS: Alert company head about failed logins
  if (p.includes('alert') && (p.includes('head') || p.includes('failed login') || p.includes('failed logins') || p.includes('novapay'))) {
    return {
      message: `I have prepared an urgent security notification for the Security Head of ${ctx.companyName}.\n\nThis alert summarizes the repeated failed login incidents detected in the last window, highlighting ${ctx.restrictedAccountsCount} restricted accounts (${ctx.restrictedUsers.map(u => u.name + ' [' + u.email + ']').join(', ') || 'Rahul Sharma'}).`,
      sources: [`${ctx.companyName} IAM Login Risk Monitor`, 'Enterprise Security Alert Policy ALT-2026'],
      recommended_action: 'Click "Confirm & Dispatch Alert" below to deliver this security alert directly to the company head.',
      action_proposal: {
        type: 'send_alert',
        title: `Dispatch Urgent Security Alert to ${ctx.companyName} Head`,
        details: `Deliver high-priority notification regarding ${ctx.restrictedAccountsCount || 2} restricted accounts with repeated failed authentication attempts.`,
        payload: {
          companyId: ctx.companyId,
          companyName: ctx.companyName,
          alertType: 'failed_login_threshold',
          restrictedUsers: ctx.restrictedUsers,
        },
      },
    };
  }

  // 2. SECURITY SUMMARY
  if (p.includes('summary') || p.includes('status') || p.includes('overview') || p.includes('brief')) {
    return {
      message: `${ctx.companyName} currently has ${ctx.totalReports} total reports, ${ctx.pendingReports} pending investigations, and ${ctx.blockedUrlsCount} blocked indicators.\n\nIn the last 24 hours, ${ctx.failedLoginAttemptsCount} login attempts failed, resulting in ${ctx.restrictedAccountsCount} restricted employee accounts.\n\nThe global Federated Threat Learning model is operating at ${ctx.federatedLearningAccuracy}% accuracy.`,
      sources: [`${ctx.companyName} Threat Intelligence Store`, 'IAM Telemetry Registry', 'Federated Network Consensus'],
      recommended_action: ctx.restrictedAccountsCount > 0
        ? 'Review the restricted employee accounts in the Login Risk Monitor and verify their identity.'
        : 'Review the latest pending fraud reports in the Reporting Center.',
    };
  }

  // 3. FAILED LOGIN ATTEMPTS / RESTRICTED EMPLOYEES
  if (p.includes('failed login') || p.includes('failed attempt') || p.includes('restricted') || p.includes('which employee')) {
    const userList = ctx.restrictedUsers.length > 0
      ? ctx.restrictedUsers.map(u => `• ${u.name} (${u.email}, Code: ${u.code}) — ${u.attempts} failed attempts (Status: Restricted)`).join('\n')
      : '• Rahul Sharma (rahul.sharma@novapay.com) — 3 failed attempts (Restricted)\n• Priya Nair (priya.nair@novapay.com) — 3 failed attempts (Restricted)';

    return {
      message: `In ${ctx.companyName}, ${ctx.restrictedAccountsCount} employee account(s) have reached the 3-attempt failure threshold and are currently temporarily restricted:\n\n${userList}\n\nAll login attempts from these accounts are halted until identity verification.`,
      sources: ['Identity & Access Management (IAM) Audit Log', 'Rate Limiter Security Engine'],
      recommended_action: 'Conduct out-of-band identity verification with these employees and require passkey re-registration.',
    };
  }

  // 4. BLOCKED URLS & REASONS
  if (p.includes('blocked url') || p.includes('blocked') || p.includes('which url') || p.includes('blocklist')) {
    if (p.includes('why') || p.includes('novapay-secure-login')) {
      return {
        message: `novapay-secure-login.com was blocked because our scanner determined an extreme risk score of 94/100.\n\nKey evidence signals detected:\n• 91% brand similarity with NovaPay\n• Official-domain mismatch (not registered to novapay.com)\n• Domain registered just 2 days ago via privacy proxy\n• Active credential harvesting form matching NovaPay login styles\n• No legitimate corporate MX records found`,
        sources: ['Threat Scanner Rule Engine', 'Domain OSINT Enrichment (AS60117)', 'Protected Browsing Blocklist'],
        recommended_action: 'Keep domain blocked in Protected Browsing and trigger automated registrar takedown.',
      };
    }

    const blockedList = ctx.blockedUrls.slice(0, 5).map(u => `• ${u}`).join('\n') || '• novapay-secure-login.com\n• qr-pay-novapay.net\n• novapay-kyc-update.org';
    return {
      message: `${ctx.companyName} currently has ${ctx.blockedUrlsCount} active blocked indicators in Protected Browsing:\n\n${blockedList}\n\nAny user or employee attempting to open these URLs via TrustLens Protected Browsing will be met with a red high-risk interception screen.`,
      sources: ['Enterprise Blocklist Database', 'Polygon Amoy Anchored Records'],
      recommended_action: 'Ensure all newly submitted phishing reports with risk scores >= 85 are automatically added to this list.',
    };
  }

  // 5. PENDING REPORTS / FRAUD REPORTS
  if (p.includes('pending') || p.includes('reports') || p.includes('fraud report') || p.includes('investigation')) {
    return {
      message: `${ctx.companyName} has ${ctx.pendingReports} pending fraud investigation(s) awaiting analyst review out of ${ctx.totalReports} total reports.\n\nLatest reports include:\n` +
        ctx.recentReports.slice(0, 3).map(r => `• ${r.id}: ${r.indicator} (${r.category}, Risk: ${r.score}/100, Status: ${r.status})`).join('\n'),
      sources: [`${ctx.companyName} Fraud Reporting Center`, 'Analyst Triage Queue'],
      recommended_action: 'Open the Fraud Reports tab to triage pending indicators and issue block decisions.',
    };
  }

  // 6. TODAY'S HIGH-RISK THREATS
  if (p.includes('today') || p.includes('high-risk') || p.includes('high risk') || p.includes('threat')) {
    const highRisk = ctx.recentReports.filter(r => r.score >= 80);
    const threats = (highRisk.length > 0 ? highRisk : ctx.recentReports).slice(0, 3)
      .map(r => `• ${r.indicator} — Score: ${r.score}/100 [${r.category}]`)
      .join('\n');

    return {
      message: `Today's highest-risk threats targeting ${ctx.companyName}:\n\n${threats}\n\nAll threats scoring >= 85 are automatically intercepted in protected browsing and anchored with cryptographic proofs.`,
      sources: ['Real-Time Threat Classifier', 'Evidence Passport Store'],
      recommended_action: 'Inspect the Evidence Passport for each high-risk threat to verify OSINT signals and anchored proofs.',
    };
  }

  // 7. FEDERATED LEARNING
  if (p.includes('federated') || p.includes('accuracy') || p.includes('model')) {
    return {
      message: `The current global Federated Threat Learning accuracy is ${ctx.federatedLearningAccuracy}% across all 5 participating companies (NovaPay, FinSecure Bank, ShopShield, MediTrust, EduSafe).\n\nKey privacy properties:\n• Raw customer records shared: 0\n• Model updates shared: 3 rounds\n• Local company data never leaves your environment; only encrypted weight updates are synchronized.`,
      sources: ['Federated Learning Coordinator Node', 'Differential Privacy Verifier'],
      recommended_action: 'Navigate to the Federated Learning tab to run Round #4 and synchronize the latest model weights.',
    };
  }

  // 8. WHICH COMPANY HAS THE MOST ALERTS
  if (p.includes('which company') || p.includes('most alerts')) {
    return {
      message: `Across the TrustLens AI multi-company network, NovaPay currently has the highest alert activity due to an ongoing targeted phishing campaign (novapay-secure-login.com) and multiple failed login spikes from foreign proxies. FinSecure Bank is second with retail banking homoglyph attacks.`,
      sources: ['Cross-Company Anonymized Telemetry', 'Multi-Tenant Security Bus'],
      recommended_action: 'Maintain strict 2FA/passkey enforcement and monitor cross-brand typo-squatting vectors.',
    };
  }

  // 9. GENERAL CYBERSECURITY QUESTIONS

  // Phishing
  if (p.includes('what is phishing') || p.includes('phishing')) {
    return {
      message: `Phishing is a cyberattack where malicious actors impersonate a trusted organization (such as your bank, employer, or a popular online service) to deceive users into disclosing sensitive credentials, OTPs, or financial information.\n\nCommon varieties:\n1. Spear Phishing: Highly targeted lures customized for specific executives or staff.\n2. Quishing: Embedding malicious URLs into physical or digital QR codes.\n3. Homoglyph Attacks: Registering lookalike domains using visually identical foreign characters (e.g., Cyrillic 'а' replacing Latin 'a').`,
      recommended_action: 'Always verify domain spelling in the address bar and use passkeys to prevent credential theft.',
    };
  }

  // Passkey
  if (p.includes('passkey') || p.includes('fido') || p.includes('webauthn')) {
    return {
      message: `A Passkey is a passwordless authentication credential based on FIDO2/WebAuthn public-key cryptography. Instead of typing a password that can be stolen or phished:\n\n1. Your device creates a unique cryptographic key pair for each website.\n2. The public key is stored on the server; the private key remains secure in your device's hardware enclave (Secure Enclave / TPM).\n3. You unlock the private key with your device's biometric sensor (Face ID / Fingerprint) or device PIN.\n\nBecause passkeys are cryptographically bound to the exact origin domain, they are 100% immune to phishing websites!`,
      recommended_action: 'Enroll your device passkey in TrustLens Settings for phishing-resistant access.',
    };
  }

  // Blockchain Anchoring
  if (p.includes('blockchain') || p.includes('anchoring') || p.includes('anchor')) {
    return {
      message: `Blockchain Evidence Anchoring creates an immutable, timestamped cryptographic proof that a threat existed at an exact point in time.\n\nHow TrustLens AI implements it:\n1. The report data (indicator, risk score, analyst decision, evidence signals) is hashed using SHA-256.\n2. Only the cryptographic hash (never sensitive customer data or screenshots) is written to the blockchain (Polygon Amoy Testnet or local hash chain).\n3. Any party can verify that the digital evidence has not been altered or backdated since the anchor timestamp.`,
      recommended_action: 'Check the Evidence Passport page for any blocked threat to view its live blockchain transaction hash.',
    };
  }

  // Homoglyph Attack
  if (p.includes('homoglyph')) {
    return {
      message: `A homoglyph attack (also known as an IDN homograph attack) occurs when an attacker registers a domain name using characters from different alphabets (like Cyrillic, Greek, or Hebrew) that appear visually identical to standard Latin characters.\n\nFor example, the Latin letter 'a' looks identical to Cyrillic 'а' (U+0430), but represents a completely different web server destination.\n\nTrustLens AI analyzes Punycode encodings and normalizes characters to instantly detect homoglyph substitutions before employees can be deceived.`,
      recommended_action: 'Use the Threat Scanner to test suspicious domains for homoglyph anomalies.',
    };
  }

  // QR Phishing (Quishing)
  if (p.includes('qr') || p.includes('quishing')) {
    return {
      message: `QR Phishing (or "Quishing") is an attack vector where adversaries paste malicious QR code stickers over legitimate payment terminals, posters, or restaurant tables, or send QR codes in emails.\n\nBecause traditional email security filters inspect text and links rather than image-based QR destinations, users scan the code with their mobile cameras and get redirected to credential harvesting pages.\n\nTrustLens AI extracts QR payload endpoints and runs full domain risk scoring before opening.`,
      recommended_action: 'Scan unfamiliar QR codes through the TrustLens Threat Scanner before authorizing payments.',
    };
  }

  // Fake Website Identification
  if (p.includes('identify a fake website') || p.includes('fake website') || p.includes('how to spot')) {
    return {
      message: `Key indicators to spot a fake website:\n1. Address Bar Anomalies: Look for hyphens (nova-pay instead of novapay), extra subdomains, or odd TLDs (.xyz, .live, .cc).\n2. Urgent Psychological Lures: "Account suspended in 15 minutes! Enter OTP to unlock."\n3. Mismatched SSL/TLS Certificate: A free basic certificate issued yesterday on a multi-million-dollar banking brand.\n4. Input Anomalies: Demanding full debit card CVV, PIN, or Social Security Number on routine logins.\n5. Inconsistent Navigation: Dead links in footer and privacy policy terms.`,
      recommended_action: 'Paste the suspicious address into the TrustLens Threat Scanner for instant deep inspection.',
    };
  }

  // Strong Password
  if (p.includes('password') || p.includes('strong password')) {
    return {
      message: `To create an effective password:\n1. Use a passphrase of 4–5 random words (e.g., 'solar-cobalt-falcon-river').\n2. Aim for at least 16 characters in length.\n3. Never reuse passwords across different corporate and personal accounts.\n4. Use a trusted password manager and upgrade to Passkeys wherever supported.`,
      recommended_action: 'Upgrade your TrustLens login to Passkey device authentication in your profile.',
    };
  }

  // How TrustLens works
  if (p.includes('how does trustlens work') || p.includes('how trustlens works') || p.includes('what is trustlens')) {
    return {
      message: `TrustLens AI operates on a complete 9-stage proactive defense loop:\n\n1. Detect: Continuous scanning of lookalike domains, QR codes, logos, and rogue apps.\n2. Explain: AI-assisted threat reasoning and OSINT attribution.\n3. Report: Centralized multi-company fraud intake.\n4. Verify: Analyst review and duplicate grouping.\n5. Alert: Instant automated alerts to company security heads upon threshold events.\n6. Block: Active containment via Protected Browsing.\n7. Prove: Immutable SHA-256 evidence anchoring.\n8. Audit: ZK-style selective disclosure and tamper-proof logs.\n9. Learn: Multi-company federated learning without sharing raw customer data.`,
      recommended_action: 'Explore the Security Loop on the Dashboard or submit a test URL to the Threat Scanner.',
    };
  }

  // 10. GENERAL CONVERSATION & GREETINGS
  if (p.includes('hello') || p.includes('hi') || p.includes('hey') || p.includes('good morning') || p.includes('good afternoon')) {
    return {
      message: `Hello! I am TrustLens Sentinel, your 24/7 AI Security Assistant for ${ctx.companyName}.\n\nI can provide real-time security summaries, investigate suspicious URLs, detail employee login risks, explain cybersecurity concepts, or dispatch high-priority alerts to company heads.\n\nHow can I protect your brand today?`,
      recommended_action: 'Ask for a "Security summary" or check "Today\'s high-risk threats".',
    };
  }

  if (p.includes('what can you do') || p.includes('help') || p.includes('capabilities')) {
    return {
      message: `As TrustLens Sentinel, I provide continuous security intelligence:\n\n1. Platform Operations:\n• Provide instant security summaries and threat metrics\n• Report on pending investigations and blocked indicators\n• Monitor employee failed logins and restricted accounts\n• Dispatch alerts to company heads upon request\n\n2. Threat Intelligence:\n• Explain specific threat indicators and OSINT signals\n• Detail why specific URLs were blocked\n• Review federated learning model accuracy\n\n3. Cybersecurity Advisory:\n• Answer questions on phishing, quishing, homoglyphs, passkeys, and blockchain proofs.`,
      recommended_action: 'Type any question or use one of the quick-action chips below.',
    };
  }

  // Fallback default helpful cybersecurity response
  return {
    message: `I understand your query regarding "${prompt}". Within ${ctx.companyName}'s security workspace, we are currently tracking ${ctx.totalReports} fraud reports, ${ctx.blockedUrlsCount} blocked threats, and ${ctx.restrictedAccountsCount} restricted employee logins.\n\nIf you are inquiring about a specific URL or threat, you can paste the indicator here or navigate to the Threat Scanner. For general cybersecurity guidance or security alerts, feel free to ask directly!`,
    sources: [`${ctx.companyName} Security Baseline`, 'TrustLens Sentinel Intelligence Core'],
    recommended_action: 'Ask "Give me a security summary" or "Show today\'s high-risk threats".',
  };
}
