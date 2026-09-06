import React, { useEffect, useMemo, useState } from 'react';
import getConfig from '../config/api.config';

const ATTENDANCE_BASE = getConfig('EXTERNAL.ATTENDANCE') || 'http://localhost:5000/attendance';
const POSTS_BASE = getConfig('EXTERNAL.POSTS') || 'http://localhost:5000/posts';

export default function PostAttendanceSummary() {
  const [month, setMonth] = useState('2026-06');
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [summary, setSummary] = useState(null);

  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // Dynamic Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Posts
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

  // Fetch Post Summary
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
        if (!res.ok) throw new Error('Server error');
        const data = await res.json();
        if (!cancelled) setSummary(data);
      } catch (err) {
        console.error('Error fetching post summary', err);
        if (!cancelled) setSummary(null);
      }
    })();
    return () => { cancelled = true; };
  }, [selected, month]);

  const filtered = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return posts.filter(p => (p.name || '').toLowerCase().includes(q)).slice(0, 10);
  }, [posts, query]);

  return (
    <div className="min-h-screen bg-white px-10 py-8 font-sans text-[#0d1b54]">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-12">
        {/* Month Selector Pill */}
        <div className="relative">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="appearance-none bg-[#e2e8f0] text-[#22c55e] font-black text-2xl px-6 py-2.5 pr-12 rounded-md cursor-pointer focus:outline-none"
          >
            <option value="2026-06">Jun 2026</option>
            <option value="2026-07">Jul 2026</option>
            <option value="2026-08">Aug 2026</option>
            <option value="2026-09">Sep 2026</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#0d1b54] text-sm">
            ▼
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-black text-[#000000] tracking-tight ml-12">Attendance</h1>

        {/* Live Time / Date Header */}
        <div className="flex gap-12 text-2xl font-bold">
          <div>
            <span className="text-[#ef4444]">Time</span>
            {currentTime && <span className="ml-3 text-[#0d1b54]">{currentTime}</span>}
          </div>
          <div>
            <span className="text-[#ef4444]">Date</span>
            {currentDate && <span className="ml-3 text-[#0d1b54]">{currentDate}</span>}
          </div>
        </div>
      </div>

      {/* Main Top Section */}
      <div className="flex justify-between items-start gap-8 mb-16">
        {/* Left Post Controls */}
        <div className="w-[52%]">
          <div className="flex items-center gap-6 mb-8">
            <label className="text-2xl font-black text-[#0d1b54] tracking-wide">POST</label>
            <div className="relative flex-1">
              <input
                type="text"
                className="w-full border-2 border-[#0d1b54] rounded-sm px-4 py-2 text-xl font-bold text-[#0d1b54] placeholder-[#0d1b54] focus:outline-none"
                placeholder="search and suggest"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              {/* Suggestions Dropdown */}
              {filtered.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 bg-white border-2 border-[#0d1b54] rounded-b-md shadow-xl max-h-52 overflow-y-auto mt-1">
                  {filtered.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 border-b border-gray-200 hover:bg-indigo-50 cursor-pointer font-bold text-lg text-[#0d1b54]"
                      onClick={() => { setSelected(p); setQuery(p.name); }}
                    >
                      {p.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 text-xl font-extrabold text-[#0d1b54] mt-10">
            <div className="flex">
              <span className="w-52">Zone Coordinate:</span>
              <span>
                {summary?.post?.zoneCoordinate ??
                  (selected ? `${selected.latitude || '—'}, ${selected.longitude || '—'}` : '-----------')}
              </span>
            </div>
            <div className="flex">
              <span className="w-52">Address</span>
              <span>{summary?.post?.address ?? (selected?.address || '-----------')}</span>
            </div>
            <div className="flex">
              <span className="w-52">Duty Hours</span>
              <span>{summary?.post?.dutyHours ?? '8 hours/ 12 hours'}</span>
            </div>
          </div>
        </div>

        {/* Right Designation Card */}
        <div className="w-[44%] bg-[#e5e7eb] rounded-xl p-3 shadow-sm border border-gray-300">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#0d1b54]">
                <th className="py-2.5 px-2 text-center font-black text-lg text-[#0d1b54] border-r border-[#0d1b54] w-[45%]">Name</th>
                <th className="py-2.5 px-2 text-center font-black text-lg text-[#0d1b54] border-r border-[#0d1b54] w-[18%]">Qty</th>
                <th className="py-2.5 px-2 text-center font-black text-lg text-[#0d1b54] border-r border-[#0d1b54] w-[20%]">Net duties</th>
                <th className="py-2.5 px-2 text-center font-black text-lg text-[#0d1b54] w-[17%]">total duties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0d1b54]">
              {summary?.summaryByDesignation?.map((row) => (
                <tr key={row.designation} className="font-extrabold text-lg text-[#0d1b54]">
                  <td className="py-2.5 px-3 text-left border-r border-[#0d1b54]">{row.designation}</td>
                  <td className="py-2.5 px-2 text-center border-r border-[#0d1b54]">{row.qty}</td>
                  <td className="py-2.5 px-2 text-center border-r border-[#0d1b54]">{row.netDuties}</td>
                  <td className="py-2.5 px-2 text-center">{row.totalDuties}</td>
                </tr>
              )) || (
                <>
                  <tr className="font-extrabold text-lg text-[#0d1b54]">
                    <td className="py-2.5 px-3 text-left border-r border-[#0d1b54]">In-charger Security</td>
                    <td className="py-2.5 px-2 text-center border-r border-[#0d1b54]">1</td>
                    <td className="py-2.5 px-2 text-center border-r border-[#0d1b54]">29</td>
                    <td className="py-2.5 px-2 text-center">31</td>
                  </tr>
                  <tr className="font-extrabold text-lg text-[#0d1b54]">
                    <td className="py-2.5 px-3 text-left border-r border-[#0d1b54]">Supervisor</td>
                    <td className="py-2.5 px-2 text-center border-r border-[#0d1b54]">1</td>
                    <td className="py-2.5 px-2 text-center border-r border-[#0d1b54]">60</td>
                    <td className="py-2.5 px-2 text-center">62</td>
                  </tr>
                  <tr className="font-extrabold text-lg text-[#0d1b54]">
                    <td className="py-2.5 px-3 text-left border-r border-[#0d1b54]">Security Guard</td>
                    <td className="py-2.5 px-2 text-center border-r border-[#0d1b54]">3</td>
                    <td className="py-2.5 px-2 text-center border-r border-[#0d1b54]">60</td>
                    <td className="py-2.5 px-2 text-center">62</td>
                  </tr>
                </>
              )}
              {/* Total Summary Row */}
              <tr className="border-t-2 border-[#0d1b54] font-black text-xl text-[#0d1b54]">
                <td className="py-3 px-3 border-r border-[#0d1b54]"></td>
                <td className="py-3 px-2 text-center border-r border-[#0d1b54]">{summary?.overallTotal?.qty ?? 5}</td>
                <td className="py-3 px-2 text-center border-r border-[#0d1b54]">{summary?.overallTotal?.netDuties ?? 289}</td>
                <td className="py-3 px-2 text-center">{summary?.overallTotal?.totalDuties ?? 300}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Guard Roster Grid */}
      <div>
        <table className="w-full border-collapse border-b-2 border-[#0d1b54]">
          <thead>
            <tr className="border-b-2 border-[#0d1b54] text-xl font-black text-[#0d1b54]">
              <th className="py-3 text-center border-r-2 border-[#0d1b54] w-[12%]">NO</th>
              <th className="py-3 text-left px-8 border-r-2 border-[#0d1b54] w-[34%]">Designation</th>
              <th className="py-3 text-center border-r-2 border-[#0d1b54] w-[38%]">Name</th>
              <th className="py-3 text-center w-[16%]">Duty</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-[#0d1b54]">
            {summary?.guardDetails?.map((g) => (
              <tr key={g.employeeId} className="text-xl font-black text-[#0d1b54]">
                <td className="py-4 text-center border-r-2 border-[#0d1b54]">{g.employeeId}</td>
                <td className="py-4 text-left px-8 border-r-2 border-[#0d1b54]">{g.designation}</td>
                <td className="py-4 text-center border-r-2 border-[#0d1b54]">{g.name}</td>
                <td className="py-4 text-center">{g.duty ?? g.dutyCount}</td>
              </tr>
            )) || (
              <>
                <tr className="text-xl font-black text-[#0d1b54]">
                  <td className="py-4 text-center border-r-2 border-[#0d1b54]">2026</td>
                  <td className="py-4 text-left px-8 border-r-2 border-[#0d1b54]">Security Guard</td>
                  <td className="py-4 text-center border-r-2 border-[#0d1b54]">suman</td>
                  <td className="py-4 text-center">30</td>
                </tr>
                <tr className="text-xl font-black text-[#0d1b54]">
                  <td className="py-4 text-center border-r-2 border-[#0d1b54]">2029</td>
                  <td className="py-4 text-left px-8 border-r-2 border-[#0d1b54]">Supervisor</td>
                  <td className="py-4 text-center border-r-2 border-[#0d1b54]">rafi</td>
                  <td className="py-4 text-center">28</td>
                </tr>
                <tr className="text-xl font-black text-[#0d1b54]">
                  <td className="py-4 text-center border-r-2 border-[#0d1b54]">2028</td>
                  <td className="py-4 text-left px-8 border-r-2 border-[#0d1b54]">Security Guard</td>
                  <td className="py-4 text-center border-r-2 border-[#0d1b54]">safi</td>
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