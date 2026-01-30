import { useState } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        // On success signup, usually redirected or need to confirm email.
        // Assuming auto-confirm for mock/local, or prompt user.
        alert('Check your email for confirmation link!');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'var(--bg-body)',
      backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(62, 207, 142, 0.05) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(62, 207, 142, 0.05) 0%, transparent 20%)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
           <div style={{ background: 'rgba(62, 207, 142, 0.1)', padding: '12px', borderRadius: '16px' }}>
              <Briefcase size={32} color="var(--brand)" />
           </div>
        </div>

        <h1 style={{ marginBottom: '0.5rem', textAlign: 'center', fontSize: '1.75rem' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-muted text-sm" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {isLogin ? 'Sign in to access your dashboard' : 'Join DuesJobs to find your next role'}
        </p>
        
        {error && <div className="text-danger" style={{ marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              placeholder="you@example.com"
            />
          </div>
          <div className="form-group" style={{ marginBottom: '0.5rem' }}>
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <span className="text-muted text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button 
            className="btn-ghost"
            style={{ padding: '0 0.25rem', color: 'var(--text-primary)' }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
