'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [a, u] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/users'),
      ]);
      setAnalytics(a.data);
      setUsers(u.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function approveExpert(userId: string) {
    await api.patch(`/admin/experts/${userId}/approve`);
    load();
  }

  async function deleteUser(id: string) {
    if (!confirm('Delete this user?')) return;
    await api.delete(`/admin/users/${id}`);
    load();
  }

  if (loading) return <div className="skeleton h-64" />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-sm text-slate-500">Platform moderation & analytics</p>
      </div>

      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
        {analytics &&
          Object.entries(analytics).map(([key, value]) => (
            <div key={key} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
              <div className="text-2xl font-bold text-brand-600">{value as number}</div>
              <div className="text-xs text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
            </div>
          ))}
      </div>

      <div>
        <h2 className="font-semibold mb-3">Users</h2>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Verified</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td className="p-3">{u.isVerified ? '✅' : '—'}</td>
                  <td className="p-3 flex gap-2">
                    {u.role === 'expert' && (
                      <button onClick={() => approveExpert(u.id)} className="text-xs px-2 py-1 rounded-lg bg-accent-500 text-white">
                        Approve
                      </button>
                    )}
                    <button onClick={() => deleteUser(u.id)} className="text-xs px-2 py-1 rounded-lg bg-red-500 text-white">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
