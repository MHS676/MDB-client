import React, { useEffect, useMemo, useState } from 'react';
import ExpenditureAnalytics from '../../components/expenditure/ExpenditureAnalytics';
import ExpenditureForm from '../../components/expenditure/ExpenditureForm';
import ExpenditureTable from '../../components/expenditure/ExpenditureTable';
import { expenditureAPI } from '../../services/api';

const createInitialFormState = () => {
  const today = new Date().toISOString().slice(0, 10);
  return {
    date: today,
    totalEscort: '',
    coverVan: '',
    receivedAmount: '',
    expenditure: '',
    remarks: '',
    sourceFile: '',
  };
};

const normalizeRecords = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.records)) return data.records;
  return [];
};

const EscortExpenditureSummaryPage = () => {
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState(createInitialFormState());
  const [editingId, setEditingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [chartType, setChartType] = useState('pie');

  const computedSurplus = useMemo(() => {
    return (Number(formData.receivedAmount) || 0) - (Number(formData.expenditure) || 0);
  }, [formData.receivedAmount, formData.expenditure]);

  const loadRecords = async () => {
    try {
      setIsLoading(true);
      const payload = await expenditureAPI.getAll();
      setRecords(normalizeRecords(payload));
    } catch (error) {
      setStatusMessage(error.message || 'Unable to load escort expenditure records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const resetForm = () => {
    setFormData(createInitialFormState());
    setEditingId(null);
    setIsEditing(false);
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setStatusMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');

    try {
      const payload = {
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        totalEscort: Number(formData.totalEscort) || 0,
        coverVan: Number(formData.coverVan) || 0,
        receivedAmount: Number(formData.receivedAmount) || 0,
        expenditure: Number(formData.expenditure) || 0,
        surplusDue: computedSurplus,
        remarks: formData.remarks.trim() || null,
        sourceFile: formData.sourceFile.trim() || null,
      };

      if (isEditing && editingId) {
        await expenditureAPI.update(editingId, payload);
        setStatusMessage('Escort expenditure record updated successfully.');
      } else {
        await expenditureAPI.create(payload);
        setStatusMessage('Escort expenditure record created successfully.');
      }

      resetForm();
      await loadRecords();
    } catch (error) {
      setStatusMessage(error.message || 'Unable to save escort expenditure record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setIsEditing(true);
    setFormData({
      date: record.date ? new Date(record.date).toISOString().slice(0, 10) : createInitialFormState().date,
      totalEscort: record.totalEscort ?? '',
      coverVan: record.coverVan ?? '',
      receivedAmount: record.receivedAmount ?? '',
      expenditure: record.expenditure ?? '',
      remarks: record.remarks ?? '',
      sourceFile: record.sourceFile ?? '',
    });
    setStatusMessage('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this escort expenditure record?')) return;

    try {
      setIsSubmitting(true);
      await expenditureAPI.delete(id);
      setStatusMessage('Escort expenditure record deleted successfully.');
      await loadRecords();
    } catch (error) {
      setStatusMessage(error.message || 'Unable to delete escort expenditure record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRecords = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return records;

    return records.filter((record) => {
      const haystack = [
        record.remarks,
        record.sourceFile,
        record.date,
        record.totalEscort,
        record.coverVan,
        record.receivedAmount,
        record.expenditure,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [records, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Escort expenditure summary</h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage escort expenditure records and monitor received amount, spend, and surplus trends.
            </p>
          </div>
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            Escort CRUD dashboard
          </div>
        </div>

        <div className="mt-6">
          <ExpenditureForm
            formData={formData}
            onFieldChange={handleFieldChange}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            isSubmitting={isSubmitting}
            isEditing={isEditing}
            computedSurplus={computedSurplus}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Falcon executive view</h3>
            <p className="text-sm text-slate-500">Review summary cards and trend charts separately from the entry form.</p>
          </div>
          {statusMessage ? <p className="text-sm text-emerald-600">{statusMessage}</p> : null}
        </div>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <span className="font-medium">Search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search remarks, file, amount or date"
              className="w-full bg-transparent outline-none"
            />
          </label>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <span>Chart</span>
            <select
              value={chartType}
              onChange={(event) => setChartType(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none"
            >
              <option value="pie">Income vs expenditure</option>
              <option value="line">Trend over time</option>
            </select>
          </label>
        </div>
        <ExpenditureAnalytics records={filteredRecords} chartType={chartType} />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Escort records</h3>
            <p className="text-sm text-slate-500">Edit or remove any saved escort expenditure entry.</p>
          </div>
        </div>
        <ExpenditureTable records={records} onEdit={handleEdit} onDelete={handleDelete} loading={isLoading} />
      </div>
    </div>
  );
};

export default EscortExpenditureSummaryPage;