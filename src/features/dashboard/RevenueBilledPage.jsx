import React, { useState, useEffect } from 'react';
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
  const [rows, setRows] = useState([]);

  // Recalculate day rows when month changes and fetch data
  useEffect(() => {
    const fetchPeriodData = async () => {
      try {
        setLoading(true);
        const data = await financialRecordsAPI.getPeriod(
          String(selectedMonth).padStart(2, '0'),
          String(currentYear)
        );
        const totalDays = new Date(currentYear, selectedMonth, 0).getDate();
        const initialRows = Array.from({ length: totalDays }, () => ({ cash: '', bank: '' }));

        if (data) {
          const recurring = data.revenueBilledRecurringMonthly ?? '';
          const outstandingTotal = (Number(data.revenueBilledOutstandingCash ?? 0) + Number(data.revenueBilledOutstandingBank ?? 0));
          setFormData({
            recurringMonthly: String(recurring),
            outstandingBilled: outstandingTotal ? String(outstandingTotal) : ''
          });
          // If there were received amounts, populate day 1 with them (keep as strings for controlled inputs)
          if ((data.revenueBilledReceivedCash ?? 0) !== 0 || (data.revenueBilledReceivedBank ?? 0) !== 0) {
            initialRows[0] = {
              cash: String(data.revenueBilledReceivedCash ?? ''),
              bank: String(data.revenueBilledReceivedBank ?? '')
            };
          }
        } else {
          setFormData({ recurringMonthly: '', outstandingBilled: '' });
        }
        setRows(initialRows);
        } catch (err) {
        console.error('Error fetching period data:', err);
        const totalDays = new Date(currentYear, selectedMonth, 0).getDate();
        setRows(Array.from({ length: totalDays }, () => ({ cash: '', bank: '' })));
      } finally {
        setLoading(false);
      }
    };
    fetchPeriodData();
  }, [selectedMonth, currentYear]);

  const handleRowChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
    setError('');
  };

  const handleReset = () => {
    setFormData({ recurringMonthly: '', outstandingBilled: '' });
    const totalDays = new Date(currentYear, selectedMonth, 0).getDate();
    setRows(Array.from({ length: totalDays }, () => ({ cash: '', bank: '' })));
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
        revenueBilledReceivedCash: rows.reduce((sum, r) => sum + (parseFloat(r.cash) || 0), 0),
        revenueBilledReceivedBank: rows.reduce((sum, r) => sum + (parseFloat(r.bank) || 0), 0),
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
          Recurring Monthly Revenue Billed ({monthsList[selectedMonth].name})
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
          Outstanding Revenue Billed ({monthsList[selectedMonth].name})
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

      {/* Responsive One-Page Grid Workspace */}
      {/* <div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] p-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Outstanding Revenue Billed</h2>

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2 h-full content-start">
          {rows.map((row, i) => (
            <div 
              key={i} 
              className="bg-slate-50/60 rounded-lg p-2 border border-slate-100 flex flex-col justify-between hover:bg-white hover:border-emerald-200 hover:shadow-md hover:shadow-slate-100 transition-all duration-150"
            >
              <div className="text-[10px] font-mono font-bold text-slate-400 mb-1">
                Day {String(i + 1).padStart(2, '0')}
              </div>
              
              <div className="space-y-1">
                <input
                  type="number"
                  placeholder="Cash"
                  value={row.cash}
                  onChange={(e) => handleRowChange(i, 'cash', e.target.value)}
                  className="w-full bg-white border border-slate-200/80 rounded px-1.5 py-0.5 text-[11px] outline-none text-slate-700 focus:border-emerald-500 font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <input
                  type="number"
                  placeholder="Bank"
                  value={row.bank}
                  onChange={(e) => handleRowChange(i, 'bank', e.target.value)}
                  className="w-full bg-white border border-slate-200/80 rounded px-1.5 py-0.5 text-[11px] outline-none text-slate-700 focus:border-emerald-500 font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div> */}

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