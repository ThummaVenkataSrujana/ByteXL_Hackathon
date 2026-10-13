# Member 4 — Evidence Verification & Brand Protection

**Domain:** Evidence Passport, Brand Trust Registry, Fraud Reporting Center, Cryptographic Utilities, Evidence PDF Export, Intelligence Engine

---

## Your Assigned Source Files

> Edit ONLY these files. Do not touch files outside this list without team agreement.

### 📄 Pages

| File | Full Path | Description |
|------|-----------|-------------|
| `EvidencePassportPage.tsx` | `trustlens-ai/src/pages/EvidencePassportPage.tsx` | Evidence Passport — blockchain anchoring simulation, ZK proof generation, PDF export, full evidence chain display |
| `FraudReportsPage.tsx` | `trustlens-ai/src/pages/FraudReportsPage.tsx` | Fraud Reporting Center — logo drag-and-drop analysis, contact intelligence, batch scan, report queue, submit modal |
| `BrandRegistryPage.tsx` | `trustlens-ai/src/pages/BrandRegistryPage.tsx` | Brand Trust Registry — registered brands, official assets (domains, handles, app IDs), add asset form, cryptographic signatures |

### ⚙️ Services

| File | Full Path | Description |
|------|-----------|-------------|
| `intelligenceService.ts` | `trustlens-ai/src/services/intelligenceService.ts` | Brand registry database, logo analysis engine, contact fraud correlation, indicator intelligence queries |
| `cryptoService.ts` | `trustlens-ai/src/services/cryptoService.ts` | SHA-256 hashing (WebCrypto API), Merkle tree construction, random hex generation for blockchain mock |

### 🛠️ Utils

| File | Full Path | Description |
|------|-----------|-------------|
| `generateEvidencePdf.ts` | `trustlens-ai/src/utils/generateEvidencePdf.ts` | jsPDF-based A4 Evidence Passport PDF generator — company header, threat summary, blockchain anchor, ZK proof table |

---

## Your Responsibilities

### 1. Evidence Passport (`EvidencePassportPage.tsx`)

The Evidence Passport is the **legal-grade evidence chain** for a confirmed fraud report.

**How it works:**
1. Receives `selectedReportId` prop from `App.tsx` (set when user clicks "View Passport" from Dashboard or ThreatScanner)
2. Loads the matching `FraudReport` from `useData().reports`
3. Finds existing `BlockAnchor` and `ZkProof` for this report from `useData().anchors` and `useData().zkProofs`

**User Actions:**
- **"Anchor Evidence to Blockchain"** → calls `anchorEvidence(reportId, network)` from `useData()`
  - Selects network: `'Polygon Amoy Testnet'` or `'Local Hash Chain'`
  - Returns a `BlockAnchor` object with SHA-256 TX hash, block number, anchor status
- **"Generate ZK Proof"** → calls `generateZkProof(reportId)` from `useData()`
  - Returns a `ZkProof` with Merkle root and claims array
  - Verification status: `'PASSED'` | `'PENDING'` | `'FAILED'`
- **"Export PDF"** → calls `generateEvidencePdf({ report, company, anchor, zkProof, isBlocked })` from `generateEvidencePdf.ts`

**Props from `App.tsx`:**
- `selectedReportId: string`
- `onNavigate: (view: string) => void`

### 2. Fraud Reporting Center (`FraudReportsPage.tsx`)

This is the **largest page** in the project (~1841 lines / 94 KB). It has 4 tabs:

#### Tab 1 — Logo Analysis
- Drag-and-drop logo image upload
- Calls `analyzeLogoAsset(imageData, targetBrand)` from `intelligenceService.ts`
- Returns `LogoAnalysisResult`: similarity score, color palette match, keyword detection, risk verdict
- Defaults to showing a sample NovaPay logo for demonstration

#### Tab 2 — Contact Intelligence
- Email/phone/social handle input(s)
- Calls `batchAnalyzeContacts(contacts)` from `intelligenceService.ts`
- Returns per-contact `IndicatorFraudCorrelation`: phishing probability, threat signals, recommended action

#### Tab 3 — Batch Scan
- Multi-indicator bulk scan
- Calls `queryIndicatorFraudIntelligence()` from `intelligenceService.ts`

#### Tab 4 — All Reports
- Full list of company-scoped `FraudReport[]` from `useData().reports`
- Search by indicator value, filter by status and type
- Per-report actions: Update Status (`updateReportStatus()`), Add to Blocklist (`addToBlocklist()`), View Passport (`onSelectReportForPassport()`)
- "Submit New Report" modal → calls `addFraudReport()` from `useData()`

**Report submission creates a `FraudReport` with:**
- `indicator_type`, `indicator_value`, `description`
- `reporter_id`, `reporter_name` from `currentUser`
- `risk_score`, `confidence`, `threat_category` (auto-analyzed)
- `status: 'pending'`

**Props from `App.tsx`:**
- `onNavigate: (view: string) => void`
- `onSelectReportForPassport: (reportId: string) => void`

### 3. Brand Trust Registry (`BrandRegistryPage.tsx`)

- Lists brands registered for `currentCompany` from `useData().officialAssets`
- Integrates with `BRAND_REGISTRY_DATABASE` from `intelligenceService.ts` for verified brand metadata
- Displays per-brand:
  - Official logo, verified color palette, Pantone codes
  - Cryptographic SVG signature (`crypto_svg_signature`)
  - Registered keywords
