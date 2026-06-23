import React, { useState } from 'react';
import RevenueBilledPage from './RevenueBilledPage';
import RevenueTillEndPage from './RevenueTillEndPage';
import ExpenditurePage from './ExpenditurePage';
import VatCompliancePage from './VatPage';
import TdsCompliancePage from './TdsPage';

const NewDashboard = ({ user, onSignOut }) => {
  // Use user context data cleanly, fallback safely if undefined
  const userName = user?.name || 'Yusuf';
  const userInitial = userName.charAt(0).toUpperCase();

  // Reset default view to the core data input page
  const [currentPage, setCurrentPage] = useState('Revenue Billed');

  // Clean, focused navigation schema with only the required input screens
  const navigationStructure = [
    {
      groupHeading: "Operations",
      items: [
        { id: 'Revenue Billed', label: 'Revenue Billed', icon: '📝' },
        { id: 'Revenue Till End', label: 'Revenue Till End', icon: '📈' },
        { id: 'Expenditure', label: 'Expenditure Summary', icon: '📉' },
      ]
    },
    {
      groupHeading: "Governance & Tax",
      items: [
        { id: 'VAT Compliance', label: 'VAT Compliance', icon: '🏛️' },
        { id: 'TDS Compliance', label: 'TDS Compliance', icon: '📋' },
      ]
    }
  ];

  // Dynamic Page Switcher Map matching the clean sidebar layout
  const renderActivePage = () => {
    switch (currentPage) {
      case 'Revenue Billed':
        return <RevenueBilledPage />;
      case 'Revenue Till End':
        return <RevenueTillEndPage />;
      case 'Expenditure':
        return <ExpenditurePage />;
      case 'VAT Compliance':
        return <VatCompliancePage />;
      case 'TDS Compliance':
        return <TdsCompliancePage />;
      default:
        return <RevenueBilledPage />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-100 overflow-hidden font-sans antialiased selection:bg-emerald-500/20">
      
      {/* LEFT SIDEBAR PANEL */}
      <aside className="w-64 bg-slate-950 text-slate-400 flex flex-col justify-between p-4 shrink-0 border-r border-slate-900 shadow-xl select-none">
        <div className="space-y-6">
          {/* Top Brand Tag */}
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="font-black text-xl text-white tracking-wider flex items-center gap-1.5">
              MDB <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/20">v2.0</span>
            </div>
          </div>

          {/* Grouped Navigation Layout */}
          <nav className="space-y-5 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
            {navigationStructure.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1.5">
                
                {/* Section Context Header Label */}
                <h3 className="px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                  {group.groupHeading}
                </h3>

                {/* Subcategory Action Links */}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = currentPage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setCurrentPage(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-[11px] font-bold rounded-xl transition-all outline-none duration-150 group cursor-pointer ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                            : 'hover:bg-slate-900 hover:text-slate-200'
                        }`}
                      >
                        <span className={`text-xs transition-transform duration-150 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>

              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Sidebar Action */}
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/5 rounded-xl transition-all cursor-pointer outline-none mt-auto shrink-0"
        >
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </aside>

      {/* RIGHT WORKSPACE CONTEXT */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/40 relative">
        
        {/* Top Operational Utilities Header */}
        <header className="h-16 border-b border-slate-200/60 bg-white/80 backdrop-blur px-6 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-6">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              System Date: <span className="text-slate-700 ml-1 font-mono">17/06/2026</span>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              System Time: <span className="text-slate-700 ml-1 font-mono">15:05:47</span>
            </div>
          </div>

          {/* User Profile Capsule */}
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 pl-3 pr-1.5 py-1 rounded-full shadow-2xs">
            <span className="text-xs font-bold text-slate-700">{userName}</span>
            <div className="w-7 h-7 bg-emerald-600 text-white text-xs font-extrabold flex items-center justify-center rounded-full shadow-sm">
              {userInitial}
            </div>
          </div>
        </header>

        {/* Active Content Subview Loader */}
        <main className="flex-1 p-6 overflow-y-auto min-h-0">
          <div className="max-w-7xl mx-auto">
            {renderActivePage()}
          </div>
        </main>

      </div>
    </div>
  );
};

export default NewDashboard;