import { useEffect, useMemo, useState } from 'react';
import { financialRecordsAPI } from '../../services/api';

const monthsList = [
  { value: 1, name: 'January' }, { value: 2, name: 'February' },
  { value: 3, name: 'March' }, { value: 4, name: 'April' },
  { value: 5, name: 'May' }, { value: 6, name: 'June' },
  { value: 7, name: 'July' }, { value: 8, name: 'August' },
  { value: 9, name: 'September' }, { value: 10, name: 'October' },
  { value: 11, name: 'November' }, { value: 12, name: 'December' },
];

const asNumber = (value) => Number(value) || 0;

const RevenueTillEndPage = () => {
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [receivedTillDate, setReceivedTillDate] = useState('0');
  const [sourceValues, setSourceValues] = useState({ recurring: 0, billedOutstanding: 0, sources: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPeriodData = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await financialRecordsAPI.getExecutiveReport(
          String(selectedMonth).padStart(2, '0'),
          String(currentYear),
        );

        const metrics = data?.metrics;
        const received = asNumber(metrics?.receivableReceivedTillDate);
        setReceivedTillDate(String(received));
        setSourceValues({
          recurring: asNumber(metrics?.recurringMonthlyRevenueBilled),
          billedOutstanding: asNumber(metrics?.outstandingRevenueBilled),
          sources: data?.raw?.sources || null,
        });
      } catch (err) {
        console.error('Error fetching period data:', err);
        setError(err.message || 'Failed to load receivable data');
      } finally {
        setLoading(false);
      }
    };

    fetchPeriodData();
  }, [selectedMonth, currentYear]);

  const totalReceivables = sourceValues.recurring + sourceValues.billedOutstanding;
  const receivableOutstanding = useMemo(
    () => totalReceivables - asNumber(receivedTillDate),
    [totalReceivables, receivedTillDate],
  );

  const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  const handleSave = async () => {
    const received = asNumber(receivedTillDate);
    if (received > totalReceivables) {
      setError('Received till date cannot be greater than total receivables.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await financialRecordsAPI.save({
        month: String(selectedMonth).padStart(2, '0'),
        year: String(currentYear),
        // Store the entered cumulative amount in one place. Keeping bank at
        // zero prevents an old bank value from being counted a second time.
        revenueTillEndReceivedCash: received,
        revenueTillEndReceivedBank: 0,
      });
      alert('✓ Receivable received till date saved successfully!');
    } catch (err) {
      console.error('Error saving receivable data:', err);
      setError(err.message || 'Failed to save receivable data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">Record cumulative collections. Outstanding is calculated automatically.</p>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 shadow-sm outline-none"
        >
          {monthsList.map((month) => <option key={month.value} value={month.value}>{month.name} {currentYear}</option>)}
        </select>
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between gap-6 border-b border-slate-100 pb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Receivables</span>
          <span className="text-xl font-black text-rose-500">৳ {formatCurrency(totalReceivables)}</span>
        </div>

        <p className="text-xs text-slate-400">
          Revenue source: {sourceValues.sources?.recurringMonthlyRevenueBilled
            ? `${sourceValues.sources.recurringMonthlyRevenueBilled.month}/${sourceValues.sources.recurringMonthlyRevenueBilled.year}`
            : 'not entered'}
          {' · '}Outstanding-bill source: {sourceValues.sources?.outstandingRevenueBilled
            ? `${sourceValues.sources.outstandingRevenueBilled.month}/${sourceValues.sources.outstandingRevenueBilled.year}`
            : 'not entered'}
        </p>

        <label className="flex items-center justify-between gap-6">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Receivable Received Till Date</span>
          <span className="relative w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">৳</span>
            <input
              type="number"
              min="0"
              value={receivedTillDate}
              onChange={(e) => { setReceivedTillDate(e.target.value); setError(''); }}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-right text-sm font-bold text-slate-800 outline-none focus:border-emerald-500"
              placeholder="0.00"
            />
          </span>
        </label>

        <div className="flex items-center justify-between gap-6 rounded-xl bg-slate-50 px-4 py-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Receivable Outstanding Till Date</span>
          <span className={`text-xl font-black ${receivableOutstanding < 0 ? 'text-rose-600' : 'text-slate-900'}`}>৳ {formatCurrency(receivableOutstanding)}</span>
        </div>

        <p className="text-xs text-slate-500">Formula: Total Receivables − Receivable Received Till Date = Receivable Outstanding Till Date.</p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default RevenueTillEndPage;