- Lists official assets:
  - Types: `domain`, `email_domain`, `social_handle`, `app_id`, `partner_domain`
  - Allowlist status badge
- "Add Official Asset" form → calls `addOfficialAsset()` from `useData()`

### 4. Intelligence Service (`intelligenceService.ts`)

Pure TypeScript service — no React:

**`BRAND_REGISTRY_DATABASE` (static, embedded):**
5 registered brands with full metadata:
| Brand | Domain | Colors |
|-------|--------|--------|
| NovaPay | novapay.com | #4F46E5 / #0F172A |
| FinSecure Bank | finsecurebank.com | #2563EB / #1E3A8A |
| ShopShield | shopshield.com | #059669 / #111827 |
| MediTrust | meditrust.com | #0D9488 / #1E293B |
| EduSafe | edusafe.com | #D97706 / #0F172A |

**Exported functions:**
- `analyzeLogoAsset(imageData, targetBrand)` → `LogoAnalysisResult`
  - Simulates image similarity scoring (0–100%)
  - Compares color palette against `verified_hex_codes`
  - Detects brand keywords in metadata
- `queryIndicatorFraudIntelligence(indicator, type)` → `IndicatorFraudCorrelation`
  - Per-indicator threat scoring with historical correlation
- `batchAnalyzeContacts(contacts[])` → `IndicatorFraudCorrelation[]`
  - Bulk analysis of email/phone/social indicators

**Note:** Member 3's `scannerService.ts` also imports `BRAND_REGISTRY_DATABASE` from this file. Coordinate with Member 3 before changing the database structure.

### 5. Crypto Service (`cryptoService.ts`)

Pure TypeScript cryptographic utilities:

**Exported functions:**
- `sha256(message: string): Promise<string>`
  - Uses `window.crypto.subtle.digest('SHA-256', ...)` (WebCrypto API)
  - Falls back to deterministic djb2-style hash if WebCrypto unavailable
  - Always returns `'0x' + hexString`
- `buildMerkleTree(claims: string[]): Promise<{ root: string; leafHashes: string[] }>`
  - Hashes each claim string with `sha256()`
  - Builds binary Merkle tree, returns root hash
  - Handles odd-length arrays by duplicating last leaf
- `generateRandomHex(length: number): string`
  - Generates a mock blockchain transaction hash
  - Returns `'0x' + randomHex(length)`

**Used by:** `DataContext.tsx` (Member 5) in `anchorEvidence()` and `generateZkProof()` functions.

### 6. Evidence PDF (`generateEvidencePdf.ts`)

Uses `jsPDF` (A4 portrait format, mm units):

**PDF Sections generated:**
1. **Header Banner** — dark slate background, "TRUSTLENS AI — EVIDENCE PASSPORT" title, report ID, generation timestamp
2. **Company Block** — company name, industry, official domain
3. **Threat Summary** — indicator value/type, risk score (color-coded), confidence, threat category, status badge
4. **OSINT Intelligence** — domain age, registrar, geo, IP, SSL issuer
5. **Evidence Signals** — bullet list of detected threat signals
6. **Blockchain Anchor** — TX hash, network, block number, anchor status, timestamp
7. **ZK Proof** — Merkle root, proof metadata (claims verified), verification status
8. **Footer** — legal disclaimer, generation info

---

## Key Dependencies (Read-Only — Do Not Edit)

| File | Owner | What You Use From It |
|------|-------|----------------------|
| `src/context/AuthContext.tsx` | **Member 2** | `useAuth()` — `currentUser`, `currentCompany` |
| `src/context/DataContext.tsx` | **Member 5** | `useData()` — `reports`, `officialAssets`, `anchors`, `zkProofs`, `addFraudReport`, `updateReportStatus`, `addToBlocklist`, `anchorEvidence`, `generateZkProof`, `addOfficialAsset` |
| `src/types/index.ts` | **Member 5** | `FraudReport`, `BlockAnchor`, `ZkProof`, `OfficialAsset`, `Brand`, `Company`, `EvidenceItem`, `ThreatAssessment`, `IndicatorType`, `ThreatCategory` |

---

## Shared File You Own (Coordinate Changes)

- **`src/services/intelligenceService.ts`** — Also imported by Member 3's `ThreatScannerPage.tsx` and `FraudReportsPage.tsx`. If you change `BRAND_REGISTRY_DATABASE` structure or function signatures, notify Member 3.
- **`src/services/cryptoService.ts`** — Called by `DataContext.tsx` (Member 5). If you change `sha256()`, `buildMerkleTree()`, or `generateRandomHex()` signatures, notify Member 5.
- **`src/utils/generateEvidencePdf.ts`** — Used only by `EvidencePassportPage.tsx`. Self-contained, no cross-member dependency.

---

## Notes

- `jsPDF` is available as a dependency (`jspdf ^4.2.1`) — import as `import jsPDF from 'jspdf'`
- `FraudReportsPage.tsx` is the largest file in the project at ~1841 lines. It contains all four tab implementations, the submit modal, and drag-and-drop logic in one file.
- The logo drag-and-drop uses standard HTML `dragover` / `drop` events with `FileReader.readAsDataURL()` — no external library.
- `EvidencePassportPage.tsx` navigation: when the user clicks "View Passport" anywhere in the app (Dashboard, ThreatScanner, FraudReports), `App.tsx` sets `selectedPassportReportId` and switches to `'passport'` view. Your page reads this via the `selectedReportId` prop.
- Always filter reports by `currentCompany.id` before displaying — the app is multi-tenant.
