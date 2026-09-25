'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  ShieldCheck,
  Building2,
  User as UserIcon,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Fingerprint,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Lock
} from 'lucide-react';

const REQUIRED_ADMIN_EMAIL = 'purushothamank.s799@gmail.com';
const REQUIRED_GOVT_ID = 'TN-SAMPLE-2026';

export const AuthView: React.FC = () => {
  const { requestOtp, verifyOtpAndLogin } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [step, setStep] = useState<'input' | 'verify'>('input');

  // Form Fields
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>(REQUIRED_ADMIN_EMAIL);
  const [officialId, setOfficialId] = useState<string>(REQUIRED_GOVT_ID);
  const [otpCode, setOtpCode] = useState<string>('');

  // Status
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setStep('input');
    setErrorMessage('');
    setSuccessMessage('');
    setDevCodeHint(null);
    setOtpCode('');

    if (role === 'admin') {
      setEmail(REQUIRED_ADMIN_EMAIL);
      setOfficialId(REQUIRED_GOVT_ID);
      setName('K. S. Purushothaman');
    } else {
      setEmail('');
      setOfficialId('');
      setName('');
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setDevCodeHint(null);

    const cleanEmail = email.trim().toLowerCase();

    // Client-side quick validation for Admin
    if (selectedRole === 'admin') {
      if (cleanEmail !== REQUIRED_ADMIN_EMAIL.toLowerCase()) {
        setErrorMessage(`Unauthorized: Only the designated municipal administrator (${REQUIRED_ADMIN_EMAIL}) is permitted to access the Official Admin Command Center.`);
        return;
      }
      if (officialId.trim() !== REQUIRED_GOVT_ID) {
        setErrorMessage(`Invalid Government Official ID. Authorized ID is ${REQUIRED_GOVT_ID}.`);
        return;
      }
    } else {
      if (!cleanEmail || !cleanEmail.includes('@')) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const res = await requestOtp(cleanEmail, selectedRole, officialId.trim(), name.trim());

      if (res.success) {
        setStep('verify');
        setSuccessMessage(res.message || `Verification code dispatched to ${cleanEmail}`);
        if (res.devCode) {
          setDevCodeHint(res.devCode);
          setOtpCode(res.devCode); // Auto-fill in dev/test mode for rapid UX
        }
        setResendCooldown(30);
      } else {
        setErrorMessage(res.error || 'Failed to dispatch verification code.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unexpected connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!otpCode || otpCode.trim().length < 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await verifyOtpAndLogin(email.trim().toLowerCase(), otpCode.trim(), name.trim());

      if (res.success) {
        setSuccessMessage('Email verified successfully! Logging you in...');
      } else {
        setErrorMessage(res.error || 'Invalid or expired verification code.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors relative selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Floating Theme Toggle */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-5 my-auto">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <img
              src="/logo.jpeg"
              alt="MyGovt AI Hub Logo"
              className="h-14 sm:h-16 w-auto object-contain rounded-2xl shadow-md"
            />
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            MyGovt AI Hub
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
            Autonomous Urban Infrastructure Triage & Verified Civic Action Portal
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 shadow-md transition-colors">
          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedRole === 'admin'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Admin Official</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('citizen')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedRole === 'citizen'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Civilian Citizen</span>
          </button>
        </div>

        {/* Auth Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-xl space-y-5 transition-colors">
          {/* Header text for selected role */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                {selectedRole === 'admin' ? 'Municipal Official Sign-In' : 'Civilian Citizen Sign-In'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {step === 'input'
                  ? 'Real-time two-factor email verification'
                  : 'Enter the 6-digit OTP code sent to your inbox'}
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                selectedRole === 'admin'
                  ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/30'
                  : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30'
              }`}
            >
              {selectedRole === 'admin' ? 'OFFICIAL GOV' : 'PUBLIC CITIZEN'}
            </span>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-500/40 text-red-700 dark:text-red-300 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* STEP 1: EMAIL & CREDENTIALS INPUT */}
          {step === 'input' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              {/* If Admin Role, show restricted banner */}
              {selectedRole === 'admin' ? (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Authorized Administration Gateway</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Restricted to designated Municipal Administrator email and official Government ID credentials.
                  </p>
                </div>
              ) : null}

              {/* Name Field (Optional for Citizen) */}
              {selectedRole === 'citizen' && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Your Full Name <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus-within:border-emerald-500 transition-colors">
                    <UserIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Arjun Verma"
                      className="bg-transparent w-full outline-none text-slate-900 dark:text-slate-200"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {selectedRole === 'admin' ? 'Authorized Admin Email' : 'Email Address'}
                </label>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus-within:border-emerald-500 transition-colors">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={selectedRole === 'admin' ? REQUIRED_ADMIN_EMAIL : 'your.email@domain.com'}
                    className="bg-transparent w-full outline-none text-slate-900 dark:text-slate-200"
                  />
                </div>
                {selectedRole === 'admin' && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block font-mono">
                    Must match: {REQUIRED_ADMIN_EMAIL}
                  </span>
                )}
              </div>

              {/* Official Govt ID for Admin */}
              {selectedRole === 'admin' && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Government Official ID
                  </label>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus-within:border-emerald-500 transition-colors">
                    <Fingerprint className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      required
                      value={officialId}
                      onChange={(e) => setOfficialId(e.target.value)}
                      placeholder="e.g. TN-SAMPLE-2026"
                      className="bg-transparent w-full outline-none text-slate-900 dark:text-slate-200 font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block font-mono">
                    Must match: {REQUIRED_GOVT_ID}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching Verification Email...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Send Verification Code to Email</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: OTP VERIFICATION */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="text-slate-600 dark:text-slate-300 text-[11px]">
                  Verification email sent to:
                </div>
                <div className="font-mono font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>{email}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('input');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline text-[11px] font-sans flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" /> Change
                  </button>
                </div>
              </div>

              {/* Dev/Local Testing Banner if SMTP not configured */}
              {devCodeHint && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                    <span>Auto-Generated OTP (Live Test Mode):</span>
                  </div>
                  <div className="text-xl font-mono font-black tracking-widest text-amber-900 dark:text-amber-100 bg-amber-500/20 px-3 py-1 rounded-lg inline-block">
                    {devCodeHint}
                  </div>
                  <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80">
                    Live SMTP: Add GMAIL_USER and GMAIL_APP_PASS in .env.local to dispatch real emails to any inbox.
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Enter 6-Digit Verification Code
                </label>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 focus-within:border-emerald-500 transition-colors">
                  <KeyRound className="w-5 h-5 text-emerald-500 shrink-0" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="bg-transparent w-full outline-none text-slate-900 dark:text-slate-100 font-mono tracking-[0.4em] text-lg font-bold text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otpCode.length < 6}
                className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Enter {selectedRole === 'admin' ? 'Command Center' : 'Citizen Desk'}</span>
                  </>
                )}
              </button>

              {/* Resend button */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={isLoading || resendCooldown > 0}
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-500 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>
                    {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend Code'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('input');
                    setErrorMessage('');
                    setSuccessMessage('');
                    setDevCodeHint(null);
                  }}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                >
                  Back to login
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security / Compliance Tag */}
        <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 font-mono flex items-center justify-center gap-2">
          <span>🔒 End-to-End Encrypted</span>
          <span>•</span>
          <span>Government of Tamil Nadu Standards</span>
        </div>
      </div>
    </div>
  );
};
