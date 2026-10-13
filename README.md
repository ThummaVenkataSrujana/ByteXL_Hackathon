# TrustLens AI
**Multi-Company AI-Powered Brand Protection, Fraud Intelligence, Secure Access, and Security Assistant**

**Tagline:** Detect the Threat. Verify the Identity. Alert the Right People. Protect the Brand.

## 1. Project Overview
TrustLens AI is a multi-company security platform concept for identifying brand impersonation, phishing, suspicious digital indicators, and account-security risks. It combines threat assessment, fraud reporting, login monitoring, alerts, an AI security assistant, protected-browsing controls, and verifiable audit records.

## 2. Problem Statement
Organizations face look-alike domains, fake support pages, fraudulent QR codes, copycat logos, fake social profiles, malicious apps, phishing, and account-takeover attempts. Separate tools can make investigation, alerting, company data isolation, and evidence tracking difficult.

TrustLens AI proposes a unified workflow to detect suspicious indicators, explain risk signals, collect reports, monitor failed logins, notify the appropriate company security head, and preserve evidence for later review.

## 3. Main Objectives
- Detect potential brand impersonation and phishing indicators.
- Explain why a submitted indicator may be suspicious.
- Let employees and analysts submit fraud reports.
- Monitor login activity and repeated failed attempts.
- Alert the relevant company security head.
- Keep company data isolated through backend authorization.
- Provide an AI security assistant for authorized security questions.
- Support protected-browsing warnings for high-risk URLs.
- Preserve evidence integrity and audit history.
- Explore privacy-preserving collaborative threat learning.

## 4. Key Features
- **Multi-company workspace:** Separates users, reports, and alerts by company.
- **Brand Trust Registry:** Records official domains, email domains, logos, social handles, app identifiers, and trusted partner domains.
- **Threat scanner:** Accepts URLs, email addresses, phone numbers, social profiles, app identifiers, QR images, and logos.
- **Evidence Passport:** Collects a report ID, risk score, supporting signals, review status, recommended action, and audit history.
- **Fraud reporting:** Lets employees and analysts report suspicious activity.
- **Login monitoring:** Records successful and failed authentication attempts.
- **Failed-login alerts:** Proposed rule creates a high-priority alert after three failed attempts.
- **Sentinel chatbot:** Answers security questions using authorized data.
- **Protected browsing:** Warns or blocks high-confidence indicators within the TrustLens browsing flow.
- **Evidence anchoring:** Can publish cryptographic commitments to a blockchain testnet.
- **Selective verification:** Can use hashes and Merkle proofs to verify selected claims.
- **Federated learning:** Can share model updates rather than raw records.
- **Audit logging:** Records security-relevant actions.

## 5. System Workflow
The high-level workflow is:

**Detect → Explain → Report → Verify → Alert → Block → Prove → Audit → Learn**

1. A user submits a suspicious digital indicator.
2. The backend validates the request and the user's company permissions.
3. Threat services analyze available evidence and risk signals.
4. The system generates a risk assessment and explanation.
5. An Evidence Passport records the assessment and its evidence references.
6. An authorized analyst reviews important decisions.
7. Eligible high-confidence indicators can be added to the protected-browsing blocklist.
8. A cryptographic commitment can be anchored for integrity verification.
9. Security events are recorded in the audit trail.



## 6. Architecture Layers
1. **Presentation layer:** React pages for dashboard, scanner, reports, Evidence Passport, alerts, chatbot, blocklist, and administration.
2. **API layer:** FastAPI routes and Pydantic validation for requests and responses.
3. **Security layer:** Authentication, authorization, password hashing, passkeys, login monitoring, and tenant isolation.
4. **Threat intelligence layer:** Brand registry, URL/domain analysis, QR/logo analysis, risk scoring, and optional OSINT.
5. **AI assistant layer:** Uses authorized security data to produce plain-language explanations and recommendations.
6. **Data layer:** SQLite and SQLAlchemy store prototype records.
7. **Verification layer:** SHA-256 and Merkle proofs support integrity checks; web3.py can anchor commitments to a testnet.
8. **Federated-learning layer:** Participating organizations can share model updates instead of raw records.

## 7. Technology Stack

