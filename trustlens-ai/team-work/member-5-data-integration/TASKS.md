# Member 5 — Data Management, Audit Logs & Integration

**Domain:** Central Data Store, Seed Data, Audit Trail, Federated Learning, TypeScript Types, Project Configuration & Backend Integration

---

## Your Assigned Source Files

> Edit ONLY these files. Do not touch files outside this list without team agreement.

### 📄 Pages

| File | Full Path | Description |
|------|-----------|-------------|
| `AuditLogsPage.tsx` | `trustlens-ai/src/pages/AuditLogsPage.tsx` | Audit trail viewer — immutable action log, filter by type/user/date, timestamps, actor, target |
| `FederatedLearningPage.tsx` | `trustlens-ai/src/pages/FederatedLearningPage.tsx` | Federated learning simulation — model rounds, local vs global accuracy, privacy metrics, contributing companies |

### 🗃️ Context

| File | Full Path | Description |
|------|-----------|-------------|
| `DataContext.tsx` | `trustlens-ai/src/context/DataContext.tsx` | Central data store — all CRUD operations, localStorage persistence, security event bus listener, audit log auto-generation |

### 📦 Data

| File | Full Path | Description |
|------|-----------|-------------|
| `seedData.ts` | `trustlens-ai/src/data/seedData.ts` | All mock/seed data — 5 companies, 10+ users, fraud reports, blocklist, alerts, anchors, ZK proofs, login attempts, federated rounds, audit logs |

### 🔷 Types

| File | Full Path | Description |
|------|-----------|-------------|
| `index.ts` | `trustlens-ai/src/types/index.ts` | All TypeScript interfaces and union types used across the entire platform |

### ⚙️ Configuration Files

| File | Full Path | Description |
|------|-----------|-------------|
| `package.json` | `trustlens-ai/package.json` | npm dependencies and scripts (`dev`, `build`, `preview`, `lint`) |
| `package-lock.json` | `trustlens-ai/package-lock.json` | Locked dependency tree — do not edit manually |
| `vite.config.ts` | `trustlens-ai/vite.config.ts` | Vite build config — React plugin, Tailwind CSS v4, server proxy config |
| `tsconfig.json` | `trustlens-ai/tsconfig.json` | TypeScript compiler options |
| `.env.example` | `trustlens-ai/.env.example` | Environment variable template — `GEMINI_API_KEY` and any future secrets |

---

## Your Responsibilities

### 1. Data Context (`DataContext.tsx`)

This is the **backbone data layer** of the entire application — all state lives here.

**State collections managed (9 total):**
| State | localStorage Key | Seed Source |
|-------|-----------------|-------------|
| `reports: FraudReport[]` | `trustlens_reports` | `SEED_FRAUD_REPORTS` |
| `blocklist: BlocklistItem[]` | `trustlens_blocklist` | `SEED_BLOCKLIST` |
| `officialAssets: OfficialAsset[]` | `trustlens_assets` | `SEED_OFFICIAL_ASSETS` |
| `alerts: SecurityAlert[]` | `trustlens_alerts` | `SEED_SECURITY_ALERTS` |
| `anchors: BlockAnchor[]` | `trustlens_anchors` | `SEED_BLOCK_ANCHORS` |
| `zkProofs: ZkProof[]` | `trustlens_proofs` | `SEED_ZK_PROOFS` |
| `loginAttempts: LoginAttempt[]` | `trustlens_logins` | `SEED_LOGIN_ATTEMPTS` |
| `federatedRounds: FederatedRound[]` | `trustlens_federated` | `SEED_FEDERATED_ROUNDS` |
| `auditLogs: AuditLog[]` | `trustlens_audit` | `SEED_AUDIT_LOGS` |
| `chatHistory: ChatMessage[]` | `trustlens_chat` | `[]` (empty on start) |

**All state is persisted to `localStorage` on every change** via `useEffect`.

**CRUD functions exposed via context:**

