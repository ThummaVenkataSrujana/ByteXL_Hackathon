# TrustLens AI — Team Work Division

## ⚠️ IMPORTANT: How This Team Works

All 5 members work **inside the same single application** — the `trustlens-ai` folder. There is **one shared codebase**, not five separate projects.

---

## Ground Rules for All Members

1. **Edit only your assigned files.** Each member's `TASKS.md` lists the exact source files they are responsible for. Do not modify files outside your assignment without team agreement.

2. **Do NOT move, rename, delete, or duplicate** any existing source file. The application must remain runnable at all times.

3. **Do NOT change code outside your scope.** If you need a function or data from another member's file, coordinate first.

4. **Shared files require team coordination.** The following files are consumed by multiple members — any change must be announced to the whole team before merging:

   | Shared File | Owner | Consumed By |
   |-------------|-------|-------------|
   | `src/App.tsx` | Member 1 | All members |
   | `src/context/AuthContext.tsx` | Member 2 | Members 1, 3, 4, 5 |
   | `src/context/DataContext.tsx` | Member 5 | Members 1, 3, 4 |
   | `src/types/index.ts` | Member 5 | All members |
   | `src/data/seedData.ts` | Member 5 | Members 2, 5 |
   | `src/services/intelligenceService.ts` | Member 4 | Members 3, 4 |
   | `src/index.css` | Member 1 | All members |
   | `server.ts` | Member 5 | Member 3 (chatbot API) |

5. **Communicate interface changes.** If you change a function signature, prop type, or exported constant in a shared file, notify all affected members immediately.

6. **Recommended start order:**
   - **First:** Member 5 finalizes `types/index.ts` and `seedData.ts`
   - **Second:** Member 2 finalizes `AuthContext.tsx`
   - **Then:** Members 1, 3, and 4 can work in parallel

---

## Team Folder Structure

```
team-work/
├── README.md                         ← You are here
├── member-1-frontend/
│   └── TASKS.md                      ← Dashboard, Landing, Settings, Layout, UI
├── member-2-authentication/
│   └── TASKS.md                      ← Login, LoginRisk, AuthContext
├── member-3-ai-security/
│   └── TASKS.md                      ← Threat Scanner, Protected Browsing, Blocklist, Chatbot, AI Services
├── member-4-evidence-brand/
│   └── TASKS.md                      ← Evidence Passport, Brand Registry, Fraud Reports, Crypto, PDF
└── member-5-data-integration/
    └── TASKS.md                      ← DataContext, SeedData, AuditLogs, FederatedLearning, Types, Config
```

---

## Application Entry Point

To run the application locally:

```bash
cd trustlens-ai
npm run dev
```

The app runs on `http://localhost:3000`. All members share this single running instance.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| UI Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Icons | Lucide React |
| Animations | Motion (Framer) |
| AI Backend | Express + Google Gemini API (`@google/genai`) |
| PDF Export | jsPDF |
| Crypto | WebCrypto API (SHA-256, Merkle Trees) |

---

*This `team-work/` folder is for coordination only. All actual application source code lives in `trustlens-ai/src/`.*
