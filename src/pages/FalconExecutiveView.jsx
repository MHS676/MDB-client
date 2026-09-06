import React, { useEffect, useMemo, useState } from 'react';
import getConfig from '../config/api.config';

const ATTENDANCE_BASE = getConfig('EXTERNAL.ATTENDANCE') || 'http://localhost:5000/attendance';
const POSTS_BASE = getConfig('EXTERNAL.POSTS') || 'http://localhost:5000/posts';

function prettyNow() {
  const d = new Date();
  return d.toLocaleString();
}

export default function FalconExecutiveView() {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [summary, setSummary] = useState(null);
  const [time, setTime] = useState(prettyNow());

  useEffect(() => {
    const t = setInterval(() => setTime(prettyNow()), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(POSTS_BASE);
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch posts', err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selected) {
      setSummary(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const url = `${ATTENDANCE_BASE}/post-summary?postId=${encodeURIComponent(selected.id)}&month=${encodeURIComponent(month)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (!cancelled) setSummary(data);
      } catch (err) {
        console.error('Error fetching summary', err);
        if (!cancelled) setSummary(null);
      }
    })();
    return () => { cancelled = true; };
  }, [selected, month]);

  const filtered = useMemo(() => {
    if (!query) return posts.slice(0, 50);
    const q = query.toLowerCase();
    return posts.filter(p => (p.name||'').toLowerCase().includes(q)).slice(0, 50);
  }, [posts, query]);

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <div className="bg-gray-100 rounded px-3 py-2 text-green-600 font-semibold">{new Date(month + '-01').toLocaleString(undefined, { month: 'short', year: 'numeric' })}</div>
          <h1 className="text-4xl font-extrabold text-center">Attendance</h1>
        </div>
        <div className="text-right">
          <div className="text-sm text-red-600 font-medium">Time</div>
          <div className="text-sm text-red-600 font-medium">Date</div>
          <div className="text-xs text-gray-500 mt-1">{time}</div>
        </div>
      </div>

      {/* Top section */}
      <div className="flex gap-8 mb-10">
        {/* Left: Post controls */}
        <div className="w-2/3">
          <div className="flex items-center gap-4 mb-3">
            <label className="text-lg font-bold text-indigo-900 w-24">POST</label>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="search and suggest"
              className="flex-1 border rounded px-4 py-2 text-lg"
            />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-6 text-indigo-900 font-medium">
            <div>
              <div className="text-sm text-indigo-700">Zone Coordinate:</div>
              <div className="mt-2 text-lg">{summary?.post?.zoneCoordinate ?? (selected ? `${selected.latitude||'—'}, ${selected.longitude||'—'}` : '-----------')}</div>
            </div>
            <div>
              <div className="text-sm text-indigo-700">Address</div>
              <div className="mt-2 text-lg">{summary?.post?.address ?? (selected?.address || '-----------')}</div>
            </div>
            <div>
              <div className="text-sm text-indigo-700">Duty Hours</div>
              <div className="mt-2 text-lg">{summary?.post?.dutyHours ?? '8 hours / 12 hours'}</div>
            </div>
          </div>

          {/* Post results (hidden when none) */}
          <div className="mt-6 max-h-44 overflow-auto">
            {filtered.map(p => (
              <div key={p.id} className={`p-3 border-b cursor-pointer ${selected?.id===p.id ? 'bg-indigo-50' : ''}`} onClick={()=>{ setSelected(p); setQuery(''); }}>
                <div className="font-semibold text-indigo-900">{p.name}</div>
                <div className="text-xs text-gray-500">{p.address}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Designation summary card */}
        <div className="w-1/3 bg-gray-100 rounded-lg p-4 shadow-md">
          <div className="bg-white rounded p-3 shadow-inner">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-600">
                  <th className="">Name</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Net duties</th>
                  <th className="text-right">total duties</th>
                </tr>
              </thead>
              <tbody className="mt-2">
                {summary?.summaryByDesignation?.map(r => (
                  <tr key={r.designation} className="border-t">
                    <td className="py-3 text-indigo-900 font-semibold">{r.designation}</td>
                    <td className="py-3 text-right">{r.qty}</td>
                    <td className="py-3 text-right">{r.netDuties}</td>
                    <td className="py-3 text-right">{r.totalDuties}</td>
                  </tr>
                ))}
                {summary && (
                  <tr className="border-t font-bold">
                    <td className="py-3">&nbsp;</td>
                    <td className="py-3 text-right">{summary.overallTotal.qty}</td>
                    <td className="py-3 text-right">{summary.overallTotal.netDuties}</td>
                    <td className="py-3 text-right">{summary.overallTotal.totalDuties}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom roster */}
      <div className="mt-6">
        <table className="w-full table-fixed border-collapse text-indigo-900">
          <thead>
            <tr className="border-b">
              <th className="w-1/6 py-4">NO</th>
              <th className="w-1/6 py-4">Designation</th>
              <th className="w-2/6 py-4">Name</th>
              <th className="w-1/6 py-4 text-right">Duty</th>
            </tr>
          </thead>
          <tbody>
            {summary?.guardDetails?.map((g, i) => (
              <tr key={g.employeeId || i} className="border-t">
                <td className="py-6 font-semibold">{g.employeeId}</td>
                <td className="py-6">{g.designation}</td>
                <td className="py-6">{g.name}</td>
                <td className="py-6 text-right font-semibold">{g.duty}</td>
              </tr>
            ))}
            {!summary?.guardDetails?.length && (
              <tr><td colSpan={4} className="py-16 text-center text-gray-400">No guards assigned or no attendance for selected month.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
