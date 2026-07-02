import React, { useEffect, useMemo, useState } from 'react';
import { financialRecordsAPI } from '../services/api';

const monthOptions = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const RevenueExpenditurePage = () => {
  const currentYear = 2026;
  const now = new Date();
  const defaultMonth = now.getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await financialRecordsAPI.getExecutiveReport(
          String(selectedMonth).padStart(2, '0'),
          String(currentYear),
        );
        setReport(data);
      } catch (fetchError) {
        console.error('Failed to load executive report:', fetchError);
        setError(fetchError.message || 'Failed to load executive report');
        setReport(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [selectedMonth]);

  const metrics = report?.metrics || {
    recurringMonthlyRevenueBilled: 0,
    outstandingRevenueBilled: 0,
    totalReceivables: 0,
    receivableReceivedTillDate: 0,
    receivableOutstandingTillDate: 0,
  };

  const receivableCoverage = useMemo(() => {
    const lifetimeInvoiced = report?.raw?.totalLifetimeInvoiced || 0;
    if (!lifetimeInvoiced) return 0;
    return (metrics.receivableReceivedTillDate / lifetimeInvoiced) * 100;
  }, [metrics, report]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Falcon Executive View</h2>
          <p className="text-xs text-slate-400 mt-0.5">Monthly revenue and accounts receivable performance calculated from saved data.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-slate-700 shadow-sm outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all cursor-pointer"
            >
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label} {currentYear}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 text-xs">▼</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Recurring Monthly Revenue Billed</div>
          <div className="mt-2 text-2xl font-black text-slate-900">৳ {formatCurrency(metrics.recurringMonthlyRevenueBilled)}</div>
          <p className="mt-2 text-xs text-slate-400">Sum of active recurring contract fees invoiced in the selected billing cycle.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Outstanding Revenue Billed</div>
          <div className="mt-2 text-2xl font-black text-amber-600">৳ {formatCurrency(metrics.outstandingRevenueBilled)}</div>
          <p className="mt-2 text-xs text-slate-400">Billed this month minus payments received for this month's invoices.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Receivables</div>
          <div className="mt-2 text-2xl font-black text-rose-500">৳ {formatCurrency(metrics.totalReceivables)}</div>
          <p className="mt-2 text-xs text-slate-400">Unpaid invoices including current month and overdue balances.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Receivable Received Till Date</div>
          <div className="mt-2 text-2xl font-black text-emerald-600">৳ {formatCurrency(metrics.receivableReceivedTillDate)}</div>
          <p className="mt-2 text-xs text-slate-400">Lifetime payments collected from day one up to the selected month.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Receivable Outstanding Till Date</div>
          <div className="mt-2 text-2xl font-black text-slate-900">৳ {formatCurrency(metrics.receivableOutstandingTillDate)}</div>
          <p className="mt-2 text-xs text-slate-400">Lifetime invoiced amount minus total lifetime received.</p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm text-white">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Collection Coverage</div>
          <div className="mt-2 text-2xl font-black text-amber-400">{formatCurrency(receivableCoverage)}%</div>
          <p className="mt-2 text-xs text-slate-400">How much of billed receivables have been collected so far.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Report</h3>
            <p className="text-sm text-slate-600 mt-1">
              {monthOptions.find((month) => month.value === selectedMonth)?.label} {currentYear}
            </p>
          </div>
          <div className="text-xs text-slate-400">
            {loading ? 'Refreshing report...' : `Records used: ${report?.raw?.recordCount || 0}`}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Formula used for RMR Billed</div>
            <div className="mt-2 text-slate-700">Active recurring contract fees invoiced in the current billing cycle.</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Formula used for Receivable Outstanding</div>
            <div className="mt-2 text-slate-700">Total receivables minus receivable outstanding equals receivable received till date.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueExpenditurePage;
