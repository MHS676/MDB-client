import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatChartLabel = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const ExpenditureAnalytics = ({ records, chartType = 'pie' }) => {
  const totalReceived = records.reduce((sum, record) => sum + Number(record.receivedAmount || 0), 0);
  const totalExpenditure = records.reduce((sum, record) => sum + Number(record.expenditure || 0), 0);
  const netBalance = totalReceived - totalExpenditure;

  const pieData = [
    { name: 'Received', value: totalReceived },
    { name: 'Expenditure', value: totalExpenditure },
  ];

  const lineData = [...records]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((record) => ({
      name: formatChartLabel(record.date),
      receivedAmount: Number(record.receivedAmount || 0),
      expenditure: Number(record.expenditure || 0),
    }));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Income</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(totalReceived)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Expenditure</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(totalExpenditure)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Net balance</p>
          <p className={`mt-2 text-xl font-semibold ${netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(netBalance)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700">
          {chartType === 'line' ? 'Trend over time' : 'Income vs expenditure'}
        </h3>
        <div className="mt-4 h-72">
          {records.length ? (
            chartType === 'line' ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="receivedAmount" stroke="#10b981" strokeWidth={2} name="Received" />
                  <Line type="monotone" dataKey="expenditure" stroke="#f59e0b" strokeWidth={2} name="Expenditure" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={55} paddingAngle={2}>
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
              No matching records to display.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenditureAnalytics;
