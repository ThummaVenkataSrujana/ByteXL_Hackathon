# Member 1 — Frontend: Dashboard & User Interface

**Domain:** Dashboard, Landing Page, Settings, Layout Components, Global Styling & App Shell

---

## Your Assigned Source Files

> Edit ONLY these files. Do not touch files outside this list without team agreement.

### 🗂️ App Shell & Entry Point

| File | Full Path | Description |
|------|-----------|-------------|
| `App.tsx` | `trustlens-ai/src/App.tsx` | Root app component — view state, routing logic, global layout, chatbot toggle, URL param handling |
| `main.tsx` | `trustlens-ai/src/main.tsx` | React DOM entry point — mounts `<App />` into `index.html` |
| `index.html` | `trustlens-ai/index.html` | HTML shell — meta tags, font imports, root div |

### 🎨 Styling

| File | Full Path | Description |
|------|-----------|-------------|
| `index.css` | `trustlens-ai/src/index.css` | Global CSS — base resets, Tailwind directives, custom utility classes |

### 📄 Pages

| File | Full Path | Description |
|------|-----------|-------------|
| `DashboardPage.tsx` | `trustlens-ai/src/pages/DashboardPage.tsx` | Main security dashboard — KPI stat cards, Recharts trend/bar charts, alert feed, recent report list, navigation shortcuts |
| `LandingPage.tsx` | `trustlens-ai/src/pages/LandingPage.tsx` | Public-facing landing page — hero section, feature highlights, CTA buttons (Enter App / Login) |
| `SettingsPage.tsx` | `trustlens-ai/src/pages/SettingsPage.tsx` | System settings and preferences page |

### 🧩 Layout Components

| File | Full Path | Description |
|------|-----------|-------------|
| `Navbar.tsx` | `trustlens-ai/src/components/layout/Navbar.tsx` | Top navigation bar — brand logo, alerts bell with badge, company/user switcher dropdown (7 demo accounts), profile menu, logout |
| `Sidebar.tsx` | `trustlens-ai/src/components/layout/Sidebar.tsx` | Left sidebar — 11 navigation links with active state highlighting, company overview card, Gateway Proxy widget |

---

## Your Responsibilities

### 1. App Shell (`App.tsx`)
- Manages `currentView` state that drives all page rendering via conditional JSX
- Hosts `selectedPassportReportId` and `protectedUrl` state passed as props to child pages
- Handles `onNavigate`, `handleSelectReport`, `handleOpenProtectedUrl` callbacks
- Reads URL search params (`?url=`) on mount for protected browsing deep-linking
- Wraps the whole app in `<AuthProvider>` and `<DataProvider>` (do not remove these)
- Renders ambient background gradient blobs (decorative, `pointer-events-none`)

### 2. Dashboard (`DashboardPage.tsx`)
- Pulls live company-scoped metrics from `useAuth()` and `useData()`:
  - Pending reports, confirmed threats, open alerts, failed logins, restricted users, blockchain anchors, federated accuracy
- Renders two Recharts charts:
  - `AreaChart` — 7-day threat trend (threats / blocked / reports per day)
  - `BarChart` — threat distribution by category
- Renders a live alert feed (open alerts with acknowledge action)
- Renders a recent reports list with "View Passport" navigation shortcut
- All data is company-scoped via `currentCompany.id` filter

### 3. Landing Page (`LandingPage.tsx`)
- Receives `onEnterApp`, `onGoToLogin`, `onGoToRegister` props from `App.tsx`
- Public marketing/intro screen; no authentication required

### 4. Settings Page (`SettingsPage.tsx`)
- System preferences and configuration options

### 5. Navbar (`Navbar.tsx`)
- Consumes `useAuth()`: `currentUser`, `currentCompany`, `logout`, `switchUserQuick`
- Consumes `useData()`: `alerts`, `acknowledgeAlert`
- Renders alert dropdown with company-scoped open alerts and acknowledge button
- Renders demo account quick-switcher dropdown (7 accounts across 5 companies)
- Renders profile dropdown with current user info and logout

### 6. Sidebar (`Sidebar.tsx`)
- Consumes `useAuth()`: `currentCompany`
- Renders 11 nav items — IDs must match the `currentView` strings used in `App.tsx`
- Highlights active route with purple accent
- Renders company overview card (name, domain, industry badge)
- Renders Gateway Proxy widget linking to `'protected'` view

---

## Key Dependencies (Read-Only — Do Not Edit)

These files are maintained by other members but your code imports from them:

| File | Owner | What You Use From It |
|------|-------|----------------------|
| `src/context/AuthContext.tsx` | **Member 2** | `useAuth()` — `currentUser`, `currentCompany`, `allUsers`, `logout`, `switchUserQuick` |
| `src/context/DataContext.tsx` | **Member 5** | `useData()` — `reports`, `blocklist`, `alerts`, `loginAttempts`, `anchors`, `federatedRounds`, `acknowledgeAlert` |
| `src/types/index.ts` | **Member 5** | `User`, `Company`, `FraudReport`, `SecurityAlert`, etc. |
| `src/data/seedData.ts` | **Member 5** | `SEED_COMPANIES` (imported in Navbar) |

---

## Shared File You Own (Coordinate Changes)

- **`src/App.tsx`** — all other members depend on this for routing. If you add/rename a view key (e.g., `'dashboard'`, `'scanner'`), notify the whole team.
- **`src/index.css`** — global styles affect all components. Coordinate with all members before adding/changing CSS classes that are used across the app.

---

## View Keys Reference (`App.tsx` `currentView` values)

| View Key | Page Rendered |
|----------|--------------|
| `'landing'` | LandingPage |
| `'login'` | LoginPage (Member 2) |
| `'dashboard'` | DashboardPage |
| `'registry'` | BrandRegistryPage (Member 4) |
| `'scanner'` | ThreatScannerPage (Member 3) |
| `'reports'` | FraudReportsPage (Member 4) |
| `'passport'` | EvidencePassportPage (Member 4) |
| `'blocklist'` | BlocklistPage (Member 3) |
| `'protected'` | ProtectedBrowsingPage (Member 3) |
| `'risk'` | LoginRiskPage (Member 2) |
| `'federated'` | FederatedLearningPage (Member 5) |
| `'audit'` | AuditLogsPage (Member 5) |
| `'settings'` | SettingsPage |

---

## Notes

- Do not remove `<AuthProvider>` or `<DataProvider>` wrappers from `App.tsx` — all pages depend on these contexts.
- The ambient glow blobs in `App.tsx` are purely decorative; do not remove `aria-hidden="true"` and `pointer-events-none`.
- Recharts is available as a dependency (`recharts ^3.10.1`) — use `ResponsiveContainer` to ensure responsive charts.
- `motion` (Framer Motion v12) is available for animations.