| Layer | Technology | Usage |
|---|---|---|
| Frontend | React | Dashboard, scanner, reports, chatbot, alerts |
| Build tool | Vite | Frontend development and build |
| Styling | Tailwind CSS | Responsive UI, cards, forms, risk indicators |
| Charts | Recharts | Threat analytics and graphs |
| Routing | React Router | Navigation between pages |
| Backend | FastAPI | REST API and business logic |
| Validation | Pydantic | Request/response validation |
| Database | SQLite | Prototype data storage |
| ORM | SQLAlchemy | Database models and queries |
| Password security | Argon2id or bcrypt | Password hashing and verification |
| Authentication | WebAuthn/passkeys | Device-based, phishing-resistant authentication |
| Similarity detection | RapidFuzz | Brand and domain similarity |
| Image processing | Pillow | Logo and QR image handling |
| Perceptual hashing | imagehash | Comparing potentially copied logos |
| Computer vision | OpenCV | QR and logo image processing |
| QR decoding | pyzbar | Extracting QR destinations |
| LLM | OpenAI, Gemini, or Groq | Security explanations and chatbot responses |
| OSINT | WHOIS/DNS API or seeded data | Domain and reputation signals |
| Machine learning | scikit-learn | Lightweight phishing-risk classification |
| Federated learning | Flower or custom FedAvg | Collaborative model-learning concept |
| Blockchain | web3.py | Evidence-hash anchoring |
| Network | Polygon Amoy | Blockchain testnet |
| Selective verification | SHA-256 and Merkle tree | Integrity checks and selective disclosure |
| Deployment | Vercel/Netlify and Render/Railway | Frontend and backend hosting |
| Version control | Git and GitHub | Source control and collaboration |

Use only the options that are actually implemented in the project. A listed technology is not proof that the integration is complete.

## 8. Authentication and Login Alerts
The proposed login process uses a registered company email, password, and WebAuthn passkey verification. Depending on the device, a passkey may be unlocked with face recognition, a fingerprint, or a device PIN. Biometric matching remains within the authenticator; the application should not collect raw facial images or biometric templates for passkey login.

### Failed-login rule
- Attempt 1: Reject login and record the failure.
- Attempt 2: Reject login and update the counter.
- Attempt 3: Temporarily restrict further attempts, create a high-priority alert, notify the appropriate company security head, and update the audit log.

Alert channels can include in-app notifications, Slack, or email if configured. Never include passwords, password hashes, passkey private keys, biometric data, or session tokens in alerts.

## 9. Threat Assessment
The threat scanner can assess:
- Brand-name and domain similarity.
- Typo-squatting and homoglyph signals.
- Suspicious top-level domains and URL structures.
- Official-domain mismatches.
- Login, OTP, KYC, payment, or verification keywords.
- QR-code destinations.
- Logo similarity.
- Domain age, DNS, and reputation signals when available.

Risk scores should be accompanied by evidence. An AI-generated explanation is supportive and should not be the only basis for a high-impact security decision.

## 10. Evidence Passport
Each report can include:
- Unique report ID.
- Submitted indicator and report metadata.
- Risk score and confidence.
- Evidence signals and enrichment.
- AI-generated plain-language summary.
- Analyst verification status.
- Block decision and rationale.
- Blockchain proof reference, if available.
- Audit history.

The Evidence Passport helps reviewers understand why a threat was flagged instead of receiving only a generic “malicious” label.

## 11. TrustLens Sentinel Chatbot
Sentinel is intended to answer questions such as:
- “Give me a security summary for my company.”
- “Why was this URL flagged?”
- “Which accounts have repeated failed login attempts?”
- “Show high-risk threats from the last 24 hours.”
- “Which reports are awaiting review?”

The backend must enforce user roles and company authorization before retrieving data. The chatbot should use predefined safe data functions rather than execute arbitrary SQL from user input. It must request confirmation before sending alerts or performing consequential actions.

