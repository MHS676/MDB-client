import React, { useState, useEffect } from 'react';
import { financialRecordsAPI } from '../services/api';

const RevenueExpenditurePage = () => {
  const [data, setData] = useState({
    recurringBilled: 0,
    outstandingBilled: 0,
    receivedTillDate: 0,
    budgetedExpenditure: 0,
    actualExpenditure: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const records = await financialRecordsAPI.getSummary();
        
        let recurringBilled = 0;
        let outstandingBilled = 0;
        let receivedTillDate = 0;
        let budgetedExpenditure = 0;
        let actualExpenditure = 0;

        // Sum across all records
        records.forEach(r => {
          recurringBilled += (r.revenueBilledRecurringMonthly || 0);
          outstandingBilled += (r.revenueTillEndOutstandingCash || 0) + (r.revenueBilledOutstandingCash || 0);
          receivedTillDate += (r.revenueBilledReceivedCash || 0) + (r.revenueBilledReceivedBank || 0) + (r.revenueTillEndReceivedCash || 0);
          budgetedExpenditure += (r.expenditureBudgetedCash || 0);
          actualExpenditure += (r.expenditureActualCash || 0);
        });

        setData({
          recurringBilled,
          outstandingBilled,
          receivedTillDate,
          budgetedExpenditure,
          actualExpenditure
        });
      } catch (err) {
        console.error('Failed to fetch summary', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalReceivables = data.recurringBilled + data.outstandingBilled;
  const receivableOutstanding = totalReceivables - data.receivedTillDate;
  const expenditureVariance = data.budgetedExpenditure - data.actualExpenditure;

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
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Revenue & Expenditure Overview</h2>
        <p className="text-xs text-slate-400 mt-0.5">Track recurring streams, outstanding billing, and operating variances.</p>
      </div>

      {/* Main Executive Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. REVENUE SUMMARY CARD */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-xs relative">
          <div className="absolute top-4 right-4 text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded font-mono">Statement 01</div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
            <span>📊</span> 1. Revenue Summary
          </h3>
          
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span>Recurring Monthly Revenue Billed</span>
              <span className="font-mono font-bold text-slate-900">৳ {formatCurrency(data.recurringBilled)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span>Outstanding Revenue Billed</span>
              <span className="font-mono font-bold text-slate-900">৳ {formatCurrency(data.outstandingBilled)}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-700">Total Receivables</span>
              <span className="font-mono text-rose-500">৳ {formatCurrency(totalReceivables)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-600 pt-1">
              <span>Receivable Received Till Date</span>
              <span className="font-mono font-bold text-emerald-600">৳ {formatCurrency(data.receivedTillDate)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span>Receivable Outstanding Till Date</span>
              <span className={`font-mono font-bold ${receivableOutstanding < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {receivableOutstanding < 0 ? '- ' : ''}৳ {formatCurrency(Math.abs(receivableOutstanding))}
              </span>
            </div>
          </div>
        </div>

        {/* 2. EXPENDITURE SUMMARY CARD */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-xs">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
            <span>📉</span> 2. Expenditure Summary
          </h3>
          
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span>Budgeted Expenditure</span>
              <span className="font-mono font-bold text-slate-900">৳ {formatCurrency(data.budgetedExpenditure)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span>Actual Expenditure (Till Date)</span>
              <span className="font-mono font-bold text-slate-900">৳ {formatCurrency(data.actualExpenditure)}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-700">Total Expenditure Variance (+/-)</span>
              <span className={`font-mono ${expenditureVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {expenditureVariance >= 0 ? '+ ' : '- '}৳ {formatCurrency(Math.abs(expenditureVariance))}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 text-right italic pt-4">Values formatted in BDT currency layer.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RevenueExpenditurePage;
