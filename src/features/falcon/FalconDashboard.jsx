import React, { useState } from 'react';
import RevenueExpenditurePage from '../../pages/RevenueExpenditurePage';
import FinancialCompliancePage from '../../pages/FinancialCompliancePage';
import KpiAnalyticsPage from '../../pages/KpiAnalyticsPage';

const FalconDashboard = ({ user, onSignOut }) => {
  const userName = user?.name || 'Yusuf';
  const userInitial = userName.charAt(0).toUpperCase();

  const [currentPage, setCurrentPage] = useState('Revenue & Expenditure');

  const navigationStructure = [
    {
      groupHeading: "Operations",
      items: [
        { id: 'Revenue & Expenditure', label: 'Revenue & Expenditure', icon: '📊' },
      ]
    },
    {
      groupHeading: "Governance & Tax",
      items: [
        { id: 'Financial Compliance', label: 'Financial Compliance', icon: '🏛️' },
      ]
    },
    {
      groupHeading: "Analytics",
      items: [
        { id: 'Key Performance Indicators', label: 'Key Performance Indicators', icon: '📈' },
      ]
    }
  ];

  const renderActivePage = () => {
    switch (currentPage) {
      case 'Revenue & Expenditure':
        return <RevenueExpenditurePage />;
      case 'Financial Compliance':
        return <FinancialCompliancePage />;
      case 'Key Performance Indicators':
        return <KpiAnalyticsPage />;
      default:
        return <RevenueExpenditurePage />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-100 overflow-hidden font-sans antialiased selection:bg-amber-500/20">
      
      {/* LEFT SIDEBAR PANEL — Authentic Slate Dark to match original theme */}
      <aside className="w-64 bg-slate-950 text-slate-400 flex flex-col justify-between p-4 shrink-0 border-r border-slate-900 shadow-xl select-none">
        <div className="space-y-6">
          {/* Top Brand Tag */}
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="font-black text-xl text-white tracking-wider flex flex-col gap-0.5">
              <span className="text-amber-500 text-[10px] font-bold uppercase tracking-widest">Falcon Management</span>
              <span className="text-sm tracking-tight text-slate-200">EXECUTIVE VIEW</span>
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
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
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
          <span>Exit Executive Session</span>
        </button>
      </aside>

      {/* RIGHT WORKSPACE CONTEXT */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Top Operational Premium Dark Utilities Header — Perfectly matching Screenshot 2026-06-22 at 1.20.00 PM */}
        <header className="h-20 bg-[#0f172a] border-b border-slate-800 px-8 flex items-center justify-between shrink-0 select-none shadow-lg m-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="text-amber-500 font-bold uppercase text-xs tracking-wider">
              FINANCIAL MANAGEMENT DASHBOARD
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              DATE SYSTEM: <span className="text-white ml-2 font-mono text-xs">17 / 06 / 2026</span>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              TIME SYSTEM: <span className="text-white ml-2 font-mono text-xs">16:53:06</span>
            </div>

            {/* Profile Pillar */}
            <div className="flex items-center gap-3 border-l border-slate-700 pl-6">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-white tracking-tight">Executive Director</span>
                <span className="text-[9px] text-slate-400 font-medium">Falcon Management</span>
              </div>
              <div className="w-8 h-8 bg-slate-700 text-slate-300 text-xs font-extrabold flex items-center justify-center rounded-lg shadow-inner">
                {userInitial}
              </div>
            </div>
          </div>
        </header>

        {/* Active Content Subview Loader Window */}
        <main className="flex-1 px-8 pb-8 overflow-y-auto min-h-0">
          <div className="max-w-7xl mx-auto">
            {renderActivePage()}
          </div>
        </main>

      </div>
    </div>
  );
};

export default FalconDashboard;