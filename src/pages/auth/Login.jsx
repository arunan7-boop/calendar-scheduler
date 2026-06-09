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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white rounded-[32px] shadow-xl p-8 md:p-10 w-full max-w-md border border-white/20">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2 tracking-tight text-center">
          Calandr
        </h1>
        <p className="text-gray-500 text-center text-sm mb-8 font-medium">
          AI-Powered Appointment Scheduling
        </p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm font-medium">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 tracking-wide">
              Email Address
            </label>
            <input
              type="email"
              className="input md3-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 tracking-wide">
              Password
            </label>
            <input
              type="password"
              className="input md3-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="w-full py-3.5 btn btn-primary text-base font-bold shadow-md hover:shadow-lg transition-all duration-200 rounded-full">
            Sign In
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-600 mt-8 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 hover:text-indigo-800 hover:underline font-semibold transition-colors duration-200">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
