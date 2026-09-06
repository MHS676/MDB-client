import React, { useEffect, useMemo, useState } from 'react';
import getConfig from '../config/api.config';

const ATTENDANCE_BASE = getConfig('EXTERNAL.ATTENDANCE') || 'http://localhost:5000/attendance';
const POSTS_BASE = getConfig('EXTERNAL.POSTS') || 'http://localhost:5000/posts';

function nowDisplay() {
  const d = new Date();
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

export default function PostAttendanceSummary() {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(nowDisplay());

  useEffect(() => {
    const t = setInterval(() => setTime(nowDisplay()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(POSTS_BASE);
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load posts', err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selected) { setSummary(null); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const url = `${ATTENDANCE_BASE}/post-summary?postId=${encodeURIComponent(selected.id)}&month=${encodeURIComponent(month)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Server error');
        const data = await res.json();
        if (!cancelled) setSummary(data);
      } catch (err) {
        console.error('Error fetching post summary', err);
        if (!cancelled) setSummary(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selected, month]);

  const filtered = useMemo(() => {
    if (!query) return posts.slice(0,50);
    const q = query.toLowerCase();
    return posts.filter(p => (p.name||'').toLowerCase().includes(q)).slice(0,50);
  }, [posts, query]);

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <select value={month} onChange={e => setMonth(e.target.value)} className="border px-3 py-1 rounded">
            {/* Simple month selector: last 12 months */}
            {Array.from({length:12}).map((_,i) => {
              const d = new Date(); d.setMonth(d.getMonth()-i);
              const val = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
              return <option key={val} value={val}>{d.toLocaleString(undefined,{month:'short', year:'numeric'})}</option>;
            })}
          </select>
          <h2 className="text-2xl font-bold">Attendance</h2>
        </div>
        <div className="text-sm text-gray-600">{time}</div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel */}
        <div className="col-span-5 border rounded p-4">
          <label className="block font-semibold mb-2">POST: search and suggest</label>
          <input className="w-full border rounded px-3 py-2 mb-3" value={query} onChange={e=>setQuery(e.target.value)} placeholder="search posts..." />
          <div className="max-h-52 overflow-auto mb-4">
            {filtered.map(p=> (
              <div key={p.id} className={`p-2 cursor-pointer ${selected?.id===p.id? 'bg-indigo-50 border-l-4 border-indigo-400':''}`} onClick={()=>{ setSelected(p); setQuery(''); }}>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-gray-500">{p.address||'—'}</div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="font-semibold mb-2">Post Details</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <div><strong>Zone Coordinate:</strong> {summary?.post?.zoneCoordinate ?? (selected ? `${selected.latitude||'—'},${selected.longitude||'—'}` : '—')}</div>
              <div><strong>Address:</strong> {summary?.post?.address ?? (selected?.address||'—')}</div>
              <div><strong>Duty Hours:</strong> {summary?.post?.dutyHours ?? '8 hours / 12 hours'}</div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-span-7 border rounded p-4">
          <h3 className="font-semibold mb-3">Designation Summary</h3>
          <div className="overflow-auto">
            <table className="w-full text-sm table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left px-3 py-2">Designation</th>
                  <th className="text-right px-3 py-2">Qty</th>
                  <th className="text-right px-3 py-2">Net duties</th>
                  <th className="text-right px-3 py-2">Total duties</th>
                </tr>
              </thead>
              <tbody>
                {summary?.summaryByDesignation?.map(row => (
                  <tr key={row.designation} className="border-b">
                    <td className="px-3 py-2">{row.designation}</td>
                    <td className="px-3 py-2 text-right">{row.qty}</td>
                    <td className="px-3 py-2 text-right">{row.netDuties}</td>
                    <td className="px-3 py-2 text-right">{row.totalDuties}</td>
                  </tr>
                ))}
                {summary && (
                  <tr className="font-semibold bg-gray-50">
                    <td className="px-3 py-2">Total</td>
                    <td className="px-3 py-2 text-right">{summary.overallTotal.qty}</td>
                    <td className="px-3 py-2 text-right">{summary.overallTotal.netDuties}</td>
                    <td className="px-3 py-2 text-right">{summary.overallTotal.totalDuties}</td>
                  </tr>
                )}
                {!summary && (
                  <tr><td colSpan={4} className="px-3 py-6 text-center text-gray-400">No data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Roster */}
      <div className="mt-6 border rounded p-4">
        <h3 className="font-semibold mb-3">Detailed Guard Duty Roster</h3>
        <div className="overflow-auto">
          <table className="w-full text-sm table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 text-left">NO</th>
                <th className="px-3 py-2 text-left">Designation</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-right">Duty</th>
              </tr>
            </thead>
            <tbody>
              {summary?.guardDetails?.length ? (
                summary.guardDetails.map((g, idx) => (
                  <tr key={g.employeeId} className="border-b">
                    <td className="px-3 py-2">{g.employeeId || String(idx+1)}</td>
                    <td className="px-3 py-2">{g.designation}</td>
                    <td className="px-3 py-2">{g.name}</td>
                    <td className="px-3 py-2 text-right">{g.duty}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="px-3 py-6 text-center text-gray-400">No guard data for selected post/month.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
