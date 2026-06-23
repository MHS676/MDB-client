import React, { useState, useEffect } from 'react';
import { financialRecordsAPI } from '../../services/api';

const ExpenditurePage = () => {
  const currentYear = 2026;
  const [selectedMonth, setSelectedMonth] = useState(5); // Default to June
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const monthsList = [
    { value: 0, name: 'January' }, { value: 1, name: 'February' },
    { value: 2, name: 'March' }, { value: 3, name: 'April' },
    { value: 4, name: 'May' }, { value: 5, name: 'June' },
    { value: 6, name: 'July' }, { value: 7, name: 'August' },
    { value: 8, name: 'September' }, { value: 9, name: 'October' },
    { value: 10, name: 'November' }, { value: 11, name: 'December' },
  ];

  // Refactored state keys for expenditure tracking
  const [formData, setFormData] = useState({
    budgeted: '',
    actual: '',
  });

  useEffect(() => {
    const fetchPeriodData = async () => {
      try {
        setLoading(true);
        const data = await financialRecordsAPI.getPeriod(
          String(selectedMonth + 1).padStart(2, '0'),
          String(currentYear)
        );
        if (data) {
          setFormData({
            budgeted: data.expenditureBudgetedCash || '',
            actual: data.expenditureActualCash || '',
          });
        } else {
          handleReset();
        }
      } catch (err) {
        console.error('Error fetching period data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPeriodData();
  }, [selectedMonth, currentYear]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleReset = () => {
    setFormData({ budgeted: '', actual: '' });
    setError('');
  };

  // Real-time calculation mechanics
  const budgetedNum = parseFloat(formData.budgeted) || 0;
  const actualNum = parseFloat(formData.actual) || 0;
  const variance = budgetedNum - actualNum;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(val));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      const payload = {
        month: String(selectedMonth + 1).padStart(2, '0'),
        year: String(currentYear),
        expenditureBudgetedCash: budgetedNum || 0,
        expenditureActualCash: actualNum || 0,
      };

      await financialRecordsAPI.save(payload);
      alert('✓ Expenditure records saved successfully!');
      handleReset();
    } catch (err) {
      console.error('Error saving expenditure data:', err);
      setError(err.message || 'Failed to save expenditure data');
      alert('❌ Error: ' + (err.message || 'Failed to save'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col justify-between max-w-4xl mx-auto space-y-4 overflow-hidden select-none">
      
      {/* Header Controller Section */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Expenditure Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">Log monthly operational budgets and calculate variances against target spending.</p>
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

      {/* Main Single-Page Workspace Form Card */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] p-8 flex flex-col justify-center items-center">
        
        <div className="w-full max-w-lg space-y-6">
          
          {/* Field 1: Budgeted Expenditure */}
          <div className="flex items-center justify-between gap-6">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider w-36">
              Budgeted
            </label>
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">৳</span>
              <input
                type="number"
                value={formData.budgeted}
                onChange={(e) => handleInputChange('budgeted', e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0,000,000.00"
              />
            </div>
          </div>

          {/* Field 2: Actual Expenditure */}
          <div className="flex items-center justify-between gap-6">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider w-36">
              Actual (Till Date)
            </label>
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">৳</span>
              <input
                type="number"
                value={formData.actual}
                onChange={(e) => handleInputChange('actual', e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0,000,000.00"
              />
            </div>
          </div>

          {/* <hr className="border-dashed border-slate-200" /> */}

          {/* Calculated Output Indicator: Expenditure Variance */}
          {/* <div className="flex items-center justify-between gap-6 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Variance (+/-)
            </span>
            <div className={`text-base font-black px-1 ${variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {variance >= 0 ? '+ ' : '- '}৳ {formatCurrency(variance)}
            </div>
          </div> */}

        </div>

      </div>

      {/* Footer Interface controls */}
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

export default ExpenditurePage;