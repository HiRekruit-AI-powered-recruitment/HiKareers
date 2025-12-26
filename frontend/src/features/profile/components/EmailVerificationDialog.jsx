import React, { useEffect, useState, useRef } from 'react';
import { userAPI } from '../api';

export default function EmailVerificationDialog({ open, onClose, email, onVerified }) {
  const [sent, setSent] = useState(false);
  const [timer, setTimer] = useState(0); // seconds remaining
  const [otp, setOtp] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [status, setStatus] = useState({ text: '', type: '' }); // type: info|success|error
  const timerRef = useRef(null);

  useEffect(() => {
    // Reset dialog state whenever it's opened or closed
    clearState();
    return () => stopTimer();
  }, [open]);

  function clearState() {
    setSent(false);
    setTimer(0);
    setOtp('');
    setSending(false);
    setVerifying(false);
    setStatus({ text: '', type: '' });
    stopTimer();
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function startTimer(seconds = 300) {
    setTimer(seconds);
    stopTimer();
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          stopTimer();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  async function handleSend() {
    if (!email) {
      setStatus({ text: 'Email not available', type: 'error' });
      return;
    }
    setSending(true);
    setStatus({ text: '', type: '' });
    try {
      const res = await userAPI.sendEmailOtp(email);
      if (!res?.success) {
        throw new Error(res?.message || 'Failed to send OTP');
      }
      setStatus({ text: res.message || `OTP sent to ${email}`, type: 'info' });
      setSent(true);
      startTimer(300);
    } catch (err) {
      setStatus({ text: err?.message || 'Failed to send OTP', type: 'error' });
    } finally {
      setSending(false);
    }
  }

  async function handleVerify() {
    if (!otp) {
      setStatus({ text: 'Please enter OTP', type: 'error' });
      return;
    }
    setVerifying(true);
    setStatus({ text: '', type: '' });
    try {
      const res = await userAPI.verifyEmailOtp({ otp });
      if (!res?.success) {
        throw new Error(res?.message || 'Invalid or expired OTP');
      }
      setStatus({ text: res.message || 'OTP verified successfully', type: 'success' });
      if (onVerified) {
        await onVerified();
      }
      setTimeout(() => onClose(), 700);
    } catch (err) {
      setStatus({ text: err?.message || 'Verification failed', type: 'error' });
    } finally {
      setVerifying(false);
    }
  }

  function formatTimer(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-md p-6 shadow-lg z-10">
        <button className="absolute right-3 top-3 text-neutral-500" onClick={onClose}>✕</button>
        <h3 className="text-xl font-semibold mb-2">Verify Email</h3>
        <p className="text-sm text-neutral-600 mb-4">Confirm ownership of this email to verify your account.</p>

        <div className="mb-4">
          <label className="label text-sm">Email</label>
          <input type="email" value={email || ''} disabled className="input bg-neutral-100 cursor-not-allowed" />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleSend}
            className="btn btn-primary"
            disabled={sending || (sent && timer > 0)}
          >
            {sending
              ? 'Sending...'
              : sent && timer > 0
              ? `Sent (${formatTimer(timer)})`
              : sent && timer === 0
              ? 'Resend'
              : 'Send OTP'
            }
          </button>
        </div>

        {status.text && (
          <div className={`mb-4 text-sm ${status.type === 'error' ? 'text-red-600' : status.type === 'success' ? 'text-emerald-600' : 'text-neutral-600'}`}>
            {status.text}
          </div>
        )}

        <div className="mb-4">
          <label className="label text-sm">Enter OTP</label>
          <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" className="input" />
        </div>

        <div className="flex justify-end gap-2">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleVerify} disabled={verifying}>{verifying ? 'Verifying...' : 'Verify'}</button>
        </div>
      </div>
    </div>
  );
}
