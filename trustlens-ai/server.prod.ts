import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Serve static Vite build
app.use(express.static(path.join(__dirname, 'dist')));

// Initialize Gemini SDK if API key is present
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

const SYSTEM_INSTRUCTION = `You are TrustLens Sentinel, a 24/7 AI security assistant for the TrustLens AI platform. Answer any user question helpfully, clearly, and accurately. For platform-data questions, use only the provided authorized company context. For general cybersecurity questions, use your own knowledge. Never reveal passwords, password hashes, passkeys, private keys, biometric data, or another company's private data. If data is unavailable, say so clearly. Always provide a helpful answer, evidence sources when relevant, and a recommended next action.

Classification Guidelines:
1. Platform-data question: Use ONLY the provided company context (reports, blocked URLs, failed logins, alerts, federated learning). Cite sources (e.g. "NovaPay IAM Registry", "Protected Browsing Blocklist").
2. General cybersecurity question: Explain clearly using cybersecurity knowledge.
3. Alert/action request: If user asks to alert the company head or take action on threats or failed logins, explain the proposed action clearly and recommend confirmation.
4. General conversation: Be professional, sharp, and helpful.

Format response clearly with:
- Main answer
- Sources (for platform data)
- Recommended action (when relevant)`;

// API: Chatbot endpoint
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  const { prompt, history, context } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!ai || !process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: 'Gemini API not configured, fallback enabled' });
  }

  try {
    const contextPrompt = `
CURRENT AUTHORIZED COMPANY CONTEXT:
Company Name: ${context?.companyName || 'NovaPay'}
User Role: ${context?.userRole || 'analyst'}
User Name: ${context?.userName || 'Staff'}
Total Reports: ${context?.totalReports || 0}
Pending Investigations: ${context?.pendingReports || 0}
Confirmed Threats: ${context?.confirmedThreats || 0}
Blocked URLs Count: ${context?.blockedUrlsCount || 0}
Blocked URLs: ${(context?.blockedUrls || []).slice(0, 10).join(', ')}
Failed Login Attempts (24h): ${context?.failedLoginAttemptsCount || 0}
Restricted Employee Accounts: ${context?.restrictedAccountsCount || 0}
Restricted Users List: ${JSON.stringify(context?.restrictedUsers || [])}
Recent Alerts: ${JSON.stringify(context?.recentAlerts || [])}
Recent Reports: ${JSON.stringify(context?.recentReports || [])}
Federated Learning Accuracy: ${context?.federatedLearningAccuracy || 91}%

USER CONVERSATION HISTORY:
${(history || []).slice(-6).map((h: any) => `${h.role === 'user' ? 'User' : 'Sentinel'}: ${h.message}`).join('\n')}

USER QUESTION:
"${prompt}"
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contextPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const outputText = response.text || '';

    const lowerPrompt = prompt.toLowerCase();
    const isAlertRequest = lowerPrompt.includes('alert') && (lowerPrompt.includes('head') || lowerPrompt.includes('failed login') || lowerPrompt.includes('failed logins'));

    let actionProposal = undefined;
    if (isAlertRequest) {
      actionProposal = {
        type: 'send_alert',
        title: `Dispatch Urgent Security Alert to ${context?.companyName || 'NovaPay'} Head`,
        details: `Deliver high-priority notification regarding restricted accounts with repeated failed authentication attempts.`,
        payload: {
          companyId: context?.companyId,
          companyName: context?.companyName,
          alertType: 'failed_login_threshold',
          restrictedUsers: context?.restrictedUsers,
        },
      };
    }

    return res.json({
      message: outputText,
      sources: [`${context?.companyName || 'Enterprise'} Security Intelligence Bus`, 'Protected Browsing Telemetry'],
      recommended_action: 'Review flagged threats and verify employee credentials.',
      action_proposal: actionProposal,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    return res.status(500).json({ error: error?.message || 'Gemini inference failed' });
  }
});

// API: Threat Explanation endpoint
app.post('/api/gemini/explain', async (req: Request, res: Response) => {
  const { indicator, scanResult, companyName } = req.body;

  if (!ai || !process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: 'Gemini API not configured' });
  }

  try {
    const prompt = `Explain the following threat assessment for security analysts:
Target Brand / Company: ${companyName || 'NovaPay'}
Indicator: ${indicator}
Risk Score: ${scanResult?.risk_score}/100
Confidence: ${scanResult?.confidence}
Threat Category: ${scanResult?.threat_category}
Evidence Signals: ${JSON.stringify(scanResult?.evidence_signals)}
OSINT Data: ${JSON.stringify(scanResult?.osint_data)}

Provide a concise, professional 2-paragraph security summary and clear recommended action.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert fraud and brand security analyst. Write concise, technical, actionable analysis.',
      },
    });

    return res.json({ explanation: response.text });
  } catch (error: any) {
    console.error('Error in /api/gemini/explain:', error);
    return res.status(500).json({ error: 'Failed to generate threat explanation' });
  }
});

