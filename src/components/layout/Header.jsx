import React, { useState, useEffect } from 'react';

const Header = ({ user }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Date</span>
          <span className="text-sm font-semibold text-slate-700">{time.toLocaleDateString()}</span>
        </div>
        <div className="w-px h-8 bg-slate-100" />
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Time</span>
          <span className="text-sm font-semibold text-slate-700 font-mono">{time.toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-slate-50 pl-4 pr-2 py-1.5 rounded-full border border-slate-100">
        <span className="text-sm font-medium text-slate-600">{user || 'Admin'}</span>
        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md shadow-emerald-600/20">
          {user ? user.charAt(0).toUpperCase() : 'A'}
        </div>
      </div>
    </header>
  );
};

export default Header;