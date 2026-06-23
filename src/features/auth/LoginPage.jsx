import React, { useState } from 'react';
import { authAPI } from '../../services/api';

const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulated authentication check matching your dashboard user profile
      if (email === 'yusuf@mdb.com' && password === 'admin123') {
        // Store token for API calls
        await authAPI.login(email, password);
        onLoginSuccess({ name: 'Yusuf', email: 'yusuf@mdb.com' });
      } else {
        setError('Invalid enterprise credentials. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-900 flex items-center justify-center p-4 overflow-hidden font-sans">
      
      {/* Decorative Blur Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 bg-slate-700/40 border border-slate-600/30 px-3 py-1 rounded-full shadow-2xs">
            <span className="text-emerald-400 font-black text-sm tracking-wider">MDB</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase bg-slate-800 px-1.5 py-0.5 rounded">v2.0</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight pt-1">Management Dashboard</h1>
          <p className="text-xs text-slate-400">Sign in to manage corporate revenue logs and compliance.</p>
        </div>

        {/* Error Alert Bar */}
        {error && (
          <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all">
            {error}
          </div>
        )}

        {/* Form Elements */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Input Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Corporate Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-xs font-medium text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
              placeholder="name@mdb.com"
            />
          </div>

          {/* Password Input Field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Security Password
              </label>
              <a href="#forgot" className="text-[10px] font-bold text-emerald-400 hover:underline">
                Forgot?
              </a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-xs font-medium text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
              placeholder="••••••••••••"
            />
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-600/50 text-slate-950 text-xs font-bold py-2.5 px-4 rounded-xl shadow-md shadow-emerald-500/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
            ) : (
              'Access Dashboard'
            )}
          </button>

        </form>

        {/* Demo Hint Footer */}
        <div className="mt-6 pt-4 border-t border-slate-700/30 text-center">
          <p className="text-[10px] text-slate-500">
            Demo Access — Use User: <span className="text-slate-400 font-mono">yusuf@mdb.com</span> & Pass: <span className="text-slate-400 font-mono">admin123</span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;