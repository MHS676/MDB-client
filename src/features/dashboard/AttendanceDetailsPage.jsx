import React, { useEffect, useState } from 'react';

export default function AttendanceDetailsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await fetch('http://localhost:5000/attendance');
      if (!response.ok) throw new Error('Failed to fetch attendance');
      const data = await response.json();
      console.log('Fetched Attendance Data:', data); // Inspect raw backend response
      setLogs(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error('Failed to fetch attendance logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const search = filter.toLowerCase();
    const guardName = log.guardProfile?.user?.name || log.user?.name || '';
    const postName = log.post?.name || log.captureAddress || '';
    const guardId = log.guardProfile?.employeeId || log.id || '';

    return (
      guardName.toLowerCase().includes(search) ||
      postName.toLowerCase().includes(search) ||
      guardId.toLowerCase().includes(search)
    );
  });

  return (
    <div style={{ padding: '24px', color: '#fff', backgroundColor: '#0b0f19', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>🛡️ Guard Attendance Logs</h2>
        <input
          type="text"
          placeholder="Filter by Guard, Location, or Record ID..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #1f293d',
            backgroundColor: '#161e2e',
            color: '#fff',
            width: '320px',
            fontSize: '13px',
          }}
        />
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Loading attendance data...</p>
      ) : filteredLogs.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#161e2e', borderRadius: '8px', color: '#94a3b8' }}>
          No attendance records found.
        </div>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: '#161e2e', borderRadius: '12px', border: '1px solid #1f293d' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#cbd5e1', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1f293d', backgroundColor: '#0f172a' }}>
                <th style={{ padding: '14px' }}>Record ID</th>
                <th style={{ padding: '14px' }}>Check-In Time</th>
                <th style={{ padding: '14px' }}>Coordinates (Lat, Long)</th>
                <th style={{ padding: '14px' }}>Address / Location</th>
                <th style={{ padding: '14px' }}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #1f293d' }}>
                  <td style={{ padding: '14px', fontFamily: 'monospace', color: '#f59e0b', fontWeight: 'bold' }}>
                    {log.id ? `${log.id.slice(0, 8)}...` : 'N/A'}
                  </td>
                  <td style={{ padding: '14px', fontWeight: 'bold', color: '#fff' }}>
                    {log.checkInTime ? new Date(log.checkInTime).toLocaleString() : 'N/A'}
                  </td>
                  <td style={{ padding: '14px', fontFamily: 'monospace' }}>
                    {log.captureLatitude && log.captureLongitude
                      ? `${log.captureLatitude.toFixed(6)}, ${log.captureLongitude.toFixed(6)}`
                      : 'N/A'}
                  </td>
                  <td style={{ padding: '14px' }}>
                    {log.captureAddress || log.post?.name || 'GPS Captured'}
                  </td>
                  <td style={{ padding: '14px', color: '#94a3b8' }}>
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}