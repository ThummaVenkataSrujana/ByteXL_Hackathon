import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Company, UserRole } from '../types';
import { SEED_COMPANIES, SEED_USERS } from '../data/seedData';

interface AuthContextType {
  currentUser: User | null;
  currentCompany: Company | null;
  isAuthenticated: boolean;
  loginStep: 'credentials' | 'device_verification' | 'authenticated';
  pendingUser: User | null;
  loginError: string | null;
  loginWarning: string | null;
  viewRole: 'owner' | 'employee';
  setViewRole: (role: 'owner' | 'employee') => void;
  verifyDevice: (usePasskey: boolean) => Promise<boolean>;
  submitCredentials: (email: string, pass: string) => Promise<{ success: boolean; requiresDeviceVerify?: boolean; error?: string }>;
  logout: () => void;
  switchUserQuick: (email: string) => void;
  cancelDeviceVerification: () => void;
  allUsers: User[];
  unrestrictUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_AUTH = 'trustlens_auth_user';
const STORAGE_KEY_USERS = 'trustlens_users_db';
const STORAGE_KEY_ROLE = 'trustlens_view_role';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS);
      return saved ? JSON.parse(saved) : SEED_USERS;
    } catch {
      return SEED_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      if (saved) {
        const u = JSON.parse(saved);
        return u;
      }
      // Default initial demo logged in user: Marcus Vance (NovaPay Company Head)
      const defaultUser = SEED_USERS.find(u => u.email === 'head1@novapay.com') || SEED_USERS[0];
      return defaultUser;
    } catch {
      return SEED_USERS[0];
    }
  });

  const [loginStep, setLoginStep] = useState<'credentials' | 'device_verification' | 'authenticated'>('authenticated');
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginWarning, setLoginWarning] = useState<string | null>(null);

  const [viewRole, setViewRoleState] = useState<'owner' | 'employee'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROLE);
      return saved === 'employee' ? 'employee' : 'owner';
    } catch {
      return 'owner';
    }
  });

  const setViewRole = (role: 'owner' | 'employee') => {
    setViewRoleState(role);
    try {
      localStorage.setItem(STORAGE_KEY_ROLE, role);
    } catch {}
  };

  // Sync users to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(allUsers));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [allUsers]);

  // Sync active user to storage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_AUTH);
      }
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [currentUser]);

  const currentCompany = currentUser
    ? SEED_COMPANIES.find(c => c.id === currentUser.company_id) || SEED_COMPANIES[0]
    : null;

  const submitCredentials = async (email: string, pass: string): Promise<{ success: boolean; requiresDeviceVerify?: boolean; error?: string }> => {
    setLoginError(null);
    setLoginWarning(null);

    const cleanEmail = email.trim().toLowerCase();
    const userIndex = allUsers.findIndex(u => u.email.toLowerCase() === cleanEmail);

    if (userIndex === -1) {
      // User not found - show generic message
      setLoginError('Invalid credentials.');
      return { success: false, error: 'Invalid credentials.' };
    }

    const targetUser = allUsers[userIndex];

    // Check if account is restricted
    if (targetUser.status === 'restricted') {
      const msg = 'Account temporarily restricted due to excessive failed login attempts. Contact your security head.';
      setLoginError(msg);
      return { success: false, error: msg };
    }

    // Standard demo passwords:
    // Company heads: Head@123
    // Analysts: Analyst@123
    // Employees: Employee@123
    // Also accept universal demo password 'TrustLens@2026' or 'Password@123'
    let isValidPassword = false;
    if (targetUser.role === 'company_head' && (pass === 'Head@123' || pass === 'TrustLens@2026' || pass === 'Password@123')) {
      isValidPassword = true;
    } else if (targetUser.role === 'analyst' && (pass === 'Analyst@123' || pass === 'TrustLens@2026' || pass === 'Password@123')) {
      isValidPassword = true;
    } else if ((targetUser.role === 'employee' || targetUser.role === 'admin') && (pass === 'Employee@123' || pass === 'TrustLens@2026' || pass === 'Password@123' || pass === 'Head@123')) {
      isValidPassword = true;
    }

    if (!isValidPassword) {
      // Increment failed attempt count
      const updatedCount = targetUser.failed_attempt_count + 1;
      const isNowRestricted = updatedCount >= 3;

      const updatedUsers = [...allUsers];
      updatedUsers[userIndex] = {
        ...targetUser,
        failed_attempt_count: updatedCount,
        status: isNowRestricted ? 'restricted' : targetUser.status,
      };
      setAllUsers(updatedUsers);

      // Trigger Alert bus event
      window.dispatchEvent(new CustomEvent('trustlens:login_failed', {
        detail: {
          user: targetUser,
          attemptCount: updatedCount,
          restricted: isNowRestricted,
        }
      }));

      if (isNowRestricted) {
        const errorMsg = 'Account restricted: 3 consecutive failed login attempts detected. A high-priority security alert has been dispatched to your company security head.';
        setLoginError(errorMsg);
        return { success: false, error: errorMsg };
      } else if (updatedCount === 2) {
        const warnMsg = 'Invalid credentials. Warning: One more failed attempt will trigger a security alert and lock this account.';
        setLoginError(warnMsg);
        setLoginWarning('One attempt remaining before account restriction.');
        return { success: false, error: warnMsg };
      } else {
        setLoginError('Invalid credentials.');
        return { success: false, error: 'Invalid credentials.' };
      }
    }

    // Password is valid -> reset failed attempts and proceed to device verification
    const updatedUsers = [...allUsers];
    updatedUsers[userIndex] = {
      ...targetUser,
      failed_attempt_count: 0,
    };
    setAllUsers(updatedUsers);

    setPendingUser(targetUser);
    setLoginStep('device_verification');

    return { success: true, requiresDeviceVerify: true };
  };

  const verifyDevice = async (usePasskey: boolean): Promise<boolean> => {
    if (!pendingUser) return false;

    // Simulate device authentication delay
    await new Promise(resolve => setTimeout(resolve, 600));

    setCurrentUser(pendingUser);
    setPendingUser(null);
    setLoginStep('authenticated');

    // Trigger Login Success event for audit log
    window.dispatchEvent(new CustomEvent('trustlens:login_success', {
      detail: {
        user: pendingUser,
        method: usePasskey ? 'Passkey / WebAuthn' : 'Password only (Standard)',
      }
    }));

    return true;
  };

  const cancelDeviceVerification = () => {
    setPendingUser(null);
    setLoginStep('credentials');
    setLoginError(null);
    setLoginWarning(null);
  };

  const logout = () => {
    setCurrentUser(null);
    setPendingUser(null);
    setLoginStep('credentials');
    localStorage.removeItem(STORAGE_KEY_AUTH);
  };

  const switchUserQuick = (email: string) => {
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      setPendingUser(null);
      setLoginStep('authenticated');
    }
  };

  const unrestrictUser = (userId: string) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, status: 'active', failed_attempt_count: 0 };
      }
      return u;
    }));

    window.dispatchEvent(new CustomEvent('trustlens:user_unrestricted', { detail: { userId } }));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentCompany,
        isAuthenticated: !!currentUser,
        loginStep,
        pendingUser,
        loginError,
        loginWarning,
        viewRole,
        setViewRole,
        submitCredentials,
        verifyDevice,
        cancelDeviceVerification,
        logout,
        switchUserQuick,
        allUsers,
        unrestrictUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
