'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';
import {
  ShieldCheck,
  Building2,
  User as UserIcon,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Activity,
  Fingerprint
} from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, sendVerificationCode, verifyEmailAndSetPassword, quickLogin } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');

  // Form Fields
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [officialId, setOfficialId] = useState<string>('');

  // Email Verification Step
  const [verificationSent, setVerificationSent] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [enteredCode, setEnteredCode] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Status
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage('');
    setSuccessMessage('');
    setVerificationSent(false);
    if (authMode === 'signin') {
      if (role === 'admin') {
        setEmail('admin@infrapulse.gov');
      } else {
        setEmail('citizen@gmail.com');
      }
    } else {
      setEmail('');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await login(email, password, selectedRole);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to sign in');
      }
    } catch (_) {
      setErrorMessage('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const res = await sendVerificationCode(email, name, selectedRole, officialId);
      if (res.success) {
        setVerificationCode(res.code);
        setVerificationSent(true);
        setSuccessMessage(`Verification email sent to ${email}`);
      } else {
        setErrorMessage(res.error || 'Failed to send verification code');
      }
    } catch (_) {
      setErrorMessage('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyAndSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verifyEmailAndSetPassword(email, enteredCode, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Verification failed');
      }
    } catch (_) {
      setErrorMessage('Verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-xl shadow-emerald-500/20 text-slate-950 font-black mb-2">
            <Activity className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            InfraPulse<span className="text-emerald-400 font-mono">.AI</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Autonomous Urban Infrastructure Triage & Sustainable Smart City Portal
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex rounded-2xl bg-slate-900 border border-slate-800 p-1.5 shadow-lg">
          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedRole === 'admin'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
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
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Civilian Citizen</span>
          </button>
        </div>

        {/* Auth Card */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-5">
          {/* Header text for selected role */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white">
                {selectedRole === 'admin' ? 'Municipal Official Access' : 'Citizen Grievance Access'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {authMode === 'signin' ? 'Sign in to access your portal' : 'Register & verify your email'}
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                selectedRole === 'admin'
                  ? 'bg-red-500/10 text-red-400 border-red-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {selectedRole === 'admin' ? 'OFFICIAL GOV' : 'PUBLIC CITIZEN'}
            </span>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {authMode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus-within:border-emerald-500 transition-colors">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={selectedRole === 'admin' ? 'officer@infrapulse.gov' : 'name@example.com'}
                    className="bg-transparent w-full outline-none text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus-within:border-emerald-500 transition-colors">
                  <Lock className="w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password..."
                    className="bg-transparent w-full outline-none text-slate-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Sign In to {selectedRole === 'admin' ? 'Command Center' : 'Citizen Desk'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* REGISTER WITH EMAIL VERIFICATION FLOW */
            <div>
              {!verificationSent ? (
                <form onSubmit={handleSendCode} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
                      <UserIcon className="w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={selectedRole === 'admin' ? 'Officer Name' : 'Citizen Name'}
                        className="bg-transparent w-full outline-none text-slate-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
                      <Mail className="w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@domain.com"
                        className="bg-transparent w-full outline-none text-slate-200"
                      />
                    </div>
                  </div>

                  {selectedRole === 'admin' && (
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Official Government ID</label>
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
                        <Fingerprint className="w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          required
                          value={officialId}
                          onChange={(e) => setOfficialId(e.target.value)}
                          placeholder="e.g. BBMP-OFF-4091"
                          className="bg-transparent w-full outline-none text-slate-200"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Send Email Confirmation Code</span>
                    <Mail className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* STEP 2: ENTER CODE & SET PASSWORD */
                <form onSubmit={handleVerifyAndSetPassword} className="space-y-4">
                  {/* Highlighted Simulated Email Banner */}
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs space-y-1">
                    <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <Mail className="w-4 h-4" />
                      <span>Verification Code Dispatched!</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      Simulated inbox for demonstration: Your 4-digit security code is:
                    </p>
                    <div className="text-lg font-mono font-black text-white bg-slate-950 px-3 py-1.5 rounded-lg border border-emerald-500/60 inline-block tracking-widest">
                      {verificationCode}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Enter 4-Digit Code</label>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
                      <KeyRound className="w-4 h-4 text-emerald-400" />
                      <input
                        type="text"
                        required
                        maxLength={4}
                        value={enteredCode}
                        onChange={(e) => setEnteredCode(e.target.value)}
                        placeholder="Enter code (e.g. 1234)"
                        className="bg-transparent w-full outline-none text-slate-200 font-mono tracking-widest text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Set Account Password</label>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
                      <Lock className="w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="bg-transparent w-full outline-none text-slate-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Confirm Password</label>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
                      <Lock className="w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="bg-transparent w-full outline-none text-slate-200"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Activate Account & Sign In</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Toggle Sign In / Register Mode */}
          <div className="pt-2 text-center text-xs">
            {authMode === 'signin' ? (
              <p className="text-slate-400">
                New user?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setEmail('');
                    setName('');
                    setPassword('');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-emerald-400 hover:underline font-semibold cursor-pointer"
                >
                  Register & verify email
                </button>
              </p>
            ) : (
              <p className="text-slate-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setErrorMessage('');
                    setSuccessMessage('');
                    setVerificationSent(false);
                  }}
                  className="text-emerald-400 hover:underline font-semibold cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>

        {/* 1-Click Demo Logins for Hackathon Judges */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-2.5">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
            <span>⚡ 1-CLICK DEMO LOGIN (FOR JUDGES):</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => quickLogin('admin')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-left transition-all cursor-pointer flex flex-col gap-0.5"
            >
              <span className="font-bold text-emerald-400 text-[11px]">🏢 Municipal Admin</span>
              <span className="text-[10px] text-slate-400 truncate">Commissioner Mohan</span>
            </button>
            <button
              type="button"
              onClick={() => quickLogin('citizen')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-left transition-all cursor-pointer flex flex-col gap-0.5"
            >
              <span className="font-bold text-cyan-400 text-[11px]">👤 Civilian Citizen</span>
              <span className="text-[10px] text-slate-400 truncate">Arjun Verma (Citizen)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
