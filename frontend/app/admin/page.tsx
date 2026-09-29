'use client';

import { useEffect, useState } from 'react';
import {
  Users, GraduationCap, MessagesSquare, BookOpen, CheckCircle2, UserRoundPlus,
  ShieldCheck, Trash2, BadgeCheck,
} from 'lucide-react';
import { api, apiError } from '../../lib/api';
import { useToast } from '../../lib/toast';
import type { AdminAnalytics, AdminUser } from '../../lib/types';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/ui/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Skeleton } from '../../components/ui/Skeleton';
import { shortDate } from '../../lib/format';

export default function AdminPage() {
  const { push } = useToast();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [a, u] = await Promise.all([
        api.get<AdminAnalytics>('/admin/analytics'), // Axios: GET /admin/analytics
        api.get<AdminUser[]>('/admin/users'), // Axios: GET /admin/users
      ]);
      setAnalytics(a.data);
      setUsers(u.data);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function approveExpert(userId: string) {
    setBusyId(userId);
    try {
      await api.patch(`/admin/experts/${userId}/approve`); // Axios: PATCH /admin/experts/:userId/approve
      push('success', 'Expert approved.');
      await load();
    } catch (err) {
      push('error', apiError(err));
    } finally {
      setBusyId(null);
    }
  }

  async function deleteUser() {
    if (!confirmDelete) return;
    setBusyId(confirmDelete.id);
    try {
      await api.delete(`/admin/users/${confirmDelete.id}`); // Axios: DELETE /admin/users/:id
      push('success', 'User deleted.');
      setUsers((prev) => prev.filter((u) => u.id !== confirmDelete.id));
    } catch (err) {
      push('error', apiError(err));
    } finally {
      setBusyId(null);
      setConfirmDelete(null);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Admin" title="Platform overview" description="Moderation and platform-wide analytics." />

      {loading || !analytics ? (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard icon={Users} label="Total users" value={analytics.totalUsers} tone="brand" />
          <StatCard icon={GraduationCap} label="Students" value={analytics.totalStudents} tone="neutral" />
          <StatCard icon={ShieldCheck} label="Experts" value={analytics.totalExperts} tone="accent" />
          <StatCard icon={UserRoundPlus} label="Pending experts" value={analytics.pendingExperts} tone="accent" />
          <StatCard icon={MessagesSquare} label="Posts resolved" value={`${analytics.resolvedPosts}/${analytics.totalPosts}`} tone="success" />
          <StatCard icon={BookOpen} label="Materials" value={analytics.totalMaterials} tone="neutral" />
        </div>
      )}

      <div>
        <h2 className="mb-3 font-serif text-[16px] font-semibold text-ink">Users</h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-subtle text-[11.5px] uppercase tracking-wide text-ink-3">
                <tr>
                  <th className="px-4 py-2.5 font-medium">User</th>
                  <th className="px-4 py-2.5 font-medium">Role</th>
                  <th className="px-4 py-2.5 font-medium">Verified</th>
                  <th className="px-4 py-2.5 font-medium">Joined</th>
                  <th className="px-4 py-2.5 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {loading && users.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-6"><Skeleton className="h-6" /></td></tr>
                )}
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={u.name} size="sm" />
                        <div>
                          <p className="font-medium text-ink">{u.name}</p>
                          <p className="text-[11.5px] text-ink-3">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={u.role === 'admin' ? 'brand' : u.role === 'expert' ? 'accent' : 'neutral'} className="capitalize">
                        {u.role === 'expert' && u.expertProfile?.isApproved && <BadgeCheck className="h-3 w-3" />} {u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5">{u.isVerified ? <CheckCircle2 className="h-4 w-4 text-success" /> : <span className="text-ink-3">—</span>}</td>
                    <td className="px-4 py-2.5 text-ink-2">{shortDate(u.createdAt)}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-1.5">
                        {u.role === 'expert' && !u.expertProfile?.isApproved && (
                          <button onClick={() => approveExpert(u.id)} disabled={busyId === u.id} className="btn-secondary btn-sm">Approve</button>
                        )}
                        <button onClick={() => setConfirmDelete(u)} disabled={busyId === u.id} className="flex h-7 w-7 items-center justify-center rounded-md text-ink-3 hover:bg-danger-soft hover:text-danger" aria-label="Delete user">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title={`Delete ${confirmDelete?.name}?`}
        description="This permanently removes the account and cannot be undone."
        confirmLabel="Delete user"
        danger
        busy={busyId === confirmDelete?.id}
        onConfirm={deleteUser}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
