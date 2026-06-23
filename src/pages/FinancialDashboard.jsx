const handleSave = async () => {
  try {
    // 1. Gather your values safely.
    // Replace 'recurringRevenueBilled' and 'dailyBreakdown' with the EXACT state variables you use to manage your inputs.
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
      month: selectedMonthName || "June", // Ensure this evaluates to a pure string name
      year: "2026",
      revenueBilledRecurringMonthly: recurringMonthly,
      revenueBilledReceivedCash: totalReceivedCash,
      revenueBilledReceivedBank: totalReceivedBank,
      revenueBilledOutstandingCash: 0,
      revenueBilledOutstandingBank: 0
    };

    // 3. Resolve API URL cleanly from your working Vite .env configuration
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    console.log("Sending payload to NestJS backend:", payload);

    const response = await fetch(`${API_BASE}/financial-records/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-jwt-token-string-xyz-replace-with-real-jwt-sign'
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
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