import React, { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

const RevenueExpenditurePage = () => {
  const currentYear = new Date().getFullYear();
  const now = new Date();
  const defaultMonth = now.getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [report, setReport] = useState(null);
  const [allMonthsData, setAllMonthsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));

  // Fetch data for a single month
  const fetchMonthReport = async (month, year) => {
    try {
      const data = await financialRecordsAPI.getExecutiveReport(
        String(month).padStart(2, '0'),
        String(year),
      );
      return { month, year, data };
    } catch (err) {
      console.error(`Failed to load report for ${month}/${year}:`, err);
      return { month, year, data: null };
    }
  };

  // Fetch all months data when showAllMonths is toggled
  useEffect(() => {
    if (showAllMonths) {
      const fetchAllMonths = async () => {
        setLoading(true);
        try {
          const promises = monthOptions.map((m) => fetchMonthReport(m.value, selectedYear));
          const results = await Promise.all(promises);
          
          const chartData = results
            .filter((r) => r.data !== null)
            .map((r) => ({
              month: monthOptions.find((m) => m.value === r.month)?.label.substring(0, 3) || `M${r.month}`,
              recurringMonthlyRevenue: r.data?.metrics?.recurringMonthlyRevenueBilled || 0,
              outstandingRevenue: r.data?.metrics?.outstandingRevenueBilled || 0,
              totalReceivables: r.data?.metrics?.totalReceivables || 0,
              received: r.data?.metrics?.receivableReceivedTillDate || 0,
              outstanding: r.data?.metrics?.receivableOutstandingTillDate || 0,
            }));
          
          setAllMonthsData(chartData);
          setError('');
        } catch (err) {
          console.error('Failed to load yearly data:', err);
          setError('Failed to load yearly data');
        } finally {
          setLoading(false);
        }
      };
      
      fetchAllMonths();
    }
  }, [showAllMonths, selectedYear]);

  // Fetch single month data
  useEffect(() => {
    if (!showAllMonths) {
      const fetchReport = async () => {
        try {
          setLoading(true);
          setError('');
          const data = await financialRecordsAPI.getExecutiveReport(
            String(selectedMonth).padStart(2, '0'),
            String(selectedYear),
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
    }
  }, [selectedMonth, selectedYear, showAllMonths]);

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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Falcon Executive View</h2>
          <p className="text-xs text-slate-400 mt-0.5">Monthly revenue and accounts receivable performance. Default: All data shown • Apply filters to refine view.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAllMonths(!showAllMonths)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              showAllMonths
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {showAllMonths ? '📊 Yearly View' : '📅 Monthly View'}
          </button>

          {!showAllMonths && (
            <>
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-slate-700 shadow-sm outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all cursor-pointer"
                >
                  {monthOptions.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 text-xs">▼</div>
              </div>
            </>
          )}

          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-slate-700 shadow-sm outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all cursor-pointer"
            >
              {[currentYear, currentYear - 1, currentYear - 2].map((year) => (
                <option key={year} value={year}>
                  {year}
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

      {loading && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Loading data...
        </div>
      )}

      {/* MONTHLY VIEW */}
      {!showAllMonths && report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
              <div className="text-[12px] font-bold uppercase tracking-widest text-black">Recurring Monthly Revenue Billed</div>
              <div className="mt-2 text-2xl font-black text-slate-900">৳ {formatCurrency(report?.metrics?.recurringMonthlyRevenueBilled)}</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
              <div className="text-[12px] font-bold uppercase tracking-widest text-black">Outstanding Revenue Billed</div>
              <div className="mt-2 text-2xl font-black text-amber-600">৳ {formatCurrency(report?.metrics?.outstandingRevenueBilled)}</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
              <div className="text-[12px] font-bold uppercase tracking-widest text-black">Total Receivables</div>
              <div className="mt-2 text-2xl font-black text-rose-500">৳ {formatCurrency(report?.metrics?.totalReceivables)}</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
              <div className="text-[12px] font-bold uppercase tracking-widest text-black">Receivable Received Till Date</div>
              <div className="mt-2 text-2xl font-black text-emerald-600">৳ {formatCurrency(report?.metrics?.receivableReceivedTillDate)}</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
              <div className="text-[12px] font-bold uppercase tracking-widest text-black">Receivable Outstanding Till Date</div>
              <div className="mt-2 text-2xl font-black text-slate-900">৳ {formatCurrency(report?.metrics?.receivableOutstandingTillDate)}</div>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm text-white">
              <div className="text-[12px] font-bold uppercase tracking-widest text-slate-400">Collection Coverage</div>
              <div className="mt-2 text-2xl font-black text-amber-400">
                {formatCurrency(
                  ((report?.metrics?.receivableReceivedTillDate || 0) / (report?.raw?.totalLifetimeInvoiced || 1)) * 100
                )}%
              </div>
            </div>
          </div>

          {/* Single Month Pie Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Receivable Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Received', value: report?.metrics?.receivableReceivedTillDate || 0 },
                    { name: 'Outstanding', value: report?.metrics?.receivableOutstandingTillDate || 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ৳${formatCurrency(value)}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip formatter={(value) => `৳${formatCurrency(value)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* YEARLY VIEW - GRAPHS */}
      {showAllMonths && allMonthsData.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Revenue Trend ({selectedYear})</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={allMonthsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `৳${formatCurrency(value)}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="recurringMonthlyRevenue"
                    stroke="#10b981"
                    name="Monthly Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="outstandingRevenue"
                    stroke="#f59e0b"
                    name="Outstanding Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Receivable Status Chart */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Receivable Status ({selectedYear})</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={allMonthsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `৳${formatCurrency(value)}`} />
                  <Legend />
                  <Bar dataKey="received" stackId="a" fill="#10b981" name="Received" />
                  <Bar dataKey="outstanding" stackId="a" fill="#ef4444" name="Outstanding" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Total Receivables Trend */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Total Receivables Trend ({selectedYear})</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={allMonthsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `৳${formatCurrency(value)}`} />
                <Legend />
                <Bar dataKey="totalReceivables" fill="#3b82f6" name="Total Receivables" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200 p-5 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-widest text-emerald-700">Total Received (Year)</div>
              <div className="mt-2 text-2xl font-black text-emerald-600">
                ৳ {formatCurrency(allMonthsData.reduce((sum, m) => sum + m.received, 0))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl border border-rose-200 p-5 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-widest text-rose-700">Total Outstanding (Year)</div>
              <div className="mt-2 text-2xl font-black text-rose-600">
                ৳ {formatCurrency(allMonthsData.reduce((sum, m) => sum + m.outstanding, 0))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-5 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-widest text-blue-700">Avg Monthly Revenue</div>
              <div className="mt-2 text-2xl font-black text-blue-600">
                ৳ {formatCurrency(allMonthsData.reduce((sum, m) => sum + m.recurringMonthlyRevenue, 0) / (allMonthsData.length || 1))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl border border-amber-200 p-5 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-widest text-amber-700">Total Receivables (Year)</div>
              <div className="mt-2 text-2xl font-black text-amber-600">
                ৳ {formatCurrency(allMonthsData.reduce((sum, m) => sum + m.totalReceivables, 0))}
              </div>
            </div>
          </div>
        </>
      )}

      {!loading && !report && !showAllMonths && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
          No data available for the selected period
        </div>
      )}
    </div>
  );
};

export default RevenueExpenditurePage;