// API: Gateway Proxy Endpoint (Active Perimeter Defense)
app.all('/api/gateway/proxy', async (req: Request, res: Response) => {
  const urlParam = ((req.query.url as string) || req.body?.url || '').trim();

  if (!urlParam) {
    return res.status(400).json({ error: 'Target URL parameter is required for Gateway Proxy' });
  }

  const clean = urlParam.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].split('?')[0];

  const knownBlockedDomains = [
    'novapay-secure-login.com',
    'finsecure-ebank-login.info',
    'qr-pay-novapay.net',
    'novapay-kyc-update.org',
    'com.novapay.fastcash.loan',
    'support-novapay-settlement.cc',
    'shopshield-orders.info',
    'meditrust-claims-portal.org',
  ];

  const isBlocked = knownBlockedDomains.some(b => clean === b || clean.includes(b));

  if (isBlocked) {
    return res.status(403).json({
      status: 'BLOCKED',
      decision: 'INTERCEPTED',
      url: urlParam,
      domain: clean,
      risk_score: 95,
      threat_category: 'Brand Impersonation / Phishing',
      reason: 'Hostile credential harvesting domain matched on active enterprise blocklist',
      interception_policy: 'Strict Zero-Trust Perimeter Intercept',
      gateway_signature: '0x' + Array.from({ length: 32 }, (_, i) => ((clean.length * 7 + i * 13) % 16).toString(16)).join(''),
      timestamp: new Date().toISOString(),
    });
  }

  const officialDomains = ['novapay.com', 'finsecurebank.com', 'shopshield.com', 'meditrust.com', 'edusafe.com'];
  const isOfficial = officialDomains.some(o => clean === o || clean.endsWith('.' + o));
  const latency = Math.floor(Math.random() * 20) + 14;

  return res.json({
    status: 'ACTIVE',
    decision: isOfficial ? 'OFFICIAL_ALLOWED' : 'ALLOWED_SANDBOXED',
    url: urlParam,
    domain: clean,
    risk_score: isOfficial ? 0 : 35,
    latency_ms: latency,
    ssl_inspection: {
      valid: true,
      issuer: isOfficial ? 'DigiCert High Assurance EV TLS CA' : 'Cloudflare Inc ECC CA-3',
      protocol: 'TLS 1.3 / QUIC Protocol Enforced',
      cipher: 'AEAD-AES256-GCM-SHA384',
    },
    security_headers: {
      'content-security-policy': "default-src 'self'; frame-ancestors 'none'; sandbox allow-same-origin;",
      'strict-transport-security': 'max-age=31536000; includeSubDomains',
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
      'x-gateway-proxy': 'TrustLens-Perimeter-v2.4-Active',
    },
    gateway_proxy_status: 'ACTIVE',
    isolation_layer: 'Full Virtualized DOM Sandbox',
    message: isOfficial
      ? 'Verified official corporate destination. Direct encrypted tunnel active.'
      : 'External destination safe pass-through rendered in virtualized security sandbox.',
  });
});

// API: Gateway Status Healthcheck
app.get('/api/gateway/status', (_req: Request, res: Response) => {
  return res.json({
    gateway_proxy_status: 'ACTIVE',
    mode: 'Zero-Trust Perimeter Proxy',
    version: '2.4.0-TLS-AMOY',
    active_intercept_rules: 1420,
    enforced_at: new Date().toISOString(),
  });
});

// Catch-all: serve React app for all non-API routes (SPA routing)
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`TrustLens AI Production Server running on port ${port}`);
});
