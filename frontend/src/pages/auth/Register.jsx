import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

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
      await axios.post('/api/auth/register', {
        email,
        password,
        userType,
        firstName,
        lastName
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Create Account</h1>
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">I am a...</label>
            <select
              className="input"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              <option value="CLIENT">Client</option>
              <option value="PROFESSIONAL">Professional</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input type="text" className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input type="text" className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary w-full">Create Account</button>
        </form>
        <p className="text-center text-sm mt-4">
          Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
