import React, { useEffect, useMemo, useState } from 'react';
import { getConfig, buildUrl } from '../config/api.config';

function formatMonthForInput(month) {
  // input type=month expects YYYY-MM
  return month;
}

function formatDisplayDate(date) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function GuardAttendanceDetails() {
  const attendanceBase = getConfig('EXTERNAL.ATTENDANCE') || '/attendance';
  const postsBase = getConfig('EXTERNAL.POSTS') || '/posts';

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [posts, setPosts] = useState([]);
  const [postQuery, setPostQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // fetch posts for autocomplete (simple list)
    (async () => {
      try {
        const res = await fetch(postsBase);
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load posts', err);
      }
    })();
  }, [postsBase]);

  useEffect(() => {
    if (!selectedPost) {
      setSummary(null);
      return;
    }
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const url = `${attendanceBase}/summary?postId=${encodeURIComponent(selectedPost.id)}&month=${encodeURIComponent(month)}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        setSummary(data);
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Failed to fetch summary', err);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [selectedPost, month, attendanceBase]);

  const filteredPosts = useMemo(() => {
    if (!postQuery) return posts.slice(0, 50);
    const q = postQuery.toLowerCase();
    return posts.filter((p) => (p.name || '').toLowerCase().includes(q)).slice(0, 50);
  }, [posts, postQuery]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Top Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-extrabold">Attendance Summary</h1>
          <input
            type="month"
            value={formatMonthForInput(month)}
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
                key={p.id}
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
                {summary?.summaryByDesignation?.map((row) => (
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
                    <td className="px-3 py-2 text-right">{summary.summaryByDesignation.reduce((s, r) => s + r.qty, 0)}</td>
                    <td className="px-3 py-2 text-right">{summary.summaryByDesignation.reduce((s, r) => s + r.netDuties, 0)}</td>
                    <td className="px-3 py-2 text-right">{summary.summaryByDesignation.reduce((s, r) => s + r.totalDuties, 0)}</td>
                  </tr>
                )}
                {!summary && (
                  <tr><td colSpan={4} className="px-3 py-4 text-gray-400">No summary to display</td></tr>
                )}
              </tbody>
            </table>
          </div>
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
              {summary?.guardDetails?.length ? (
                summary.guardDetails.map((g, idx) => (
                  <tr key={g.employeeId} className="border-b">
                    <td className="px-3 py-2">{g.employeeId || idx + 1}</td>
                    <td className="px-3 py-2">{g.designation}</td>
                    <td className="px-3 py-2">{g.name}</td>
                    <td className="px-3 py-2 text-right">{g.dutyCount}</td>
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
