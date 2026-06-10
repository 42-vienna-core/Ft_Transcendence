"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../auth.module.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

type Step = 'email' | 'code' | 'success';

function ResetPass() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setPending(true);
    try {
      const res = await fetch(`${BACKEND_URL}/auth/request-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.message ?? 'Failed to send code');
      } else {
        setStep('code');
      }
    } finally {
      setPending(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setPending(true);
    try {
      const res = await fetch(`${BACKEND_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword: password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.message ?? 'Reset failed');
      } else {
        setStep('success');
      }
    } finally {
      setPending(false);
    }
  }

  if (step === 'success') {
    return (
      <div className={styles.page}>
        <div className={`glass ${styles.card}`}>
          <div className={styles.cardTitle}>
            <h2>Password Reset</h2>
          </div>
          <p style={{ textAlign: 'center', padding: '1rem 1.25rem' }}>
            Your password has been reset successfully.
          </p>
          <div className={styles.actions}>
            <button
              className={styles.submitBtn}
              type="button"
              onClick={() => router.push('/login')}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'code') {
    return (
      <div className={styles.page}>
        <div className={`glass ${styles.card}`}>
          <div className={styles.cardTitle}>
            <h2>Reset Password</h2>
          </div>
          <form onSubmit={handleResetPassword}>
            <div className={styles.inputRow}>
              <label htmlFor="code" className={styles.inputLabel}>
                <input
                  required
                  id="code"
                  type="text"
                  name="code"
                  value={code}
                  placeholder="6-digit code"
                  maxLength={6}
                  className={styles.input}
                  onChange={(e) => setCode(e.target.value)}
                />
              </label>
              <div className={styles.iconWrapper}>
                <img src="/png/secret.png" alt="icon" className={styles.icon} />
              </div>
            </div>
            <div className={styles.inputRow}>
              <label htmlFor="password" className={styles.inputLabel}>
                <input
                  required
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  placeholder="New password"
                  className={styles.input}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <div className={styles.iconWrapper}>
                <img
                  src={showPassword ? '/png/eye.png' : '/png/secret.png'}
                  alt="toggle"
                  className={styles.icon}
                  onClick={() => setShowPassword((v) => !v)}
                />
              </div>
            </div>
            <div className={styles.inputRow}>
              <label htmlFor="confirmPassword" className={styles.inputLabel}>
                <input
                  required
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={confirmPassword}
                  placeholder="Confirm password"
                  className={styles.input}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </label>
              <div className={styles.iconWrapper}>
                <img
                  src={showConfirm ? '/png/eye.png' : '/png/secret.png'}
                  alt="toggle"
                  className={styles.icon}
                  onClick={() => setShowConfirm((v) => !v)}
                />
              </div>
            </div>
            <div className={styles.errorBox}>
              <p className={styles.errorMessage}>{error}</p>
            </div>
            <div className={styles.actions}>
              <button className={styles.submitBtn} type="submit" disabled={pending}>
                {pending ? 'Resetting...' : 'Reset password'}
              </button>
            </div>
          </form>
          <div className={styles.footerLinks}>
            <button type="button" className={styles.linkBtn} onClick={() => router.push('/login')}>
              Login
            </button>
            <span className={styles.separator}>/</span>
            <button type="button" className={styles.linkBtn} onClick={() => router.push('/register')}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={`glass ${styles.card}`}>
        <div className={styles.cardTitle}>
          <h2>Reset Password</h2>
        </div>
        <form onSubmit={handleRequestCode}>
          <div className={styles.inputRow}>
            <label htmlFor="email" className={styles.inputLabel}>
              <input
                required
                id="email"
                type="email"
                name="email"
                value={email}
                placeholder="email"
                className={styles.input}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <div className={styles.iconWrapper}>
              <img src="/png/email.png" alt="icon" className={styles.icon} />
            </div>
          </div>
          <div className={styles.errorBox}>
            <p className={styles.errorMessage}>{error}</p>
          </div>
          <div className={styles.actions}>
            <button className={styles.submitBtn} type="submit" disabled={pending}>
              {pending ? 'Sending...' : 'Send code'}
            </button>
          </div>
        </form>
        <div className={styles.footerLinks}>
          <button type="button" className={styles.linkBtn} onClick={() => router.push('/login')}>
            Login
          </button>
          <span className={styles.separator}>/</span>
          <button type="button" className={styles.linkBtn} onClick={() => router.push('/register')}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetPass;
