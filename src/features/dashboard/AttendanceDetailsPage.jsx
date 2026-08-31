import React, { useEffect, useState, useMemo } from 'react';

const ATTENDANCE_API_URL = import.meta.env.VITE_ATTENDANCE_API_URL || 'http://localhost:5000/attendance';

export default function AttendanceDetailsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      console.log('🔍 Token from localStorage:', token ? 'Present' : 'Missing');
      
      if (!token) {
        setError('❌ Authentication required. Please login first.');
        setLogs([]);
        setLoading(false);
        return;
      }

      console.log(`📤 Fetching from: ${ATTENDANCE_API_URL}`);
      const response = await fetch(ATTENDANCE_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log(`📥 Response Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error Response:', errorData);
        
        if (response.status === 401) {
          localStorage.removeItem('token');
          setError('❌ Session expired. Please login again.');
          setLogs([]);
          setLoading(false);
          return;
        }
        
        if (response.status === 403) {
          setError(`❌ Access Denied. Your role doesn't have permission to view attendance. Required: COORDINATOR or SECURITY_IN_CHARGE. Error: ${errorData.message || 'Forbidden'}`);
          setLogs([]);
          setLoading(false);
          return;
        }

        throw new Error(`Failed to fetch attendance (${response.status}): ${errorData.message || response.statusText}`);
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

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const search = searchFilter.toLowerCase();
      const guardName = log.user?.name || log.guardProfile?.user?.name || '';
      const postName = log.post?.name || log.captureAddress || '';
      const employeeId = log.user?.employeeId || log.guardProfile?.employeeId || '';

      const matchesSearch = 
        guardName.toLowerCase().includes(search) ||
        postName.toLowerCase().includes(search) ||
        employeeId.toLowerCase().includes(search);

      const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
      const matchesLocation = locationFilter === 'ALL' || (log.captureAddress || log.post?.name || '') === locationFilter;

      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [logs, searchFilter, statusFilter, locationFilter]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const uniqueGuards = new Set(filteredLogs.map(log => log.user?.id || log.guardProfile?.id)).size;
    
    // Estimate duty hours (assuming 8 hours per day if present)
    const totalDutyHours = filteredLogs.filter(log => log.status === 'PRESENT').length * 8;
    
    return { uniqueGuards, totalDutyHours };
  }, [filteredLogs]);

  // Get unique statuses and locations for dropdown
  const statuses = useMemo(() => {
    const unique = [...new Set(logs.map(log => log.status).filter(Boolean))];
    return unique.sort();
  }, [logs]);

  const locations = useMemo(() => {
    const unique = [...new Set(logs.map(log => log.captureAddress || log.post?.name || 'Unknown').filter(Boolean))];
    return unique.sort();
  }, [logs]);

  const refreshData = () => {
    fetchAttendance();
  };

  // Function to get accurate location (use address if available, otherwise reverse geocoding hint)
  const getLocationDisplay = (log) => {
    if (log.captureAddress) {
      return log.captureAddress;
    }
    if (log.post?.name) {
      return log.post.name;
    }
    if (log.captureLatitude && log.captureLongitude) {
      return `📍 ${log.captureLatitude.toFixed(5)}, ${log.captureLongitude.toFixed(5)}`;
    }
    return 'Location Pending';
  };

  // Function to check if location is accurate (has address)
  const isLocationAccurate = (log) => {
    return log.captureAddress ? '✅ Accurate' : '⚠️ GPS Only';
  };

  // Function to check if time is accurate (within expected working hours)
  const isTimeAccurate = (log) => {
    if (!log.checkInTime) return '❌ No Time';
    const checkInHour = new Date(log.checkInTime).getHours();
    if (checkInHour >= 0 && checkInHour <= 23) {
      return '✅ Valid';
    }
    return '⚠️ Check';
  };

  return (
    <div style={{ padding: '24px', color: '#000', backgroundColor: '#fff', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #000', paddingBottom: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px', color: '#000' }}>🛡️ Guard Attendance Logs</h2>
          <p style={{ fontSize: '12px', color: '#333' }}>Total Records: {logs.length} | Filtered: {filteredLogs.length}</p>
        </div>
        <button
          onClick={refreshData}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f59e0b',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '13px',
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      {!loading && logs.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
          <div style={{
            backgroundColor: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px', fontWeight: 'bold' }}>Total Records</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{filteredLogs.length}</div>
          </div>
          <div style={{
            backgroundColor: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px', fontWeight: 'bold' }}>Unique Guards</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{statistics.uniqueGuards}</div>
          </div>
          <div style={{
            backgroundColor: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px', fontWeight: 'bold' }}>Total Duty Hours</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0066cc' }}>{statistics.totalDutyHours}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Search: Guard name, Location, ID..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          style={{
            padding: '10px 12px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: '#fff',
            color: '#000',
            fontSize: '13px',
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '10px 12px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: '#fff',
            color: '#000',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          <option value="ALL">📊 All Status</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          style={{
            padding: '10px 12px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: '#fff',
            color: '#000',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          <option value="ALL">📍 All Locations</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div style={{
          padding: '16px',
          marginBottom: '20px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '4px',
          border: '1px solid #ef5350',
          fontSize: '13px',
        }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          <p>⏳ Loading attendance data...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: '4px', color: '#666', border: '1px solid #ddd' }}>
          {logs.length === 0 ? (
            <>
              <p>📭 No attendance records found.</p>
              <p style={{ fontSize: '12px', marginTop: '8px', color: '#999' }}>
                Make sure guards have checked in and you have proper authorization.
              </p>
            </>
          ) : (
            <p>No records match the current filter.</p>
          )}
        </div>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #ddd' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#000', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #000', backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '12px', fontWeight: 'bold' }}>Guard ID</th>
                <th style={{ padding: '12px', fontWeight: 'bold' }}>Guard Name</th>
                <th style={{ padding: '12px', fontWeight: 'bold' }}>Status</th>
                <th style={{ padding: '12px', fontWeight: 'bold' }}>Check-In Time</th>
                <th style={{ padding: '12px', fontWeight: 'bold' }}>Time Accuracy</th>
                <th style={{ padding: '12px', fontWeight: 'bold' }}>Location</th>
                <th style={{ padding: '12px', fontWeight: 'bold' }}>Location Accuracy</th>
                <th style={{ padding: '12px', fontWeight: 'bold' }}>Marked By</th>
                <th style={{ padding: '12px', fontWeight: 'bold' }}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #ddd', backgroundColor: '#fff' }}>
                  <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '10px', color: '#0066cc', fontWeight: 'bold' }}>
                    {log.userId ? log.userId.substring(0, 8) : log.user?.id?.substring(0, 8) || log.guardProfile?.id?.substring(0, 8) || 'N/A'}
                  </td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#000' }}>
                    {log.user?.name || log.guardProfile?.user?.name || 'Unknown'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '3px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      backgroundColor: log.status === 'PRESENT' ? '#c8e6c9' : 
                                       log.status === 'LATE' ? '#ffe0b2' :
                                       log.status === 'ABSENT' ? '#ffcdd2' : '#bbdefb',
                      color: log.status === 'PRESENT' ? '#2e7d32' : 
                             log.status === 'LATE' ? '#e65100' :
                             log.status === 'ABSENT' ? '#c62828' : '#1565c0'
                    }}>
                      {log.status || 'PRESENT'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#d97706' }}>
                    {log.checkInTime ? new Date(log.checkInTime).toLocaleString() : 'N/A'}
                  </td>
                  <td style={{ padding: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                    {isTimeAccurate(log)}
                  </td>
                  <td style={{ padding: '12px', color: '#333', fontWeight: '500' }}>
                    {getLocationDisplay(log)}
                  </td>
                  <td style={{ padding: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                    {isLocationAccurate(log)}
                  </td>
                  <td style={{ padding: '12px', color: '#333' }}>
                    {log.markedBy?.name || log.markedByProfile?.user?.name || 'Self'}
                  </td>
                  <td style={{ padding: '12px', color: '#666', fontSize: '11px' }}>
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