| Function | Description | Called By |
|----------|-------------|-----------|
| `addFraudReport(report)` | Adds new fraud report, creates audit log | Members 3, 4 |
| `updateReportStatus(reportId, status)` | Updates report status, creates audit log | Member 4 |
| `addToBlocklist(item)` | Adds to blocklist, anchors evidence, creates audit log | Members 3, 4 |
| `removeFromBlocklist(id)` | Unblocks item (status → 'unblocked'), creates audit log | Member 3 |
| `anchorEvidence(reportId, network)` | SHA-256 anchors evidence to blockchain (simulated), creates `BlockAnchor`, creates audit log | Member 4 |
| `generateZkProof(reportId)` | Builds Merkle tree from report claims, creates `ZkProof`, creates audit log | Member 4 |
| `acknowledgeAlert(alertId)` | Sets alert status to 'acknowledged', creates audit log | Members 1, 3 |
| `resolveAlert(alertId)` | Sets alert status to 'resolved', creates audit log | Member 1 |
| `dispatchHeadAlert(title, message, metadata)` | Creates new `SecurityAlert` for company head, creates audit log | Member 3 (chatbot) |
| `runFederatedRound()` | Simulates a new federated learning round, creates `FederatedRound`, creates audit log | Member 5 (FederatedLearningPage) |
| `addOfficialAsset(asset)` | Adds new official asset to registry, creates audit log | Member 4 |
| `saveChatMessage(msg)` | Appends chat message to `chatHistory` | Member 3 (chatbot) |
| `clearChatHistory()` | Clears all chat messages | Member 3 (chatbot) |

**Security Event Bus (listens to `window` CustomEvents from `AuthContext`):**

| Event | Action Taken |
|-------|-------------|
| `trustlens:login_failed` | Creates `LoginAttempt` (status: 'failed'), creates `AuditLog` (action: 'login_failure'), if restricted → creates `SecurityAlert` for company head |
| `trustlens:login_success` | Creates `LoginAttempt` (status: 'success'), creates `AuditLog` (action: 'login_success') |
| `trustlens:user_unrestricted` | Creates `AuditLog` (action: 'account_unrestricted') |

### 2. Seed Data (`seedData.ts`) — ~62 KB

The single source of truth for all demo data. Contains:

**Companies (5):**
- NovaPay (Fintech)
- FinSecure Bank (Banking)
- ShopShield (E-Commerce)
- MediTrust (Healthcare)
- EduSafe (Education)

**Users (10+):**
Each company has: 1 Company Head + 1 Analyst + 1–2 Employees

| Email Pattern | Role | Password |
|--------------|------|----------|
| `head{N}@{company}.com` | company_head | `Head@123` |
| `analyst{N}@{company}.com` | analyst | `Analyst@123` |
| `employee{N}@{company}.com` | employee | `Employee@123` |

**Other seed collections:** `SEED_FRAUD_REPORTS`, `SEED_BLOCKLIST`, `SEED_OFFICIAL_ASSETS`, `SEED_SECURITY_ALERTS`, `SEED_BLOCK_ANCHORS`, `SEED_ZK_PROOFS`, `SEED_LOGIN_ATTEMPTS`, `SEED_FEDERATED_ROUNDS`, `SEED_AUDIT_LOGS`

**Important:** `AuthContext.tsx` (Member 2) imports `SEED_COMPANIES` and `SEED_USERS` directly. Notify Member 2 before changing company IDs or user email patterns.

### 3. Audit Logs Page (`AuditLogsPage.tsx`)

- Reads `auditLogs` from `useData()`
- Filters by `currentCompany.id`
- Displays: timestamp, user email, action type, target type, target ID, IP address, device
- Filter controls: action type dropdown, user search, date range

**`AuditLog.action` values (all 15):**
`login_success` | `login_failure` | `account_restricted` | `account_unrestricted` | `report_created` | `report_verified` | `threat_blocked` | `threat_unblocked` | `alert_created` | `alert_acknowledged` | `alert_resolved` | `chatbot_alert_dispatched` | `blockchain_anchored` | `zk_proof_generated` | `federated_round_completed` | `official_asset_added`

### 4. Federated Learning Page (`FederatedLearningPage.tsx`)

