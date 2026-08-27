import { financialRecordsAPI } from '../services/api';

const handleSave = async () => {
  try {
    // 1. Gather your values safely.
    const recurringMonthly = parseFloat(recurringRevenueBilled) || 0; 
    
    let totalReceivedCash = 0;
    let totalReceivedBank = 0;

    // Iterate through your data array or object to get the sum
    if (Array.isArray(dailyBreakdown)) {
      dailyBreakdown.forEach(day => {
        totalReceivedCash += parseFloat(day.cash) || 0;
        totalReceivedBank += parseFloat(day.bank) || 0;
      });
    } else if (dailyBreakdown && typeof dailyBreakdown === 'object') {
      Object.keys(dailyBreakdown).forEach(dayKey => {
        totalReceivedCash += parseFloat(dailyBreakdown[dayKey].cash) || 0;
        totalReceivedBank += parseFloat(dailyBreakdown[dayKey].bank) || 0;
      });
    }

    // 2. Build the precise payload the NestJS DTO demands
    const payload = {
      month: selectedMonthName || "June",
      year: "2026",
      revenueBilledRecurringMonthly: recurringMonthly,
      revenueBilledReceivedCash: totalReceivedCash,
      revenueBilledReceivedBank: totalReceivedBank,
      revenueBilledOutstandingCash: 0,
      revenueBilledOutstandingBank: 0
    };

    console.log("Sending payload to NestJS backend:", payload);

    // 3. Use the professional API service instead of hardcoded fetch
    const result = await financialRecordsAPI.save(payload);
    
    if (result && result.success) {
      alert('✓ Financial metrics written to PostgreSQL database successfully!');
    } else {
      console.error('Backend validation rejection packet:', result);
      alert(`Could not save: ${result.message || 'Validation Failure'}`);
    }
  } catch (error) {
    console.error('Network execution failure:', error);
    alert('An execution error occurred. Check your web browser inspection console.');
  }
};