import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import { setStoredToken } from '../../utils/tokenStorage';

export default function Register() {
  const [userType, setUserType] = useState('PROFESSIONAL');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/register', { email, password, userType, firstName, lastName });
      if (response.data.token) setStoredToken(response.data.token);
      navigate(userType === 'PROFESSIONAL' ? '/org/create' : '/client');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
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
          <p className="font-serif text-xl text-ivory-100 mb-1 italic">Create your account</p>
          <p className="text-content-secondary text-sm mb-7 font-sans">Join the Solaise.AI network</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-md text-sm font-sans text-danger border border-danger/20" style={{ background: 'var(--danger-soft)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Role toggle */}
            <div>
              <label className="u-eyebrow block mb-2">I am a</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'PROFESSIONAL', label: 'Service Provider' },
                  { value: 'CLIENT', label: 'Client' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setUserType(opt.value)}
                    className={`h-control-md rounded-sm text-sm font-sans font-medium border transition-all duration-mid ease-lux ${
                      userType === opt.value
                        ? 'border-border-gold text-content-gold shadow-glow-gold-sm'
                        : 'border-border-default text-content-secondary hover:border-border-strong'
                    }`}
                    style={{ background: userType === opt.value ? 'var(--glass-gold)' : 'var(--surface-raised)' }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="u-eyebrow block mb-2">First Name</label>
                <input
                  type="text"
                  className="w-full h-control-md px-4 rounded-sm bg-surface-raised border border-border-default text-content-primary font-sans text-sm transition-all duration-mid ease-lux focus:border-border-gold focus:shadow-glow-gold-sm outline-none"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="u-eyebrow block mb-2">Last Name</label>
                <input
                  type="text"
                  className="w-full h-control-md px-4 rounded-sm bg-surface-raised border border-border-default text-content-primary font-sans text-sm transition-all duration-mid ease-lux focus:border-border-gold focus:shadow-glow-gold-sm outline-none"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

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
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-control-md rounded-sm font-sans font-semibold text-sm tracking-wide text-content-on-gold mt-2 transition-all duration-mid ease-lux hover:-translate-y-px hover:shadow-glow-gold-md disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--gold-gradient)' }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div className="u-rule my-7"><span className="text-xs text-content-muted font-sans px-2">or</span></div>

          <p className="text-center text-sm text-content-secondary font-sans">
            Already a member?{' '}
            <Link to="/login" className="text-content-gold hover:text-gold-300 font-medium transition-colors duration-fast">
              Sign in
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
