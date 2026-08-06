import React from 'react';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const ExpenditureTable = ({ records, onEdit, onDelete, loading }) => {
  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">Loading records...</div>;
  }

  if (!records.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
        No expenditure records yet. Create one to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-3 py-3 text-left font-semibold text-slate-600">Date</th>
            <th className="px-3 py-3 text-left font-semibold text-slate-600">Escort</th>
            <th className="px-3 py-3 text-left font-semibold text-slate-600">Van</th>
            <th className="px-3 py-3 text-left font-semibold text-slate-600">Received</th>
            <th className="px-3 py-3 text-left font-semibold text-slate-600">Expenditure</th>
            <th className="px-3 py-3 text-left font-semibold text-slate-600">Surplus</th>
            <th className="px-3 py-3 text-left font-semibold text-slate-600">Remarks</th>
            <th className="px-3 py-3 text-right font-semibold text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {records.map((record) => {
            const isPositive = Number(record.surplusDue || 0) >= 0;
            return (
              <tr key={record.id} className="align-top">
                <td className="whitespace-nowrap px-3 py-3 text-slate-700">{formatDate(record.date)}</td>
                <td className="whitespace-nowrap px-3 py-3 text-slate-700">{record.totalEscort ?? 0}</td>
                <td className="whitespace-nowrap px-3 py-3 text-slate-700">{record.coverVan ?? 0}</td>
                <td className="whitespace-nowrap px-3 py-3 text-slate-700">{formatCurrency(record.receivedAmount)}</td>
                <td className="whitespace-nowrap px-3 py-3 text-slate-700">{formatCurrency(record.expenditure)}</td>
                <td className={`whitespace-nowrap px-3 py-3 font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatCurrency(record.surplusDue)}
                </td>
                <td className="max-w-[220px] px-3 py-3 text-slate-600">
                  {record.remarks || '—'}
                </td>
                <td className="px-3 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(record)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(record.id)}
                      className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenditureTable;
