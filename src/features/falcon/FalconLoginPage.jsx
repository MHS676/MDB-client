import React, { useState } from 'react';

const FalconLoginPage = ({ onLoginSuccess }) => {
  const [clientId, setClientId] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (clientId === 'falcon-exec' && secretKey === 'falcon2026') {
        setIsLoading(false);
        onLoginSuccess({ name: 'Executive Director', role: 'Falcon Management' });
      } else {
        setIsLoading(false);
        setError('Unauthorized corporate access token key combination.');
      }
    }, 700);
  };

  return (
    <div className="h-screen w-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden font-sans relative">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-slate-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative">
        <div className="text-center space-y-2 mb-6">

          <p className="text-[11px] text-slate-500">Financial Management Dashboard Gateway</p>
        </div>

        {error && (
          <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] px-3 py-2 rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Access ID</label>
            <input
              type="text"
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 outline-none focus:border-amber-500/60 transition-all"
              placeholder="falcon-exec"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Management Secret Key</label>
            <input
              type="password"
              required
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 outline-none focus:border-amber-500/60 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-600 text-slate-950 text-xs font-bold py-2 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center h-9 mt-2"
          >
            {isLoading ? <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" /> : 'Authenticate Access'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-900 text-center">
          <p className="text-[10px] text-slate-600">
            ID: <span className="text-slate-400 font-mono">falcon-exec</span> | Key: <span className="text-slate-400 font-mono">falcon2026</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FalconLoginPage;