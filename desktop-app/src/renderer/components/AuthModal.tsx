import React, { useState } from 'react';
import { Mail, KeyRound, AlertCircle, CheckCircle2, Lock, X } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuthenticated: (email: string) => void;
  apiBaseUrl: string;
}

export function AuthModal({ open, onClose, onAuthenticated, apiBaseUrl }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '']);
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const norm = email.trim().toLowerCase();
    if (!norm || !norm.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/otp-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: norm }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to send login code.');
      }
      setStep('code');
    } catch (err: any) {
      setError(err.message || 'Could not send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const otp = code.join('');
    if (otp.length !== 4) {
      setError('Please enter the complete 4-digit code.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/otp-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: otp }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Invalid code. Please retry.');
      }

      localStorage.setItem('v6_user_email', email.trim().toLowerCase());
      localStorage.setItem('v6_is_paid', 'true');
      onAuthenticated(email.trim().toLowerCase());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to verify code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-1.5 text-center pt-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-zinc-950 font-black text-xl shadow-lg">
            V6
          </div>
          <h3 className="text-xl font-black text-white pt-2">
            {step === 'email' ? 'Sign in to V6 Render' : 'Enter 4-Digit Code'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            {step === 'email'
              ? 'Enter your registered email to sync your 7-day trial or active subscription'
              : `A 4-digit security code was sent to ${email}`}
          </p>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                Account Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                disabled={loading}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-white text-sm font-bold text-zinc-950 hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Sending Code...' : 'Continue with Email'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
            <div className="flex justify-center gap-2.5 py-2">
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    const next = [...code];
                    next[idx] = val;
                    setCode(next);
                    if (val && idx < 3) {
                      document.getElementById(`otp-${idx + 1}`)?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
                      document.getElementById(`otp-${idx - 1}`)?.focus();
                    }
                  }}
                  className="h-14 w-12 rounded-xl border border-zinc-700 bg-zinc-950 text-center text-xl font-bold text-white focus:border-white focus:outline-none"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-white text-sm font-bold text-zinc-950 hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Verifying...' : 'Unlock Universal Studio'}
            </button>

            <p
              onClick={() => setStep('email')}
              className="text-center text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer pt-1"
            >
              ← Back to change email
            </p>
          </form>
        )}

        <div className="mt-6 border-t border-zinc-800/80 pt-4 text-center">
          <p className="text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
            <Lock className="h-3 w-3" />
            <span>Encrypted cloud rendering · 256-Bit SSL</span>
          </p>
        </div>
      </div>
    </div>
  );
}
