import React, { useState, useEffect } from 'react';
import apiCall from '../../services/api';

const DataInputCorePage = ({ user }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'SECURITY_GUARD',
    password: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  const roles = [
    { value: 'COORDINATOR', label: 'Coordinator', color: 'emerald' },
    { value: 'SECURITY_IN_CHARGE', label: 'Security In Charge', color: 'blue' },
    { value: 'SECURITY_SUPERVISOR', label: 'Security Supervisor', color: 'purple' },
    { value: 'SECURITY_GUARD', label: 'Security Guard', color: 'amber' },
    { value: 'CLIENT', label: 'Client', color: 'cyan' },
  ];

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await apiCall('http://localhost:3001/users', 'GET');
      setAccounts(response || []);
      setError(null);
    } catch (err) {
      setError('Failed to load accounts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.name || !formData.password) {
      alert('Please fill all fields');
      return;
    }

    try {
      await apiCall('http://localhost:3001/auth/register', 'POST', {
        email: formData.email,
        name: formData.name,
        password: formData.password,
      });

      setFormData({ email: '', name: '', role: 'SECURITY_GUARD', password: '' });
      setShowForm(false);
      fetchAccounts();
    } catch (err) {
      setError('Failed to create account');
      console.error(err);
    }
  };

  const handleDeleteAccount = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;

    try {
      await apiCall(`http://localhost:3001/users/${userId}`, 'DELETE');
      fetchAccounts();
    } catch (err) {
      setError('Failed to delete account');
      console.error(err);
    }
  };

  const getRoleColor = (roleValue) => {
    const role = roles.find((r) => r.value === roleValue);
    return role?.color || 'slate';
  };

  const getRoleLabel = (roleValue) => {
    const role = roles.find((r) => r.value === roleValue);
    return role?.label || roleValue;
  };

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'ALL' || account.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const colorClasses = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    cyan: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    slate: 'bg-slate-50 border-slate-200 text-slate-700',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className="text-2xl">🔐</span> Data Input Core
          </h1>
          <p className="text-sm text-slate-600 mt-1">Manage user accounts and permissions</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all shadow-md"
        >
          {showForm ? '✕ Cancel' : '+ New Account'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="font-bold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Create Account Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Create New Account</h2>
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="user@falconsecurity.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by email or name..."
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Roles</option>
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Accounts Table */}
      {loading ? (
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="inline-block">
            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600 mt-2">Loading accounts...</p>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center border border-slate-200">
          <p className="text-slate-600">No accounts found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-sm text-slate-900 font-mono">{account.email}</td>
                    <td className="px-6 py-3 text-sm text-slate-700">{account.name}</td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                          colorClasses[getRoleColor(account.role)]
                        }`}
                      >
                        {getRoleLabel(account.role)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-600">
                      {new Date(account.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <button
                        onClick={() => handleDeleteAccount(account.id)}
                        className="px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded transition-all"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 font-bold">
            Showing {filteredAccounts.length} of {accounts.length} accounts
          </div>
        </div>
      )}

      {/* Role Permissions Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-3">Role Permissions Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
          <div>
            <p className="font-bold mb-1">👑 Coordinator</p>
            <p>Full access - Create, Read, Update, Delete</p>
          </div>
          <div>
            <p className="font-bold mb-1">🔒 Security In Charge</p>
            <p>Area-level management - CRUD for assigned area</p>
          </div>
          <div>
            <p className="font-bold mb-1">👮 Security Supervisor</p>
            <p>Supervised guards - CRUD for supervised staff</p>
          </div>
          <div>
            <p className="font-bold mb-1">🛡️ Security Guard</p>
            <p>Self-service only - Create and Read own records</p>
          </div>
          <div>
            <p className="font-bold mb-1">👤 Client</p>
            <p>Read-only access - Monitor assigned posts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataInputCorePage;
