import React, { useEffect, useState, useMemo } from 'react';

const ATTENDANCE_API_URL = import.meta.env.VITE_ATTENDANCE_API_URL || 'http://localhost:5000/attendance';
const POSTS_API_URL = import.meta.env.VITE_POSTS_API_URL || 'http://localhost:5000/posts';

export default function AttendanceDetailsPage() {
  const [logs, setLogs] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2026-06');
  const [loading, setLoading] = useState(true);
  const [postSummary, setPostSummary] = useState(null);
  const [postLoading, setPostLoading] = useState(false);

  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // Live Clock & Date
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Attendance Logs & Posts
  useEffect(() => {
    fetchInitialData();
  }, [selectedMonth]);

  // Fetch post-wise summary when a post is selected
  useEffect(() => {
    let cancelled = false;
    const fetchPostSummary = async () => {
      if (!selectedPost) {
        setPostSummary(null);
        return;
      }
      setPostLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const url = `${ATTENDANCE_API_URL}/post-summary?postId=${encodeURIComponent(selectedPost.id)}&month=${encodeURIComponent(selectedMonth)}`;
        let res = await fetch(url, { headers });
        if (res.status === 401 || res.status === 403) {
          // fallback to public endpoint if available
          const publicUrl = `${ATTENDANCE_API_URL}/post-summary-public?postId=${encodeURIComponent(selectedPost.id)}&month=${encodeURIComponent(selectedMonth)}`;
          res = await fetch(publicUrl);
        }
        if (!res.ok) throw new Error(`Failed to fetch post summary ${res.status}`);
        const data = await res.json();
        if (!cancelled) setPostSummary(data);
      } catch (err) {
        console.error('Failed to fetch post summary', err);
        if (!cancelled) setPostSummary(null);
      } finally {
        if (!cancelled) setPostLoading(false);
      }
    };

    fetchPostSummary();
    return () => { cancelled = true; };
  }, [selectedPost, selectedMonth]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const [attRes, postResRaw] = await Promise.all([
        fetch(`${ATTENDANCE_API_URL}?month=${selectedMonth}`, { headers }).catch(() => null),
        fetch(POSTS_API_URL, { headers }).catch(() => null)
      ]);

      // If posts fetch is unauthorized, try public posts endpoint
      let postRes = postResRaw;
      if (postResRaw && (postResRaw.status === 401 || postResRaw.status === 403)) {
        try {
          postRes = await fetch(`${POSTS_API_URL}/public`).catch(() => null);
        } catch (e) {
          postRes = null;
        }
      }

      if (attRes && attRes.ok) {
        const data = await attRes.json();
        setLogs(Array.isArray(data) ? data : (data?.data || []));
      } else if (attRes && !attRes.ok) {
        // surface server errors for debugging
        console.warn('Attendance fetch failed', attRes.status);
      }

      if (postRes && postRes.ok) {
        const postData = await postRes.json();
        setPosts(Array.isArray(postData) ? postData : []);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  // Autocomplete Suggestions
  const filteredPosts = useMemo(() => {
    if (!searchQuery) return [];
    // If user selected a post and the input matches exactly, hide suggestions
    if (selectedPost && selectedPost.name === searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return posts.filter(p => (p.name || '').toLowerCase().includes(q)).slice(0, 8);
  }, [posts, searchQuery]);

  // Prefer server-provided post summary when available, otherwise fall back to logs
  const summaryByDesignation = useMemo(() => {
    if (postSummary && postSummary.summaryByDesignation) return postSummary.summaryByDesignation;
    if (!logs.length) return null;

    const stats = {};
    logs.forEach(log => {
      const des = log.user?.designation || log.guardProfile?.designation || 'Security Guard';
      if (!stats[des]) {
        stats[des] = { designation: des, qty: 0, netDuties: 0, totalDuties: 0, guardIds: new Set() };
      }
      const guardId = log.userId || log.user?.id || log.guardProfile?.id;
      if (guardId) stats[des].guardIds.add(guardId);
      if (log.status === 'PRESENT') stats[des].netDuties += 1;
      stats[des].totalDuties += 1;
    });

    return Object.values(stats).map(item => ({
      ...item,
      qty: item.guardIds.size || 1
    }));
  }, [logs, postSummary]);

  // Guard roster uses server guardDetails when present
  const guardRoster = useMemo(() => {
    if (postSummary && Array.isArray(postSummary.guardDetails)) {
      return postSummary.guardDetails.map((g) => ({
        id: g.employeeId || g.userId || g.id,
        name: g.name || g.user?.name || 'Guard',
        designation: g.designation || g.user?.designation || 'Security Guard',
        dutyCount: g.duty ?? g.dutyCount ?? 0,
      }));
    }

    if (!logs.length) return [];
    const guardMap = {};
    logs.forEach(log => {
      const id = log.user?.employeeId || (log.userId ? log.userId.substring(0, 6) : 'N/A');
      const name = log.user?.name || log.guardProfile?.user?.name || 'Guard';
      const designation = log.user?.designation || log.guardProfile?.designation || 'Security Guard';
      if (!guardMap[id]) guardMap[id] = { id, name, designation, dutyCount: 0 };
      if (log.status === 'PRESENT') guardMap[id].dutyCount += 1;
    });
    return Object.values(guardMap);
  }, [logs, postSummary]);

  return (
    <div className="min-h-screen bg-white px-6 py-8 sm:px-12 md:px-16 lg:px-20 text-slate-900">
      {/* Top Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mb-10">
        <div className="flex items-center gap-4">
          <label className="sr-only">Select month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-gray-100 text-green-600 font-semibold text-lg px-4 py-2 rounded-lg shadow-sm focus:outline-none"
            aria-label="Select month"
          >
            <option value="2026-06">Jun 2026</option>
            <option value="2026-07">Jul 2026</option>
            <option value="2026-08">Aug 2026</option>
            <option value="2026-09">Sep 2026</option>
          </select>
        </div>

        <h1 className="text-center text-3xl sm:text-4xl font-extrabold">Attendance</h1>

        <div className="flex justify-end items-center space-x-6 text-sm text-slate-600">
          <div className="text-sm">
            <div className="text-red-600 font-semibold">Time</div>
            <div className="text-slate-800">{currentTime}</div>
          </div>
          <div className="text-sm">
            <div className="text-red-600 font-semibold">Date</div>
            <div className="text-slate-800">{currentDate}</div>
          </div>
        </div>
      </div>

      {/* Controls + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-7 bg-white rounded-xl shadow p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="text-2xl font-bold">POST</div>
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-indigo-200"
              />

              {filteredPosts.length > 0 && (
                <div className="absolute z-30 top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg mt-2 max-h-56 overflow-auto">
                  {filteredPosts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedPost(p); setSearchQuery(p.name); }}
                      className="w-full text-left px-4 py-3 hover:bg-indigo-50"
                    >
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.address}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-slate-700">
            <div>
              <div className="text-xs text-gray-500">Zone Coordinator</div>
              <div className="font-semibold mt-2">
                {postSummary?.post?.zoneCoordinator || postSummary?.guardDetails?.find(g => g.role === 'COORDINATOR' || g.designation?.toLowerCase()?.includes('coordinator'))?.name || '—'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Address</div>
              <div className="font-semibold mt-2">{((postSummary?.post?.address ?? selectedPost?.address) || '—')}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Duty Hours</div>
              <div className="font-semibold mt-2">{postSummary?.post?.dutyHours ?? '8 / 12 hrs'}</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-gray-50 rounded-xl shadow p-4">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white">
                  <th className="text-left px-3 py-2">Name</th>
                  <th className="text-right px-3 py-2">Qty</th>
                  <th className="text-right px-3 py-2">Net duties</th>
                  <th className="text-right px-3 py-2">Total duties</th>
                </tr>
              </thead>
              <tbody>
                {summaryByDesignation ? summaryByDesignation.map((row) => (
                  <tr key={row.designation} className="border-t">
                    <td className="px-3 py-3 font-semibold">{row.designation}</td>
                    <td className="px-3 py-3 text-right">{row.qty}</td>
                    <td className="px-3 py-3 text-right">{row.netDuties}</td>
                    <td className="px-3 py-3 text-right">{row.totalDuties}</td>
                  </tr>
                )) : (
                  <tr className="border-t">
                    <td className="px-3 py-3">—</td>
                    <td className="px-3 py-3 text-right">—</td>
                    <td className="px-3 py-3 text-right">—</td>
                    <td className="px-3 py-3 text-right">—</td>
                  </tr>
                )}

                <tr className="bg-white font-bold">
                  <td className="px-3 py-3">Total</td>
                  <td className="px-3 py-3 text-right">{summaryByDesignation ? summaryByDesignation.reduce((s, r) => s + (r.qty || 0), 0) : 0}</td>
                  <td className="px-3 py-3 text-right">{summaryByDesignation ? summaryByDesignation.reduce((s, r) => s + (r.netDuties || 0), 0) : 0}</td>
                  <td className="px-3 py-3 text-right">{summaryByDesignation ? summaryByDesignation.reduce((s, r) => s + (r.totalDuties || 0), 0) : 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Guard roster */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3">Guard ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Designation</th>
                <th className="px-4 py-3 text-right">Duties</th>
              </tr>
            </thead>
            <tbody>
              {guardRoster.length > 0 ? guardRoster.map((g) => (
                <tr key={g.id} className="border-t">
                  <td className="px-4 py-3 font-mono text-indigo-700">{g.id}</td>
                  <td className="px-4 py-3 font-semibold">{g.name}</td>
                  <td className="px-4 py-3">{g.designation}</td>
                  <td className="px-4 py-3 text-right font-semibold">{g.dutyCount}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No guard duty records available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}