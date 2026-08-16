import React, { useEffect, useMemo, useState } from 'react';
import ExpenditureAnalytics from '../../components/expenditure/ExpenditureAnalytics';
import ExpenditureTable from '../../components/expenditure/ExpenditureTable';
import { expenditureAPI } from '../../services/api';

const normalizeRecords = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.records)) return data.records;
  return [];
};

// Blank source files are deliberately excluded from the selector, so an empty
// value is a collision-free "all" option (unlike a real filename such as "all").
const ALL_SOURCE_FILES = '';

// Expenditures represent a business date, rather than an instant in a user's
// timezone. Prefer the date portion returned by the API so an ISO timestamp
// cannot move a record into the previous/next day in another timezone.
const getRecordDateKey = (record) => {
  const value = record.date ?? record.createdAt;
  if (value === null || value === undefined || value === '') return '';

  const rawValue = String(value);
  const isoDateMatch = rawValue.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoDateMatch) return isoDateMatch[1];

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';

  return [parsed.getFullYear(), String(parsed.getMonth() + 1).padStart(2, '0'), String(parsed.getDate()).padStart(2, '0')].join('-');
};

const EscortExpenditureSummaryPage = () => {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFileFilter, setSourceFileFilter] = useState(ALL_SOURCE_FILES);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [chartType, setChartType] = useState('pie');

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

  const sourceFileOptions = useMemo(() => {
    return [...new Set(
      records
        .map((record) => String(record.sourceFile || '').trim())
        .filter(Boolean),
    )];
  }, [records]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSourceFileFilter(ALL_SOURCE_FILES);
    setDateFrom('');
    setDateTo('');
  };

  const handlePrintChart = () => {
    const chartNode = document.getElementById('escort-exec-chart');
    if (!chartNode) {
      setStatusMessage('Chart container unavailable for print/export.');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=1200,height=900');
    if (!printWindow) {
      setStatusMessage('Please allow popups to print or export the chart.');
      return;
    }

    const now = new Date();
    const printedAt = new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Dhaka',
    }).format(now);

    printWindow.document.write(`
      <html>
        <head>
          <title>Escort Expenditure Chart Report</title>
          <style>
            body { font-family: Inter, Arial, sans-serif; margin: 24px; color: #0f172a; }
            h1 { font-size: 18px; margin: 0 0 8px; }
            p { margin: 0 0 16px; color: #475569; font-size: 12px; }
            .chart-shell { border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; }
          </style>
        </head>
        <body>
          <h1>Falcon Executive View — Escort Expenditure</h1>
          <p>Printed at ${printedAt}</p>
          <div class="chart-shell">${chartNode.innerHTML}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const filteredRecords = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSource =
        sourceFileFilter === ALL_SOURCE_FILES ||
        String(record.sourceFile || '').trim() === sourceFileFilter;

      if (!matchesSource) return false;

      if (dateFrom || dateTo) {
        const recordDate = getRecordDateKey(record);
        if (!recordDate) return false;
        if (dateFrom && recordDate < dateFrom) return false;
        if (dateTo && recordDate > dateTo) return false;
      }

      if (!query) return true;

      const searchableFields = [
        record.remarks,
        record.sourceFile,
        getRecordDateKey(record),
        record.totalEscort,
        record.coverVan,
        record.receivedAmount,
        record.expenditure,
        record.client?.name,
        record.company?.name,
      ];

      return searchableFields.some((field) => {
        if (field === null || field === undefined) return false;
        return String(field).toLowerCase().includes(query);
      });
    });
  }, [records, searchTerm, sourceFileFilter, dateFrom, dateTo]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Falcon executive view — escort expenditure report
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Read-only analytical reporting workspace. Data entry and CRUD are available in Data Input Core.
            </p>
          </div>
          <div className="rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
            read-only mode
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Analytical summary</h3>
            <p className="text-sm text-slate-500">
              Filters instantly update KPI cards, chart trends, and underlying escort records.
            </p>
          </div>
          {statusMessage ? <p className="text-sm text-emerald-600">{statusMessage}</p> : null}
        </div>
        <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="space-y-1 text-sm text-slate-600">
            <span className="font-medium">Date from</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none"
            />
          </label>

          <label className="space-y-1 text-sm text-slate-600">
            <span className="font-medium">Date to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none"
            />
          </label>

          <label className="space-y-1 text-sm text-slate-600">
            <span className="font-medium">Source file</span>
            <select
              value={sourceFileFilter}
              onChange={(event) => setSourceFileFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none"
            >
              <option value={ALL_SOURCE_FILES}>All source files</option>
              {sourceFileOptions.map((sourceFile) => (
                <option key={sourceFile} value={sourceFile}>
                  {sourceFile}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm text-slate-600 xl:col-span-2">
            <span className="font-medium">Remarks / search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search remarks, file, amount or date"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none"
            />
          </label>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetFilters}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Reset filters
          </button>

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

        <ExpenditureAnalytics records={filteredRecords} chartType={chartType} onPrintChart={handlePrintChart} />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Escort records</h3>
            <p className="text-sm text-slate-500">Filtered read-only table for executive review and verification.</p>
          </div>
        </div>
        <ExpenditureTable records={filteredRecords} loading={isLoading} readOnly />
      </div>
    </div>
  );
};

export default EscortExpenditureSummaryPage;
