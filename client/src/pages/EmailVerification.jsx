import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { supabase } from '../services/supabase';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';
import '../styles/auth.css';

export default function EmailVerification() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setEmail(user.email);
  }, [user, navigate]);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length < 6) {
      setError('Please enter a valid OTP');
      return;
    }

    setLoading(true);

    try {
      // Verify OTP with backend
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/verify-otp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: otp }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid OTP');
      }

      // OTP verified successfully
      setVerified(true);
      
      // Wait 1 second then redirect to onboarding preferences
      setTimeout(() => {
        navigate('/onboarding');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setResendLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/resend-otp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to resend OTP');
      }

      alert('OTP resent to your email');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="auth-container">
        <div className="auth-background">
          <div className="gradient-blob blob-1"></div>
          <div className="gradient-blob blob-2"></div>
          <div className="gradient-blob blob-3"></div>
        </div>

        <div className="auth-content" style={{ gridTemplateColumns: '1fr' }}>
          <div className="auth-card" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
            <div className="auth-header fade-in">
              <div className="auth-logo" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                <CheckCircle size={40} color="#22c55e" />
              </div>
              <h1>Email Verified!</h1>
              <p className="text-muted">Your email has been successfully verified</p>
            </div>

            <div className="slide-up" style={{ marginTop: '2rem' }}>
              <p className="text-muted">Redirecting to preferences setup...</p>
              <div className="loading-spinner" style={{ margin: '1rem auto' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
      </div>

      <div className="auth-content" style={{ gridTemplateColumns: '1fr' }}>
        <div className="auth-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          {/* Header */}
          <div className="auth-header fade-in">
            <div className="auth-logo">
              <Mail size={40} color="var(--brand)" />
            </div>
            <h1>Verify Your Email</h1>
            <p className="text-muted">
              We've sent a 6-digit OTP to<br />
              <strong>{email}</strong>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleVerifyOTP} className="auth-form slide-up">
            {error && (
              <div className="error-message shake-animation">
                <span>⚠️ {error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Enter OTP Code</label>
              <input
                type="text"
                className="form-input otp-input"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength="6"
                required
                style={{
                  fontSize: '2rem',
                  letterSpacing: '0.5rem',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                }}
              />
              <small className="text-muted" style={{ marginTop: '0.5rem', display: 'block' }}>
                Check your email for the 6-digit code
              </small>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-signup"
              disabled={loading || otp.length < 6}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Verifying...
                </>
              ) : (
                <>
                  Verify Email
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="auth-footer fade-in">
            <p className="text-muted text-sm">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="auth-link"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {resendLoading ? 'Sending...' : 'Resend OTP'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
