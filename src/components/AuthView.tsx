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
  CreditCard,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Lock,
  Inbox,
  LogIn,
  UserPlus,
  SendHorizontal,
  Eye,
  EyeOff
} from 'lucide-react';

const AUTHORIZED_ADMIN_EMAILS = ['mygovtaihub@gmail.com'];
const isAuthorizedAdmin = (e: string) => AUTHORIZED_ADMIN_EMAILS.includes((e || '').trim().toLowerCase());

export const AuthView: React.FC = () => {
  const { signIn, issueAdminCard, requestOtp, verifyOtpAndLogin } = useAuth();

  // Mode: 'signin' (Admin via Card / Existing Citizen) vs 'signup' (1st time Citizen email OTP verification)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [step, setStep] = useState<'input' | 'verify'>('input');

  // Form Fields - All start completely empty
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [showCardNumber, setShowCardNumber] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');

  // Status & Loaders
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isIssuingCard, setIsIssuingCard] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleModeChange = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setStep('input');
    setErrorMessage('');
    setSuccessMessage('');
    setDevCodeHint(null);
    setOtpCode('');
    setCardNumber('');
    setEmail('');
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setStep('input');
    setErrorMessage('');
    setSuccessMessage('');
    setDevCodeHint(null);
    setOtpCode('');
    setCardNumber('');
    setEmail('');
    setName('');
  };

  // 1. ADMIN LOGIN WITH PERMANENT CARD NUMBER (NO OTP REQUIRED)
  const handleAdminCardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanCard = cardNumber.trim();

    if (!cleanEmail) {
      setErrorMessage('Please enter your authorized municipal email.');
      return;
    }

    if (!isAuthorizedAdmin(cleanEmail)) {
      setErrorMessage('Access Denied: Only authorized municipal officials are permitted to access the Official Command Center.');
      return;
    }

    if (!cleanCard) {
      setErrorMessage('Please enter your Municipal Security Card Number.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn(cleanEmail, 'admin', cleanCard);

      if (res.success) {
        setSuccessMessage('Card verified successfully! Accessing Municipal Command Center...');
      } else {
        setErrorMessage(res.error || 'Invalid Municipal Security Card Number. Please verify your card or request issuance below.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. ADMIN 1ST-TIME CARD ISSUANCE TRIGGER
  const handleIssueAdminCard = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMessage('Please enter your authorized municipal email above before requesting card issuance.');
      return;
    }

    if (!isAuthorizedAdmin(cleanEmail)) {
      setErrorMessage('Unauthorized: Only designated municipal administrators can receive an official security card.');
      return;
    }

    setIsIssuingCard(true);

    try {
      const res = await issueAdminCard(cleanEmail);

      if (res.success) {
        setSuccessMessage(res.message || `Permanent Security Card dispatched to your email. Please check your inbox and enter your card number above.`);
      } else {
        setErrorMessage(res.error || 'Failed to dispatch Security Card email.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Connection error while issuing card.');
    } finally {
      setIsIssuingCard(false);
    }
  };

  // 3. CITIZEN SIGN IN
  const handleCitizenSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn(cleanEmail, 'citizen');

      if (res.success) {
        setSuccessMessage('Authentication successful! Loading dashboard...');
      } else {
        if (res.notRegistered) {
          setErrorMessage(res.error || "Account not registered yet. Please select the 'Sign Up (1st Time Only)' tab to complete email verification.");
        } else {
          setErrorMessage(res.error || 'Failed to sign in. Please check your credentials.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unexpected connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. CITIZEN SIGN UP STEP 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setDevCodeHint(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await requestOtp(cleanEmail, 'citizen', name.trim());

      if (res.success) {
        setStep('verify');
        setSuccessMessage(res.message || `Verification code sent to ${cleanEmail}`);
        if (res.devCode) {
          setDevCodeHint(res.devCode);
          setOtpCode(res.devCode);
        }
        setResendCooldown(30);
      } else {
        setErrorMessage(res.error || 'Failed to dispatch verification email.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unexpected connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. CITIZEN SIGN UP STEP 2: Verify OTP
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
      const res = await verifyOtpAndLogin(
        email.trim().toLowerCase(),
        otpCode.trim(),
        undefined,
        name.trim()
      );

      if (res.success) {
        setSuccessMessage('Registration verified! Logging you in...');
      } else {
        setErrorMessage(res.error || 'Invalid verification code. Please check your email.');
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

      <div className="w-full max-w-md space-y-4 my-auto">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="flex justify-center mb-1.5">
            <img
              src="/logo.png"
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

        {/* PRIMARY TOGGLE: SIGN IN vs SIGN UP */}
        <div className="grid grid-cols-2 rounded-2xl bg-slate-200 dark:bg-slate-800/90 p-1 shadow-inner text-xs font-bold">
          <button
            type="button"
            onClick={() => handleModeChange('signin')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              authMode === 'signin'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4 text-emerald-500" />
            <span>Sign In</span>
            <span className="text-[10px] font-normal opacity-75">(Card / Email)</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('signup')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              authMode === 'signup'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-500" />
            <span>Sign Up</span>
            <span className="text-[10px] font-normal opacity-75">(1st Time Citizen)</span>
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 shadow-md transition-colors">
          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-xl space-y-4 transition-colors">
          {/* Header text for selected mode & role */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                {selectedRole === 'admin'
                  ? 'Official Admin Command Sign In'
                  : authMode === 'signin'
                  ? 'Civilian Citizen Sign In'
                  : 'New Citizen Registration'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {selectedRole === 'admin'
                  ? 'Authenticate with your Permanent Municipal Security Card'
                  : authMode === 'signin'
                  ? 'Enter your registered email to access portal'
                  : step === 'input'
                  ? 'Enter details to receive email verification code'
                  : 'Enter the 6-digit code dispatched to your email'}
              </p>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                selectedRole === 'admin'
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30'
                  : 'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-500/30'
              }`}
            >
              {selectedRole === 'admin' ? 'OFFICIAL GOV' : 'PUBLIC CITIZEN'}
            </span>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-500/40 text-red-700 dark:text-red-300 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                {errorMessage}
                {authMode === 'signin' && errorMessage.includes('not registered') && (
                  <button
                    type="button"
                    onClick={() => handleModeChange('signup')}
                    className="block mt-1 font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    👉 Click here to Sign Up with Email Verification
                  </button>
                )}
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW A: ADMIN OFFICIAL - PERMANENT CARD LOGIN                */}
          {/* ============================================================ */}
          {selectedRole === 'admin' ? (
            <form onSubmit={handleAdminCardLogin} className="space-y-4">
              {/* Email Field - Starts completely blank, generic placeholder */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Authorized Municipal Email <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus-within:border-emerald-500 transition-colors">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter authorized municipal email"
                    className="bg-transparent w-full outline-none text-slate-900 dark:text-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Permanent Card Number Field - Masked & Hidden with Toggle */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Enter Your Card Number <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus-within:border-emerald-500 transition-colors">
                  <CreditCard className="w-5 h-5 text-emerald-500 shrink-0" />
                  <input
                    type={showCardNumber ? 'text' : 'password'}
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.toUpperCase())}
                    placeholder="••••••••••••••••"
                    className="bg-transparent w-full outline-none text-slate-900 dark:text-slate-100 font-mono tracking-widest uppercase font-bold text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCardNumber(!showCardNumber)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 shrink-0"
                    title={showCardNumber ? 'Hide card number' : 'Show card number'}
                  >
                    {showCardNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Enter the card number dispatched to your official email.
                </span>
              </div>

              {/* 1st-Time Admin Helper Box */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>First time logging in or don't have your card?</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Enter your email above, then click below to generate and dispatch your <strong>Permanent Municipal Security Card</strong> to your inbox.
                </p>
                <button
                  type="button"
                  onClick={handleIssueAdminCard}
                  disabled={isIssuingCard || isLoading || !email.trim()}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-slate-800 text-emerald-700 dark:text-emerald-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isIssuingCard ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Dispatching Permanent Card to Email...</span>
                    </>
                  ) : (
                    <>
                      <SendHorizontal className="w-3.5 h-3.5" />
                      <span>Issue / Email My Permanent Security Card</span>
                    </>
                  )}
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading || isIssuingCard || !email.trim() || !cardNumber.trim()}
                className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Card...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In with Security Card</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ============================================================ */
            /* VIEW B: CIVILIAN CITIZEN FLOW                                */
            /* ============================================================ */
            <>
              {authMode === 'signin' ? (
                /* CITIZEN SIGN IN */
                <form onSubmit={handleCitizenSignIn} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Registered Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus-within:border-emerald-500 transition-colors">
                      <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.registered.email@example.com"
                        className="bg-transparent w-full outline-none text-slate-900 dark:text-slate-200"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 block">
                      First time user? Switch to{' '}
                      <button
                        type="button"
                        onClick={() => handleModeChange('signup')}
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                      >
                        Sign Up (1st Time Only)
                      </button>
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Sign In to Citizen Portal</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* CITIZEN SIGN UP (1st Time Only) */
                <>
                  {step === 'input' ? (
                    <form onSubmit={handleRequestOtp} className="space-y-4">
                      {/* Name Field */}
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Your Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus-within:border-emerald-500 transition-colors">
                          <UserIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name (e.g. Arjun Verma)"
                            className="bg-transparent w-full outline-none text-slate-900 dark:text-slate-200"
                          />
                        </div>
                      </div>

                      {/* Email Field */}
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus-within:border-emerald-500 transition-colors">
                          <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            className="bg-transparent w-full outline-none text-slate-900 dark:text-slate-200"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading || !email.trim() || !name.trim()}
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
                    /* STEP 2: VERIFY CITIZEN OTP */
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                        <div className="text-slate-600 dark:text-slate-300 text-[11px] flex items-center gap-1.5">
                          <Inbox className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Verification email sent to:</span>
                        </div>
                        <div className="font-mono font-bold text-slate-900 dark:text-white flex items-center justify-between">
                          <span className="truncate">{email}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setStep('input');
                              setErrorMessage('');
                              setSuccessMessage('');
                            }}
                            className="text-emerald-600 dark:text-emerald-400 hover:underline text-[11px] font-sans flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                          >
                            <ArrowLeft className="w-3 h-3" /> Change
                          </button>
                        </div>
                      </div>

                      {/* Dev / Local Testing Code */}
                      {devCodeHint && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs space-y-1">
                          <div className="font-bold flex items-center gap-1.5">
                            <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                            <span>Auto-Generated Code (Test Mode):</span>
                          </div>
                          <div className="text-sm font-mono text-amber-900 dark:text-amber-100">
                            OTP: <span className="font-bold">{devCodeHint}</span>
                          </div>
                        </div>
                      )}

                      {/* 6-Digit OTP Code Input */}
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Enter 6-Digit Verification Code <span className="text-red-500">*</span>
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
                            <span>Verifying & Registering...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Verify Code & Complete Registration</span>
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
                            {resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : 'Resend Email'}
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
                          Back to start
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Security / Compliance Tag */}
        <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 font-mono flex items-center justify-center gap-2">
          <span>🔒 Verified Access</span>
          <span>•</span>
          <span>Government of Tamil Nadu</span>
        </div>
      </div>
    </div>
  );
};
