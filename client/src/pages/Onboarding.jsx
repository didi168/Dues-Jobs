import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { supabase } from '../services/supabase';
import { usePageMeta } from '../hooks/usePageMeta';
import { Briefcase, CheckCircle, Mail, ArrowRight } from 'lucide-react';
import '../styles/onboarding.css';

export default function Onboarding() {
  usePageMeta(
    'Onboarding',
    'Complete your job preferences setup to get personalized job matches.',
    'onboarding, job preferences, setup, job matching'
  );
  
  const navigate = useNavigate();
  const { user, session, loading: authLoading } = useAuth();
  const [step, setStep] = useState(0); // 0 = Email Verification, 1-3 = Preferences
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    keywords: '',
    locations: '',
    remote_only: false,
    sources: ['Remotive', 'RemoteOK'],
    email_enabled: true,
    telegram_enabled: false,
    telegram_chat_id: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    
    if (!user) {
      navigate('/login');
    } else {
      setEmail(user.email);
      // User is authenticated, skip email verification and go to preferences
      setEmailVerified(true);
      setStep(1);
    }
  }, [user, authLoading, navigate]);

  // Email verification handlers
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setOtpError('');

    if (!otp || otp.length < 6) {
      setOtpError('Please enter a valid OTP');
      return;
    }

    setOtpLoading(true);

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
      setEmailVerified(true);
      setStep(1); // Move to preferences step 1
    } catch (err) {
      setOtpError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtpError('');
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
      setOtpError(err.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSourceChange = (source) => {
    const newSources = formData.sources.includes(source)
      ? formData.sources.filter(s => s !== source)
      : [...formData.sources, source];
    setFormData({ ...formData, sources: newSources });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Retry logic to ensure session is established
      let currentSession = null;
      let retries = 0;
      const maxRetries = 5;

      while (!currentSession && retries < maxRetries) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          currentSession = session;
          break;
        }
        retries++;
        // Wait 500ms before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (!currentSession) {
        throw new Error('Authentication failed. Please try logging in again.');
      }

      const payload = {
        ...formData,
        keywords: formData.keywords
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        locations: formData.locations
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
      };

      // Save preferences to database using authenticated request
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/me/preferences`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentSession.access_token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to save preferences (${response.status})`);
      }

      // Preferences saved successfully, redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving preferences:', err);
      alert('Error saving preferences: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        {/* Show loading while auth is being checked */}
        {authLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loading-spinner" style={{ margin: '1rem auto' }}></div>
            <p className="text-muted">Loading...</p>
          </div>
        ) : !emailVerified ? (
          <>
            {/* Email Verification Step */}
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
              {otpError && (
                <div className="error-message shake-animation">
                  <span>⚠️ {otpError}</span>
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
                className="btn btn-primary"
                disabled={otpLoading || otp.length < 6}
                style={{ width: '100%' }}
              >
                {otpLoading ? (
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
          </>
        ) : (
          <>
            {/* Preferences Setup */}
            {/* Header */}
            <div className="onboarding-header">
              <div className="onboarding-logo">
                <Briefcase size={40} color="var(--brand)" />
              </div>
              <h1>Welcome to Dues Jobs</h1>
              <p className="text-muted">Let's set up your job preferences</p>
            </div>

            {/* Progress Bar */}
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
            </div>
            <div className="progress-text">Step {step} of 3</div>

            {/* Step 1: Job Criteria */}
            {step === 1 && (
              <div className="onboarding-step">
                <h2>What kind of jobs are you looking for?</h2>
                <p className="text-secondary">Tell us about your ideal role</p>

                <div className="form-group">
                  <label className="form-label">Keywords (Comma separated)</label>
                  <textarea
                    className="form-textarea"
                    value={formData.keywords}
                    onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                    rows={3}
                    placeholder="e.g. React, Node.js, Python, Senior Engineer, Full Stack"
                  />
                  <small className="text-muted">Leave empty to see all jobs</small>
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Locations (Comma separated)</label>
                  <input
                    className="form-input"
                    value={formData.locations}
                    onChange={e => setFormData({ ...formData, locations: e.target.value })}
                    disabled={formData.remote_only}
                    placeholder="e.g. San Francisco, London, New York"
                  />
                  <small className="text-muted">
                    {formData.remote_only ? 'Disabled - Remote only is selected' : 'Leave empty to see all locations'}
                  </small>
                </div>

                <div className="form-group">
                  <label className="toggle-wrapper">
                    <input
                      type="checkbox"
                      className="toggle-input"
                      checked={formData.remote_only}
                      onChange={e => setFormData({ ...formData, remote_only: e.target.checked })}
                    />
                    <div className="toggle-switch"></div>
                    <span className="text-sm">Remote Jobs Only</span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 2: Job Sources */}
            {step === 2 && (
              <div className="onboarding-step">
                <h2>Where should we search?</h2>
                <p className="text-secondary">Select job sources to include in your search</p>

                <div className="sources-grid">
                  {['Remotive', 'RemoteOK', 'Adzuna'].map(source => (
                    <label
                      key={source}
                      className={`source-card ${formData.sources.includes(source) ? 'active' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.sources.includes(source)}
                        onChange={() => handleSourceChange(source)}
                        style={{ display: 'none' }}
                      />
                      <div className="source-content">
                        <CheckCircle
                          size={24}
                          color={formData.sources.includes(source) ? 'var(--brand)' : '#ccc'}
                        />
                        <span className="source-name">{source}</span>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="info-box">
                  <p>
                    <strong>Remotive:</strong> Curated remote jobs from top companies
                  </p>
                  <p>
                    <strong>RemoteOK:</strong> Largest remote job board with 50k+ listings
                  </p>
                  <p>
                    <strong>Adzuna:</strong> Aggregated jobs from multiple sources
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Notifications */}
            {step === 3 && (
              <div className="onboarding-step">
                <h2>How should we notify you?</h2>
                <p className="text-secondary">Choose your preferred notification methods</p>

                <div className="notification-options">
                  <label className="notification-card">
                    <input
                      type="checkbox"
                      checked={formData.email_enabled}
                      onChange={e => setFormData({ ...formData, email_enabled: e.target.checked })}
                      style={{ display: 'none' }}
                    />
                    <div className="notification-content">
                      <div className="notification-icon">📧</div>
                      <div>
                        <h3>Email Notifications</h3>
                        <p>Get a daily summary of matching jobs</p>
                      </div>
                      <div className={`checkbox ${formData.email_enabled ? 'checked' : ''}`}></div>
                    </div>
                  </label>

                  <label className="notification-card">
                    <input
                      type="checkbox"
                      checked={formData.telegram_enabled}
                      onChange={e => setFormData({ ...formData, telegram_enabled: e.target.checked })}
                      style={{ display: 'none' }}
                    />
                    <div className="notification-content">
                      <div className="notification-icon">🤖</div>
                      <div>
                        <h3>Telegram Alerts</h3>
                        <p>Get instant notifications on Telegram</p>
                      </div>
                      <div className={`checkbox ${formData.telegram_enabled ? 'checked' : ''}`}></div>
                    </div>
                  </label>
                </div>

                {formData.telegram_enabled && (
                  <div className="form-group">
                    <label className="form-label">Telegram Chat ID</label>
                    <input
                      className="form-input"
                      value={formData.telegram_chat_id}
                      onChange={e => setFormData({ ...formData, telegram_chat_id: e.target.value })}
                      placeholder="Get your ID from @dues_jobs_bot"
                    />
                    <small className="text-muted">
                      Message <strong>@dues_jobs_bot</strong> with /start to get your Chat ID
                    </small>
                  </div>
                )}

                <div className="info-box">
                  <p>You can change these settings anytime in your account settings.</p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="onboarding-actions">
              <button
                onClick={handleBack}
                className="btn btn-secondary"
                disabled={step === 1}
                style={{ opacity: step === 1 ? 0.5 : 1 }}
              >
                Back
              </button>

              {step < 3 ? (
                <button onClick={handleNext} className="btn btn-primary">
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="btn btn-primary"
                  disabled={loading || formData.sources.length === 0}
                >
                  {loading ? 'Setting up...' : 'Complete Setup'}
                </button>
              )}
            </div>

            {/* Skip Option */}
            {step < 3 && (
              <button
                onClick={() => {
                  localStorage.setItem('onboarding_complete', 'true');
                  navigate('/dashboard');
                }}
                className="btn-ghost"
                style={{ marginTop: '1rem', width: '100%', textAlign: 'center' }}
              >
                Skip for now
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
