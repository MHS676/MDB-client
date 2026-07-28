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
  const [dailyEntries, setDailyEntries] = useState([]);
  const [receivedBeforePeriod, setReceivedBeforePeriod] = useState({ cash: 0, bank: 0 });
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
        const savedEntries = Array.isArray(data?.selectedRecord?.revenueTillEndDailyBreakdown)
          ? data.selectedRecord.revenueTillEndDailyBreakdown
          : [];
        // Retain existing cumulative data as one editable entry when opening an
        // old record for the first time.
        const legacyCash = asNumber(data?.selectedRecord?.revenueTillEndReceivedCash);
        const legacyBank = asNumber(data?.selectedRecord?.revenueTillEndReceivedBank);
        const entries = savedEntries.length > 0 ? savedEntries.map((entry) => ({
          ...entry,
          cash: asNumber(entry.cash) || '',
          bank: asNumber(entry.bank) || '',
        })) : (
          legacyCash || legacyBank
            ? [{ date: `${currentYear}-${String(selectedMonth).padStart(2, '0')}-01`, cash: legacyCash, bank: legacyBank }]
            : []
        );
        setDailyEntries(entries);
        const periodCash = entries.reduce((sum, entry) => sum + asNumber(entry.cash), 0);
        const periodBank = entries.reduce((sum, entry) => sum + asNumber(entry.bank), 0);
        setReceivedBeforePeriod({
          cash: Math.max(0, asNumber(metrics?.receivableReceivedCashTillDate) - periodCash),
          bank: Math.max(0, asNumber(metrics?.receivableReceivedBankTillDate) - periodBank),
        });
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
  const periodReceivedCash = useMemo(() => dailyEntries.reduce((sum, entry) => sum + asNumber(entry.cash), 0), [dailyEntries]);
  const periodReceivedBank = useMemo(() => dailyEntries.reduce((sum, entry) => sum + asNumber(entry.bank), 0), [dailyEntries]);
  const receivedCash = receivedBeforePeriod.cash + periodReceivedCash;
  const receivedBank = receivedBeforePeriod.bank + periodReceivedBank;
  const receivedTillDate = receivedCash + receivedBank;
  const receivableOutstanding = useMemo(() => totalReceivables - receivedTillDate, [totalReceivables, receivedTillDate]);

  const updateEntry = (index, field, value) => {
    setDailyEntries((entries) => entries.map((entry, entryIndex) => (
      entryIndex === index ? { ...entry, [field]: value } : entry
    )));
    setError('');
  };

  const addEntry = () => {
    setDailyEntries((entries) => [...entries, {
      date: '', cash: '', bank: '',
    }]);
  };

  const periodStart = `${currentYear}-${String(selectedMonth).padStart(2, '0')}-01`;
  const periodEnd = `${currentYear}-${String(selectedMonth).padStart(2, '0')}-${String(new Date(currentYear, selectedMonth, 0).getDate()).padStart(2, '0')}`;

  const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  const handleSave = async () => {
    if (receivedTillDate > totalReceivables) {
      setError('Received till date cannot be greater than total receivables.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await financialRecordsAPI.save({
        month: String(selectedMonth).padStart(2, '0'),
        year: String(currentYear),
        revenueTillEndDailyBreakdown: dailyEntries.map((entry) => ({
          date: entry.date,
          cash: asNumber(entry.cash),
          bank: asNumber(entry.bank),
        })),
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
        {/* <p className="text-xs text-slate-500">Record each day’s collection by cash and bank. Outstanding is calculated automatically.</p> */}
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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Daily Receivable Received</span>
            <button type="button" onClick={addEntry} className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50">+ Add day</button>
          </div>
          <div className="grid grid-cols-[1.1fr_1fr_1fr_auto] gap-2  text-[12px] font-bold uppercase tracking-wider text-slate-400">
            <span>Date</span><span className="">Cash</span><span className="">Bank</span><span />
          </div>
          {dailyEntries.length === 0 ? (
            <p className="rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-500">No daily collections entered for this month.</p>
          ) : dailyEntries.map((entry, index) => (
            <div key={`${entry.date}-${index}`} className="grid grid-cols-[1.1fr_1fr_1fr_auto] gap-2">
              <input type="date" min={periodStart} max={periodEnd} value={entry.date} onChange={(e) => updateEntry(index, 'date', e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500" />
              <input type="number" placeholder="0.00"  value={entry.cash} onChange={(e) => updateEntry(index, 'cash', e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-right text-sm font-bold text-slate-800 outline-none focus:border-emerald-500" placeholder="0.00" />
              <input type="number" placeholder="0.00" value={entry.bank} onChange={(e) => updateEntry(index, 'bank', e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-right text-sm font-bold text-slate-800 outline-none focus:border-emerald-500" placeholder="0.00" />
              <button type="button" onClick={() => setDailyEntries((entries) => entries.filter((_, entryIndex) => entryIndex !== index))} className="px-2 text-xs font-bold text-rose-500 hover:text-rose-700">Remove</button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm">
          <div><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Cash Till Date</span><span className="font-black text-emerald-700">৳ {formatCurrency(receivedCash)}</span></div>
          <div><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Bank Till Date</span><span className="font-black text-emerald-700">৳ {formatCurrency(receivedBank)}</span></div>
          <div className="text-right"><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Received Till Date</span><span className="font-black text-emerald-700">৳ {formatCurrency(receivedTillDate)}</span></div>
        </div>

        <div className="flex items-center justify-between gap-6 rounded-xl bg-slate-50 px-4 py-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Receivable Outstanding Till Date</span>
          <span className={`text-xl font-black ${receivableOutstanding < 0 ? 'text-rose-600' : 'text-slate-900'}`}>৳ {formatCurrency(receivableOutstanding)}</span>
        </div>

        {/* <p className="text-xs text-slate-500">Formula: Total Receivables − (daily cash + daily bank) = Receivable Outstanding Till Date.</p> */}
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