Simulates privacy-preserving federated ML training:

- Reads `federatedRounds` from `useData()`
- Displays rounds table: round number, company, local accuracy, global accuracy, threats analyzed, records shared vs model updates
- "Run New Round" button → calls `runFederatedRound()` from `useData()`
- Key privacy guarantee to emphasize: *only model weight updates are shared — never raw records*
- Shows accuracy trend chart (Recharts)

### 5. Types (`src/types/index.ts`)

Defines all 15+ TypeScript interfaces used across the project:

| Interface | Used By |
|-----------|---------|
| `User`, `UserRole`, `UserStatus` | Members 1, 2 |
| `Company` | Members 1, 2, 4 |
| `Brand`, `OfficialAsset` | Member 4 |
| `FraudReport`, `IndicatorType`, `ReportStatus`, `ThreatCategory` | Members 3, 4 |
| `BlocklistItem` | Members 3, 4 |
| `BlockAnchor`, `ZkProof`, `EvidenceItem`, `ThreatAssessment` | Member 4 |
| `LoginAttempt` | Members 2, 5 |
| `SecurityAlert`, `AlertSeverity`, `AlertStatus` | Members 1, 3, 5 |
| `ChatMessage` | Member 3 |
| `FederatedRound` | Member 5 |
| `AuditLog` | Member 5 |

**Before changing any type:** Notify all members who use it (see table above).

### 6. Project Configuration

**`package.json` — npm scripts:**
```
npm run dev      → tsx server.ts  (Express + Vite dev mode)
npm run build    → vite build     (Production bundle)
npm run preview  → vite preview   (Preview production build)
npm run lint     → tsc --noEmit   (TypeScript type check)
```

**`vite.config.ts`** — Configures:
- `@vitejs/plugin-react`
- `@tailwindcss/vite` (Tailwind CSS v4)
- Server proxy: `/api` → `http://localhost:3000`

**`.env.example`** — Template:
```
GEMINI_API_KEY=your_api_key_here
```
To enable AI: copy to `.env` and add a real Gemini API key.

---

## Key Dependencies (Read-Only — Do Not Edit)

| File | Owner | What You Use From It |
|------|-------|----------------------|
| `src/context/AuthContext.tsx` | **Member 2** | `useAuth()` — `currentUser`, `currentCompany`, `allUsers` |
| `src/services/cryptoService.ts` | **Member 4** | `sha256()`, `buildMerkleTree()`, `generateRandomHex()` — used inside `DataContext.tsx` for anchoring and ZK proofs |

---

## Shared Files You Own (Coordinate Changes)

- **`src/context/DataContext.tsx`** — Most consumed file in the project. Members 1, 3, and 4 all call functions from it. Any new function, renamed function, or state field change must be communicated to the full team.
- **`src/types/index.ts`** — Used by every file. Type changes ripple through the whole codebase. Announce all changes.
- **`src/data/seedData.ts`** — Consumed by `AuthContext.tsx` (Member 2). Changing user emails, company IDs, or password patterns will break Member 2's authentication logic.
- **`package.json`** — Controls all dependencies. Only add packages that are genuinely needed. Communicate additions to the team.
- **`server.ts`** — Owned by Member 3. You maintain `.env.example` and deployment environment setup only.

---

## Notes

- All localStorage keys follow the pattern `trustlens_*` — do not change existing keys (it would break persisted data for all demo users).
- The `DataContext` uses `useAuth()` internally (it is nested inside `<AuthProvider>` in `App.tsx`) to access `currentUser` and `currentCompany` for company-scoping CRUD operations.
- `runFederatedRound()` in `DataContext` simulates model training with random accuracy improvements — it generates a realistic `FederatedRound` record and creates an audit log entry.
- The `anchorEvidence()` function tries `'Polygon Amoy Testnet'` first, falls back to `'Local Hash Chain'` if the network is unavailable (simulated random success/failure).
- Do NOT modify the `AuditLog` entries that are auto-created by `DataContext.tsx` — audit logs must remain tamper-evident in the demo.
