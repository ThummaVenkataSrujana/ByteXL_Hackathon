# Member 2 — Login & Authentication

**Domain:** Login Flow, Login Risk Monitor, Authentication State Machine & Session Management

---

## Your Assigned Source Files

> Edit ONLY these files. Do not touch files outside this list without team agreement.

### 📄 Pages

| File | Full Path | Description |
|------|-----------|-------------|
| `LoginPage.tsx` | `trustlens-ai/src/pages/LoginPage.tsx` | Full 2-step login UI — credentials entry, device verification, passkey simulation, error/warning feedback |
| `LoginRiskPage.tsx` | `trustlens-ai/src/pages/LoginRiskPage.tsx` | Login risk monitor — failed attempt table, restricted account viewer, unrestrict action |

### 🔐 Context

| File | Full Path | Description |
|------|-----------|-------------|
| `AuthContext.tsx` | `trustlens-ai/src/context/AuthContext.tsx` | Auth state machine — credential validation, device verification, session persistence, account restriction logic, event bus |

---

## Your Responsibilities

### 1. Login Page (`LoginPage.tsx`)

The login flow is a **2-step process**:

**Step 1 — Credentials**
- Email + Password input fields
- On submit → calls `submitCredentials(email, password)` from `useAuth()`
- Shows `loginError` and `loginWarning` from `AuthContext` as inline feedback
- Warning displayed at attempt count 2: *"One more failed attempt will lock this account"*
- Error displayed at attempt count 3: *"Account restricted — alert dispatched to security head"*

**Step 2 — Device Verification**
- Shown when `loginStep === 'device_verification'`
- Two buttons: **"Use Passkey / WebAuthn"** and **"Continue with Password Only"**
- Both call `verifyDevice(usePasskey: boolean)` from `useAuth()`
- "Cancel" button calls `cancelDeviceVerification()`

**Props received from `App.tsx`:**
- `onSuccess: () => void` — called after successful login to navigate to `'dashboard'`
- `onGoToRegister: () => void` — link to register (currently re-routes to login in the demo)

### 2. Login Risk Page (`LoginRiskPage.tsx`)

- Displays login attempt history from `useData().loginAttempts`, filtered by `currentCompany.id`
- Columns: Timestamp, Attempted Email, Status (success/failed), IP Address, Device, Browser, Location, Attempt Count
- Shows restricted users from `useAuth().allUsers` (status === `'restricted'`)
- "Unrestrict" button calls `useAuth().unrestrictUser(userId)`
- Prop received: `onNavigate: (view: string) => void`

### 3. Auth Context (`AuthContext.tsx`)

This is the most critical authentication file. It manages:

**State managed:**
- `currentUser: User | null` — the logged-in user
- `currentCompany: Company | null` — derived from `currentUser.company_id`
- `loginStep: 'credentials' | 'device_verification' | 'authenticated'`
- `pendingUser: User | null` — user who passed credentials but not yet device-verified
- `loginError: string | null` — displayed on LoginPage
- `loginWarning: string | null` — yellow warning banner on LoginPage
- `allUsers: User[]` — full user list, used for login lookup and restriction tracking

**Functions exposed via context:**
- `submitCredentials(email, pass)` — validates against seed data passwords, increments `failed_attempt_count`, restricts on 3 failures, fires `trustlens:login_failed` event
- `verifyDevice(usePasskey)` — simulates 600ms delay, promotes `pendingUser` to `currentUser`, fires `trustlens:login_success` event
- `cancelDeviceVerification()` — resets back to Step 1
- `logout()` — clears `currentUser`, removes from localStorage
- `switchUserQuick(email)` — instant role switch for demo purposes
- `unrestrictUser(userId)` — sets status back to `'active'`, resets failed count, fires `trustlens:user_unrestricted` event

**Demo Passwords (do not change):**
| Role | Password |
|------|----------|
| `company_head` | `Head@123` |
| `analyst` | `Analyst@123` |
| `employee` / `admin` | `Employee@123` |
| Universal demo | `TrustLens@2026` or `Password@123` |

**Session Persistence:**
- `currentUser` → `localStorage['trustlens_auth_user']`
- `allUsers` → `localStorage['trustlens_users_db']`
- Default logged-in user on first load: `head1@novapay.com` (Marcus Vance, NovaPay Company Head)

**Security Event Bus (Browser CustomEvents fired by AuthContext):**
| Event Name | Payload | Listener |
|------------|---------|----------|
| `trustlens:login_failed` | `{ user, attemptCount, restricted }` | `DataContext.tsx` (Member 5) |
| `trustlens:login_success` | `{ user, method }` | `DataContext.tsx` (Member 5) |
| `trustlens:user_unrestricted` | `{ userId }` | `DataContext.tsx` (Member 5) |

---

## Key Dependencies (Read-Only — Do Not Edit)

| File | Owner | What You Use From It |
|------|-------|----------------------|
| `src/types/index.ts` | **Member 5** | `User`, `Company`, `UserRole`, `UserStatus` |
| `src/data/seedData.ts` | **Member 5** | `SEED_COMPANIES`, `SEED_USERS` — imported directly in `AuthContext.tsx` |

---

## Shared File You Own (Coordinate Changes)

- **`src/context/AuthContext.tsx`** — Every other member calls `useAuth()`. If you add or remove fields from the context value, notify all members:
  - Member 1 uses: `currentUser`, `currentCompany`, `logout`, `switchUserQuick`
  - Member 3 uses: `currentUser`, `currentCompany`
  - Member 4 uses: `currentUser`, `currentCompany`
  - Member 5 uses: `currentUser`, `currentCompany`, `allUsers`, `unrestrictUser`

---

## Notes

- `AuthContext.tsx` uses `window.dispatchEvent` for the event bus — this is intentional. `DataContext.tsx` (Member 5) uses `window.addEventListener` to listen. Do not replace this pattern without coordinating with Member 5.
- The `verifyDevice` function uses a 600ms simulated delay (`setTimeout`) — this simulates real biometric/WebAuthn latency.
- `allUsers` is initialized from `localStorage` first, falling back to `SEED_USERS` — this means login attempt counts persist across page reloads.
- Do NOT add real password hashing — this is a demo/hackathon app using plain-text password matching.
