import { useState, useEffect } from 'react';
import { financialRecordsAPI } from '../../services/api';

const RevenueBilledPage = () => {
  const currentYear = 2026;
  const now = new Date();
  const defaultMonth = now.getMonth() + 1; // 1..12
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const monthsList = [
    { value: 1, name: 'January' }, { value: 2, name: 'February' },
    { value: 3, name: 'March' }, { value: 4, name: 'April' },
    { value: 5, name: 'May' }, { value: 6, name: 'June' },
    { value: 7, name: 'July' }, { value: 8, name: 'August' },
    { value: 9, name: 'September' }, { value: 10, name: 'October' },
    { value: 11, name: 'November' }, { value: 12, name: 'December' },
  ];

  const [formData, setFormData] = useState({ recurringMonthly: '', outstandingBilled: '' });

  useEffect(() => {
    const fetchPeriodData = async () => {
      try {
        setLoading(true);
        const data = await financialRecordsAPI.getPeriod(
          String(selectedMonth).padStart(2, '0'),
          String(currentYear)
        );
        if (data) {
          const recurring = data.revenueBilledRecurringMonthly ?? 0;
          const outstandingTotal = (Number(data.revenueBilledOutstandingCash ?? 0) + Number(data.revenueBilledOutstandingBank ?? 0));
          setFormData({
            recurringMonthly: String(recurring),
            outstandingBilled: String(outstandingTotal)
          });
        } else {
          setFormData({ recurringMonthly: '0', outstandingBilled: '0' });
        }
      } catch (err) {
        console.error('Error fetching period data:', err);
        setError(err.message || 'Failed to load revenue billed data');
      } finally {
        setLoading(false);
      }
    };
    fetchPeriodData();
  }, [selectedMonth, currentYear]);

  const handleReset = () => {
    setFormData({ recurringMonthly: '0', outstandingBilled: '0' });
    setError('');
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      const payload = {
        month: String(selectedMonth).padStart(2, '0'),
        year: String(currentYear),
        revenueBilledRecurringMonthly: parseFloat(formData.recurringMonthly) || 0,
        revenueBilledOutstandingCash: parseFloat(formData.outstandingBilled) || 0,
        // split outstanding into bank/cash not captured separately in UI — put total into cash and keep bank 0
        revenueBilledOutstandingBank: 0,
      };

      await financialRecordsAPI.save(payload);
      alert('✓ Revenue Billed records saved successfully!');
      handleReset();
    } catch (err) {
      console.error('Error saving revenue billed data:', err);
      setError(err.message || 'Failed to save revenue billed data');
      alert('❌ Error: ' + (err.message || 'Failed to save'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col justify-between max-w-7xl mx-auto space-y-2">
      
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Track outstanding balances by day in a calendar view.</p>
        </div>
        
        <div className="relative">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-slate-700 shadow-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all cursor-pointer"
          >
            {monthsList.map((m) => (
              <option key={m.value} value={m.value}>{m.name} {currentYear}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 text-xs">
            ▼
          </div>
        </div>
      </div>

      {/* Top Metric Field Row */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] p-4 flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Recurring Monthly Revenue Billed 
        </label>
        <div className="relative w-64">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">৳</span>
          <input
            type="number"
            value={formData.recurringMonthly}
            onChange={(e) => setFormData({ ...formData, recurringMonthly: e.target.value })}
            className="w-full bg-slate-50/50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-slate-800 font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="0.00"
          />
        </div>
      </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] p-4 flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Outstanding Revenue Billed 
        </label>
        <div className="relative w-64">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">৳</span>
          <input
            type="number"
            value={formData.outstandingBilled}
                  onChange={(e) => setFormData({ ...formData, outstandingBilled: e.target.value })}
            className="w-full bg-slate-50/50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-slate-800 font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Simplified Flat Actions Footer */}
      <div className="flex justify-end gap-3 items-center pt-1">
        {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
        <button 
          onClick={handleReset}
          disabled={loading}
          className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:bg-slate-100 transition-all disabled:opacity-50"
        >
          Reset
        </button>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="px-5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

    </div>
  );
};

export default RevenueBilledPage;
