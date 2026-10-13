import React, { useState } from 'react';
import {
  Shield, Eye, EyeOff, Lock, Mail, Key, Fingerprint,
  AlertTriangle, ArrowRight, CheckCircle2, ShieldCheck, RefreshCw,
  Building2, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onSuccess: () => void;
  onGoToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onGoToRegister }) => {
  const {
    submitCredentials, loginStep, pendingUser, loginError, loginWarning,
    verifyDevice, cancelDeviceVerification
  } = useAuth();

  const [email, setEmail] = useState('head1@novapay.com');
  const [password, setPassword] = useState('Head@123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricVerifying, setIsBiometricVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const res = await submitCredentials(email, password);
      if (res.success && !res.requiresDeviceVerify) {
        onSuccess();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeviceAuth = async (usePasskey: boolean) => {
    setIsBiometricVerifying(true);
    try {
      const ok = await verifyDevice(usePasskey);
      if (ok) {
        onSuccess();
      }
    } finally {
      setIsBiometricVerifying(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Ambient Aqua-Blue Shade at Corners of the Screen */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-28 -left-28 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -top-28 -right-28 w-80 h-80 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute -bottom-28 -left-28 w-80 h-80 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="absolute -bottom-28 -right-28 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Lockup */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mx-auto mb-3 shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">TrustLens AI</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Multi-Company Brand Protection & Fraud Intelligence
          </p>
        </div>

        {/* STEP 1: CREDENTIALS FORM */}
        {loginStep === 'credentials' && (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Company Sign In</h2>
            <p className="text-xs text-slate-500 mb-6">
              Enter your corporate email address to access your company security dashboard.
            </p>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 mb-5 flex items-start gap-2.5 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-medium">
                  {loginError}
                </div>
              </div>
            )}

            {loginWarning && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 mb-5 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-medium">{loginWarning}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Corporate Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-slate-50 border border-slate-250 focus:border-indigo-500 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-400">Encrypted</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full bg-slate-50 border border-slate-250 focus:border-indigo-500 focus:bg-white rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Device Verification</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Pre-fills */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>One-Click Demo Accounts</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('head1@novapay.com', 'Head@123')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
                >
                  <div className="font-bold text-slate-900">NovaPay Head</div>
                  <div className="text-[10px] text-slate-500 font-mono">head1@novapay.com</div>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('analyst1@novapay.com', 'Analyst@123')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
                >
                  <div className="font-bold text-slate-900">NovaPay Analyst</div>
                  <div className="text-[10px] text-slate-500 font-mono">analyst1@novapay.com</div>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('head2@finsecurebank.com', 'Head@123')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
                >
                  <div className="font-bold text-slate-900">FinSecure Head</div>
                  <div className="text-[10px] text-slate-500 font-mono">head2@finsecurebank.com</div>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('employee1@novapay.com', 'Employee@123')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
                >
                  <div className="font-bold text-slate-900">NovaPay Staff</div>
                  <div className="text-[10px] text-slate-500 font-mono">employee1@novapay.com</div>
                </button>
              </div>

              {/* Test Wrong Password Trigger */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('rahul.sharma@novapay.com');
                    setPassword('WrongPassword');
                  }}
                  className="w-full py-1.5 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[11px] text-rose-800 font-medium text-center transition-colors cursor-pointer"
                >
                  Fill Wrong Password (Test 3-Attempt Lockout Alert)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DEVICE & PASSKEY VERIFICATION */}
        {loginStep === 'device_verification' && pendingUser && (
          <div className="p-8 rounded-2xl bg-white border border-indigo-200 shadow-xl animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mx-auto mb-4">
              <Fingerprint className="w-6 h-6 animate-pulse" />
            </div>

            <h2 className="text-lg font-bold text-slate-900 text-center mb-1">
              Verify Device Identity
            </h2>
            <p className="text-xs text-slate-500 text-center mb-6">
              Authenticated credentials for <strong className="text-slate-900">{pendingUser.email}</strong>.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 mb-6 leading-relaxed">
              <p className="mb-2">
                “Device authentication may use Face ID, fingerprint, or device PIN depending on your device.”
              </p>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Private keys never leave your secure enclave. No raw facial images or biometric templates are transmitted.</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                disabled={isBiometricVerifying}
                onClick={() => handleDeviceAuth(true)}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isBiometricVerifying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Device Enclave...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4" />
                    <span>Authenticate via Device Passkey (Recommended)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isBiometricVerifying}
                onClick={() => handleDeviceAuth(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer text-center"
              >
                Continue with Password-Only (Fallback Warning)
              </button>

              <button
                type="button"
                onClick={cancelDeviceVerification}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-700 py-1 cursor-pointer"
              >
                Back to email login
              </button>
            </div>
          </div>
        )}

        <div className="text-center mt-6 text-xs text-slate-400">
          TrustLens AI Security · Strict Multi-Tenant RBAC Enforcement
        </div>
      </div>
    </div>
  );
};
