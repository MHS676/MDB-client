import React, { useEffect, useState } from 'react';
import { financialRecordsAPI } from '../../services/api';

const RevenueTillEndPage = () => {
  const currentYear = 2026;
  const now = new Date();
  const defaultMonth = now.getMonth() + 1;
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

  const [receivedTillDate, setReceivedTillDate] = useState('');
  const [dayValues, setDayValues] = useState([]);

  const toDayValueArray = (breakdown, days) => {
    const values = Array.from({ length: days }, () => '0');

    if (Array.isArray(breakdown)) {
      breakdown.forEach((entry, index) => {
        if (entry && typeof entry === 'object') {
          const dayNumber = Number(entry.day);
          const value = entry.value ?? entry.amount ?? entry.total ?? 0;
          if (dayNumber >= 1 && dayNumber <= days) {
            values[dayNumber - 1] = String(Number(value) || 0);
          } else if (index < days) {
            values[index] = String(Number(value) || 0);
          }
        } else if (index < days) {
          values[index] = String(Number(entry) || 0);
        }
      });
      return values;
    }

    if (breakdown && typeof breakdown === 'object') {
      Object.keys(breakdown).forEach((key) => {
        const dayNumber = Number(key);
        if (dayNumber >= 1 && dayNumber <= days) {
          const entry = breakdown[key];
          const value = entry && typeof entry === 'object' ? (entry.value ?? entry.amount ?? entry.total ?? 0) : entry;
          values[dayNumber - 1] = String(Number(value) || 0);
        }
      });
    }

    return values;
  };

  useEffect(() => {
    const fetchPeriodData = async () => {
      try {
        setLoading(true);
        const data = await financialRecordsAPI.getPeriod(
          String(selectedMonth).padStart(2, '0'),
          String(currentYear)
        );
        const totalDays = new Date(currentYear, selectedMonth, 0).getDate();

        if (data) {
          setReceivedTillDate(String(data.revenueTillEndReceivedCash ?? 0));
          const breakdownValues = toDayValueArray(data.revenueTillEndDailyBreakdown, totalDays);
          setDayValues(breakdownValues);
        } else {
          setReceivedTillDate('0');
          setDayValues(Array.from({ length: totalDays }, () => '0'));
        }
      } catch (err) {
        console.error('Error fetching period data:', err);
        const totalDays = new Date(currentYear, selectedMonth, 0).getDate();
        setDayValues(Array.from({ length: totalDays }, () => '0'));
      } finally {
        setLoading(false);
      }
    };
    fetchPeriodData();
  }, [selectedMonth, currentYear]);

  const handleInputChange = (index, value) => {
    const updatedValues = [...dayValues];
    updatedValues[index] = value;
    setDayValues(updatedValues);
    setError('');
  };

  const handleReset = () => {
    setReceivedTillDate('0');
    setDayValues(dayValues.map(() => '0'));
    setError('');
  };

  const outstandingTillDateTotal = dayValues.reduce((sum, currentValue) => sum + (parseFloat(currentValue) || 0), 0);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      const dailyBreakdown = dayValues.map((value, index) => ({
        day: index + 1,
        value: Number(value) || 0,
      }));

      const payload = {
        month: String(selectedMonth).padStart(2, '0'),
        year: String(currentYear),
        revenueTillEndReceivedCash: parseFloat(receivedTillDate) || 0,
        revenueTillEndOutstandingCash: outstandingTillDateTotal,
        revenueTillEndDailyBreakdown: dailyBreakdown,
      };

      await financialRecordsAPI.save(payload);
      alert('✓ Revenue Till End records saved successfully!');
    } catch (err) {
      console.error('Error saving revenue till end data:', err);
      setError(err.message || 'Failed to save revenue till end data');
      alert('❌ Error: ' + (err.message || 'Failed to save'));
    } finally {
      setLoading(false);
    }
  };

  const midpoint = Math.ceil(dayValues.length / 2);
  const leftColumnDays = dayValues.slice(0, midpoint);
  const rightColumnDays = dayValues.slice(midpoint);

  return (
    // Maximized view bounds to prevent window from shifting or creating scrollbars
    <div className="h-[calc(100vh-140px)] flex flex-col justify-between max-w-6xl mx-auto space-y-3 overflow-hidden select-none">
      
      {/* Header Module */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <p className="text-xs text-slate-400 mt-0.5">Track and balance outstanding values against target logs.</p>
        </div>
        
        <div className="relative">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-1.5 pr-10 text-xs font-bold text-slate-700 shadow-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all cursor-pointer"
          >
            {monthsList.map((m) => (
              <option key={m.value} value={m.value}>{m.name} {currentYear}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 text-[10px]">
            ▼
          </div>
        </div>
      </div>

      {/* Main Container Core */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] p-4 flex flex-col justify-between space-y-3">
        
        {/* Metric Banner */}
        <div className="bg-slate-50/50 rounded-xl border border-slate-100/80 px-4 py-2 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Receivable Received Till Date
          </span>
          <div className="relative w-56">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">৳</span>
            <input
              type="number"
              value={receivedTillDate}
              onChange={(e) => setReceivedTillDate(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-3 py-1 text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Ledger Balance Sheet - Constrained to prevent overflow layout flexes */}
        <div className="bg-slate-50/50 rounded-xl border border-slate-100/80 px-4 py-2 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Receivable Outstanding Till Date
          </span>
          <div className="relative w-56">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">৳</span>
            <input
              type="number"
                value={outstandingTillDateTotal.toFixed(2)}
                readOnly
                className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-3 py-1 text-xs font-bold text-slate-800"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-2 gap-x-8 items-stretch">
          
          {/* Left Split Side */}
          <div className="flex flex-col min-h-0 border-r border-slate-100 pr-4">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pb-1.5 mb-1 border-b border-slate-50">
              <span>Date Tag</span>
              <span>Outstanding Value</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-none">
              {leftColumnDays.map((value, idx) => (
                <div key={idx} className="flex items-center justify-between py-0.5 px-1 hover:bg-slate-50/60 rounded transition-colors">
                  <div className="w-9 bg-slate-50 border border-slate-200/80 text-slate-500 font-mono text-[11px] font-bold py-0.5 rounded text-center shadow-2xs">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div className="relative w-44">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]">৳</span>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handleInputChange(idx, e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-md pl-6 pr-2 py-0.5 text-xs outline-none focus:border-emerald-500 transition-all font-semibold text-slate-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Split Side */}
          <div className="flex flex-col min-h-0 pl-4">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pb-1.5 mb-1 border-b border-slate-50">
              <span>Date Tag</span>
              <span>Outstanding Value</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-none">
              {rightColumnDays.map((value, idx) => {
                const globalIndex = midpoint + idx;
                return (
                  <div key={globalIndex} className="flex items-center justify-between py-0.5 px-1 hover:bg-slate-50/60 rounded transition-colors">
                    <div className="w-9 bg-slate-50 border border-slate-200/80 text-slate-500 font-mono text-[11px] font-bold py-0.5 rounded text-center shadow-2xs">
                      {String(globalIndex + 1).padStart(2, '0')}
                    </div>
                    <div className="relative w-44">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]">৳</span>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => handleInputChange(globalIndex, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-md pl-6 pr-2 py-0.5 text-xs outline-none focus:border-emerald-500 transition-all font-semibold text-slate-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Flat Action Bar */}
      <div className="flex justify-end gap-3 items-center shrink-0">
        {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
        <button 
          onClick={handleReset}
          disabled={loading}
          className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-100 transition-all disabled:opacity-50"
        >
          Reset
        </button>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="px-5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

    </div>
  );
};

export default RevenueTillEndPage;