## 12. Database Design
Suggested tables:
- `companies` — company profiles and security-head contacts.
- `users` — employees, analysts, admins, company heads, and owners.
- `passkeys` — WebAuthn credential IDs and public-key metadata.
- `brands` and `official_assets` — official brand identity details.
- `fraud_reports` and `evidence` — submitted reports and evidence references.
- `threat_assessments` — scores, signals, and model output.
- `blocklist` — blocked indicators, rationale, expiry, and status.
- `block_anchors` and `zk_proofs` — proof metadata and transaction references.
- `login_attempts` and `security_alerts` — authentication events and alerts.
- `chat_messages` — chatbot history subject to access controls.
- `federated_rounds` — learning-round metadata.
- `audit_logs` — security and administrative events.


## 13. Example API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Verify password |
| POST | `/api/auth/passkey/register/options` | Start passkey registration |
| POST | `/api/auth/passkey/register/verify` | Finish passkey registration |
| POST | `/api/auth/passkey/login/options` | Start passkey login |
| POST | `/api/auth/passkey/login/verify` | Finish passkey login |
| POST | `/api/companies` | Create a company |
| POST | `/api/brands` | Register a brand |
| POST | `/api/scan` | Assess an indicator |
| POST | `/api/scan/qr` | Decode and assess a QR code |
| POST | `/api/scan/logo` | Compare a suspicious logo |
| POST | `/api/reports` | Submit a fraud report |
| POST | `/api/reports/{id}/verify` | Verify a report |
| GET | `/api/blocklist` | View authorized blocked indicators |
| POST | `/api/blocklist` | Add an eligible indicator |
| POST | `/api/alerts/login-failure` | Create a failed-login alert |
| GET | `/api/companies/{id}/alerts` | Retrieve authorized alerts |
| POST | `/api/chat` | Ask Sentinel a question |
| POST | `/api/federated/train` | Run a learning round |
| GET | `/api/dashboard/stats` | Retrieve dashboard metrics |

These are proposed endpoint contracts. Implement and test them before describing them as available.

## 14. Development Setup
1. Install supported versions of Python and Node.js.
2. Create and activate a Python virtual environment.
3. Install backend dependencies from `requirements.txt`.
4. Install frontend dependencies using the repository's package manager and lockfile.
5. Configure required environment variables in a local `.env` file.
6. Start the FastAPI backend and Vite frontend separately.
7. Run tests for authentication, tenant isolation, threat scoring, login throttling, and alert delivery.

Exact commands depend on the repository structure and dependency files.

## 15. Privacy and Security
- Enforce company and role authorization on every protected backend operation.
- Store password hashes, never plain-text passwords.
- Rate-limit login attempts and use generic authentication errors.
- Keep API keys, webhook URLs, and private keys in environment variables or a secret manager.
- Never store full sensitive reports or personal data on a public blockchain.
- Never send passwords, biometric data, private keys, or session tokens to the chatbot.
- Require confirmation for consequential chatbot actions.
- Record security events without logging secrets.
- Test protected browsing within the actual implemented scope.
- Use synthetic demo records instead of real employee data.

## 16. Suggested Demo
1. Sign in as a company security head using test credentials.
2. Ask Sentinel for an authorized security summary.
3. Show a demo account with three failed login attempts.
4. Display the resulting alert and audit record.
5. Submit a sample look-alike domain to the scanner.
6. Review the risk signals in its Evidence Passport.
7. Demonstrate analyst review and a protected-browsing warning.
8. Show blockchain proof only if the testnet integration is working.
9. Run a federated-learning simulation only if it is implemented.
10. Finish with dashboard analytics and audit logs.

## 17. Team Collaboration
- Use Git branches for individual contributions.
- Open pull requests and review changes before merging.
- Keep API contracts, database models, and frontend expectations consistent.
- Test the integrated application from a clean setup.
- Document which features are complete, simulated, or planned.

## 18. Future Enhancements
- Production OSINT and reputation integrations.
- More robust threat models and evaluation datasets.
- Production monitoring, backups, and deployment hardening.
- Formal zero-knowledge proofs beyond a hash/Merkle prototype.
- Independent security review of multi-company authorization.
- Additional enterprise alerting integrations.

## 19. Disclaimer
TrustLens AI is a security-support platform concept/prototype. Validate detections against reliable evidence. Do not claim universal device-level blocking, direct biometric verification, formal zero-knowledge proofs, federated-learning privacy guarantees, or blockchain immutability beyond what the implementation demonstrates.

## License
Add the license selected by the project team before public distribution.
