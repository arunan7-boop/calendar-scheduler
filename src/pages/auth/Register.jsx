import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import { setStoredToken } from '../../utils/tokenStorage';

export default function Register() {
  const [userType, setUserType] = useState('CLIENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        userType,
        firstName,
        lastName
      });
      
      // Save JWT token
      if (response.data.token) {
        setStoredToken(response.data.token);
      }
      
      // Professionals go to org creation, clients go to dashboard
      if (userType === 'PROFESSIONAL') {
        navigate('/org/create');
      } else {
        navigate('/client');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'radial-gradient(circle at 50% 50%, #111e38 0%, #080f1e 100%)', fontFamily: "'Open Sans', 'Roboto', sans-serif" }}>
      <div className="rounded-[28px] shadow-2xl p-8 md:p-10 w-full max-w-md border" style={{ background: 'rgba(16, 24, 48, 0.45)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderColor: 'rgba(255, 255, 255, 0.08)' }}>
        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight text-center">
          Create Account
        </h1>
        <p className="text-gray-400 text-center text-sm mb-8 font-medium">
          Join Calandr appointment network today
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 text-red-400 rounded-2xl border border-red-900/30 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-group">
            <label className="block text-sm font-semibold text-gray-300 mb-1.5 tracking-wide">
              I am registering as a...
            </label>
            <select
              className="w-full px-4 py-3 rounded-2xl font-normal text-sm transition-all duration-200 outline-none"
              style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.12)', color: 'white' }}
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              <option value="CLIENT" style={{ background: '#0d1527', color: 'white' }}>Client (Looking to Book)</option>
              <option value="PROFESSIONAL" style={{ background: '#0d1527', color: 'white' }}>Professional (Service Provider)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-300 mb-1.5 tracking-wide">
                First Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-2xl font-normal text-sm transition-all duration-200 outline-none"
                style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.12)', color: 'white' }}
                placeholder="Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-300 mb-1.5 tracking-wide">
                Last Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-2xl font-normal text-sm transition-all duration-200 outline-none"
                style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.12)', color: 'white' }}
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="block text-sm font-semibold text-gray-300 mb-1.5 tracking-wide">
              Email Address
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-2xl font-normal text-sm transition-all duration-200 outline-none"
              style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.12)', color: 'white' }}
              placeholder="jane.doe@example.com"
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
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="w-full py-3.5 text-base font-bold shadow-md hover:shadow-lg transition-all duration-200 rounded-full mt-4 text-white" style={{ background: '#0972d3' }}>
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-8 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
