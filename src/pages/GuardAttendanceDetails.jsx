import React, { useEffect, useMemo, useState } from 'react';

function formatDisplayDate(date) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  } catch (e) {
    return date.toString();
  }
}

export default function GuardAttendanceDetails() {
  const attendanceBase = import.meta.env.VITE_ATTENDANCE_API_URL || '/attendance';
  const postsBase = import.meta.env.VITE_POSTS_API_URL || '/posts';

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [posts, setPosts] = useState([]);
  const [postQuery, setPostQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(postsBase);
        if (!res.ok) throw new Error(`Failed to fetch posts (${res.status})`);
        const data = await res.json();
        if (!cancelled) setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load posts', err);
        if (!cancelled) setPosts([]);
      }
    })();
    return () => { cancelled = true; };
  }, [postsBase]);

  useEffect(() => {
    if (!selectedPost) {
      setSummary(null);
      setError(null);
      return;
    }

    const controller = new AbortController();
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${attendanceBase}/post-summary?postId=${encodeURIComponent(selectedPost.id)}&month=${encodeURIComponent(month)}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          const body = await res.text().catch(() => '');
          throw new Error(`Summary fetch failed (${res.status}) ${body}`);
        }
        const data = await res.json();

        if (!active) return;

        setSummary({
          post: data.post ?? selectedPost,
          summaryByDesignation: Array.isArray(data.summaryByDesignation) ? data.summaryByDesignation : (data.summaryByDesignation ? [data.summaryByDesignation] : []),
          guardDetails: Array.isArray(data.guardDetails) ? data.guardDetails : (data.guardDetails ? [data.guardDetails] : []),
          overallTotal: data.overallTotal ?? { qty: 0, netDuties: 0, totalDuties: 0 },
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch summary', err);
          setError(err.message || 'Failed to load summary');
          setSummary(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; controller.abort(); };
  }, [selectedPost, month, attendanceBase]);

  const filteredPosts = useMemo(() => {
    if (!postQuery) return posts.slice(0, 50);
    const q = postQuery.toLowerCase();
    return posts.filter((p) => (p.name || '').toLowerCase().includes(q)).slice(0, 50);
  }, [posts, postQuery]);

  const totals = useMemo(() => {
    const rows = summary?.summaryByDesignation ?? [];
    return rows.reduce((acc, r) => ({
      qty: acc.qty + (Number(r.qty) || 0),
      netDuties: acc.netDuties + (Number(r.netDuties) || 0),
      totalDuties: acc.totalDuties + (Number(r.totalDuties) || 0),
    }), { qty: 0, netDuties: 0, totalDuties: 0 });
  }, [summary]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-extrabold">Attendance Summary</h1>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="px-3 py-1 border rounded-lg bg-white" aria-label="Month selector" />
        </div>
        <div className="text-sm text-gray-600">
          <div>{formatDisplayDate(now)}</div>
          <div className="text-xs text-gray-400">System Time</div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-5 bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">POST: search and suggest</label>
          <input className="w-full border rounded px-3 py-2 mb-3" placeholder="Search posts..." value={postQuery} onChange={(e) => setPostQuery(e.target.value)} />

          <div className="max-h-48 overflow-auto mb-3">
            {filteredPosts.map((p) => (
              <div key={p.id ?? p.postId} className={`p-2 rounded hover:bg-gray-100 cursor-pointer ${selectedPost?.id === p.id ? 'bg-indigo-50 border-l-4 border-indigo-400' : ''}`} onClick={() => { setSelectedPost(p); setPostQuery(''); }}>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-gray-500">{p.address || '—'}</div>
              </div>
            ))}
            {!filteredPosts.length && <div className="text-sm text-gray-400 p-2">No posts found</div>}
          </div>

          <div className="mt-4">
            <h3 className="font-semibold">Post Details</h3>
            <div className="mt-2 text-sm text-gray-700">
              <div><strong>Zone Coordinate:</strong> {selectedPost ? `${selectedPost.latitude ?? '—'}, ${selectedPost.longitude ?? '—'}` : '—'}</div>
              <div><strong>Address:</strong> {selectedPost ? (selectedPost.address || '—') : '—'}</div>
              <div><strong>Duty Hours:</strong> {summary?.post?.dutyHours ?? '8'} hours</div>
            </div>
          </div>
        </div>

        <div className="col-span-7 bg-white rounded-lg shadow p-4">
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
                {(summary?.summaryByDesignation ?? []).map((row) => (
                  <tr key={row.designation} className="border-b">
                    <td className="px-3 py-2">{row.designation}</td>
                    <td className="px-3 py-2 text-right">{row.qty}</td>
                    <td className="px-3 py-2 text-right">{row.netDuties}</td>
                    <td className="px-3 py-2 text-right">{row.totalDuties}</td>
                  </tr>
                ))}

                {summary ? (
                  <tr className="font-semibold bg-gray-50">
                    <td className="px-3 py-2">Total</td>
                    <td className="px-3 py-2 text-right">{totals.qty}</td>
                    <td className="px-3 py-2 text-right">{totals.netDuties}</td>
                    <td className="px-3 py-2 text-right">{totals.totalDuties}</td>
                  </tr>
                ) : (
                  <tr><td colSpan={4} className="px-3 py-4 text-gray-400">No summary to display</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {loading && <div className="mt-3 text-sm text-gray-500">Loading summary…</div>}
          {error && <div className="mt-3 text-sm text-red-600">Error: {error}</div>}
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-4">
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
              {(summary?.guardDetails ?? []).length ? (
                (summary.guardDetails ?? []).map((g, idx) => (
                  <tr key={g.employeeId ?? g.id ?? idx} className="border-b">
                    <td className="px-3 py-2">{g.employeeId ?? idx + 1}</td>
                    <td className="px-3 py-2">{g.designation}</td>
                    <td className="px-3 py-2">{g.name}</td>
                    <td className="px-3 py-2 text-right">{g.dutyCount ?? g.duty ?? 0}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="px-3 py-6 text-center text-gray-400">No guards assigned or no attendance for selected month.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
// import React, { useEffect, useMemo, useState } from 'react';
// import { getConfig, buildUrl } from '../config/api.config';

// function formatMonthForInput(month) {
//   // input type=month expects YYYY-MM
//   return month;
// }

// function formatDisplayDate(date) {
import React, { useEffect, useMemo, useState } from 'react';

function formatDisplayDate(date) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  } catch (e) {
    return date.toString();
  }
}

export default function GuardAttendanceDetails() {
  // Prefer Vite env vars if present; fallback to relative paths expected by the app's proxy
  const attendanceBase = import.meta.env.VITE_ATTENDANCE_API_URL || '/attendance';
  const postsBase = import.meta.env.VITE_POSTS_API_URL || '/posts';

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [posts, setPosts] = useState([]);
  const [postQuery, setPostQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(postsBase);
        if (!res.ok) throw new Error(`Failed to fetch posts (${res.status})`);
        const data = await res.json();
        if (!cancelled) setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load posts', err);
        if (!cancelled) setPosts([]);
      }
    })();
    return () => { cancelled = true; };
  }, [postsBase]);

  useEffect(() => {
    // If no post selected, clear the summary — avoid stale UI
    if (!selectedPost) {
      setSummary(null);
      setError(null);
      return;
    }

    const controller = new AbortController();
    let isActive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Use the post-summary endpoint (server exposes /post-summary)
        const url = `${attendanceBase}/post-summary?postId=${encodeURIComponent(selectedPost.id)}&month=${encodeURIComponent(month)}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          const errBody = await res.text().catch(() => '');
          throw new Error(`Summary fetch failed (${res.status}) ${errBody}`);
        }
        const data = await res.json();

        if (!isActive) return;

        // Normalise shape: ensure arrays exist so rendering logic doesn't crash
        const safe = {
          post: data.post ?? selectedPost,
          summaryByDesignation: Array.isArray(data.summaryByDesignation) ? data.summaryByDesignation : (data.summaryByDesignation ? [data.summaryByDesignation] : []),
          guardDetails: Array.isArray(data.guardDetails) ? data.guardDetails : (data.guardDetails ? [data.guardDetails] : []),
          overallTotal: data.overallTotal ?? { qty: 0, netDuties: 0, totalDuties: 0 },
        };

        setSummary(safe);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch summary', err);
          setError(err.message || 'Failed to load summary');
          setSummary(null);
        }
      } finally {
        if (isActive) setLoading(false);
      }
    })();

    return () => { isActive = false; controller.abort(); };
  }, [selectedPost, month, attendanceBase]);

  const filteredPosts = useMemo(() => {
    if (!postQuery) return posts.slice(0, 50);
    const q = postQuery.toLowerCase();
    return posts.filter((p) => (p.name || '').toLowerCase().includes(q)).slice(0, 50);
  }, [posts, postQuery]);

  // Safe totals (avoid reduce on undefined)
  const totals = useMemo(() => {
    const rows = summary?.summaryByDesignation ?? [];
    return rows.reduce(
      (acc, r) => ({
        qty: acc.qty + (Number(r.qty) || 0),
        netDuties: acc.netDuties + (Number(r.netDuties) || 0),
        totalDuties: acc.totalDuties + (Number(r.totalDuties) || 0),
      }),
      { qty: 0, netDuties: 0, totalDuties: 0 }
    );
  }, [summary]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Top Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-extrabold">Attendance Summary</h1>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-1 border rounded-lg bg-white"
            aria-label="Month selector"
          />
        </div>
        <div className="text-sm text-gray-600">
          <div>{formatDisplayDate(now)}</div>
          <div className="text-xs text-gray-400">System Time</div>
        </div>
      </div>

      {/* Main Content: left (post details) and right (designation summary) */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-5 bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">POST: search and suggest</label>
          <input
            className="w-full border rounded px-3 py-2 mb-3"
            placeholder="Search posts..."
            value={postQuery}
            onChange={(e) => setPostQuery(e.target.value)}
          />

          <div className="max-h-48 overflow-auto mb-3">
            {filteredPosts.map((p) => (
              <div
                key={p.id ?? p.postId}
                className={`p-2 rounded hover:bg-gray-100 cursor-pointer ${selectedPost?.id === p.id ? 'bg-indigo-50 border-l-4 border-indigo-400' : ''}`}
                onClick={() => { setSelectedPost(p); setPostQuery(''); }}
              >
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-gray-500">{p.address || '—'}</div>
              </div>
            ))}
            {!filteredPosts.length && <div className="text-sm text-gray-400 p-2">No posts found</div>}
          </div>

          <div className="mt-4">
            <h3 className="font-semibold">Post Details</h3>
            <div className="mt-2 text-sm text-gray-700">
              <div><strong>Zone Coordinate:</strong> {selectedPost ? `${selectedPost.latitude ?? '—'}, ${selectedPost.longitude ?? '—'}` : '—'}</div>
              <div><strong>Address:</strong> {selectedPost ? (selectedPost.address || '—') : '—'}</div>
              <div><strong>Duty Hours:</strong> {summary?.post?.dutyHours ?? '8'} hours</div>
            </div>
          </div>
        </div>

        <div className="col-span-7 bg-white rounded-lg shadow p-4">
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
                {(summary?.summaryByDesignation ?? []).map((row) => (
                  <tr key={row.designation} className="border-b">
                    <td className="px-3 py-2">{row.designation}</td>
                    <td className="px-3 py-2 text-right">{row.qty}</td>
                    <td className="px-3 py-2 text-right">{row.netDuties}</td>
                    <td className="px-3 py-2 text-right">{row.totalDuties}</td>
                  </tr>
                ))}

                {(summary) ? (
                  <tr className="font-semibold bg-gray-50">
                    <td className="px-3 py-2">Total</td>
                    <td className="px-3 py-2 text-right">{totals.qty}</td>
                    <td className="px-3 py-2 text-right">{totals.netDuties}</td>
                    <td className="px-3 py-2 text-right">{totals.totalDuties}</td>
                  </tr>
                ) : (
                  <tr><td colSpan={4} className="px-3 py-4 text-gray-400">No summary to display</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {loading && <div className="mt-3 text-sm text-gray-500">Loading summary…</div>}
          {error && <div className="mt-3 text-sm text-red-600">Error: {error}</div>}
        </div>
      </div>

      {/* Detailed Roster */}
      <div className="mt-6 bg-white rounded-lg shadow p-4">
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
              {(summary?.guardDetails ?? []).length ? (
                (summary.guardDetails ?? []).map((g, idx) => (
                  <tr key={g.employeeId ?? g.id ?? idx} className="border-b">
                    <td className="px-3 py-2">{g.employeeId ?? idx + 1}</td>
                    <td className="px-3 py-2">{g.designation}</td>
                    <td className="px-3 py-2">{g.name}</td>
                    <td className="px-3 py-2 text-right">{g.dutyCount ?? g.duty ?? 0}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="px-3 py-6 text-center text-gray-400">No guards assigned or no attendance for selected month.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        setSummary(data);
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Failed to fetch summary', err);
        setSummary(null);
      }
    })();

    return () => controller.abort();
  }, [selectedPost, month, attendanceBase]);

  const filteredPosts = useMemo(() => {
    if (!postQuery) return [];
    const q = postQuery.toLowerCase();
    return posts.filter((p) => (p.name || '').toLowerCase().includes(q)).slice(0, 10);
  }, [posts, postQuery]);

  return (
    <div className="min-h-screen bg-white p-8 font-sans text-[#0c1854]">
      {/* Top Bar: Month Dropdown, Title, Time/Date */}
      <div className="flex items-center justify-between mb-10">
        {/* Month Selector Pill */}
        <div className="relative">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="appearance-none bg-[#e2e8f0] text-[#16a34a] font-black text-xl px-6 py-2 pr-10 rounded-lg cursor-pointer focus:outline-none"
          >
            <option value="2026-06">Jun 2026</option>
            <option value="2026-07">Jul 2026</option>
            <option value="2026-08">Aug 2026</option>
            <option value="2026-09">Sep 2026</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#0c1854]">
            ▼
          </div>
        </div>

        {/* Center Title */}
        <h1 className="text-5xl font-black text-[#000000] tracking-tight">Attendance</h1>

        {/* Time and Date Labels */}
        <div className="flex gap-8 text-xl font-bold">
          <div className="text-[#dc2626]">
            <span>Time</span>
            {currentTime && <span className="ml-2 text-[#0c1854]">{currentTime}</span>}
          </div>
          <div className="text-[#dc2626]">
            <span>Date</span>
            {currentDate && <span className="ml-2 text-[#0c1854]">{currentDate}</span>}
          </div>
        </div>
      </div>

      {/* Main Grid: Left side Post Search & Details, Right side Designation Table */}
      <div className="grid grid-cols-12 gap-8 mb-10 items-start">
        {/* Left Side Controls */}
        <div className="col-span-7">
          <div className="flex items-center gap-4 mb-6">
            <label className="text-2xl font-black text-[#0c1854] w-20">POST</label>
            <div className="relative flex-1">
              <input
                className="w-full border-2 border-[#0c1854] rounded-md px-4 py-2 text-xl font-bold text-[#0c1854] placeholder-[#0c1854] focus:outline-none"
                placeholder="search and suggest"
                value={postQuery}
                onChange={(e) => setPostQuery(e.target.value)}
              />

              {/* Suggestions Dropdown */}
              {filteredPosts.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 bg-white border-2 border-[#0c1854] rounded-b-md shadow-lg max-h-52 overflow-y-auto mt-1">
                  {filteredPosts.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 border-b border-gray-200 hover:bg-indigo-50 cursor-pointer font-bold text-lg text-[#0c1854]"
                      onClick={() => { setSelectedPost(p); setPostQuery(p.name); }}
                    >
                      {p.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Details List */}
          <div className="space-y-4 text-xl font-bold text-[#0c1854] mt-8">
            <div className="flex">
              <span className="w-48">Zone Coordinate:</span>
              <span>
                {summary?.post?.zoneCoordinate ??
                  (selectedPost ? `${selectedPost.latitude ?? '—'}, ${selectedPost.longitude ?? '—'}` : '-----------')}
              </span>
            </div>
            <div className="flex">
              <span className="w-48">Address</span>
              <span>{summary?.post?.address ?? (selectedPost?.address || '-----------')}</span>
            </div>
            <div className="flex">
              <span className="w-48">Duty Hours</span>
              <span>{summary?.post?.dutyHours ?? '8 hours/ 12 hours'}</span>
            </div>
          </div>
        </div>

        {/* Right Side Card Table */}
        <div className="col-span-5 bg-[#e5e7eb] p-2 rounded-xl shadow-sm border border-gray-300">
          <table className="w-full text-lg border-collapse">
            <thead>
              <tr className="border-b-2 border-[#0c1854]">
                <th className="py-2 px-3 text-center font-black border-r border-[#0c1854]">Name</th>
                <th className="py-2 px-3 text-center font-black border-r border-[#0c1854]">Qty</th>
                <th className="py-2 px-3 text-center font-black border-r border-[#0c1854]">Net duties</th>
                <th className="py-2 px-3 text-center font-black">total duties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0c1854]">
              {summary?.summaryByDesignation?.map((row) => (
                <tr key={row.designation} className="font-extrabold">
                  <td className="py-3 px-3 text-left border-r border-[#0c1854]">{row.designation}</td>
                  <td className="py-3 px-3 text-center border-r border-[#0c1854]">{row.qty}</td>
                  <td className="py-3 px-3 text-center border-r border-[#0c1854]">{row.netDuties}</td>
                  <td className="py-3 px-3 text-center">{row.totalDuties}</td>
                </tr>
              )) || (
                <>
                  <tr className="font-extrabold">
                    <td className="py-2 px-3 text-left border-r border-[#0c1854]">In-charger Security</td>
                    <td className="py-2 px-3 text-center border-r border-[#0c1854]">1</td>
                    <td className="py-2 px-3 text-center border-r border-[#0c1854]">29</td>
                    <td className="py-2 px-3 text-center">31</td>
                  </tr>
                  <tr className="font-extrabold">
                    <td className="py-2 px-3 text-left border-r border-[#0c1854]">Supervisor</td>
                    <td className="py-2 px-3 text-center border-r border-[#0c1854]">1</td>
                    <td className="py-2 px-3 text-center border-r border-[#0c1854]">60</td>
                    <td className="py-2 px-3 text-center">62</td>
                  </tr>
                  <tr className="font-extrabold">
                    <td className="py-2 px-3 text-left border-r border-[#0c1854]">Security Guard</td>
                    <td className="py-2 px-3 text-center border-r border-[#0c1854]">3</td>
                    <td className="py-2 px-3 text-center border-r border-[#0c1854]">60</td>
                    <td className="py-2 px-3 text-center">62</td>
                  </tr>
                </>
              )}
              {/* Summary Totals Row */}
              <tr className="border-t-2 border-[#0c1854] font-black text-xl">
                <td className="py-3 px-3 border-r border-[#0c1854]"></td>
                <td className="py-3 px-3 text-center border-r border-[#0c1854]">
                  {summary?.overallTotal?.qty ?? 5}
                </td>
                <td className="py-3 px-3 text-center border-r border-[#0c1854]">
                  {summary?.overallTotal?.netDuties ?? 289}
                </td>
                <td className="py-3 px-3 text-center">
                  {summary?.overallTotal?.totalDuties ?? 300}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Duty Roster Grid */}
      <div className="mt-6">
        <table className="w-full border-collapse text-xl font-bold border-b-2 border-[#0c1854]">
          <thead>
            <tr className="border-b-2 border-[#0c1854]">
              <th className="py-3 w-1/12 text-center border-r-2 border-[#0c1854]">NO</th>
              <th className="py-3 w-4/12 text-center border-r-2 border-[#0c1854]">Designation</th>
              <th className="py-3 w-5/12 text-center border-r-2 border-[#0c1854]">Name</th>
              <th className="py-3 w-2/12 text-center">Duty</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-[#0c1854]">
            {summary?.guardDetails?.map((g) => (
              <tr key={g.employeeId}>
                <td className="py-4 text-center border-r-2 border-[#0c1854]">{g.employeeId}</td>
                <td className="py-4 text-center border-r-2 border-[#0c1854]">{g.designation}</td>
                <td className="py-4 text-center border-r-2 border-[#0c1854]">{g.name}</td>
                <td className="py-4 text-center">{g.duty ?? g.dutyCount}</td>
              </tr>
            )) || (
              <>
                <tr>
                  <td className="py-4 text-center border-r-2 border-[#0c1854]">2026</td>
                  <td className="py-4 text-center border-r-2 border-[#0c1854]">Security Guard</td>
                  <td className="py-4 text-center border-r-2 border-[#0c1854]">suman</td>
                  <td className="py-4 text-center">30</td>
                </tr>
                <tr>
                  <td className="py-4 text-center border-r-2 border-[#0c1854]">2029</td>
                  <td className="py-4 text-center border-r-2 border-[#0c1854]">Supervisor</td>
                  <td className="py-4 text-center border-r-2 border-[#0c1854]">rafi</td>
                  <td className="py-4 text-center">28</td>
                </tr>
                <tr>
                  <td className="py-4 text-center border-r-2 border-[#0c1854]">2028</td>
                  <td className="py-4 text-center border-r-2 border-[#0c1854]">Security Guard</td>
                  <td className="py-4 text-center border-r-2 border-[#0c1854]">safi</td>
                  <td className="py-4 text-center">29</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}