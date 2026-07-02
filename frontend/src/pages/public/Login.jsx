import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, AlertTriangle, Sparkles, BookOpen } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute w-[500px] h-[500px] bg-brand-900/10 rounded-full blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="max-w-md w-full glass-panel rounded-3xl p-8 relative border border-slate-900 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-brand-950/60 border border-brand-900 text-brand-400 rounded-2xl mb-4">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="text-slate-400 text-xs mt-1">Sign in to manage your seat and payments</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center space-x-2 bg-red-950/30 border border-red-900/40 text-red-400 p-3.5 rounded-xl mb-6 text-sm">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:border-brand-500 focus:outline-none transition-all placeholder-slate-600"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:border-brand-500 focus:outline-none transition-all placeholder-slate-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl mt-4 flex items-center justify-center space-x-2 shadow-lg shadow-brand-900/10 hover:shadow-brand-900/30 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-900 text-center">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 font-bold hover:text-brand-300 transition-colors">
              Create an Account
            </Link>
          </p>
          <div className="mt-4 inline-flex items-center space-x-1.5 text-[10px] bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-500 font-mono">
            <Sparkles className="h-3 w-3 text-brand-500" />
            <span>Admin Dev Seed enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
