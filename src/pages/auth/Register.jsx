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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white rounded-[32px] shadow-xl p-8 md:p-10 w-full max-w-md border border-white/20">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2 tracking-tight text-center">
          Create Account
        </h1>
        <p className="text-gray-500 text-center text-sm mb-8 font-medium">
          Join Calandr appointment network today
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-group">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 tracking-wide">
              I am registering as a...
            </label>
            <select
              className="input md3-input w-full"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              <option value="CLIENT">Client (Looking to Book)</option>
              <option value="PROFESSIONAL">Professional (Service Provider)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 tracking-wide">
                First Name
              </label>
              <input
                type="text"
                className="input md3-input"
                placeholder="Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 tracking-wide">
                Last Name
              </label>
              <input
                type="text"
                className="input md3-input"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 tracking-wide">
              Email Address
            </label>
            <input
              type="email"
              className="input md3-input"
              placeholder="jane.doe@example.com"
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
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="w-full py-3.5 btn btn-primary text-base font-bold shadow-md hover:shadow-lg transition-all duration-200 rounded-full mt-4">
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-8 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-800 hover:underline font-semibold transition-colors duration-200">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
