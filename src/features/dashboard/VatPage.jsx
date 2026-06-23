import React, { useState, useEffect } from 'react';
import { financialRecordsAPI } from '../../services/api';

const VatCompliancePage = () => {
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

  const [formData, setFormData] = useState({
    accrued: '',
    received: '',
    paid: '',
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
            accrued: data.vatAccruedCash || '',
            received: data.vatAccruedBank || '', // map received to vatAccruedBank as per save payload
            paid: data.vatPaidCash || '',
          });
        } else {
          setFormData({ accrued: '', received: '', paid: '' });
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
    setFormData({ accrued: '', received: '', paid: '' });
    setError('');
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      const payload = {
        month: String(selectedMonth + 1).padStart(2, '0'),
        year: String(currentYear),
        vatAccruedCash: parseFloat(formData.accrued) || 0,
        vatAccruedBank: parseFloat(formData.received) || 0,
        vatPaidCash: parseFloat(formData.paid) || 0,
      };

      await financialRecordsAPI.save(payload);
      alert('✓ VAT records saved successfully!');
      handleReset();
    } catch (err) {
      console.error('Error saving VAT data:', err);
      setError(err.message || 'Failed to save VAT data');
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
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">VAT Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">Log monthly accrued balances, financial receipts, and payout indicators.</p>
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
          
          {/* Field 1: Accrued */}
          <div className="flex items-center justify-between gap-6">
            <label className="text-sm font-bold text-slate-600 uppercase tracking-wider w-24">
              Accrued
            </label>
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">৳</span>
              <input
                type="number"
                value={formData.accrued}
                onChange={(e) => handleInputChange('accrued', e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Field 2: Received */}
          <div className="flex items-center justify-between gap-6">
            <label className="text-sm font-bold text-slate-600 uppercase tracking-wider w-24">
              Received
            </label>
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">৳</span>
              <input
                type="number"
                value={formData.received}
                onChange={(e) => handleInputChange('received', e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Field 3: Paid */}
          <div className="flex items-center justify-between gap-6">
            <label className="text-sm font-bold text-slate-600 uppercase tracking-wider w-24">
              Paid
            </label>
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">৳</span>
              <input
                type="number"
                value={formData.paid}
                onChange={(e) => handleInputChange('paid', e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0.00"
              />
            </div>
          </div>

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

export default VatCompliancePage;