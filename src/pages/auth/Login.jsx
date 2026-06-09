import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import { setStoredToken } from '../../utils/tokenStorage';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      setStoredToken(res.data.token);
      navigate(res.data.userType === 'CLIENT' ? '/client' : '/professional');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'radial-gradient(circle at 50% 50%, #111e38 0%, #080f1e 100%)', fontFamily: "'Open Sans', 'Roboto', sans-serif" }}>
      <div className="rounded-[28px] shadow-2xl p-8 md:p-10 w-full max-w-md border" style={{ background: 'rgba(16, 24, 48, 0.45)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderColor: 'rgba(255, 255, 255, 0.08)' }}>
        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight text-center">
          Calandr
        </h1>
        <p className="text-gray-400 text-center text-sm mb-8 font-medium">
          AI-Powered Appointment Scheduling
        </p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 text-red-400 rounded-2xl border border-red-900/30 text-sm font-medium">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="block text-sm font-semibold text-gray-300 mb-1.5 tracking-wide">
              Email Address
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-2xl font-normal text-sm transition-all duration-200 outline-none"
              style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.12)', color: 'white' }}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="block text-sm font-semibold text-gray-300 mb-1.5 tracking-wide">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-2xl font-normal text-sm transition-all duration-200 outline-none"
              style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.12)', color: 'white' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="w-full py-3.5 text-base font-bold shadow-md hover:shadow-lg transition-all duration-200 rounded-full text-white" style={{ background: '#0972d3' }}>
            Sign In
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-400 mt-8 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
