import React from 'react';

const inputClassName =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const ExpenditureForm = ({
  formData,
  onFieldChange,
  onSubmit,
  onCancel,
  isSubmitting,
  isEditing,
  computedSurplus,
}) => {
  const handleChange = (field) => (event) => {
    onFieldChange(field, event.target.value);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {isEditing ? 'Edit expenditure record' : 'Create expenditure record'}
          </h3>
          <p className="text-sm text-slate-500">
            Surplus/due is calculated automatically from received amount minus expenditure.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-600">
          <span>Date</span>
          <input
            type="date"
            value={formData.date}
            onChange={handleChange('date')}
            className={inputClassName}
            required
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-600">
          <span>Total Escort</span>
          <input
            type="number"
            min="0"
            value={formData.totalEscort}
            onChange={handleChange('totalEscort')}
            className={inputClassName}
            placeholder="0"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-600">
          <span>Cover Van</span>
          <input
            type="number"
            min="0"
            value={formData.coverVan}
            onChange={handleChange('coverVan')}
            className={inputClassName}
            placeholder="0"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-600">
          <span>Received Amount</span>
          <input
            type="number"
            min="0"
            value={formData.receivedAmount}
            onChange={handleChange('receivedAmount')}
            className={inputClassName}
            placeholder="0"
            required
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-600">
          <span>Expenditure</span>
          <input
            type="number"
            min="0"
            value={formData.expenditure}
            onChange={handleChange('expenditure')}
            className={inputClassName}
            placeholder="0"
            required
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-600">
          <span>Source File</span>
          <input
            type="text"
            value={formData.sourceFile}
            onChange={handleChange('sourceFile')}
            className={inputClassName}
            placeholder="e.g. invoice-001.pdf"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-600 md:col-span-2">
          <span>Remarks</span>
          <textarea
            rows="3"
            value={formData.remarks}
            onChange={handleChange('remarks')}
            className={inputClassName}
            placeholder="Add a short note about this entry"
          />
        </label>
      </div>

      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-emerald-800">Computed surplus / due</p>
            <p className="text-xs text-emerald-700">
              Received amount minus expenditure
            </p>
          </div>
          <span
            className={`text-lg font-bold ${computedSurplus >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}
          >
            {formatCurrency(computedSurplus)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {isEditing ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update record' : 'Create record'}
        </button>
      </div>
    </form>
  );
};

export default ExpenditureForm;
