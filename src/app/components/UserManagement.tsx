import type { Role } from '../App';
import { Shield, Plus, Search, Mail, Trash2, MoreHorizontal } from 'lucide-react';

const users = [
  { id: 1, name: 'Priya Mehta', email: 'priya.mehta@logitrack.in', role: 'super_admin', distributor: 'All', status: 'active', lastLogin: '17 May, 10:24 AM' },
  { id: 2, name: 'Rahul Sharma', email: 'rahul.s@northdist.in', role: 'distributor_admin', distributor: 'North Distributors', status: 'active', lastLogin: '17 May, 09:48 AM' },
  { id: 3, name: 'Sneha Patil', email: 'sneha.p@southdist.in', role: 'distributor_admin', distributor: 'South Distributors', status: 'active', lastLogin: '16 May, 04:12 PM' },
  { id: 4, name: 'Ajay Kumar', email: 'ajay.k@northdist.in', role: 'branch_manager', distributor: 'North — Andheri', status: 'active', lastLogin: '17 May, 08:55 AM' },
  { id: 5, name: 'Kavita Desai', email: 'kavita.d@northdist.in', role: 'branch_manager', distributor: 'North — Malad', status: 'active', lastLogin: '17 May, 07:30 AM' },
  { id: 6, name: 'Deepak Joshi', email: 'deepak.j@northdist.in', role: 'admin_support', distributor: 'North Distributors', status: 'active', lastLogin: '17 May, 10:02 AM' },
  { id: 7, name: 'Pooja Verma', email: 'pooja.v@southdist.in', role: 'admin_support', distributor: 'South Distributors', status: 'inactive', lastLogin: '12 May, 02:40 PM' },
  { id: 8, name: 'Arjun Nair', email: 'arjun.n@eastdist.in', role: 'distributor_admin', distributor: 'East Distributors', status: 'active', lastLogin: '16 May, 11:20 AM' },
];

const scheduledReports = [
  { id: 1, name: 'Daily Operations Summary', schedule: 'Daily at 7:00 AM', recipients: 'priya.mehta@logitrack.in', format: 'PDF', status: 'active' },
  { id: 2, name: 'Weekly Driver Performance', schedule: 'Monday at 8:00 AM', recipients: 'rahul.s@northdist.in, sneha.p@southdist.in', format: 'Excel', status: 'active' },
  { id: 3, name: 'Monthly Fleet Utilization', schedule: '1st of month at 6:00 AM', recipients: 'priya.mehta@logitrack.in', format: 'PDF', status: 'active' },
  { id: 4, name: 'Return Rate Alert Digest', schedule: 'Daily at 6:00 PM', recipients: 'priya.mehta@logitrack.in, rahul.s@northdist.in', format: 'Email', status: 'paused' },
];

const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
  super_admin: { label: 'Super Admin', color: '#6366F1', bg: '#EEF2FF' },
  distributor_admin: { label: 'Distributor Admin', color: '#0891B2', bg: '#F0F9FF' },
  branch_manager: { label: 'Branch Manager', color: '#059669', bg: '#ECFDF5' },
  admin_support: { label: 'Admin Support', color: '#D97706', bg: '#FFFBEB' },
};

export default function UserManagement({ role }: { role: Role }) {
  if (role === 'branch_manager' || role === 'admin_support') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <Shield size={22} className="text-slate-400" />
          </div>
          <div className="text-slate-700 font-medium mb-1">Access Restricted</div>
          <p className="text-slate-400" style={{ fontSize: '13px' }}>User management is only available to admins.</p>
        </div>
      </div>
    );
  }

  const visibleUsers = role === 'distributor_admin'
    ? users.filter(u => u.distributor.includes('North'))
    : users;

  const activeCount = visibleUsers.filter(u => u.status === 'active').length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: visibleUsers.length, color: '#6366F1' },
          { label: 'Active', value: activeCount, color: '#10B981' },
          { label: 'Inactive', value: visibleUsers.length - activeCount, color: '#94A3B8' },
          { label: 'Reports Scheduled', value: 4, color: '#8B5CF6' },
        ].map(s => (
          <div
            key={s.label}
            className="bg-white rounded-xl p-4 shadow-sm"
            style={{ border: '1px solid #E2E8F0', borderLeftWidth: '3px', borderLeftColor: s.color }}
          >
            <div className="text-slate-800 font-bold" style={{ fontSize: '1.5rem' }}>{s.value}</div>
            <div className="text-slate-500" style={{ fontSize: '11px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between p-5 pb-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <div className="text-slate-800 text-sm font-semibold">Users</div>
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Manage platform users and permissions</div>
          </div>
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ border: '1px solid #E2E8F0' }}
            >
              <Search size={13} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search users…"
                className="outline-none bg-transparent text-slate-600"
                style={{ fontSize: '12px', width: 120 }}
              />
            </div>
            {role === 'super_admin' && (
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white font-medium transition-colors"
                style={{ background: '#6366F1', fontSize: '12px' }}
              >
                <Plus size={13} /> Add User
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Name', 'Email', 'Role', 'Distributor / Branch', 'Status', 'Last Login', ...(role === 'super_admin' ? ['Actions'] : [])].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-slate-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map(user => {
                const rc = roleConfig[user.role];
                const initials = user.name.split(' ').map(n => n[0]).join('');
                return (
                  <tr key={user.id} style={{ borderTop: '1px solid #F1F5F9' }} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                          style={{ background: rc.color, fontSize: '10px' }}
                        >
                          {initials}
                        </div>
                        <span className="text-slate-700 font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full font-medium"
                        style={{ background: rc.bg, color: rc.color, fontSize: '11px' }}
                      >
                        {rc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{user.distributor}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-medium" style={{ color: user.status === 'active' ? '#10B981' : '#94A3B8', fontSize: '11px' }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: user.status === 'active' ? '#10B981' : '#CBD5E1' }} />
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{user.lastLogin}</td>
                    {role === 'super_admin' && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                            <Mail size={13} />
                          </button>
                          <button className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scheduled Reports — Super Admin only */}
      {role === 'super_admin' && (
        <div className="bg-white rounded-xl shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
          <div className="flex items-center justify-between p-5 pb-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
            <div>
              <div className="text-slate-800 text-sm font-semibold">Scheduled Reports</div>
              <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Auto-email reports to recipients</div>
            </div>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white font-medium"
              style={{ background: '#6366F1', fontSize: '12px' }}
            >
              <Plus size={13} /> Schedule Report
            </button>
          </div>
          <div>
            {scheduledReports.map((r, i) => (
              <div
                key={r.id}
                className="flex items-start justify-between p-4 hover:bg-slate-50 transition-colors"
                style={{ borderTop: i === 0 ? 'none' : '1px solid #F8FAFC' }}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-slate-700 font-medium" style={{ fontSize: '13px' }}>{r.name}</span>
                    <span
                      className="px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: r.status === 'active' ? '#ECFDF5' : '#F1F5F9',
                        color: r.status === 'active' ? '#059669' : '#94A3B8',
                        fontSize: '10px',
                      }}
                    >
                      {r.status}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500" style={{ fontSize: '10px' }}>{r.format}</span>
                  </div>
                  <div className="text-slate-500 mb-0.5" style={{ fontSize: '11px' }}>{r.schedule}</div>
                  <div className="text-slate-400 truncate" style={{ fontSize: '11px' }}>To: {r.recipients}</div>
                </div>
                <button className="p-1.5 rounded hover:bg-slate-100 text-slate-400 transition-colors">
                  <MoreHorizontal size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
