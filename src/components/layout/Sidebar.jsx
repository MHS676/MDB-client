import React from 'react';

const Sidebar = ({ currentPage, setCurrentPage, onLogout }) => {
  const menuItems = [
    { id: 'Revenue Billed', label: 'Revenue Billed', icon: '📊' },
    { id: 'Revenue Till End', label: 'Revenue Till End', icon: '📈' },
    { id: 'Expenditure', label: 'Expenditure', icon: '📉' },
    { id: 'VAT', label: 'VAT Compliance', icon: '🏛️' },
    { id: 'TDS', label: 'TDS Compliance', icon: '🧾' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 h-screen flex flex-col justify-between border-r border-slate-800">
      <div>
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-black tracking-wider text-white flex items-center gap-2">
            MDB <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-medium tracking-normal">v2.0</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Management Dashboard</p>
        </div>
        
        <nav className="p-4 space-y-1.5">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                currentPage === item.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/15'
                  : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer"
        >
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;