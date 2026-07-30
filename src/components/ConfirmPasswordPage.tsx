import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, KeyRound, CheckCircle2, ArrowRight, Building2, UserCheck } from 'lucide-react';
import CareLinkLogo from './CareLinkLogo';
import { api } from '../api';

interface ConfirmPasswordPageProps {
  tokenFromUrl?: string;
  onGoToLogin: () => void;
}

export default function ConfirmPasswordPage({ tokenFromUrl, onGoToLogin }: ConfirmPasswordPageProps) {
  const [token, setToken] = useState(tokenFromUrl || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [confirmedAccount, setConfirmedAccount] = useState<any>(null);

  useEffect(() => {
    if (!token && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      if (urlToken) {
        setToken(urlToken);
      }
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!token) {
      setError('Missing confirmation token. Please check your confirmation link.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (newPin && newPin.length !== 4) {
      setError('Security PIN must be exactly 4 digits.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.confirmSetPassword({
        token,
        password: newPassword,
        pin: newPin || '1234'
      });

      if (res.success) {
        setSuccess(true);
        setConfirmedAccount(res.user || res.department || res.account);
      } else {
        setError(res.message || 'Failed to confirm account settings.');
      }
    } catch (err: any) {
      setError(err.message || 'Confirmation link is invalid or has expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-blue-600 animate-pulse" />
            Federal Health Network • Account Activation
          </div>
          <div className="flex justify-center pt-2">
            <CareLinkLogo size="lg" showSubtitle />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  Set Your Password & PIN
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Your administrator created your account credential. Please set your permanent security password & 4-digit PIN to activate your profile.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-2xl font-semibold">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirmation Token
                </label>
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Paste account activation token here..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                  placeholder="At least 6 characters..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                  placeholder="Re-enter password..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  4-Digit Security PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono font-bold tracking-widest text-center focus:ring-2 focus:ring-blue-500"
                  placeholder="1234"
                />
                <p className="text-[10px] text-slate-400 mt-1">Used for high-security actions and quick profile verification.</p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-xl transition-all shadow-md shadow-blue-200 cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                <KeyRound className="w-4 h-4" />
                <span>{submitting ? 'Activating Account...' : 'Activate Account & Set Password'}</span>
              </button>
            </form>
          ) : (
            <div className="text-center space-y-5 py-2">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">Account Activated Successfully!</h3>
                <p className="text-xs text-slate-500">
                  Your credentials have been securely activated on the CareLink Unified Health Platform.
                </p>
              </div>

              {confirmedAccount && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    {confirmedAccount.role === 'department' ? (
                      <Building2 className="w-4 h-4 text-blue-600" />
                    ) : (
                      <UserCheck className="w-4 h-4 text-blue-600" />
                    )}
                    <span className="font-extrabold text-slate-900 uppercase">
                      {confirmedAccount.role} Account Profile
                    </span>
                  </div>
                  <p className="text-slate-700">Account Holder: <strong className="text-slate-900">{confirmedAccount.name}</strong></p>
                  <p className="text-slate-700">Email: <strong className="text-slate-900">{confirmedAccount.email}</strong></p>
                  <p className="text-slate-700">Account ID: <span className="font-mono text-blue-600 font-bold">{confirmedAccount.id}</span></p>
                </div>
              )}

              <button
                onClick={onGoToLogin}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                <span>Proceed to Login Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-slate-400 text-xs">
        © 2026 Federal Ministry of Health • CareLink National Digital Network
      </div>
    </div>
  );
}
