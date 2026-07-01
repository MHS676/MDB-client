import React, { useState, useEffect } from 'react';
import { financialRecordsAPI } from '../services/api';

const FinancialCompliancePage = () => {
  const [data, setData] = useState({
    vatAccrued: 0,
    vatReceived: 0,
    vatPaid: 0,
    tdsIncome: 0,
    tdsExpenditure: 0,
    tdsPaid: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const records = await financialRecordsAPI.getSummary();
        
        let vatAccrued = 0;
        let vatReceived = 0;
        let vatPaid = 0;
        let tdsIncome = 0;
        let tdsExpenditure = 0;
        let tdsPaid = 0;

        // Sum across all records
        records.forEach(r => {
          vatAccrued += (r.vatAccruedCash || 0);
          vatReceived += (r.vatAccruedBank || 0);
          vatPaid += (r.vatPaidCash || 0);

          tdsIncome += (r.tdsIncomeCash || 0);
          tdsExpenditure += (r.tdsExpenditureCash || 0);
          tdsPaid += (r.tdsIncomeBank || 0);  // As modeled earlier, Paid is mapped to tdsIncomeBank
        });

        setData({
          vatAccrued,
          vatReceived,
          vatPaid,
          tdsIncome,
          tdsExpenditure,
          tdsPaid
        });
      } catch (err) {
        console.error('Failed to fetch summary', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(val));
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Financial Compliance & Auditing</h2>
        <p className="text-xs text-slate-400 mt-0.5">Monitor legal tax processing frameworks, structural corporate VAT, and local TDS ledgers.</p>
        <p className="text-xs text-slate-400 mt-1">Data as of: {new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date())} {new Date().getFullYear()}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* VAT PANEL */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-xs relative">
          <div className="absolute top-4 right-4 text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded font-mono">Statement 02</div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
            <span>🏛️</span> 1. VAT (Value Added Tax)
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span>Accrued</span>
              <span className="font-mono font-bold text-slate-900">৳ {formatCurrency(data.vatAccrued)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span>Received</span>
              <span className="font-mono font-bold text-slate-900">৳ {formatCurrency(data.vatReceived)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span>Paid</span>
              <span className="font-mono font-bold text-slate-900">৳ {formatCurrency(data.vatPaid)}</span>
            </div>
          </div>
        </div>

        {/* TDS PANEL */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-xs">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
            <span>📋</span> 2. TDS (Tax Deducted At Source)
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span>on Income</span>
              <span className="font-mono font-bold text-slate-900">৳ {formatCurrency(data.tdsIncome)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span>on Expenditure</span>
              <span className="font-mono font-bold text-slate-900">৳ {formatCurrency(data.tdsExpenditure)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span>Paid</span>
              <span className="font-mono font-bold text-slate-900">৳ {formatCurrency(data.tdsPaid)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Audit Documentation Section Footer */}
      <div className="bg-slate-100/50 border border-slate-200/60 rounded-2xl p-8 text-center max-w-xl mx-auto mt-6">
        <span className="text-2xl block mb-2">📋</span>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Audit Documentation</h4>
        <p className="text-[11px] text-slate-400 mt-1">This section is preserved for system ledger validation logs and executive signature blocks.</p>
      </div>
    </div>
  );
};

export default FinancialCompliancePage;
