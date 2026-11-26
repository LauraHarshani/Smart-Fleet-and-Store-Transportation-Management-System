import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login({ email: email.trim(), password });
      if (user.role === 'System Administrator') navigate('/dashboard', { replace: true });
      else if (['Store Manager', 'Store Employee'].includes(user.role)) navigate('/store', { replace: true });
      else setError('This account does not have access to the admin or store portal.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#173F35]">LogiFleet Login</h2>
        
        {error && <div className="bg-red-50 text-red-500 p-2 rounded mb-4 text-sm">{error}</div>}
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full border p-2 rounded-lg" 
            required 
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full border p-2 rounded-lg" 
            required 
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#173F35] text-white py-2 rounded-lg font-semibold hover:bg-[#0F2C25] disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;