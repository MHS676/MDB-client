import React, { useEffect, useState } from 'react';

const ATTENDANCE_API_URL = import.meta.env.VITE_ATTENDANCE_API_URL || 'http://localhost:5000';

export default function AttendanceDetailsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please login first.');
        setLogs([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${ATTENDANCE_API_URL}/attendance`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setError('Session expired. Please login again.');
          setLogs([]);
          setLoading(false);
          return;
        }
        throw new Error(`Failed to fetch attendance (${response.status})`);
      }

      const data = await response.json();
      console.log('📡 Fetched Attendance Data:', data);
      
      // Handle both array and object responses
      const attendanceData = Array.isArray(data) ? data : (data?.data || []);
      setLogs(attendanceData);
      
      if (attendanceData.length === 0) {
        console.log('⚠️ No attendance records found in response');
      }
    } catch (err) {
      console.error('❌ Failed to fetch attendance logs:', err);
      setError(err.message || 'Failed to fetch attendance records');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const search = filter.toLowerCase();
    const guardName = log.user?.name || log.guardProfile?.user?.name || '';
    const postName = log.post?.name || log.captureAddress || '';
    const employeeId = log.user?.employeeId || log.guardProfile?.employeeId || '';

    return (
      guardName.toLowerCase().includes(search) ||
      postName.toLowerCase().includes(search) ||
      employeeId.toLowerCase().includes(search)
    );
  });

  const refreshData = () => {
    fetchAttendance();
  };

  return (
    <div style={{ padding: '24px', color: '#fff', backgroundColor: '#0b0f19', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>🛡️ Guard Attendance Logs</h2>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>Total Records: {logs.length}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
          <button
            onClick={refreshData}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f59e0b',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '16px',
          marginBottom: '20px',
          backgroundColor: '#7f1d1d',
          color: '#fca5a5',
          borderRadius: '8px',
          border: '1px solid #991b1b',
          fontSize: '13px',
        }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
          <p>⏳ Loading attendance data...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#161e2e', borderRadius: '8px', color: '#94a3b8' }}>
          {logs.length === 0 ? (
            <>
              <p>📭 No attendance records found.</p>
              <p style={{ fontSize: '12px', marginTop: '8px', color: '#64748b' }}>
                Make sure guards have checked in and you have proper authorization.
              </p>
            </>
          ) : (
            <p>No records match the current filter.</p>
          )}
        </div>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: '#161e2e', borderRadius: '12px', border: '1px solid #1f293d' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#cbd5e1', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1f293d', backgroundColor: '#0f172a' }}>
                <th style={{ padding: '14px' }}>Guard Name</th>
                <th style={{ padding: '14px' }}>Status</th>
                <th style={{ padding: '14px' }}>Check-In Time</th>
                <th style={{ padding: '14px' }}>Marked By</th>
                <th style={{ padding: '14px' }}>Coordinates (Lat, Long)</th>
                <th style={{ padding: '14px' }}>Location</th>
                <th style={{ padding: '14px' }}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #1f293d', backgroundColor: '#1a1f2e' }}>
                  <td style={{ padding: '14px', fontWeight: 'bold', color: '#fff' }}>
                    {log.user?.name || log.guardProfile?.user?.name || 'Unknown'}
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      backgroundColor: log.status === 'PRESENT' ? '#065f46' : 
                                       log.status === 'LATE' ? '#92400e' :
                                       log.status === 'ABSENT' ? '#7f1d1d' : '#1e3a8a',
                      color: '#fff'
                    }}>
                      {log.status || 'PRESENT'}
                    </span>
                  </td>
                  <td style={{ padding: '14px', fontWeight: 'bold', color: '#f59e0b' }}>
                    {log.checkInTime ? new Date(log.checkInTime).toLocaleString() : 'N/A'}
                  </td>
                  <td style={{ padding: '14px', color: '#cbd5e1' }}>
                    {log.markedBy?.name || log.markedByProfile?.user?.name || 'Self'}
                  </td>
                  <td style={{ padding: '14px', fontFamily: 'monospace', fontSize: '11px' }}>
                    {log.captureLatitude && log.captureLongitude
                      ? `${log.captureLatitude.toFixed(6)}, ${log.captureLongitude.toFixed(6)}`
                      : 'N/A'}
                  </td>
                  <td style={{ padding: '14px', color: '#cbd5e1' }}>
                    {log.captureAddress || log.post?.name || 'GPS Captured'}
                  </td>
                  <td style={{ padding: '14px', color: '#94a3b8', fontSize: '11px' }}>
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