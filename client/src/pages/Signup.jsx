import { useState } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Mail, Lock, ArrowRight, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import { supabase } from '../services/supabase';
import '../styles/auth.css';

export default function Signup() {
  usePageMeta(
    'Create Account',
    'Sign up for DuesJobs and start receiving personalized job recommendations. Join thousands of professionals finding their dream jobs.',
    'signup, create account, job search, remote jobs, career'
  );
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [signupComplete, setSignupComplete] = useState(false);

  const checkPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z\d]/.test(pwd)) strength++;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    checkPasswordStrength(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      // Create account in Supabase Auth WITHOUT email verification
      const { error } = await signUp(email, password);
      if (error) throw error;
      
      // Send OTP via backend (nodemailer + SMTP)
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/send-otp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send OTP');
      }
      
      // Show OTP verification screen
      setSignupComplete(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return '#ccc';
    if (passwordStrength === 1) return '#ef4444';
    if (passwordStrength === 2) return '#f97316';
    if (passwordStrength === 3) return '#eab308';
    return '#22c55e';
  };

  // OTP Verification Screen
  if (signupComplete) {
    return <OTPVerification email={email} />;
  }

  return (
    <div className="auth-container signup-container">
      <div className="auth-background">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
      </div>

      <div className="auth-content">
        {/* Side Info */}
        <div className="auth-info fade-in">
          <div className="info-card">
            <div className="info-icon">🚀</div>
            <h3>Get Started Today</h3>
            <p>Join thousands of professionals finding their dream jobs</p>
          </div>
          <div className="info-card">
            <div className="info-icon">🎨</div>
            <h3>Personalized Experience</h3>
            <p>Customize your job preferences and get tailored recommendations</p>
          </div>
          <div className="info-card">
            <div className="info-icon">💼</div>
            <h3>Career Growth</h3>
            <p>Discover opportunities that match your career goals</p>
          </div>
        </div>

        <div className="auth-card signup-card">
          {/* Header */}
          <div className="auth-header fade-in">
            <div className="auth-logo">
              <Briefcase size={40} color="var(--brand)" />
            </div>
            <h1>Create Account</h1>
            <p className="text-muted">Join DuesJobs and find your next opportunity</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form slide-up">
            {error && (
              <div className="error-message shake-animation">
                <span>⚠️ {error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="input-icon-button"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div
                      className="strength-fill"
                      style={{
                        width: `${(passwordStrength / 4) * 100}%`,
                        backgroundColor: getStrengthColor(),
                      }}
                    ></div>
                  </div>
                  <span className="strength-text" style={{ color: getStrengthColor() }}>
                    {passwordStrength === 0 && 'Very Weak'}
                    {passwordStrength === 1 && 'Weak'}
                    {passwordStrength === 2 && 'Fair'}
                    {passwordStrength === 3 && 'Good'}
                    {passwordStrength === 4 && 'Strong'}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="input-icon-button"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {confirmPassword && password === confirmPassword && (
                  <CheckCircle size={18} className="input-icon success" />
                )}
              </div>
              {confirmPassword && password !== confirmPassword && (
                <div className="password-mismatch">
                  ⚠️ Passwords do not match
                </div>
              )}
            </div>

            <div className="terms-checkbox">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms" className="text-sm">
                I agree to the{' '}
                <a href="#" className="auth-link">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="auth-link">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-signup"
              disabled={loading || password !== confirmPassword || !password || !confirmPassword}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer fade-in">
            <p className="text-muted text-sm">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// OTP Verification Component
function OTPVerification({ email }) {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

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

      console.log('OTP verified, redirecting to onboarding...');
      // OTP verified successfully, redirect to onboarding
      setTimeout(() => {
        console.log('Navigating to /onboarding');
        navigate('/onboarding');
      }, 500);
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
