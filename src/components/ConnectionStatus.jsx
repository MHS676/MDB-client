import React, { useState, useEffect } from 'react';
import { testAllConnections, testApiEndpoints, connectionTests } from '../utils/connectionChecker';

const ConnectionStatus = () => {
  const [connections, setConnections] = useState([]);
  const [apiTests, setApiTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allHealthy, setAllHealthy] = useState(false);

  useEffect(() => {
    const checkConnections = async () => {
      try {
        const healthResults = await testAllConnections();
        const apiResults = await testApiEndpoints();
        
        setConnections(healthResults);
        setApiTests(apiResults);
        setAllHealthy(healthResults.every(r => r.success));
      } catch (error) {
        console.error('Error checking connections:', error);
      } finally {
        setLoading(false);
      }
    };

    checkConnections();
    const interval = setInterval(checkConnections, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">🔍 Checking backend connections...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <div className={`border rounded-lg p-4 ${
        allHealthy 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <h3 className={`font-semibold ${
          allHealthy ? 'text-green-800' : 'text-red-800'
        }`}>
          {allHealthy ? '✅ All Backends Connected' : '❌ Some Backends Offline'}
        </h3>
      </div>

      {/* Server Health Checks */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-700 mb-3">📡 Server Status</h4>
        <div className="space-y-2">
          {connections.map((conn, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="text-lg">{conn.success ? '✅' : '❌'}</span>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{conn.service}</p>
                <p className="text-sm text-gray-600">{conn.url}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Endpoint Tests */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-700 mb-3">📊 API Endpoints</h4>
        <div className="space-y-2">
          {apiTests.map((test, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="text-lg">
                {test.status.includes('✅') ? '✅' : '❌'}
              </span>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{test.endpoint}</p>
                <p className="text-xs text-gray-500">
                  {test.requiresAuth ? 'Requires Authentication' : 'Public Endpoint'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Configuration</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>MDB Backend:</strong> {connectionTests.mdbBackend.url}</p>
          <p><strong>Auth Server:</strong> {connectionTests.authServer.url}</p>
          <p><strong>Guard Backend:</strong> {connectionTests.guardBackend.url}</p>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;
