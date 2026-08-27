import React, { useState, useEffect } from 'react';

const Header = ({ user, onLogout }) => {
  const [time, setTime] = useState(new Date());
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    setShowLogoutMenu(false);
    if (onLogout) {
      await onLogout();
    }
  };

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

      <div className="relative">
        <button
          onClick={() => setShowLogoutMenu(!showLogoutMenu)}
          className="flex items-center gap-3 bg-slate-50 pl-4 pr-2 py-1.5 rounded-full border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <span className="text-sm font-medium text-slate-600">{user || 'Admin'}</span>
          <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md shadow-emerald-600/20">
            {user ? user.charAt(0).toUpperCase() : 'A'}
          </div>
        </button>

        {showLogoutMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-xs text-slate-600 font-semibold">Logged in as</p>
              <p className="text-sm text-slate-900 font-bold truncate">{user || 'Admin'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;