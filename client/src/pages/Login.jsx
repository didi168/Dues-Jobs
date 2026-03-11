import { useState } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import '../styles/auth.css';

export default function Login() {
  usePageMeta(
    'Sign In',
    'Sign in to your DuesJobs account and continue your job search. Access personalized job recommendations.',
    'login, sign in, job search, remote jobs'
  );
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
      </div>

      <div className="auth-content">
        <div className="auth-card login-card">
          {/* Header */}
          <div className="auth-header fade-in">
            <div className="auth-logo">
              <Briefcase size={40} color="var(--brand)" />
            </div>
            <h1>Welcome Back</h1>
            <p className="text-muted">Sign in to your account and continue your job search</p>
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
                  onChange={e => setPassword(e.target.value)}
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
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-login"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer fade-in">
            <p className="text-muted text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Side Info */}
        <div className="auth-info fade-in">
          <div className="info-card">
            <div className="info-icon">🎯</div>
            <h3>Find Your Perfect Role</h3>
            <p>Discover job opportunities that match your skills and preferences</p>
          </div>
          <div className="info-card">
            <div className="info-icon">⚡</div>
            <h3>Smart Matching</h3>
            <p>Our AI matches jobs to your profile automatically</p>
          </div>
          <div className="info-card">
            <div className="info-icon">🔔</div>
            <h3>Instant Alerts</h3>
            <p>Get notified about new opportunities via email or Telegram</p>
          </div>
        </div>
      </div>
    </div>
  );
}
