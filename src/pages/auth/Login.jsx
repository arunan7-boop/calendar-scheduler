import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import { setStoredToken } from '../../utils/tokenStorage';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      setStoredToken(res.data.token);
      navigate(res.data.userType === 'CLIENT' ? '/client' : '/professional');
    } catch (err) {
      setError(err.response?.data?.error || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-base" style={{
      background: 'radial-gradient(ellipse 80% 50% at 70% 0%, rgba(27,58,92,0.45) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 10% 100%, rgba(201,168,106,0.08) 0%, transparent 55%), var(--obsidian-900)'
    }}>
      <div className="w-full max-w-md">

        {/* Wordmark */}
        <div className="text-center mb-10">
          <img src="/logo-horizontal-gold.png" alt="Solaise.AI" className="h-9 mx-auto mb-5" onError={(e) => { e.target.style.display = 'none'; }} />
          <h1 className="font-display text-2xl tracking-wider text-ivory-100 mb-1">
            SOLAISE<span className="text-gold-400">.AI</span>
          </h1>
          <span className="u-eyebrow">Ultra-Luxury Self-Care</span>
        </div>

        {/* Card */}
        <div className="u-card p-8">
          <p className="font-serif text-xl text-ivory-100 mb-1 italic">Welcome back</p>
          <p className="text-content-secondary text-sm mb-7 font-sans">Sign in to your account to continue</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-md text-sm font-sans text-danger border border-danger/20" style={{ background: 'var(--danger-soft)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="u-eyebrow block mb-2">Email</label>
              <input
                type="email"
                className="w-full h-control-md px-4 rounded-sm bg-surface-raised border border-border-default text-content-primary font-sans text-sm transition-all duration-mid ease-lux focus:border-border-gold focus:shadow-glow-gold-sm outline-none"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="u-eyebrow block mb-2">Password</label>
              <input
                type="password"
                className="w-full h-control-md px-4 rounded-sm bg-surface-raised border border-border-default text-content-primary font-sans text-sm transition-all duration-mid ease-lux focus:border-border-gold focus:shadow-glow-gold-sm outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-control-md rounded-sm font-sans font-semibold text-sm tracking-wide text-content-on-gold transition-all duration-mid ease-lux hover:-translate-y-px hover:shadow-glow-gold-md disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--gold-gradient)' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="u-rule my-7"><span className="text-xs text-content-muted font-sans px-2">or</span></div>

          <p className="text-center text-sm text-content-secondary font-sans">
            New to Solaise?{' '}
            <Link to="/register" className="text-content-gold hover:text-gold-300 font-medium transition-colors duration-fast">
              Request access
            </Link>
          </p>
        </div>

        <p className="text-center text-2xs text-content-muted font-sans mt-6 tracking-wide uppercase">
          By Invitation · Members Only
        </p>
      </div>
    </div>
  );
}
